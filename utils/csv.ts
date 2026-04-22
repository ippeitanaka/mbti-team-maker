import type { AttendanceType, CSVValidationIssue, Student } from "@/types"
import { extractMBTICode } from "./mbti"

const REQUIRED_HEADERS = ["studentId", "name", "mbtiType", "attendanceType", "gender"]

const ATTENDANCE_TYPE_ALIASES: Record<string, AttendanceType> = {
  "day": "昼間部",
  "night": "夜間部",
  "昼": "昼間部",
  "昼間": "昼間部",
  "昼間部": "昼間部",
  "夜": "夜間部",
  "夜間": "夜間部",
  "夜間部": "夜間部",
}

const GENDER_ALIASES: Record<string, string> = {
  male: "男性",
  man: "男性",
  m: "男性",
  男: "男性",
  男性: "男性",
  female: "女性",
  woman: "女性",
  f: "女性",
  女: "女性",
  女性: "女性",
  other: "その他",
  nonbinary: "その他",
  "non-binary": "その他",
  x: "その他",
  その他: "その他",
  unknown: "未回答",
  unanswered: "未回答",
  未回答: "未回答",
}

export class CSVValidationError extends Error {
  issues: CSVValidationIssue[]

  constructor(issues: CSVValidationIssue[]) {
    super("CSV validation failed")
    this.name = "CSVValidationError"
    this.issues = issues
  }
}

function splitCSVLine(line: string) {
  return line.split(",").map((value) => value.trim().replace(/^"|"$/g, ""))
}

function normalizeAttendanceType(value: string) {
  return ATTENDANCE_TYPE_ALIASES[value.trim().toLowerCase()]
}

function normalizeGender(value: string) {
  const normalized = value.trim()
  if (!normalized) {
    return ""
  }

  return GENDER_ALIASES[normalized.toLowerCase()] || normalized
}

function validateCSV(csvData: string) {
  const lines = csvData
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const issues: CSVValidationIssue[] = []

  if (!lines.length) {
    throw new CSVValidationError([
      {
        row: 1,
        field: "file",
        message: "CSVファイルが空です。",
        severity: "error",
      },
    ])
  }

  const header = splitCSVLine(lines[0])
  const students: Student[] = []
  const seenIds = new Set<string>()

  REQUIRED_HEADERS.forEach((requiredHeader, index) => {
    if (header[index] !== requiredHeader) {
      issues.push({
        row: 1,
        field: requiredHeader,
        message: `ヘッダーは ${REQUIRED_HEADERS.join(", ")} の順で入力してください。`,
        severity: "error",
      })
    }
  })

  for (let index = 1; index < lines.length; index++) {
    const values = splitCSVLine(lines[index])
    const rowNumber = index + 1

    if (values.length < REQUIRED_HEADERS.length) {
      issues.push({
        row: rowNumber,
        field: "row",
        message: "列数が不足しています。studentId,name,mbtiType,attendanceType,gender を入力してください。",
        severity: "error",
      })
      continue
    }

    const [studentId, name, mbtiTypeRaw, attendanceTypeRaw, genderRaw] = values
    const mbtiType = mbtiTypeRaw.toUpperCase()
    const mbtiCode = extractMBTICode(mbtiType)
    const attendanceType = normalizeAttendanceType(attendanceTypeRaw)
    const gender = normalizeGender(genderRaw)

    if (!studentId) {
      issues.push({ row: rowNumber, field: "studentId", message: "学籍番号が空です。", severity: "error" })
    }

    if (!name) {
      issues.push({ row: rowNumber, field: "name", message: "名前が空です。", severity: "error" })
    }

    if (mbtiCode === "XXXX") {
      issues.push({
        row: rowNumber,
        field: "mbtiType",
        message: "MBTIは INFP や ENFJ-T のような形式で入力してください。",
        severity: "error",
      })
    }

    if (!attendanceType) {
      issues.push({
        row: rowNumber,
        field: "attendanceType",
        message: "昼間部 または 夜間部 を入力してください。",
        severity: "error",
      })
    }

    if (!gender) {
      issues.push({
        row: rowNumber,
        field: "gender",
        message: "性別が空です。",
        severity: "error",
      })
    }

    if (studentId && seenIds.has(studentId)) {
      issues.push({
        row: rowNumber,
        field: "studentId",
        message: `学籍番号 ${studentId} が重複しています。`,
        severity: "error",
      })
    }

    if (studentId && !seenIds.has(studentId) && name && mbtiCode !== "XXXX" && attendanceType && gender) {
      seenIds.add(studentId)
      students.push({
        studentId,
        name,
        mbtiType,
        mbtiCode,
        attendanceType,
        gender,
      })
    }
  }

  if (issues.some((issue) => issue.severity === "error")) {
    throw new CSVValidationError(issues)
  }

  return students
}

export async function parseCSV(file: File): Promise<Student[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string
        resolve(validateCSV(csvData))
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsText(file)
  })
}
