import type { Student, Team, TeamFormationConfig, TeamGenerationResult } from "@/types"
import { calculateTeamCompatibility } from "./mbti"
import { formTeams } from "./team-formation"

function buildConstraintPrompt(config: TeamFormationConfig) {
  const parts: string[] = []

  if (config.constraints.spreadLeaders && config.constraints.leaderIds.length > 0) {
    parts.push(`リーダー候補ID: ${config.constraints.leaderIds.join(", ")} をできるだけ各チームに分散してください。`)
  }

  if (config.constraints.preferredPairs.length > 0) {
    parts.push(
      `同じチーム希望ペア: ${config.constraints.preferredPairs.map((pair) => `${pair.firstId}-${pair.secondId}`).join(" / ")}`,
    )
  }

  if (config.constraints.separatedPairs.length > 0) {
    parts.push(
      `別チーム希望ペア: ${config.constraints.separatedPairs.map((pair) => `${pair.firstId}-${pair.secondId}`).join(" / ")}`,
    )
  }

  if (config.constraints.avoidDuplicateMbti) {
    parts.push("同じMBTIタイプが同一チームに偏りすぎないようにしてください。")
  }

  if (config.constraints.balanceClasses) {
    parts.push("各チームのクラス比が全体比に近づくようにしてください。")
  }

  if (config.constraints.balanceGender) {
    parts.push("各チームの性別比が全体比に近づくようにしてください。")
  }

  return parts.join("\n")
}

export async function formTeamsWithAI(students: Student[], config: TeamFormationConfig): Promise<TeamGenerationResult> {
  try {
    const { numberOfTeams, strategy, purpose } = config

    // Prepare the prompt for the AI
    const prompt = createAIPrompt(students, numberOfTeams, strategy, purpose, buildConstraintPrompt(config))

    // Call the server-side AI API route
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
      return { teams: formTeams(students, config), source: "local" }
    }

    const data = await response.json()

    // Parse the AI response to get teams
    const teams = parseAIResponse(data.text, students, numberOfTeams)

    // Calculate compatibility for each team
    teams.forEach((team) => {
      team.compatibility = calculateTeamCompatibility(team.members)
    })

    return { teams, source: "ai" }
  } catch (error) {
    console.error("Error forming teams with AI:", error)
    console.log("Falling back to local algorithm...")
    // Fallback to the local algorithm if AI fails
    return { teams: formTeams(students, config), source: "local" }
  }
}

function createAIPrompt(
  students: Student[],
  numberOfTeams: number,
  strategy: string,
  purpose?: string,
  constraintPrompt?: string,
): string {
  // Create a list of students with their MBTI types
  const studentList = students
    .map(
      (student) =>
        `${student.studentId} / ${student.name}: ${student.mbtiType} (${student.mbtiCode}), ${student.studentClass}, ${student.gender}`,
    )
    .join("\n")

  // Create the prompt
  const prompt = `
以下の学生リストをMBTIタイプの相性を考慮して、${numberOfTeams}チームに分けてください。
チーム分けの戦略は「${strategy}」です。
${purpose ? `チームの目的は「${purpose}」です。` : ""}
${constraintPrompt ? `以下の条件も満たしてください。\n${constraintPrompt}` : ""}

学生リスト:
${studentList}

各チームのメンバーを以下の形式で出力してください:
Team 1: [学生ID1], [学生ID2], ...
Team 2: [学生ID3], [学生ID4], ...
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
    studentMap.set(student.studentId, student)
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
