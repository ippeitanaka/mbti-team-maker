export interface Student {
  studentId: string
  name: string
  mbtiType: string
  mbtiCode?: string
  studentClass: string
  gender: string
}

export interface PairConstraint {
  firstId: string
  secondId: string
}

export interface TeamConstraintConfig {
  spreadLeaders: boolean
  leaderIds: string[]
  preferredPairs: PairConstraint[]
  separatedPairs: PairConstraint[]
  avoidDuplicateMbti: boolean
  balanceClasses: boolean
  balanceGender: boolean
}

export interface TeamInsight {
  compatibility: number
  diversityScore: number
  groupBalanceScore: number
  uniqueMbtiCount: number
  leaderCount: number
  classBalanceScore: number
  genderBalanceScore: number
  warnings: string[]
  highlights: string[]
}

export interface Team {
  id: number
  name: string
  members: Student[]
  compatibility?: number
  insight?: TeamInsight
}

export interface PlanOverview {
  totalScore: number
  averageCompatibility: number
  diversityScore: number
  sizeSpread: number
  satisfiedConstraints: number
  totalConstraints: number
  notes: string[]
}

export type TeamPlanSource = "ai" | "local"

export interface TeamPlan {
  id: string
  title: string
  subtitle: string
  strategy: TeamFormationStrategy
  source: TeamPlanSource
  teams: Team[]
  overview: PlanOverview
}

export interface TeamGenerationResult {
  teams: Team[]
  source: TeamPlanSource
}

export interface CSVValidationIssue {
  row: number
  field: string
  message: string
  severity: "error" | "warning"
}

export interface MBTICompatibility {
  [key: string]: {
    [key: string]: number
  }
}

export type TeamFormationStrategy = "compatibility" | "balance" | "diversity" | "similarity"

export interface TeamFormationConfig {
  numberOfTeams: number
  strategy: TeamFormationStrategy
  purpose?: string
  constraints: TeamConstraintConfig
}
