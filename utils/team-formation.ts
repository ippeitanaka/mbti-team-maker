import type { Student, Team, TeamFormationStrategy } from "@/types"
import { calculateTeamCompatibility, getMBTIGroup } from "./mbti"

// Distribute students into teams based on the selected strategy
export function formTeams(students: Student[], numberOfTeams: number, strategy: TeamFormationStrategy): Team[] {
  // Initialize empty teams
  const teams: Team[] = Array.from({ length: numberOfTeams }, (_, i) => ({
    id: i + 1,
    name: `Team ${i + 1}`,
    members: [],
    compatibility: 0,
  }))

  // Make a copy of students to avoid modifying the original array
  const remainingStudents = [...students]

  // Different strategies for team formation
  switch (strategy) {
    case "compatibility":
      return formTeamsByCompatibility(remainingStudents, teams)

    case "balance":
      return formTeamsByBalance(remainingStudents, teams)

    case "diversity":
      return formTeamsByDiversity(remainingStudents, teams)

    case "similarity":
      return formTeamsBySimilarity(remainingStudents, teams)

    default:
      return formTeamsByCompatibility(remainingStudents, teams)
  }
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

  // Calculate compatibility for each team
  teams.forEach((team) => {
    team.compatibility = calculateTeamCompatibility(team.members)
  })

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

  // Calculate compatibility for each team
  teams.forEach((team) => {
    team.compatibility = calculateTeamCompatibility(team.members)
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

  // Calculate compatibility for each team
  teams.forEach((team) => {
    team.compatibility = calculateTeamCompatibility(team.members)
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

  // Calculate compatibility for each team
  teams.forEach((team) => {
    team.compatibility = calculateTeamCompatibility(team.members)
  })

  return teams
}
