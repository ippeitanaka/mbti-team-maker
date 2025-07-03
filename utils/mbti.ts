import type { Student, MBTICompatibility } from "@/types"

// Extract the 4-letter MBTI code from the full type string
export function extractMBTICode(mbtiType: string): string {
  // Match patterns like "INFP-A", "INFP-T", or just "INFP"
  const match = mbtiType.match(/([EI][NS][FT][JP])(-[AT])?/)
  return match ? match[1] : "XXXX" // Return XXXX if no valid code found
}

// Basic MBTI compatibility matrix
// Values range from 0 (incompatible) to 10 (highly compatible)
export const mbtiCompatibilityMatrix: MBTICompatibility = {
  // NF types (Diplomats)
  INFP: {
    ENFJ: 9,
    ENTJ: 8,
    INFJ: 7,
    ENFP: 7,
    INTJ: 6,
    INFP: 5,
    INTP: 5,
    ENTP: 5,
    ISFP: 4,
    ESFJ: 4,
    ISFJ: 3,
    ESFP: 3,
    ISTP: 2,
    ESTP: 2,
    ISTJ: 1,
    ESTJ: 1,
  },
  ENFP: {
    INFJ: 9,
    INTJ: 8,
    ENFJ: 7,
    INFP: 7,
    ENTJ: 6,
    ENFP: 5,
    ENTP: 5,
    INTP: 5,
    ESFP: 4,
    ISFJ: 4,
    ESFJ: 3,
    ISFP: 3,
    ESTP: 2,
    ISTP: 2,
    ESTJ: 1,
    ISTJ: 1,
  },
  INFJ: {
    ENFP: 9,
    ENTP: 8,
    INFP: 7,
    ENFJ: 7,
    INTP: 6,
    INFJ: 5,
    INTJ: 5,
    ENTJ: 5,
    ISFJ: 4,
    ESFP: 4,
    ISFP: 3,
    ESFJ: 3,
    ISTP: 2,
    ESTP: 2,
    ISTJ: 1,
    ESTJ: 1,
  },
  ENFJ: {
    INFP: 9,
    ISFP: 8,
    ENFP: 7,
    INFJ: 7,
    ESFP: 6,
    ENFJ: 5,
    ESFJ: 5,
    ENTJ: 5,
    ISFJ: 4,
    INTP: 4,
    INTJ: 3,
    ENTP: 3,
    ISTJ: 2,
    ISTP: 2,
    ESTJ: 1,
    ESTP: 1,
  },

  // NT types (Analysts)
  INTJ: {
    ENFP: 9,
    ENTP: 8,
    INTP: 7,
    ENTJ: 7,
    INFJ: 6,
    INTJ: 5,
    INFP: 5,
    ENFJ: 5,
    ISTP: 4,
    ESTP: 4,
    ISTJ: 3,
    ESTJ: 3,
    ISFP: 2,
    ESFP: 2,
    ISFJ: 1,
    ESFJ: 1,
  },
  ENTJ: {
    INFP: 9,
    INTP: 8,
    INTJ: 7,
    ENFP: 7,
    ENTP: 6,
    ENTJ: 5,
    ENFJ: 5,
    INFJ: 5,
    ESTJ: 4,
    ISTP: 4,
    ESTP: 3,
    ISTJ: 3,
    ESFJ: 2,
    ISFP: 2,
    ESFP: 1,
    ISFJ: 1,
  },
  INTP: {
    ENTJ: 9,
    ENFJ: 8,
    ENTP: 7,
    INTJ: 7,
    INFJ: 6,
    INTP: 5,
    INFP: 5,
    ENFP: 5,
    ISTP: 4,
    ESTJ: 4,
    ESTP: 3,
    ISTJ: 3,
    ISFP: 2,
    ESFJ: 2,
    ESFP: 1,
    ISFJ: 1,
  },
  ENTP: {
    INFJ: 9,
    INTJ: 8,
    INTP: 7,
    ENFP: 7,
    ENTJ: 6,
    ENTP: 5,
    ENFJ: 5,
    INFP: 5,
    ESTP: 4,
    ISTP: 4,
    ESTJ: 3,
    ISTJ: 3,
    ESFP: 2,
    ISFP: 2,
    ESFJ: 1,
    ISFJ: 1,
  },

  // SF types (Sentinels)
  ISFJ: {
    ESFP: 9,
    ESTP: 8,
    ISFP: 7,
    ESFJ: 7,
    ISTJ: 6,
    ISFJ: 5,
    ESTJ: 5,
    ISTP: 5,
    ENFJ: 4,
    ENFP: 4,
    INFP: 3,
    INFJ: 3,
    ENTJ: 2,
    ENTP: 2,
    INTJ: 1,
    INTP: 1,
  },
  ESFJ: {
    ISFP: 9,
    ISTP: 8,
    ESFP: 7,
    ISFJ: 7,
    ESTJ: 6,
    ESFJ: 5,
    ISTJ: 5,
    ESTP: 5,
    ENFP: 4,
    ENFJ: 4,
    INFJ: 3,
    INFP: 3,
    ENTP: 2,
    ENTJ: 2,
    INTP: 1,
    INTJ: 1,
  },
  ISTJ: {
    ESFP: 9,
    ESTP: 8,
    ISFJ: 7,
    ESTJ: 7,
    ISFP: 6,
    ISTJ: 5,
    ESFJ: 5,
    ISTP: 5,
    ENTJ: 4,
    ENTP: 4,
    INTJ: 3,
    INTP: 3,
    ENFJ: 2,
    ENFP: 2,
    INFJ: 1,
    INFP: 1,
  },
  ESTJ: {
    ISFP: 9,
    ISTP: 8,
    ISTJ: 7,
    ESFJ: 7,
    ESTP: 6,
    ESTJ: 5,
    ISFJ: 5,
    ESFP: 5,
    ENTJ: 4,
    INTJ: 4,
    ENTP: 3,
    INTP: 3,
    ENFP: 2,
    INFJ: 2,
    ENFJ: 1,
    INFP: 1,
  },

  // SP types (Explorers)
  ISFP: {
    ESTJ: 9,
    ENTJ: 8,
    ESFJ: 7,
    ENFJ: 7,
    ISTJ: 6,
    ISFP: 5,
    ISTP: 5,
    ESTP: 5,
    ESFP: 4,
    INFP: 4,
    INFJ: 3,
    ENFP: 3,
    INTP: 2,
    INTJ: 2,
    ENTP: 1,
    INFJ: 1,
  },
  ESFP: {
    ISFJ: 9,
    ISTJ: 8,
    ESFJ: 7,
    ISTP: 7,
    ESTP: 6,
    ESFP: 5,
    ISFP: 5,
    ESTJ: 5,
    ENFJ: 4,
    INFP: 4,
    ENFP: 3,
    INFJ: 3,
    ENTJ: 2,
    INTP: 2,
    ENTP: 1,
    INTJ: 1,
  },
  ISTP: {
    ESFJ: 9,
    ESTJ: 8,
    ESTP: 7,
    ISFP: 7,
    ESFP: 6,
    ISTP: 5,
    ISFJ: 5,
    ISTJ: 5,
    ENTJ: 4,
    INTJ: 4,
    ENTP: 3,
    INTP: 3,
    ENFJ: 2,
    INFP: 2,
    ENFP: 1,
    INFJ: 1,
  },
  ESTP: {
    ISFJ: 9,
    ISTJ: 8,
    ISTP: 7,
    ESFP: 7,
    ISFP: 6,
    ESTP: 5,
    ESFJ: 5,
    ESTJ: 5,
    INTP: 4,
    INTJ: 4,
    ENTP: 3,
    ENTJ: 3,
    INFP: 2,
    INFJ: 2,
    ENFP: 1,
    ENFJ: 1,
  },
}

