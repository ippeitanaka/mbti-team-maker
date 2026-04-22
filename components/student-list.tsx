"use client"

import type { Student } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { extractMBTICode, getMBTIDescription, getMBTIGroup } from "@/utils/mbti"
import { ScrollArea } from "@/components/ui/scroll-area"

interface StudentListProps {
  students: Student[]
}

export function StudentList({ students }: StudentListProps) {
  if (!students.length) {
    return null
  }

  return (
    <Card className="w-full cute-shadow h-full">
      <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
        <CardTitle className="text-lg font-bold">学生リスト ({students.length}人)</CardTitle>
      </CardHeader>
      <CardContent className="p-0 px-4 sm:px-6 pb-4">
        <ScrollArea className="h-[350px] pr-4 custom-scrollbar">
          <div className="space-y-2">
            {students.map((student) => (
              <div key={student.studentId} className="p-3 rounded-lg border mbti-card hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-wrap-anywhere">
                    <h3 className="font-medium">{student.name}</h3>
                    <p className="text-xs text-muted-foreground">{student.studentId}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {student.attendanceType} / {student.gender}
                    </p>
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
  )
}
