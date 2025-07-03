"use client"

import { useState } from "react"
import type { Student, Team, TeamFormationConfig } from "@/types"
import { FileUpload } from "@/components/file-upload"
import { StudentList } from "@/components/student-list"
import { TeamConfig } from "@/components/team-config"
import { TeamResults } from "@/components/team-results"
import { MBTIInfo } from "@/components/mbti-info"
import { formTeamsWithAI } from "@/utils/ai-team-formation"
import { formTeams } from "@/utils/team-formation"

export default function Home() {
  const [students, setStudents] = useState<Student[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [config, setConfig] = useState<TeamFormationConfig>({
    numberOfTeams: 4,
    strategy: "compatibility",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"upload" | "config" | "results">("upload")

  const handleStudentsLoaded = (loadedStudents: Student[]) => {
    setStudents(loadedStudents)
    setStep("config")
  }

  const handleConfigChange = (newConfig: TeamFormationConfig) => {
    setConfig(newConfig)
  }

  const handleFormTeams = async () => {
    setIsLoading(true)
    try {
      const formedTeams = await formTeamsWithAI(students, config)
      setTeams(formedTeams)
      setStep("results")
    } catch (error) {
      console.error("Error forming teams:", error)
      // Still try to use the local algorithm as a last resort
      try {
        const formedTeams = formTeams(students, config.numberOfTeams, config.strategy)
        setTeams(formedTeams)
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
    setTeams([])
    setStep("config")
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">MBTI Team Maker</h1>
          <p className="text-muted-foreground">MBTIの相性を考慮して、最適なチーム分けを提案します</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
          <div className={`${step === "upload" ? "lg:col-span-12" : "lg:col-span-4"}`}>
            <FileUpload
              onStudentsLoaded={handleStudentsLoaded}
              defaultCsvUrl="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E6%98%BC%E9%96%93%E9%83%A8%EF%BC%91%E5%B9%B4%E7%94%9FA%E3%82%AF%E3%83%A9%E3%82%B9-QUBxCFAjN0F4N8hvXCtek9m7SFqJip.csv"
            />
          </div>

          {step !== "upload" && (
            <>
              <div className="lg:col-span-4">
                <StudentList students={students} />
              </div>
              <div className="lg:col-span-4">
                {step === "config" ? (
                  <TeamConfig
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

        {step === "results" && <TeamResults teams={teams} onReset={handleReset} />}
      </div>
    </main>
  )
}