// Get compatibility score between two MBTI types
export function getCompatibilityScore(type1: string, type2: string): number {
  const code1 = extractMBTICode(type1)
  const code2 = extractMBTICode(type2)

  if (code1 === "XXXX" || code2 === "XXXX") return 5 // Default middle value for unknown types

  if (mbtiCompatibilityMatrix[code1] && mbtiCompatibilityMatrix[code1][code2] !== undefined) {
    return mbtiCompatibilityMatrix[code1][code2]
  }

  // If not found in the matrix, calculate a basic compatibility
  let score = 0

  // Check each letter position
  for (let i = 0; i < 4; i++) {
    if (code1[i] === code2[i]) {
      score += 1.25 // 1.25 * 4 = 5 (middle value)
    }
  }

  return score
}

// Calculate team compatibility score
export function calculateTeamCompatibility(team: Student[]): number {
  if (team.length <= 1) return 10 // Perfect compatibility for a single person

  let totalScore = 0
  let pairCount = 0

  // Calculate compatibility between each pair of team members
  for (let i = 0; i < team.length; i++) {
    for (let j = i + 1; j < team.length; j++) {
      totalScore += getCompatibilityScore(team[i].mbtiType, team[j].mbtiType)
      pairCount++
    }
  }

  return pairCount > 0 ? totalScore / pairCount : 10
}

