export type ConfidenceLevel = 'GREEN' | 'AMBER' | 'RED'

export interface AgentResponse {
  answer: string
  methodology: string
  confidence: ConfidenceLevel
  followUpQuestions: string[]
}

export type Intent =
  | 'metric_lookup'
  | 'segment_query'
  | 'basket_query'
  | 'comparison'
  | 'trend'
  | 'actions'
  | 'explanation'
  | 'unknown'
