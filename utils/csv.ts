import type { CSVValidationIssue, Student } from "@/types"
import { extractMBTICode } from "./mbti"

const REQUIRED_HEADERS = ["studentId", "name", "mbtiType", "class", "gender"]

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
        message: "列数が不足しています。studentId,name,mbtiType,class,gender を入力してください。",
        severity: "error",
      })
      continue
    }

    const [studentId, name, mbtiTypeRaw, studentClassRaw, genderRaw] = values
    const mbtiType = mbtiTypeRaw.toUpperCase()
    const mbtiCode = extractMBTICode(mbtiType)
    const studentClass = studentClassRaw.trim()
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

    if (!studentClass) {
      issues.push({
        row: rowNumber,
        field: "class",
        message: "クラスを入力してください。",
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

    if (studentId && !seenIds.has(studentId) && name && mbtiCode !== "XXXX" && studentClass && gender) {
      seenIds.add(studentId)
      students.push({
        studentId,
        name,
        mbtiType,
        mbtiCode,
        studentClass,
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
