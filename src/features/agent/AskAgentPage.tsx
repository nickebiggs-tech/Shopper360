import { useState, useRef, useEffect } from 'react'
import { Send, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { useData } from '../../data/DataProvider'
import { askAgent } from './agent-service'
import { MessageBubble } from './components/MessageBubble'
import { TrafficLight } from './components/TrafficLight'
import type { AgentResponse } from './types'

interface Message {
  id: string
  role: 'user' | 'agent'
  content: string
  response?: AgentResponse
}

const SUGGESTED = [
  'What are my key metrics?',
  'Show me the segment breakdown.',
  'What should I do to improve retention?',
  'Which categories drive the most revenue?',
  'How is my basket value trending?',
]

export function AskAgentPage() {
  const { state } = useData()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [expandedMethodology, setExpandedMethodology] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSend = (query: string) => {
    if (!query.trim()) return

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: query.trim() }
    const response = askAgent(query.trim(), state.customers, state.summary, state.categories)
    const agentMsg: Message = { id: `a-${Date.now()}`, role: 'agent', content: response.answer, response }

    setMessages((prev) => [...prev, userMsg, agentMsg])
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(input)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Ask Shopper360</h1>
        <p className="text-sm text-slate-500 mt-1">Ask questions about your shoppers, baskets, segments, and trends.</p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4 scrollbar-thin">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">How can I help?</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md">
              I can answer questions about your customer metrics, segments, basket analysis, trends, and provide actionable recommendations.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:bg-slate-50 hover:border-primary/30 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="space-y-2">
            <MessageBubble role={msg.role} content={msg.content} />

            {msg.response && (
              <div className="ml-0 space-y-2">
                <TrafficLight level={msg.response.confidence} />

                {/* Methodology toggle */}
                <button
                  onClick={() => setExpandedMethodology(expandedMethodology === msg.id ? null : msg.id)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
                >
                  {expandedMethodology === msg.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  How I got this
                </button>
                {expandedMethodology === msg.id && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-500">
                    {msg.response.methodology}
                  </div>
                )}

                {/* Follow-up questions */}
                <div className="flex flex-wrap gap-1.5">
                  {msg.response.followUpQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-500 hover:bg-slate-50 hover:border-primary/30 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 pt-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your shoppers, baskets, segments..."
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            className="p-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">
          Responses are generated from your local data. Confidence levels indicate data reliability.
        </p>
      </div>
    </div>
  )
}
