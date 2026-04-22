import type {
  PairConstraint,
  PlanOverview,
  Student,
  Team,
  TeamConstraintConfig,
  TeamFormationConfig,
  TeamFormationStrategy,
  TeamPlan,
  TeamPlanSource,
} from "@/types"
import { calculateTeamCompatibility, extractMBTICode, getMBTIGroup } from "./mbti"

const SCORE_PRECISION = 10

function round(value: number, precision = SCORE_PRECISION) {
  return Math.round(value * precision) / precision
}

export function getStrategyLabel(strategy: TeamFormationStrategy) {
  switch (strategy) {
    case "compatibility":
      return "相性重視"
    case "balance":
      return "バランス重視"
    case "diversity":
      return "多様性重視"
    case "similarity":
      return "類似性重視"
    default:
      return "おすすめ"
  }
}

function uniqueMbtiCount(team: Team) {
  return new Set(team.members.map((student) => extractMBTICode(student.mbtiType))).size
}

function getTeamLeaderCount(team: Team, leaderIds: string[]) {
  return team.members.filter((student) => leaderIds.includes(student.studentId)).length
}

function getAllStudentsFromTeams(teams: Team[]) {
  return teams.flatMap((team) => team.members)
}

function getCategoryDistribution(students: Student[], getCategory: (student: Student) => string) {
  const counts = new Map<string, number>()

  students.forEach((student) => {
    const category = getCategory(student)
    counts.set(category, (counts.get(category) || 0) + 1)
  })

  return counts
}

function getCategoryDeviationForTeam(team: Team, students: Student[], getCategory: (student: Student) => string) {
  if (!team.members.length || !students.length) {
    return 0
  }

  const totalStudents = students.length
  const overallDistribution = getCategoryDistribution(students, getCategory)
  const teamDistribution = getCategoryDistribution(team.members, getCategory)

  return [...overallDistribution.entries()].reduce((total, [category, count]) => {
    const expected = (team.members.length * count) / totalStudents
    const actual = teamDistribution.get(category) || 0
    return total + Math.abs(actual - expected)
  }, 0)
}

function calculateCategoryBalanceScore(team: Team, students: Student[], getCategory: (student: Student) => string) {
  if (team.members.length <= 1) {
    return 100
  }

  const deviation = getCategoryDeviationForTeam(team, students, getCategory)
  return round(Math.max(0, 100 - (deviation / team.members.length) * 100))
}

function countCategoryDistributionPenalty(teams: Team[], getCategory: (student: Student) => string, weight: number) {
  const allStudents = getAllStudentsFromTeams(teams)

  return round(
    teams.reduce((total, team) => total + getCategoryDeviationForTeam(team, allStudents, getCategory) * weight, 0),
  )
}

function isCategoryBalanceSatisfied(teams: Team[], getCategory: (student: Student) => string) {
  const allStudents = getAllStudentsFromTeams(teams)

  return teams.every((team) => getCategoryDeviationForTeam(team, allStudents, getCategory) <= 1)
}

export function calculateTeamDiversityScore(team: Team) {
  if (team.members.length <= 1) {
    return 100
  }

  return round((uniqueMbtiCount(team) / team.members.length) * 100)
}

export function calculateGroupBalanceScore(team: Team) {
  if (team.members.length <= 1) {
    return 100
  }

  const counts = new Map<string, number>()

  team.members.forEach((student) => {
    const group = getMBTIGroup(student.mbtiType)
    counts.set(group, (counts.get(group) || 0) + 1)
  })

  const values = [...counts.values()]
  const max = Math.max(...values)
  const min = Math.min(...values)

  return round(Math.max(0, 100 - (max - min) * 25))
}

function countMbtiDuplicates(team: Team) {
  const counts = new Map<string, number>()

  team.members.forEach((student) => {
    const mbtiCode = extractMBTICode(student.mbtiType)
    counts.set(mbtiCode, (counts.get(mbtiCode) || 0) + 1)
  })

  return [...counts.values()].reduce((total, count) => total + Math.max(0, count - 1), 0)
}

function getTeamWarnings(team: Team, constraints: TeamConstraintConfig, students: Student[]) {
  const warnings: string[] = []
  const compatibility = calculateTeamCompatibility(team.members)
  const diversityScore = calculateTeamDiversityScore(team)

  if (compatibility < 5.5) {
    warnings.push("相性スコアがやや低めです")
  }

  if (diversityScore < 45) {
    warnings.push("MBTIタイプが偏り気味です")
  }

  if (constraints.spreadLeaders && getTeamLeaderCount(team, constraints.leaderIds) > 1) {
    warnings.push("リーダー候補がこのチームに集中しています")
  }

  if (constraints.avoidDuplicateMbti && countMbtiDuplicates(team) > 1) {
    warnings.push("同じMBTIが複数名入っています")
  }

  if (constraints.balanceClasses && calculateCategoryBalanceScore(team, students, (student) => student.studentClass) < 70) {
    warnings.push("クラス比が全体構成からやや外れています")
  }

  if (constraints.balanceGender && calculateCategoryBalanceScore(team, students, (student) => student.gender) < 70) {
    warnings.push("性別比が全体構成からやや外れています")
  }

  return warnings
}

