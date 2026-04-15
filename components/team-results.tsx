"use client"

import { useState } from "react"
import type { TeamPlan } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { extractMBTICode, getMBTIDescription, getMBTIGroup } from "@/utils/mbti"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Download, RefreshCw, Users, Printer, Braces, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react"

interface TeamResultsProps {
  plans: TeamPlan[]
  selectedPlanId: string
  onSelectPlan: (planId: string) => void
  onRegenerate: () => void
  onReset: () => void
}

export function TeamResults({ plans, selectedPlanId, onSelectPlan, onRegenerate, onReset }: TeamResultsProps) {
  const [activeTeam, setActiveTeam] = useState<number | null>(null)
  const currentPlan = plans.find((plan) => plan.id === selectedPlanId) ?? plans[0]

  if (!plans.length || !currentPlan) {
    return null
  }

  const handleExportCsv = () => {
    try {
      let csvContent = "Team,Name,StudentID,MBTI Type,MBTI Group\n"

      currentPlan.teams.forEach((team) => {
        team.members.forEach((student) => {
          csvContent += `${team.name},${student.name},${student.studentId},${extractMBTICode(student.mbtiType)},${getMBTIGroup(student.mbtiType)}\n`
        })
      })

      const BOM = "\uFEFF"
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `${currentPlan.title}_mbti_teams.csv`)
      document.body.appendChild(link)
      link.click()
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)
    } catch (error) {
      console.error("Error exporting CSV:", error)
      alert("CSVのエクスポートに失敗しました。もう一度お試しください。")
    }
  }

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(plans, null, 2)], { type: "application/json;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "mbti-team-plans.json"
    document.body.appendChild(link)
    link.click()

    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 100)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="w-full space-y-4">
      <Card className="soft-card w-full overflow-hidden border-white/70 bg-white/85 backdrop-blur print:shadow-none">
        <CardHeader className="px-4 pb-2 pt-4 sm:px-6">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5" />
            チーム分け結果
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="mb-6 grid gap-3 lg:grid-cols-4">
            {plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => onSelectPlan(plan.id)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  selectedPlanId === plan.id
                    ? "border-primary bg-primary/10 shadow-[0_20px_50px_rgba(255,127,156,0.18)]"
                    : "border-white/70 bg-white/70 hover:-translate-y-1 hover:border-primary/40"
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{plan.title}</p>
                    <p className="text-xs text-slate-500">{plan.subtitle}</p>
                  </div>
                  <Badge variant="secondary" className="rounded-full">
                    {plan.overview.totalScore}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="rounded-xl bg-background/70 p-2">相性 {plan.overview.averageCompatibility}</div>
                  <div className="rounded-xl bg-background/70 p-2">多様性 {plan.overview.diversityScore}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="mb-6 grid gap-3 md:grid-cols-4">
            <Card className="metric-card">
              <CardContent className="p-4">
                <p className="metric-label">総合スコア</p>
                <p className="metric-value">{currentPlan.overview.totalScore}</p>
              </CardContent>
            </Card>
            <Card className="metric-card">
              <CardContent className="p-4">
                <p className="metric-label">平均相性</p>
                <p className="metric-value">{currentPlan.overview.averageCompatibility}</p>
              </CardContent>
            </Card>
            <Card className="metric-card">
              <CardContent className="p-4">
                <p className="metric-label">多様性</p>
                <p className="metric-value">{currentPlan.overview.diversityScore}</p>
              </CardContent>
            </Card>
            <Card className="metric-card">
              <CardContent className="p-4">
                <p className="metric-label">条件達成</p>
                <p className="metric-value">
                  {currentPlan.overview.satisfiedConstraints}/{currentPlan.overview.totalConstraints}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6 rounded-3xl border border-primary/15 bg-primary/5 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-bold">この案のポイント</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentPlan.overview.notes.map((note) => (
                <Badge key={note} className="rounded-full bg-white/80 px-4 py-1 text-slate-700" variant="outline">
                  {note}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4 print:grid-cols-2">
            {currentPlan.teams.map((team, index) => (
              <Card
                key={team.id}
                className={`team-card team-card-${(index % 8) + 1} cursor-pointer ${activeTeam === team.id ? "ring-2 ring-primary" : ""}`}
                onClick={() => setActiveTeam(activeTeam === team.id ? null : team.id)}
              >
                <CardContent className="p-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base">{team.name}</h3>
                    <Badge variant="secondary" className="rounded-full">
                      {team.members.length}人
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>相性スコア: {team.compatibility?.toFixed(1)}/10</p>
                    <p>ユニークMBTI: {team.insight?.uniqueMbtiCount}</p>
                    <p>リーダー候補: {team.insight?.leaderCount}人</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {activeTeam && (
            <Card className="mb-4 rounded-3xl border-white/70 bg-white/75">
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-base">{currentPlan.teams.find((t) => t.id === activeTeam)?.name} の詳細</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                {(() => {
                  const team = currentPlan.teams.find((item) => item.id === activeTeam)
                  if (!team) return null

                  return (
                    <>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl bg-emerald-50 p-4">
                          <div className="mb-2 flex items-center gap-2 text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                            <p className="text-sm font-bold">納得ポイント</p>
                          </div>
                          <ul className="space-y-2 text-sm text-emerald-900">
                            {team.insight?.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                          </ul>
                        </div>
                        <div className="rounded-2xl bg-amber-50 p-4">
                          <div className="mb-2 flex items-center gap-2 text-amber-700">
                            <AlertTriangle className="h-4 w-4" />
                            <p className="text-sm font-bold">注意点</p>
                          </div>
                          <ul className="space-y-2 text-sm text-amber-900">
                            {(team.insight?.warnings.length ? team.insight.warnings : ["目立った懸念はありません"]).map((warning) => (
                              <li key={warning}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <Accordion type="single" collapsible className="rounded-2xl border border-white/70 bg-white/75 px-4">
                        <AccordionItem value="members" className="border-none">
                          <AccordionTrigger className="text-sm">メンバー詳細を見る</AccordionTrigger>
                          <AccordionContent>
                            <ScrollArea className="h-[320px] pr-2 custom-scrollbar">
                              <div className="space-y-2">
                                {team.members.map((student) => (
                                  <div key={student.studentId} className="mbti-card rounded-2xl border border-white/70 bg-white/80 p-3">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                      <div className="text-wrap-anywhere">
                                        <h3 className="font-medium text-slate-900">{student.name}</h3>
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
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </>
                  )
                })()}
              </CardContent>
            </Card>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 px-4 sm:px-6 pb-4">
          <Button variant="outline" onClick={onReset} className="h-10 w-full rounded-xl sm:w-auto print:hidden">
            <RefreshCw className="w-4 h-4 mr-2" />
            やり直す
          </Button>
          <Button variant="outline" onClick={onRegenerate} className="h-10 w-full rounded-xl sm:w-auto print:hidden">
            <Sparkles className="mr-2 h-4 w-4" />
            別案を再生成
          </Button>
          <Button onClick={handleExportCsv} className="h-10 w-full rounded-xl sm:w-auto print:hidden">
            <Download className="w-4 h-4 mr-2" />
            CSVでエクスポート
          </Button>
          <Button variant="secondary" onClick={handleExportJson} className="h-10 w-full rounded-xl sm:w-auto print:hidden">
            <Braces className="mr-2 h-4 w-4" />
            JSONを書き出し
          </Button>
          <Button variant="secondary" onClick={handlePrint} className="h-10 w-full rounded-xl sm:w-auto print:hidden">
            <Printer className="mr-2 h-4 w-4" />
            印刷する
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
