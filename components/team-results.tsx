"use client"

import { useState } from "react"
import type { Team } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { extractMBTICode, getMBTIDescription, getMBTIGroup } from "@/utils/mbti"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, RefreshCw, Users } from "lucide-react"

interface TeamResultsProps {
  teams: Team[]
  onReset: () => void
}

export function TeamResults({ teams, onReset }: TeamResultsProps) {
  const [activeTeam, setActiveTeam] = useState<number | null>(null)

  if (!teams.length) {
    return null
  }

  const handleExport = () => {
    try {
      // Create CSV content
      let csvContent = "Team,Name,StudentID,MBTI Type,MBTI Group\n"

      teams.forEach((team) => {
        team.members.forEach((student) => {
          csvContent += `${team.name},${student.name},${student.studentId},${extractMBTICode(student.mbtiType)},${getMBTIGroup(student.mbtiType)}\n`
        })
      })

      // Create a blob with BOM for proper UTF-8 encoding
      const BOM = "\uFEFF"
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8" })

      // Create a download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", "mbti_teams.csv")

      // Append to body, click, and clean up
      document.body.appendChild(link)
      link.click()

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)
    } catch (error) {
      console.error("Error exporting CSV:", error)
      alert("CSVのエクスポートに失敗しました。もう一度お試しください。")
    }
  }

  return (
    <div className="w-full space-y-4">
      <Card className="w-full cute-shadow">
        <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5" />
            チーム分け結果
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            {teams.map((team, index) => (
              <Card
                key={team.id}
                className={`team-card team-card-${(index % 8) + 1} cursor-pointer ${activeTeam === team.id ? "ring-2 ring-primary" : ""}`}
                onClick={() => setActiveTeam(activeTeam === team.id ? null : team.id)}
              >
                <CardContent className="p-3">
                  <h3 className="font-bold text-base mb-1">{team.name}</h3>
                  <div className="text-sm">
                    <p>メンバー: {team.members.length}人</p>
                    <p>相性スコア: {team.compatibility?.toFixed(1)}/10</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {activeTeam && (
            <Card className="mb-4">
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-base">{teams.find((t) => t.id === activeTeam)?.name} メンバー</CardTitle>
              </CardHeader>
              <CardContent className="p-0 px-4 pb-4">
                <ScrollArea className="h-[300px] pr-2 custom-scrollbar">
                  <div className="space-y-2">
                    {teams
                      .find((t) => t.id === activeTeam)
                      ?.members.map((student) => (
                        <div
                          key={student.studentId}
                          className="p-3 rounded-lg border mbti-card hover:shadow-md transition-all"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="text-wrap-anywhere">
                              <h3 className="font-medium">{student.name}</h3>
                              <p className="text-xs text-muted-foreground">{student.studentId}</p>
                            </div>
                            <div className="flex flex-col items-start sm:items-end">
                              <span className="text-sm font-medium">{extractMBTICode(student.mbtiType)}</span>
                              <span className="text-xs text-muted-foreground">{getMBTIGroup(student.mbtiType)}</span>
                            </div>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground text-wrap-anywhere">
                            {getMBTIDescription(student.mbtiType)}
                          </p>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 px-4 sm:px-6 pb-4">
          <Button variant="outline" onClick={onReset} className="w-full sm:w-auto h-10">
            <RefreshCw className="w-4 h-4 mr-2" />
            やり直す
          </Button>
          <Button onClick={handleExport} className="w-full sm:w-auto h-10">
            <Download className="w-4 h-4 mr-2" />
            CSVでエクスポート
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