function getTeamHighlights(team: Team, constraints: TeamConstraintConfig, students: Student[]) {
  const highlights: string[] = []
  const compatibility = calculateTeamCompatibility(team.members)
  const diversityScore = calculateTeamDiversityScore(team)
  const balanceScore = calculateGroupBalanceScore(team)
  const leaderCount = getTeamLeaderCount(team, constraints.leaderIds)
  const classBalanceScore = calculateCategoryBalanceScore(team, students, (student) => student.studentClass)
  const genderBalanceScore = calculateCategoryBalanceScore(team, students, (student) => student.gender)

  if (compatibility >= 7.5) {
    highlights.push("相性の良い組み合わせが多いチームです")
  }

  if (diversityScore >= 70) {
    highlights.push("MBTIの多様性が高く、視点が広がりやすい構成です")
  }

  if (balanceScore >= 80) {
    highlights.push("思考タイプと行動タイプのバランスが良好です")
  }

  if (leaderCount === 1) {
    highlights.push("リーダー候補が1人入り、役割が明確になりやすいです")
  }

  if (constraints.balanceClasses && classBalanceScore >= 85) {
    highlights.push("クラス比が全体構成に近く保たれています")
  }

  if (constraints.balanceGender && genderBalanceScore >= 85) {
    highlights.push("性別比が全体構成に近く、偏りが抑えられています")
  }

  if (!highlights.length) {
    highlights.push("大きな偏りがなく、扱いやすいチーム構成です")
  }

  return highlights
}

export function enrichTeams(teams: Team[], config: TeamFormationConfig) {
  const allStudents = getAllStudentsFromTeams(teams)

  return teams.map((team) => {
    const compatibility = round(calculateTeamCompatibility(team.members))

    return {
      ...team,
      compatibility,
      insight: {
        compatibility,
        diversityScore: calculateTeamDiversityScore(team),
        groupBalanceScore: calculateGroupBalanceScore(team),
        uniqueMbtiCount: uniqueMbtiCount(team),
        leaderCount: getTeamLeaderCount(team, config.constraints.leaderIds),
        classBalanceScore: calculateCategoryBalanceScore(team, allStudents, (student) => student.studentClass),
        genderBalanceScore: calculateCategoryBalanceScore(team, allStudents, (student) => student.gender),
        warnings: getTeamWarnings(team, config.constraints, allStudents),
        highlights: getTeamHighlights(team, config.constraints, allStudents),
      },
    }
  })
}

function isSamePair(pair: PairConstraint, firstId: string, secondId: string) {
  return (
    (pair.firstId === firstId && pair.secondId === secondId) ||
    (pair.firstId === secondId && pair.secondId === firstId)
  )
}

function findTeamIndexByStudentId(teams: Team[], studentId: string) {
  return teams.findIndex((team) => team.members.some((student) => student.studentId === studentId))
}

function getConstraintSummary(teams: Team[], constraints: TeamConstraintConfig) {
  const details = {
    satisfied: 0,
    total: 0,
  }

  if (constraints.spreadLeaders && constraints.leaderIds.length > 0) {
    details.total += 1
    const leaderCounts = teams.map((team) => getTeamLeaderCount(team, constraints.leaderIds))
    const max = Math.max(...leaderCounts)
    const min = Math.min(...leaderCounts)

    if (max - min <= 1 && max <= 1) {
      details.satisfied += 1
    }
  }

  if (constraints.avoidDuplicateMbti) {
    details.total += 1
    const duplicateCount = teams.reduce((total, team) => total + countMbtiDuplicates(team), 0)

    if (duplicateCount === 0) {
      details.satisfied += 1
    }
  }

  if (constraints.balanceClasses) {
    details.total += 1

    if (isCategoryBalanceSatisfied(teams, (student) => student.studentClass)) {
      details.satisfied += 1
    }
  }

  if (constraints.balanceGender) {
    details.total += 1

    if (isCategoryBalanceSatisfied(teams, (student) => student.gender)) {
      details.satisfied += 1
    }
  }

  constraints.preferredPairs.forEach((pair) => {
    details.total += 1
    const firstTeam = findTeamIndexByStudentId(teams, pair.firstId)
    const secondTeam = findTeamIndexByStudentId(teams, pair.secondId)

    if (firstTeam !== -1 && firstTeam === secondTeam) {
      details.satisfied += 1
    }
  })

  constraints.separatedPairs.forEach((pair) => {
    details.total += 1
    const firstTeam = findTeamIndexByStudentId(teams, pair.firstId)
    const secondTeam = findTeamIndexByStudentId(teams, pair.secondId)

    if (firstTeam !== -1 && secondTeam !== -1 && firstTeam !== secondTeam) {
      details.satisfied += 1
    }
  })

  return details
}

