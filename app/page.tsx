"use client"

import { useCallback, useMemo, useState } from "react"
import type { Student, TeamConstraintConfig, TeamFormationConfig, TeamPlan, TeamFormationStrategy } from "@/types"
import { FileUpload } from "@/components/file-upload"
import { StudentList } from "@/components/student-list"
import { TeamConfig } from "@/components/team-config"
import { TeamResults } from "@/components/team-results"
import { MBTIInfo } from "@/components/mbti-info"
import { formTeamsWithAI } from "@/utils/ai-team-formation"
import { formTeams } from "@/utils/team-formation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, HeartHandshake, Download, Wand2 } from "lucide-react"
import { createTeamPlan, getStrategyLabel } from "@/utils/team-insights"

const DEFAULT_CONSTRAINTS: TeamConstraintConfig = {
  spreadLeaders: false,
  leaderIds: [],
  preferredPairs: [],
  separatedPairs: [],
  avoidDuplicateMbti: false,
}

const DEFAULT_CONFIG: TeamFormationConfig = {
  numberOfTeams: 4,
  strategy: "compatibility",
  purpose: "",
  constraints: DEFAULT_CONSTRAINTS,
}

const STRATEGIES: TeamFormationStrategy[] = ["compatibility", "balance", "diversity", "similarity"]

export default function Home() {
  const [students, setStudents] = useState<Student[]>([])
  const [plans, setPlans] = useState<TeamPlan[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [config, setConfig] = useState<TeamFormationConfig>(DEFAULT_CONFIG)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"upload" | "config" | "results">("upload")

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? plans[0] ?? null,
    [plans, selectedPlanId],
  )

  const buildPlans = async () => {
    const primaryResult = await formTeamsWithAI(students, config)
    const timestamp = Date.now().toString()

    const primaryPlan = createTeamPlan({
      id: `primary-${timestamp}`,
      title: primaryResult.source === "ai" ? "AIおすすめ案" : "おすすめ案",
      subtitle:
        primaryResult.source === "ai"
          ? `${getStrategyLabel(config.strategy)}で生成したAIプラン`
          : `${getStrategyLabel(config.strategy)}で生成したローカルプラン`,
      strategy: config.strategy,
      source: primaryResult.source,
      teams: primaryResult.teams,
      config,
    })

    const alternativePlans = STRATEGIES.filter((strategy) => strategy !== config.strategy).map((strategy) => {
      const alternativeConfig: TeamFormationConfig = {
        ...config,
        strategy,
      }

      return createTeamPlan({
        id: `${strategy}-${timestamp}`,
        title: `${getStrategyLabel(strategy)}案`,
        subtitle: "比較用のローカル生成プラン",
        strategy,
        source: "local",
        teams: formTeams(students, alternativeConfig),
        config: alternativeConfig,
      })
    })

    return [primaryPlan, ...alternativePlans]
  }

  const handleStudentsLoaded = (loadedStudents: Student[]) => {
    setStudents(loadedStudents)
    setPlans([])
    setSelectedPlanId(null)
    setStep("config")
  }

  const handleConfigChange = useCallback((newConfig: TeamFormationConfig) => {
    setConfig(newConfig)
  }, [])

  const handleFormTeams = async () => {
    setIsLoading(true)
    try {
      const generatedPlans = await buildPlans()
      setPlans(generatedPlans)
      setSelectedPlanId(generatedPlans[0]?.id ?? null)
      setStep("results")
    } catch (error) {
      console.error("Error forming teams:", error)
      try {
        const fallbackPlan = createTeamPlan({
          id: `fallback-${Date.now()}`,
          title: "ローカル再生成案",
          subtitle: "AIが使えなかったためローカル生成に切り替えました",
          strategy: config.strategy,
          source: "local",
          teams: formTeams(students, config),
          config,
        })
        setPlans([fallbackPlan])
        setSelectedPlanId(fallbackPlan.id)
        setStep("results")
        alert("AIによるチーム分けに失敗しましたが、ローカルアルゴリズムでチームを作成しました。")
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError)
        alert("チーム分けに失敗しました。もう一度お試しください。")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setPlans([])
    setSelectedPlanId(null)
    setStep("config")
  }

  const stepCards = [
    {
      icon: Download,
      title: "1. テンプレートを用意",
      description: "CSVテンプレートを使って学生番号・名前・MBTIを整理します。",
    },
    {
      icon: HeartHandshake,
      title: "2. 条件を整える",
      description: "リーダー分散や相性条件を指定して、現場の事情を反映できます。",
    },
    {
      icon: Wand2,
      title: "3. 案を比較する",
      description: "おすすめ案と比較案を見比べて、納得できるチームを選べます。",
    },
  ]

  return (
    <main className="min-h-screen overflow-hidden px-4 py-6 md:px-6 md:py-8">
      <div className="app-shell mx-auto max-w-7xl">
        <section className="hero-card relative mb-6 overflow-hidden rounded-[2rem] px-6 py-8 md:px-10 md:py-12">
          <div className="floating-orb floating-orb-left" />
          <div className="floating-orb floating-orb-right" />
          <div className="relative z-10 max-w-3xl">
            <Badge className="mb-4 rounded-full bg-white/75 px-4 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-700 backdrop-blur">
              Cute Team Planner
            </Badge>
            <h1 className="mb-4 text-4xl font-black leading-tight text-slate-900 md:text-6xl">
              MBTI Team Maker
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-700 md:text-base">
              MBTI の相性、多様性、運営上の条件をまとめて扱いながら、比較しやすいチーム案を作るアプリです。
              かわいく、でも実務では説明しやすい結果に寄せています。
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full px-4 py-1 text-xs">
                CSV検証つき
              </Badge>
              <Badge variant="secondary" className="rounded-full px-4 py-1 text-xs">
                条件付き編成
              </Badge>
              <Badge variant="secondary" className="rounded-full px-4 py-1 text-xs">
                比較プラン表示
              </Badge>
              <Badge variant="secondary" className="rounded-full px-4 py-1 text-xs">
                印刷・JSON対応
              </Badge>
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-3 md:grid-cols-3">
          {stepCards.map((item) => {
            const Icon = item.icon

            return (
              <Card key={item.title} className="soft-card border-white/70 bg-white/80 backdrop-blur">
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="icon-bubble">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{item.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </section>

        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>アップロード後は、制約条件を加えた上で複数の編成案を比較できます。</span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className={`${step === "upload" ? "lg:col-span-12" : "lg:col-span-4"}`}>
            <FileUpload onStudentsLoaded={handleStudentsLoaded} templateCsvUrl="/mbti-team-maker-template.csv" />
          </div>

          {step !== "upload" && (
            <>
              <div className="lg:col-span-4">
                <StudentList students={students} />
              </div>
              <div className="lg:col-span-4">
                {step === "config" ? (
                  <TeamConfig
                    students={students}
                    initialConfig={config}
                    onConfigChange={handleConfigChange}
                    onFormTeams={handleFormTeams}
                    isLoading={isLoading}
                    studentCount={students.length}
                  />
                ) : (
                  <MBTIInfo />
                )}
              </div>
            </>
          )}
        </div>

        {step === "results" && selectedPlan ? (
          <div className="mt-6">
            <TeamResults
              plans={plans}
              selectedPlanId={selectedPlan.id}
              onSelectPlan={setSelectedPlanId}
              onRegenerate={handleFormTeams}
              onReset={handleReset}
            />
          </div>
        ) : null}
      </div>
    </main>
  )
}
