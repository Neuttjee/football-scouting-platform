import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckSquare, Clock, Users, AlertCircle } from "lucide-react"
import Link from "next/link"

const prisma = new PrismaClient()

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) return null

  const clubId = session.user.clubId

  // Fetch KPI data
  const openTasksCount = await prisma.task.count({
    where: {
      clubId,
      status: { in: ['OPEN', 'IN_UITVOERING'] }
    }
  })

  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const overdueTasksCount = await prisma.task.count({
    where: {
      clubId,
      status: { not: 'GEREED' },
      deadline: { lt: today }
    }
  })

  const topTargetsCount = await prisma.player.count({
    where: {
      clubId,
      status: 'ACTIEF'
    }
  })

  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
  const noUpdateCount = await prisma.player.count({
    where: {
      clubId,
      status: 'ACTIEF',
      laatsteUpdateAt: { lt: fourteenDaysAgo }
    }
  })

  // Fetch lists
  const openTasks = await prisma.task.findMany({
    where: {
      clubId,
      status: { in: ['OPEN', 'IN_UITVOERING'] }
    },
    include: {
      player: true,
      eigenaar: true,
    },
    orderBy: {
      deadline: 'asc'
    },
    take: 10
  })

  const topTargets = await prisma.player.findMany({
    where: {
      clubId,
      status: 'ACTIEF'
    },
    orderBy: {
      laatsteUpdateAt: 'asc'
    },
    take: 10
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welkom terug, {session.user.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Taken</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTasksCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Taken</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{overdueTasksCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Targets</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topTargetsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">Geen update &gt; 14 dgn</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{noUpdateCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Openstaande Taken (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            {openTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Geen open taken.</p>
            ) : (
              <ul className="space-y-4">
                {openTasks.map(task => (
                  <li key={task.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{task.titel}</p>
                      <p className="text-xs text-muted-foreground">
                        Voor: {task.eigenaar.name} {task.player && `| Speler: ${task.player.naam}`}
                      </p>
                    </div>
                    {task.deadline && (
                      <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded",
                        new Date(task.deadline) < new Date() ? "bg-red-100 text-red-700" : "bg-gray-100"
                      )}>
                        {task.deadline.toLocaleDateString('nl-NL')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <Link href="/taken" className="text-sm text-blue-600 hover:underline">Bekijk alle taken &rarr;</Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Targets (Oudste update eerst)</CardTitle>
          </CardHeader>
          <CardContent>
            {topTargets.length === 0 ? (
              <p className="text-sm text-muted-foreground">Geen actieve targets.</p>
            ) : (
              <ul className="space-y-4">
                {topTargets.map(player => (
                  <li key={player.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                    <div>
                      <Link href={`/spelers/${player.id}`} className="font-medium text-sm hover:underline">
                        {player.naam}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {player.clubHuidig || 'Geen club'} | {player.processtap}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {player.laatsteUpdateAt.toLocaleDateString('nl-NL')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <Link href="/spelers" className="text-sm text-blue-600 hover:underline">Bekijk alle spelers &rarr;</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}