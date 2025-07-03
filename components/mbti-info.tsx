"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Info } from "lucide-react"

export function MBTIInfo() {
  return (
    <Card className="w-full cute-shadow h-full">
      <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Info className="w-5 h-5" />
          MBTIについて
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-sm py-3">MBTIとは？</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-wrap-anywhere">
                MBTI（Myers-Briggs Type Indicator）は、C.G.ユングの心理学的タイプ論をもとに、
                イザベル・マイヤーズとキャサリン・ブリッグズによって開発された性格タイプ分類システムです。
                4つの指標（外向-内向、感覚-直感、思考-感情、判断-知覚）の組み合わせにより、
                16の性格タイプに分類されます。
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-sm py-3">MBTIの4つの指標</AccordionTrigger>
            <AccordionContent>
              <ul className="text-sm space-y-2 list-disc pl-4 text-wrap-anywhere">
                <li>
                  <strong>外向(E) - 内向(I):</strong>{" "}
                  エネルギーの方向性。外向型は外部の世界や人との交流からエネルギーを得る。内向型は内面の世界や一人の時間からエネルギーを得る。
                </li>
                <li>
                  <strong>感覚(S) - 直感(N):</strong>{" "}
                  情報の収集方法。感覚型は具体的な事実や詳細に注目する。直感型はパターンや可能性、全体像に注目する。
                </li>
                <li>
                  <strong>思考(T) - 感情(F):</strong>{" "}
                  意思決定の方法。思考型は論理や客観的な分析に基づいて決定する。感情型は価値観や人間関係への影響を考慮して決定する。
                </li>
                <li>
                  <strong>判断(J) - 知覚(P):</strong>{" "}
                  外部世界への対応方法。判断型は計画的で秩序を好む。知覚型は柔軟で適応力があり、オプションを開けておくことを好む。
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-sm py-3">MBTIの16タイプ</AccordionTrigger>
            <AccordionContent>
              <div className="text-sm grid grid-cols-1 sm:grid-cols-2 gap-2 text-wrap-anywhere">
                <div>
                  <p className="font-medium">分析家 (NT)</p>
                  <ul className="list-disc pl-4">
                    <li>INTJ: 建築家</li>
                    <li>INTP: 論理学者</li>
                    <li>ENTJ: 指揮官</li>
                    <li>ENTP: 討論者</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">外交官 (NF)</p>
                  <ul className="list-disc pl-4">
                    <li>INFJ: 提唱者</li>
                    <li>INFP: 仲介者</li>
                    <li>ENFJ: 主人公</li>
                    <li>ENFP: 広報運動家</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">番人 (SJ)</p>
                  <ul className="list-disc pl-4">
                    <li>ISTJ: 管理者</li>
                    <li>ISFJ: 擁護者</li>
                    <li>ESTJ: 幹部</li>
                    <li>ESFJ: 領事</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">探検家 (SP)</p>
                  <ul className="list-disc pl-4">
                    <li>ISTP: 巨匠</li>
                    <li>ISFP: 冒険家</li>
                    <li>ESTP: 起業家</li>
                    <li>ESFP: エンターテイナー</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-sm py-3">MBTIの相性</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm mb-2 text-wrap-anywhere">
                MBTIタイプ間の相性は、共通点と相違点のバランスによって決まります。一般的に：
              </p>
              <ul className="text-sm space-y-1 list-disc pl-4 text-wrap-anywhere">
                <li>同じグループ（NT, NF, SJ, SP）内のタイプは共通の価値観や視点を持ちやすい</li>
                <li>補完的な機能を持つタイプ同士（例：INFJ と ENTP）は良い相性になることが多い</li>
                <li>全く正反対のタイプ同士も、お互いの弱点を補い合える可能性がある</li>
                <li>ただし、個人の成熟度や価値観、経験などの要素も重要</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
