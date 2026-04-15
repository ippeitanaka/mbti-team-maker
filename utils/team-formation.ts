import type { Student, Team, TeamFormationConfig } from "@/types"
import { calculateTeamCompatibility, getMBTIGroup } from "./mbti"
import {
  calculateGroupBalanceScore,
  calculateSimilarityScore,
  calculateTeamDiversityScore,
  countConstraintPenalty,
} from "./team-insights"

function createEmptyTeams(numberOfTeams: number) {
  return Array.from({ length: numberOfTeams }, (_, i) => ({
    id: i + 1,
    name: `Team ${i + 1}`,
    members: [],
    compatibility: 0,
  }))
}

function shuffleStudents(students: Student[]) {
  const shuffled = [...students]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

function cloneTeams(teams: Team[]) {
  return teams.map((team) => ({
    ...team,
    members: [...team.members],
  }))
}

function finalizeTeams(teams: Team[]) {
  return teams.map((team) => ({
    ...team,
    compatibility: calculateTeamCompatibility(team.members),
  }))
}

// Distribute students into teams based on the selected strategy
export function formTeams(students: Student[], config: TeamFormationConfig): Team[] {
  const teams = createEmptyTeams(config.numberOfTeams)

  // Make a copy of students to avoid modifying the original array
  const remainingStudents = shuffleStudents(students)

  let initialTeams: Team[]

  // Different strategies for team formation
  switch (config.strategy) {
    case "compatibility":
      initialTeams = formTeamsByCompatibility(remainingStudents, teams)
      break

    case "balance":
      initialTeams = formTeamsByBalance(remainingStudents, teams)
      break

    case "diversity":
      initialTeams = formTeamsByDiversity(remainingStudents, teams)
      break

    case "similarity":
      initialTeams = formTeamsBySimilarity(remainingStudents, teams)
      break

    default:
      initialTeams = formTeamsByCompatibility(remainingStudents, teams)
  }

  return optimizeTeams(initialTeams, config)
}

function evaluatePlan(teams: Team[], config: TeamFormationConfig) {
  const completedTeams = finalizeTeams(teams)
  const averageCompatibility =
    completedTeams.reduce((total, team) => total + (team.compatibility || 0), 0) / completedTeams.length
  const averageDiversity =
    completedTeams.reduce((total, team) => total + calculateTeamDiversityScore(team), 0) / completedTeams.length
  const averageBalance =
    completedTeams.reduce((total, team) => total + calculateGroupBalanceScore(team), 0) / completedTeams.length
  const averageSimilarity =
    completedTeams.reduce((total, team) => total + calculateSimilarityScore(team), 0) / completedTeams.length
  const sizes = completedTeams.map((team) => team.members.length)
  const sizeSpread = Math.max(...sizes) - Math.min(...sizes)
  const sizeScore = Math.max(0, 100 - sizeSpread * 25)

  let score = 0

  switch (config.strategy) {
    case "compatibility":
      score = averageCompatibility * 12 + averageBalance * 0.18 + averageDiversity * 0.1 + sizeScore * 0.1
      break
    case "balance":
      score = averageBalance * 0.45 + sizeScore * 0.35 + averageCompatibility * 4 + averageDiversity * 0.08
      break
    case "diversity":
      score = averageDiversity * 0.6 + averageBalance * 0.2 + averageCompatibility * 3 + sizeScore * 0.12
      break
    case "similarity":
      score = averageSimilarity * 0.5 + averageCompatibility * 5 + sizeScore * 0.2 + averageBalance * 0.12
      break
  }

  score -= countConstraintPenalty(completedTeams, config)

  return score
}

function optimizeTeams(initialTeams: Team[], config: TeamFormationConfig) {
  let bestTeams = cloneTeams(initialTeams)
  let bestScore = evaluatePlan(bestTeams, config)
  let improved = true
  let guard = 0

  while (improved && guard < 8) {
    improved = false
    guard += 1

    for (let firstTeamIndex = 0; firstTeamIndex < bestTeams.length; firstTeamIndex++) {
      for (let secondTeamIndex = firstTeamIndex + 1; secondTeamIndex < bestTeams.length; secondTeamIndex++) {
        const firstTeam = bestTeams[firstTeamIndex]
        const secondTeam = bestTeams[secondTeamIndex]

        for (let firstMemberIndex = 0; firstMemberIndex < firstTeam.members.length; firstMemberIndex++) {
          for (let secondMemberIndex = 0; secondMemberIndex < secondTeam.members.length; secondMemberIndex++) {
            const candidateTeams = cloneTeams(bestTeams)
            const swapA = candidateTeams[firstTeamIndex].members[firstMemberIndex]
            const swapB = candidateTeams[secondTeamIndex].members[secondMemberIndex]

            candidateTeams[firstTeamIndex].members[firstMemberIndex] = swapB
            candidateTeams[secondTeamIndex].members[secondMemberIndex] = swapA

            const candidateScore = evaluatePlan(candidateTeams, config)

            if (candidateScore > bestScore) {
              bestTeams = candidateTeams
              bestScore = candidateScore
              improved = true
            }
          }
        }
      }
    }
  }

  return finalizeTeams(bestTeams)
}

// Form teams optimizing for overall compatibility
function formTeamsByCompatibility(students: Student[], teams: Team[]): Team[] {
  // Sort students by MBTI type to group similar types
  const sortedStudents = [...students].sort((a, b) => a.mbtiCode?.localeCompare(b.mbtiCode || "") || 0)

  // Distribute students to teams in a round-robin fashion
  for (let i = 0; i < sortedStudents.length; i++) {
    const teamIndex = i % teams.length
    teams[teamIndex].members.push(sortedStudents[i])
  }

  return teams
}

// Form teams with balanced MBTI types
function formTeamsByBalance(students: Student[], teams: Team[]): Team[] {
  // Group students by MBTI group (NF, NT, SF, SP)
  const mbtiGroups: { [key: string]: Student[] } = {}

  students.forEach((student) => {
    const group = getMBTIGroup(student.mbtiType)
    if (!mbtiGroups[group]) {
      mbtiGroups[group] = []
    }
    mbtiGroups[group].push(student)
  })

  // Distribute students from each MBTI group evenly across teams
  Object.values(mbtiGroups).forEach((groupStudents) => {
    for (let i = 0; i < groupStudents.length; i++) {
      const teamIndex = i % teams.length
      teams[teamIndex].members.push(groupStudents[i])
    }
  })

  return teams
}

// Form teams with diverse MBTI types in each team
function formTeamsByDiversity(students: Student[], teams: Team[]): Team[] {
  // Group students by MBTI code
  const mbtiCodeGroups: { [key: string]: Student[] } = {}

  students.forEach((student) => {
    const code = student.mbtiCode || "XXXX"
    if (!mbtiCodeGroups[code]) {
      mbtiCodeGroups[code] = []
    }
    mbtiCodeGroups[code].push(student)
  })

  // Sort MBTI codes by frequency (most common first)
  const sortedCodes = Object.keys(mbtiCodeGroups).sort((a, b) => mbtiCodeGroups[b].length - mbtiCodeGroups[a].length)

  // Distribute students from each MBTI code across teams
  sortedCodes.forEach((code) => {
    const groupStudents = mbtiCodeGroups[code]
    for (let i = 0; i < groupStudents.length; i++) {
      // Find the team with the fewest members
      const teamIndex = teams
        .map((team, index) => ({ index, count: team.members.length }))
        .sort((a, b) => a.count - b.count)[0].index

      teams[teamIndex].members.push(groupStudents[i])
    }
  })

  return teams
}

// Form teams with similar MBTI types in each team
function formTeamsBySimilarity(students: Student[], teams: Team[]): Team[] {
  // Group students by MBTI code
  const mbtiCodeGroups: { [key: string]: Student[] } = {}

  students.forEach((student) => {
    const code = student.mbtiCode || "XXXX"
    if (!mbtiCodeGroups[code]) {
      mbtiCodeGroups[code] = []
    }
    mbtiCodeGroups[code].push(student)
  })

  // Sort MBTI codes by frequency (most common first)
  const sortedCodes = Object.keys(mbtiCodeGroups).sort((a, b) => mbtiCodeGroups[b].length - mbtiCodeGroups[a].length)

  // Assign each MBTI group to a team until all teams have at least one group
  let currentTeamIndex = 0

  sortedCodes.forEach((code) => {
    const groupStudents = mbtiCodeGroups[code]

    // If we have more teams than MBTI groups, distribute the largest groups first
    if (currentTeamIndex < teams.length) {
      groupStudents.forEach((student) => {
        teams[currentTeamIndex].members.push(student)
      })
      currentTeamIndex = (currentTeamIndex + 1) % teams.length
    } else {
      // If all teams have at least one group, distribute remaining students to the smallest teams
      groupStudents.forEach((student) => {
        // Find the team with the fewest members
        const teamIndex = teams
          .map((team, index) => ({ index, count: team.members.length }))
          .sort((a, b) => a.count - b.count)[0].index

        teams[teamIndex].members.push(student)
      })
    }
  })

  return teams
}
