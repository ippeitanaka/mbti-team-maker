"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import type { TeamFormationStrategy, TeamFormationConfig } from "@/types"
import { Users, Sparkles } from "lucide-react"

interface TeamConfigProps {
  onConfigChange: (config: TeamFormationConfig) => void
  onFormTeams: () => void
  isLoading: boolean
  studentCount: number
}

export function TeamConfig({ onConfigChange, onFormTeams, isLoading, studentCount }: TeamConfigProps) {
  const [numberOfTeams, setNumberOfTeams] = useState(4)
  const [strategy, setStrategy] = useState<TeamFormationStrategy>("compatibility")
  const [purpose, setPurpose] = useState("")

  const handleNumberOfTeamsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value, 10)
    if (value > 0 && value <= Math.ceil(studentCount / 2)) {
      setNumberOfTeams(value)
      onConfigChange({ numberOfTeams: value, strategy, purpose })
    }
  }

  const handleStrategyChange = (value: string) => {
    setStrategy(value as TeamFormationStrategy)
    onConfigChange({ numberOfTeams, strategy: value as TeamFormationStrategy, purpose })
  }

  const handlePurposeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPurpose(e.target.value)
    onConfigChange({ numberOfTeams, strategy, purpose: e.target.value })
  }

  return (
    <Card className="w-full cute-shadow h-full">
      <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Users className="w-5 h-5" />
          チーム設定
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="numberOfTeams" className="text-sm font-medium">
              チーム数
            </Label>
            <Input
              id="numberOfTeams"
              type="number"
              min={1}
              max={Math.ceil(studentCount / 2)}
              value={numberOfTeams}
              onChange={handleNumberOfTeamsChange}
              disabled={isLoading}
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              {studentCount > 0
                ? `各チーム約 ${Math.ceil(studentCount / numberOfTeams)} 人になります`
                : "学生データをアップロードしてください"}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">チーム分け戦略</Label>
            <RadioGroup
              value={strategy}
              onValueChange={handleStrategyChange}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
              disabled={isLoading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="compatibility" id="compatibility" />
                <Label htmlFor="compatibility" className="cursor-pointer text-sm">
                  相性重視
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="balance" id="balance" />
                <Label htmlFor="balance" className="cursor-pointer text-sm">
                  バランス重視
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="diversity" id="diversity" />
                <Label htmlFor="diversity" className="cursor-pointer text-sm">
                  多様性重視
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="similarity" id="similarity" />
                <Label htmlFor="similarity" className="cursor-pointer text-sm">
                  類似性重視
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose" className="text-sm font-medium">
              チームの目的 (オプション)
            </Label>
            <Textarea
              id="purpose"
              placeholder="例: プロジェクト開発、ディスカッション、プレゼンテーションなど"
              value={purpose}
              onChange={handlePurposeChange}
              disabled={isLoading}
              className="resize-none h-20"
            />
            <p className="text-xs text-muted-foreground">目的を入力すると、AIがより適切なチーム分けを提案します</p>
          </div>

          <Button className="w-full h-10 mt-4" onClick={onFormTeams} disabled={isLoading || studentCount === 0}>
            {isLoading ? (
              "チーム分け中..."
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                チームを作成
              </>
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            AIを使用してチーム分けを行います。AIが利用できない場合は自動的にローカルアルゴリズムを使用します。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
