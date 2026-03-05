import type { AgentResponse, Intent } from './types'
import type { Customer, StoreSummary, CategoryData } from '../../data/types'
import { formatCurrency, formatNumber } from '../../lib/formatters'

function detectIntent(query: string): Intent {
  const q = query.toLowerCase()
  if (/how many|total|count|number of|avg|average|basket|revenue|retention|spend/.test(q)) return 'metric_lookup'
  if (/segment|power|regular|occasional|at.?risk|new customer/.test(q)) return 'segment_query'
  if (/basket|category|cross.?sell|product|item/.test(q)) return 'basket_query'
  if (/compar|national|benchmark|percentile|median|vs|versus/.test(q)) return 'comparison'
  if (/trend|change|month|growing|declining|over time/.test(q)) return 'trend'
  if (/what should|recommend|action|improve|suggestion|strategy/.test(q)) return 'actions'
  if (/what is|explain|define|mean|how does/.test(q)) return 'explanation'
  return 'unknown'
}

export function askAgent(
  query: string,
  customers: Customer[],
  summary: StoreSummary[],
  categories: CategoryData[],
): AgentResponse {
  const intent = detectIntent(query)
  const latest = summary.length > 0 ? summary[summary.length - 1]! : null

  switch (intent) {
    case 'metric_lookup': {
      const total = customers.length
      const avgBasket = customers.reduce((s, c) => s + c.avgBasketValue, 0) / total
      const avgRetention = customers.reduce((s, c) => s + c.retentionScore, 0) / total
      const totalSpend = customers.reduce((s, c) => s + c.totalSpend, 0)
      const atRisk = customers.filter(c => c.segment === 'At-Risk').length

      return {
        answer: `Here are your key metrics:\n\n- **Total Customers**: ${formatNumber(total)}\n- **Avg Basket Value**: ${formatCurrency(avgBasket)}\n- **Avg Retention Score**: ${avgRetention.toFixed(1)}/100\n- **Total Customer Spend**: ${formatCurrency(totalSpend)}\n- **Monthly Revenue**: ${latest ? formatCurrency(latest.totalRevenue) : 'N/A'}\n- **At-Risk Customers**: ${formatNumber(atRisk)} (${((atRisk / total) * 100).toFixed(1)}%)`,
        methodology: 'Calculated from the full customer dataset. Basket value is the average across all customers. Retention is the mean retention score.',
        confidence: 'GREEN',
        followUpQuestions: [
          'How does my basket compare to national?',
          'Which segment has the highest spend?',
          'What can I do to improve retention?',
        ],
      }
    }

    case 'segment_query': {
      const segments = ['Power Shoppers', 'Regular Shoppers', 'Occasional Visitors', 'New Customers', 'At-Risk'] as const
      const breakdown = segments.map(seg => {
        const group = customers.filter(c => c.segment === seg)
        const count = group.length
        const avgBasket = count > 0 ? group.reduce((s, c) => s + c.avgBasketValue, 0) / count : 0
        return `- **${seg}**: ${formatNumber(count)} customers, avg basket ${formatCurrency(avgBasket)}`
      })

      return {
        answer: `Customer segment breakdown:\n\n${breakdown.join('\n')}`,
        methodology: 'Segments are assigned based on visit frequency, basket value, and recency. See the Segments page for full details.',
        confidence: 'GREEN',
        followUpQuestions: [
          'How can I convert Occasional Visitors to Regulars?',
          'What are At-Risk customers worth?',
          'Show me Power Shopper trends.',
        ],
      }
    }

    case 'basket_query': {
      const top5 = [...categories].sort((a, b) => b.revenue - a.revenue).slice(0, 5)
      const lines = top5.map((c, i) => `${i + 1}. **${c.category}** — ${formatCurrency(c.revenue)} revenue, ${c.crossSellRate}% cross-sell with ${c.topPairedCategory}`)

      return {
        answer: `Top 5 categories by revenue:\n\n${lines.join('\n')}\n\nStrongest cross-sell opportunity: **${top5[0]?.category}** with **${top5[0]?.topPairedCategory}** (${top5[0]?.crossSellRate}% rate).`,
        methodology: 'Revenue and cross-sell data from category analysis. Cross-sell rate = % of baskets containing both categories.',
        confidence: 'GREEN',
        followUpQuestions: [
          'What categories are growing fastest?',
          'How do I increase basket size?',
          'Which categories are underperforming?',
        ],
      }
    }

    case 'comparison': {
      return {
        answer: 'Visit the **Benchmarks** page for detailed national comparisons across basket value, retention rate, and visits per customer. Your store is benchmarked against P25, Median, and P75 percentiles.',
        methodology: 'National benchmarks sourced from aggregated pharmacy network data.',
        confidence: 'AMBER',
        followUpQuestions: [
          'Am I above or below the national median?',
          'What\'s my basket value ranking?',
          'How has my ranking changed over time?',
        ],
      }
    }

    case 'trend': {
      if (!latest || summary.length < 2) {
        return {
          answer: 'Insufficient data to show trends. Need at least 2 months of data.',
          methodology: 'Trend analysis requires monthly summary data.',
          confidence: 'RED',
          followUpQuestions: ['What data do you have?'],
        }
      }
      const prev = summary[summary.length - 2]!
      const revChange = ((latest.totalRevenue - prev.totalRevenue) / prev.totalRevenue * 100).toFixed(1)
      const custChange = latest.totalCustomers - prev.totalCustomers
      const retChange = (latest.retentionRate - prev.retentionRate).toFixed(1)

      return {
        answer: `Month-over-month changes:\n\n- **Revenue**: ${revChange}% (${parseFloat(revChange) >= 0 ? 'up' : 'down'})\n- **Customers**: ${custChange >= 0 ? '+' : ''}${custChange}\n- **Retention**: ${retChange}pp change\n- **Active Shoppers**: ${formatNumber(latest.activeCustomers)} (was ${formatNumber(prev.activeCustomers)})`,
        methodology: 'Comparing the most recent two months of summary data.',
        confidence: 'GREEN',
        followUpQuestions: [
          'Why is retention changing?',
          'What segments are growing?',
          'Show me the full trend chart.',
        ],
      }
    }

    case 'actions': {
      const atRisk = customers.filter(c => c.segment === 'At-Risk')
      const lowCategory = customers.filter(c => c.categoryCount <= 2 && c.segment === 'Regular Shoppers')

      return {
        answer: `Here are your top recommended actions:\n\n1. **Reactivate At-Risk Customers** — ${formatNumber(atRisk.length)} customers haven't visited in 45+ days. Send an SMS recall campaign with a $5 off voucher.\n\n2. **Expand Category Penetration** — ${formatNumber(lowCategory.length)} Regular Shoppers only buy from 1-2 categories. Cross-sell via in-store signage and checkout prompts.\n\n3. **Protect Power Shoppers** — Ensure loyalty rewards are meaningful. Consider a VIP tier with exclusive discounts.\n\n4. **Boost Basket Value** — Bundle popular cross-sell pairings (see Basket Analysis) at a 10% combo discount.\n\n5. **Welcome New Customers** — Send a personalised welcome email within 7 days of first visit.`,
        methodology: 'Recommendations are based on segment analysis, opportunity scores, and category data. Prioritised by potential revenue impact.',
        confidence: 'GREEN',
        followUpQuestions: [
          'How do I create a reactivation campaign?',
          'Which categories should I cross-sell?',
          'What\'s my biggest revenue risk?',
        ],
      }
    }

    case 'explanation': {
      return {
        answer: `**Shopper360** is your shopper intelligence platform. Key concepts:\n\n- **Segments**: Customers grouped by shopping behaviour (Power, Regular, Occasional, New, At-Risk)\n- **Basket Value**: Average spend per visit\n- **Retention Score**: 0-100 rating of how likely a customer is to return\n- **Cross-Sell Rate**: % of baskets containing products from two paired categories\n- **Opportunity Score**: Composite metric (0-100) combining churn risk, basket growth potential, and retention gap\n\nUse the sidebar navigation to explore each area in detail.`,
        methodology: 'Definitions based on the Shopper360 data model and analytics framework.',
        confidence: 'GREEN',
        followUpQuestions: [
          'What is a Power Shopper?',
          'How is retention score calculated?',
          'What data do you use?',
        ],
      }
    }

    default:
      return {
        answer: 'I\'m not sure how to answer that. Try asking about metrics, segments, basket analysis, trends, or recommendations. Here are some things I can help with:\n\n- "What are my key metrics?"\n- "Show me segment breakdown"\n- "What should I do to improve?"\n- "How is my basket value trending?"',
        methodology: 'Intent not recognised. Shopper360 agent handles metric lookups, segment queries, basket analysis, trends, comparisons, and recommendations.',
        confidence: 'RED',
        followUpQuestions: [
          'What are my key metrics?',
          'Show me the segment breakdown.',
          'What should I do to improve retention?',
        ],
      }
  }
}
