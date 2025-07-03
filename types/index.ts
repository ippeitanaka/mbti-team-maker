export interface Student {
  studentId: string
  name: string
  mbtiType: string
  mbtiCode?: string
}

export interface Team {
  id: number
  name: string
  members: Student[]
  compatibility?: number
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
}
