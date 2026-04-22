"use client"

import type React from "react"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CSVValidationError, parseCSV } from "@/utils/csv"
import type { CSVValidationIssue, Student } from "@/types"
import { Upload, FileText, Check, Download, AlertCircle } from "lucide-react"

interface FileUploadProps {
  onStudentsLoaded: (students: Student[]) => void
  templateCsvUrl?: string
}

export function FileUpload({ onStudentsLoaded, templateCsvUrl }: FileUploadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [issues, setIssues] = useState<CSVValidationIssue[]>([])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError(null)
    setIssues([])

    try {
      const students = await parseCSV(file)
      setFileName(file.name)
      onStudentsLoaded(students)
    } catch (err) {
      if (err instanceof CSVValidationError) {
        setError("CSVの形式に問題があります。以下を修正してください。")
        setIssues(err.issues)
      } else {
        setError("CSVファイルの解析中にエラーが発生しました。")
      }
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="soft-card h-full w-full overflow-hidden border-white/70 bg-white/85 backdrop-blur">
      <CardContent className="p-4 sm:p-6 flex flex-col items-center gap-4 h-full">
        <div className="icon-bubble icon-bubble-lg">
          <FileText className="w-8 h-8 text-primary" />
        </div>

        <div className="text-center">
          <h3 className="text-lg font-bold">学生データをアップロード</h3>
          <p className="text-sm text-muted-foreground mt-1">CSVファイルをアップロードしてチーム分けを開始します</p>
        </div>

        {templateCsvUrl ? (
          <div className="w-full rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 text-left">
            <p className="text-sm font-medium">テンプレートCSVをダウンロード</p>
            <p className="mt-1 text-xs text-muted-foreground">
              1行目は studentId,name,mbtiType,attendanceType,gender の順で入力してください。
            </p>
            <Button asChild variant="secondary" className="mt-3 w-full sm:w-auto">
              <a href={templateCsvUrl} download>
                <Download className="w-4 h-4" />
                テンプレートをダウンロード
              </a>
            </Button>
          </div>
        ) : null}

        {fileName ? (
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
            <Check className="w-4 h-4" />
            <span className="text-wrap-anywhere">{fileName}</span>
          </div>
        ) : null}

        {error ? <div className="text-sm font-medium text-destructive text-wrap-anywhere">{error}</div> : null}

        {issues.length > 0 ? (
          <Alert className="w-full rounded-2xl border-destructive/30 bg-rose-50/80 text-left">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>CSVを修正してください</AlertTitle>
            <AlertDescription>
              <div className="mt-3 space-y-2">
                {issues.slice(0, 6).map((issue, index) => (
                  <div key={`${issue.row}-${issue.field}-${index}`} className="rounded-xl bg-white/70 p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant="outline">{issue.field}</Badge>
                      <span className="text-xs text-slate-500">行 {issue.row}</span>
                    </div>
                    <p className="text-sm text-slate-700">{issue.message}</p>
                  </div>
                ))}
                {issues.length > 6 ? <p className="text-xs text-slate-500">ほか {issues.length - 6} 件の指摘があります。</p> : null}
              </div>
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="flex w-full mt-auto">
          <Button variant="outline" className="relative h-11 w-full rounded-xl border-white/80 bg-white/75" disabled={isLoading}>
            <input
              type="file"
              accept=".csv"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <Upload className="w-4 h-4 mr-2" />
            {isLoading ? "読み込み中..." : "CSVをアップロード"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
