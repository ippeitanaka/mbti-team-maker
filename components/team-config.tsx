"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { Student, TeamFormationStrategy, TeamFormationConfig, PairConstraint } from "@/types"
import { Users, Sparkles, WandSparkles, ShieldCheck } from "lucide-react"

interface TeamConfigProps {
  students: Student[]
  initialConfig: TeamFormationConfig
  onConfigChange: (config: TeamFormationConfig) => void
  onFormTeams: () => void
  isLoading: boolean
  studentCount: number
}

function parseIdList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

function parsePairs(value: string): PairConstraint[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [firstId, secondId] = line.split(",").map((item) => item.trim())
      return { firstId, secondId }
    })
    .filter((pair) => pair.firstId && pair.secondId && pair.firstId !== pair.secondId)
}

export function TeamConfig({ students, initialConfig, onConfigChange, onFormTeams, isLoading, studentCount }: TeamConfigProps) {
  const [numberOfTeams, setNumberOfTeams] = useState(initialConfig.numberOfTeams)
  const [strategy, setStrategy] = useState<TeamFormationStrategy>(initialConfig.strategy)
  const [purpose, setPurpose] = useState(initialConfig.purpose ?? "")
  const [spreadLeaders, setSpreadLeaders] = useState(initialConfig.constraints.spreadLeaders)
  const [leaderIdsText, setLeaderIdsText] = useState(initialConfig.constraints.leaderIds.join(", "))
  const [avoidDuplicateMbti, setAvoidDuplicateMbti] = useState(initialConfig.constraints.avoidDuplicateMbti)
  const [balanceClasses, setBalanceClasses] = useState(initialConfig.constraints.balanceClasses)
  const [balanceGender, setBalanceGender] = useState(initialConfig.constraints.balanceGender)
  const [preferredPairsText, setPreferredPairsText] = useState(
    initialConfig.constraints.preferredPairs.map((pair) => `${pair.firstId},${pair.secondId}`).join("\n"),
  )
  const [separatedPairsText, setSeparatedPairsText] = useState(
    initialConfig.constraints.separatedPairs.map((pair) => `${pair.firstId},${pair.secondId}`).join("\n"),
  )

  const availableIds = useMemo(() => new Set(students.map((student) => student.studentId)), [students])
  const leaderIds = useMemo(() => parseIdList(leaderIdsText), [leaderIdsText])
  const preferredPairs = useMemo(() => parsePairs(preferredPairsText), [preferredPairsText])
  const separatedPairs = useMemo(() => parsePairs(separatedPairsText), [separatedPairsText])
  const invalidLeaderIds = leaderIds.filter((id) => !availableIds.has(id))
  const invalidPairs = [...preferredPairs, ...separatedPairs].filter(
    (pair) => !availableIds.has(pair.firstId) || !availableIds.has(pair.secondId),
  )
  const classSummary = useMemo(() => {
    const counts = new Map<string, number>()

    students.forEach((student) => {
      counts.set(student.studentClass, (counts.get(student.studentClass) || 0) + 1)
    })

    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [students])
  const genderSummary = useMemo(() => {
    const counts = new Map<string, number>()

    students.forEach((student) => {
      counts.set(student.gender, (counts.get(student.gender) || 0) + 1)
    })

    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [students])

  useEffect(() => {
    onConfigChange({
      numberOfTeams,
      strategy,
      purpose,
      constraints: {
        spreadLeaders,
        leaderIds,
        preferredPairs,
        separatedPairs,
        avoidDuplicateMbti,
        balanceClasses,
        balanceGender,
      },
    })
  }, [
    numberOfTeams,
    strategy,
    purpose,
    spreadLeaders,
    leaderIds,
    preferredPairs,
    separatedPairs,
    avoidDuplicateMbti,
    balanceClasses,
    balanceGender,
    onConfigChange,
  ])

  const handleNumberOfTeamsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value, 10)
    if (value > 0 && value <= Math.ceil(studentCount / 2)) {
      setNumberOfTeams(value)
    }
  }

  const handleStrategyChange = (value: string) => {
    setStrategy(value as TeamFormationStrategy)
  }

  const handlePurposeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPurpose(e.target.value)
  }

  return (
    <Card className="soft-card h-full w-full overflow-hidden border-white/70 bg-white/85 backdrop-blur">
      <CardHeader className="px-4 pb-2 pt-4 sm:px-6">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Users className="h-5 w-5" />
          チーム設定
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4">
        <div className="space-y-5">
          <Alert className="rounded-2xl border-primary/20 bg-primary/5">
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>比較しやすい編成を作れます</AlertTitle>
            <AlertDescription>
              ここで条件を追加すると、結果画面で制約達成数や注意点も一緒に確認できます。
            </AlertDescription>
          </Alert>

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
              className="h-11 rounded-xl"
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
              <div className="flex items-center space-x-2 rounded-xl border border-white/70 bg-white/70 p-3">
                <RadioGroupItem value="compatibility" id="compatibility" />
                <Label htmlFor="compatibility" className="cursor-pointer text-sm">
                  相性重視
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-xl border border-white/70 bg-white/70 p-3">
                <RadioGroupItem value="balance" id="balance" />
                <Label htmlFor="balance" className="cursor-pointer text-sm">
                  バランス重視
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-xl border border-white/70 bg-white/70 p-3">
                <RadioGroupItem value="diversity" id="diversity" />
                <Label htmlFor="diversity" className="cursor-pointer text-sm">
                  多様性重視
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-xl border border-white/70 bg-white/70 p-3">
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
              className="h-24 resize-none rounded-2xl"
            />
            <p className="text-xs text-muted-foreground">目的を入力すると、AIがより適切なチーム分けを提案します</p>
          </div>

          <div className="rounded-2xl border border-primary/15 bg-white/70 p-4">
            <div className="mb-4 flex items-center gap-2">
              <WandSparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-bold">編成条件</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 rounded-xl bg-background/70 p-3">
                <div>
                  <Label htmlFor="spreadLeaders" className="text-sm font-medium">
                    リーダー候補を分散する
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">各チームにリーダー候補が偏らないようにします。</p>
                </div>
                <Switch id="spreadLeaders" checked={spreadLeaders} onCheckedChange={setSpreadLeaders} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="leaderIds" className="text-sm font-medium">
                  リーダー候補ID
                </Label>
                <Input
                  id="leaderIds"
                  value={leaderIdsText}
                  onChange={(event) => setLeaderIdsText(event.target.value)}
                  placeholder="例: 101, 108, 115"
                  disabled={isLoading}
                  className="h-11 rounded-xl"
                />
                <p className="text-xs text-muted-foreground">カンマ区切りで学籍番号を入力します。</p>
              </div>

              <div className="flex items-start justify-between gap-4 rounded-xl bg-background/70 p-3">
                <div>
                  <Label htmlFor="avoidDuplicateMbti" className="text-sm font-medium">
                    同じMBTIの重複を抑える
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">同一チーム内の MBTI 偏りをなるべく減らします。</p>
                </div>
                <Switch id="avoidDuplicateMbti" checked={avoidDuplicateMbti} onCheckedChange={setAvoidDuplicateMbti} />
              </div>

              <div className="flex items-start justify-between gap-4 rounded-xl bg-background/70 p-3">
                <div>
                  <Label htmlFor="balanceClasses" className="text-sm font-medium">
                    クラス比をそろえる
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">各チームのクラス構成が全体比に近づくように調整します。</p>
                </div>
                <Switch id="balanceClasses" checked={balanceClasses} onCheckedChange={setBalanceClasses} />
              </div>

              <div className="flex items-start justify-between gap-4 rounded-xl bg-background/70 p-3">
                <div>
                  <Label htmlFor="balanceGender" className="text-sm font-medium">
                    性別比をそろえる
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">各チームの性別構成が全体比に近づくように調整します。</p>
                </div>
                <Switch id="balanceGender" checked={balanceGender} onCheckedChange={setBalanceGender} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredPairs" className="text-sm font-medium">
                  同じチーム希望ペア
                </Label>
                <Textarea
                  id="preferredPairs"
                  value={preferredPairsText}
                  onChange={(event) => setPreferredPairsText(event.target.value)}
                  placeholder={"例:\n101,102\n108,110"}
                  disabled={isLoading}
                  className="min-h-[96px] rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="separatedPairs" className="text-sm font-medium">
                  別チーム希望ペア
                </Label>
                <Textarea
                  id="separatedPairs"
                  value={separatedPairsText}
                  onChange={(event) => setSeparatedPairsText(event.target.value)}
                  placeholder={"例:\n103,105\n112,114"}
                  disabled={isLoading}
                  className="min-h-[96px] rounded-2xl"
                />
              </div>

              <div className="rounded-xl border border-dashed border-primary/20 bg-primary/5 p-3">
                <p className="text-xs font-medium text-slate-700">利用可能な学籍番号</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {students.slice(0, 10).map((student) => (
                    <Badge key={student.studentId} variant="outline" className="rounded-full bg-white/80">
                      {student.studentId}
                    </Badge>
                  ))}
                  {students.length > 10 ? <Badge variant="outline">+{students.length - 10}</Badge> : null}
                </div>
                <div className="mt-3 space-y-2">
                  <div>
                    <p className="text-xs font-medium text-slate-700">クラスの内訳</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {classSummary.map(([label, count]) => (
                        <Badge key={label} variant="outline" className="rounded-full bg-white/80">
                          {label}: {count}人
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-700">性別の内訳</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {genderSummary.map(([label, count]) => (
                        <Badge key={label} variant="outline" className="rounded-full bg-white/80">
                          {label}: {count}人
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {invalidLeaderIds.length > 0 || invalidPairs.length > 0 ? (
                <Alert className="rounded-2xl border-amber-200 bg-amber-50">
                  <AlertTitle>入力確認</AlertTitle>
                  <AlertDescription>
                    {invalidLeaderIds.length > 0 ? `存在しないリーダー候補ID: ${invalidLeaderIds.join(", ")}。 ` : ""}
                    {invalidPairs.length > 0 ? "ペア指定に存在しない学籍番号があります。" : ""}
                  </AlertDescription>
                </Alert>
              ) : null}
            </div>
          </div>

          <Button className="mt-4 h-11 w-full rounded-xl" onClick={onFormTeams} disabled={isLoading || studentCount === 0}>
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