function createOverviewNotes(teams: Team[], config: TeamFormationConfig, averageCompatibility: number, diversityScore: number) {
  const notes: string[] = []
  const sizes = teams.map((team) => team.members.length)
  const sizeSpread = Math.max(...sizes) - Math.min(...sizes)

  if (averageCompatibility >= 7) {
    notes.push("全体として相性が高めの編成です")
  } else if (averageCompatibility < 5.5) {
    notes.push("相性面ではやや改善余地があります")
  }

  if (diversityScore >= 65) {
    notes.push("チームごとのMBTIの幅が十分に確保されています")
  }

  if (sizeSpread <= 1) {
    notes.push("人数差が小さく、運営しやすい構成です")
  }

  if (config.constraints.preferredPairs.length || config.constraints.separatedPairs.length) {
    notes.push("指定した組み合わせ条件を考慮した編成です")
  }

  if (config.constraints.balanceClasses) {
    notes.push("クラス比も加味してあります")
  }

  if (config.constraints.balanceGender) {
    notes.push("性別比の偏りも抑える方向で調整しています")
  }

  return notes.slice(0, 3)
}

export function createPlanOverview(teams: Team[], config: TeamFormationConfig): PlanOverview {
  const averageCompatibility = round(
    teams.reduce((total, team) => total + (team.compatibility ?? calculateTeamCompatibility(team.members)), 0) / teams.length,
  )
  const diversityScore = round(teams.reduce((total, team) => total + calculateTeamDiversityScore(team), 0) / teams.length)
  const sizes = teams.map((team) => team.members.length)
  const sizeSpread = Math.max(...sizes) - Math.min(...sizes)
  const constraints = getConstraintSummary(teams, config.constraints)
  const sizeScore = Math.max(0, 100 - sizeSpread * 25)
  const totalScore = round(averageCompatibility * 8 + diversityScore * 0.2 + sizeScore * 0.1)

  return {
    totalScore,
    averageCompatibility,
    diversityScore,
    sizeSpread,
    satisfiedConstraints: constraints.satisfied,
    totalConstraints: constraints.total,
    notes: createOverviewNotes(teams, config, averageCompatibility, diversityScore),
  }
}

export function createTeamPlan(options: {
  id: string
  title: string
  subtitle: string
  strategy: TeamFormationStrategy
  source: TeamPlanSource
  teams: Team[]
  config: TeamFormationConfig
}): TeamPlan {
  const enrichedTeams = enrichTeams(options.teams, options.config)

  return {
    id: options.id,
    title: options.title,
    subtitle: options.subtitle,
    strategy: options.strategy,
    source: options.source,
    teams: enrichedTeams,
    overview: createPlanOverview(enrichedTeams, options.config),
  }
}

export function formatConstraintPairLabel(pair: PairConstraint, students: Student[]) {
  const first = students.find((student) => student.studentId === pair.firstId)
  const second = students.find((student) => student.studentId === pair.secondId)

  return `${first?.name || pair.firstId} / ${second?.name || pair.secondId}`
}

export function countConstraintPenalty(teams: Team[], config: TeamFormationConfig) {
  let penalty = 0

  if (config.constraints.spreadLeaders && config.constraints.leaderIds.length > 0) {
    const leaderCounts = teams.map((team) => getTeamLeaderCount(team, config.constraints.leaderIds))
    const max = Math.max(...leaderCounts)
    const min = Math.min(...leaderCounts)

    penalty += Math.max(0, max - 1) * 18
    penalty += Math.max(0, max - min - 1) * 12
    penalty += leaderCounts.filter((count) => count > 1).length * 8
  }

  if (config.constraints.avoidDuplicateMbti) {
    penalty += teams.reduce((total, team) => total + countMbtiDuplicates(team) * 6, 0)
  }

  if (config.constraints.balanceClasses) {
    penalty += countCategoryDistributionPenalty(teams, (student) => student.studentClass, 5)
  }

  if (config.constraints.balanceGender) {
    penalty += countCategoryDistributionPenalty(teams, (student) => student.gender, 5)
  }

  config.constraints.preferredPairs.forEach((pair) => {
    const firstTeam = findTeamIndexByStudentId(teams, pair.firstId)
    const secondTeam = findTeamIndexByStudentId(teams, pair.secondId)

    if (firstTeam !== -1 && secondTeam !== -1 && firstTeam !== secondTeam) {
      penalty += 24
    }
  })

  config.constraints.separatedPairs.forEach((pair) => {
    const firstTeam = findTeamIndexByStudentId(teams, pair.firstId)
    const secondTeam = findTeamIndexByStudentId(teams, pair.secondId)

    if (firstTeam !== -1 && firstTeam === secondTeam) {
      penalty += 28
    }
  })

  return penalty
}

export function calculateSimilarityScore(team: Team) {
  if (team.members.length <= 1) {
    return 100
  }

  const counts = new Map<string, number>()

  team.members.forEach((student) => {
    const mbtiCode = extractMBTICode(student.mbtiType)
    counts.set(mbtiCode, (counts.get(mbtiCode) || 0) + 1)
  })

  const dominant = Math.max(...counts.values())
  return round((dominant / team.members.length) * 100)
}