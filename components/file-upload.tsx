"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { parseCSV, fetchAndParseCSV } from "@/utils/csv"
import type { Student } from "@/types"
import { Upload, FileText, Check } from "lucide-react"

interface FileUploadProps {
  onStudentsLoaded: (students: Student[]) => void
  defaultCsvUrl?: string
}

export function FileUpload({ onStudentsLoaded, defaultCsvUrl }: FileUploadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError(null)

    try {
      const students = await parseCSV(file)
      setFileName(file.name)
      onStudentsLoaded(students)
    } catch (err) {
      setError("CSVファイルの解析中にエラーが発生しました。")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadDefaultCsv = async () => {
    if (!defaultCsvUrl) return

    setIsLoading(true)
    setError(null)

    try {
      const students = await fetchAndParseCSV(defaultCsvUrl)
      setFileName("昼間部１年生Aクラス.csv")
      onStudentsLoaded(students)
    } catch (err) {
      setError("CSVファイルの読み込み中にエラーが発生しました。")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full cute-shadow h-full">
      <CardContent className="p-4 sm:p-6 flex flex-col items-center gap-4 h-full">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20">
          <FileText className="w-8 h-8 text-primary" />
        </div>

        <div className="text-center">
          <h3 className="text-lg font-bold">学生データをアップロード</h3>
          <p className="text-sm text-muted-foreground mt-1">
            CSVファイルをアップロードするか、サンプルデータを使用してください
          </p>
        </div>

        {fileName ? (
          <div className="flex items-center gap-2 text-sm font-medium text-green-600">
            <Check className="w-4 h-4" />
            <span className="text-wrap-anywhere">{fileName}</span>
          </div>
        ) : null}

        {error ? <div className="text-sm font-medium text-destructive text-wrap-anywhere">{error}</div> : null}

        <div className="flex flex-col sm:flex-row gap-2 w-full mt-auto">
          <Button variant="outline" className="relative w-full h-10" disabled={isLoading}>
            <input
              type="file"
              accept=".csv"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <Upload className="w-4 h-4 mr-2" />
            CSVをアップロード
          </Button>

          {defaultCsvUrl && (
            <Button variant="secondary" className="w-full h-10" onClick={loadDefaultCsv} disabled={isLoading}>
              サンプルデータを使用
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