// Get MBTI group (NF, NT, SF, SP)
export function getMBTIGroup(mbtiType: string): string {
  const code = extractMBTICode(mbtiType)

  if (code === "XXXX") return "Unknown"

  const secondLetter = code[1]
  const thirdLetter = code[2]

  if (secondLetter === "N" && thirdLetter === "F") return "NF (Diplomat)"
  if (secondLetter === "N" && thirdLetter === "T") return "NT (Analyst)"
  if (secondLetter === "S" && thirdLetter === "F") return "SF (Sentinel)"
  if (secondLetter === "S" && thirdLetter === "T") return "SP (Explorer)"

  return "Unknown"
}

// Get MBTI description
export function getMBTIDescription(mbtiType: string): string {
  const code = extractMBTICode(mbtiType)

  const descriptions: { [key: string]: string } = {
    INFP: "内向的で理想主義者、創造的で感受性が強い",
    ENFP: "外向的で創造的、情熱的で可能性を追求する",
    INFJ: "内向的で洞察力があり、理想主義的で思いやりがある",
    ENFJ: "外向的でカリスマ的、思いやりがあり他者を導く",
    INTJ: "内向的で戦略的、独立心が強く分析的",
    ENTJ: "外向的でリーダー気質、自信があり決断力がある",
    INTP: "内向的で論理的、好奇心旺盛で創造的",
    ENTP: "外向的で革新的、知的好奇心が強く議論好き",
    ISFJ: "内向的で思いやりがあり、忠実で責任感が強い",
    ESFJ: "外向的で協力的、社交的で思いやりがある",
    ISTJ: "内向的で実践的、信頼性があり秩序を重んじる",
    ESTJ: "外向的で管理能力が高く、伝統を重んじる",
    ISFP: "内向的で芸術的、優しく調和を好む",
    ESFP: "外向的で自発的、社交的で楽観的",
    ISTP: "内向的で器用、論理的で実践的",
    ESTP: "外向的で活動的、冒険好きで適応力がある",
  }

  return descriptions[code] || "個性的で独自の視点を持つ"
}

// Get MBTI color
export function getMBTIColor(mbtiType: string): string {
  const code = extractMBTICode(mbtiType)
  const group = code.substring(1, 3)

  switch (group) {
    case "NF":
      return "pastel-pink"
    case "NT":
      return "pastel-blue"
    case "SF":
      return "pastel-green"
    case "ST":
      return "pastel-yellow"
    default:
      return "pastel-lavender"
  }
}
