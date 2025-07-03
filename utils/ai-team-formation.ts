import type { Student, Team, TeamFormationConfig, TeamFormationStrategy } from "@/types"
import { calculateTeamCompatibility } from "./mbti"
import { formTeams } from "./team-formation"

export async function formTeamsWithAI(students: Student[], config: TeamFormationConfig): Promise<Team[]> {
  try {
    const { numberOfTeams, strategy, purpose } = config

    // Prepare the prompt for the AI
    const prompt = createAIPrompt(students, numberOfTeams, strategy, purpose)

    // Call the Google Gemini API
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("AI API error:", errorData)
      console.log("Falling back to local algorithm...")
      return formTeams(students, numberOfTeams, strategy as TeamFormationStrategy)
    }

    const data = await response.json()

    // Parse the AI response to get teams
    const teams = parseAIResponse(data.text, students, numberOfTeams)

    // Calculate compatibility for each team
    teams.forEach((team) => {
      team.compatibility = calculateTeamCompatibility(team.members)
    })

    return teams
  } catch (error) {
    console.error("Error forming teams with AI:", error)
    console.log("Falling back to local algorithm...")
    // Fallback to the local algorithm if AI fails
    return formTeams(students, config.numberOfTeams, config.strategy as TeamFormationStrategy)
  }
}

function createAIPrompt(students: Student[], numberOfTeams: number, strategy: string, purpose?: string): string {
  // Create a list of students with their MBTI types
  const studentList = students.map((student) => `${student.name}: ${student.mbtiType} (${student.mbtiCode})`).join("\n")

  // Create the prompt
  const prompt = `
以下の学生リストをMBTIタイプの相性を考慮して、${numberOfTeams}チームに分けてください。
チーム分けの戦略は「${strategy}」です。
${purpose ? `チームの目的は「${purpose}」です。` : ""}

学生リスト:
${studentList}

各チームのメンバーを以下の形式で出力してください:
Team 1: [学生名1], [学生名2], ...
Team 2: [学生名3], [学生名4], ...
...

チーム分けの理由も簡単に説明してください。
`

  return prompt
}

function parseAIResponse(aiResponse: string, students: Student[], numberOfTeams: number): Team[] {
  // Initialize empty teams
  const teams: Team[] = Array.from({ length: numberOfTeams }, (_, i) => ({
    id: i + 1,
    name: `Team ${i + 1}`,
    members: [],
    compatibility: 0,
  }))

  // Create a map of student names to student objects for easy lookup
  const studentMap = new Map<string, Student>()
  students.forEach((student) => {
    studentMap.set(student.name, student)
  })

  // Parse the AI response to extract team assignments
  const teamRegex = /Team\s+(\d+)\s*:\s*(.*?)(?=\n\s*Team|\n\s*$|$)/gs
  let match

  while ((match = teamRegex.exec(aiResponse)) !== null) {
    const teamNumber = Number.parseInt(match[1], 10)
    const memberNames = match[2].split(",").map((name) => name.trim())

    if (teamNumber > 0 && teamNumber <= numberOfTeams) {
      const teamIndex = teamNumber - 1

      memberNames.forEach((name) => {
        // Find the student by name (or closest match)
        const student = findStudentByName(name, studentMap)

        if (student && !teams.some((t) => t.members.includes(student))) {
          teams[teamIndex].members.push(student)
        }
      })
    }
  }

  // Handle any unassigned students
  const assignedStudents = new Set<string>()
  teams.forEach((team) => {
    team.members.forEach((student) => {
      assignedStudents.add(student.name)
    })
  })

  const unassignedStudents = students.filter((student) => !assignedStudents.has(student.name))

  // Distribute unassigned students to the teams with the fewest members
  unassignedStudents.forEach((student) => {
    const teamIndex = teams
      .map((team, index) => ({ index, count: team.members.length }))
      .sort((a, b) => a.count - b.count)[0].index

    teams[teamIndex].members.push(student)
  })

  return teams
}

function findStudentByName(name: string, studentMap: Map<string, Student>): Student | undefined {
  // Try exact match first
  if (studentMap.has(name)) {
    return studentMap.get(name)
  }

  // Try to find the closest match
  for (const [studentName, student] of studentMap.entries()) {
    if (studentName.includes(name) || name.includes(studentName)) {
      return student
    }
  }

  return undefined
}
