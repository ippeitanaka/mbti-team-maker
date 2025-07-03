import type { Student } from "@/types"
import { extractMBTICode } from "./mbti"

export async function parseCSV(file: File): Promise<Student[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string
        const lines = csvData.split("\n")

        // Skip header row
        const students: Student[] = []

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue

          // Split by comma, but handle quoted values
          const values = line.split(",").map((val) => val.trim().replace(/^"|"$/g, ""))

          if (values.length >= 3) {
            const student: Student = {
              studentId: values[0],
              name: values[1],
              mbtiType: values[2],
              mbtiCode: extractMBTICode(values[2]),
            }

            students.push(student)
          }
        }

        resolve(students)
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

export async function fetchAndParseCSV(url: string): Promise<Student[]> {
  try {
    const response = await fetch(url)
    const csvData = await response.text()
    const lines = csvData.split("\n")

    // Skip header row
    const students: Student[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Split by comma, but handle quoted values
      const values = line.split(",").map((val) => val.trim().replace(/^"|"$/g, ""))

      if (values.length >= 3) {
        const student: Student = {
          studentId: values[0],
          name: values[1],
          mbtiType: values[2],
          mbtiCode: extractMBTICode(values[2]),
        }

        students.push(student)
      }
    }

    return students
  } catch (error) {
    console.error("Error fetching or parsing CSV:", error)
    throw error
  }
}
