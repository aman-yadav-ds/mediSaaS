'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts'
import { Loader2 } from 'lucide-react'

interface Stats {
    statusData: { name: string; value: number }[]
    roleData: { name: string; value: number }[]
    patientsOverTime: { date: string; count: number }[]
    totalPatients: number
    totalStaff: number
}

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<Stats | null>(null)
    const supabase = createClientComponentClient()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('hospital_id')
                .eq('id', user.id)
                .single()

            if (!profile) return

            // Fetch Patients
            const { data: patients } = await supabase
                .from('patients')
                .select('created_at, status, gender')
                .eq('hospital_id', profile.hospital_id)

            // Fetch Staff
            const { data: staff } = await supabase
                .from('profiles')
                .select('role')
                .eq('hospital_id', profile.hospital_id)

            // Process Data for Charts

            // 1. Patients by Status
            const statusCount = patients?.reduce((acc: Record<string, number>, curr) => {
                acc[curr.status] = (acc[curr.status] || 0) + 1
                return acc
            }, {} as Record<string, number>) || {}

            const statusData = Object.keys(statusCount).map(key => ({
                name: key.charAt(0).toUpperCase() + key.slice(1),
                value: statusCount[key]
            }))

            // 2. Staff Distribution
            const roleCount = staff?.reduce((acc: Record<string, number>, curr) => {
                acc[curr.role] = (acc[curr.role] || 0) + 1
                return acc
            }, {} as Record<string, number>) || {}

            const roleData = Object.keys(roleCount).filter(r => r !== 'owner').map(key => ({
                name: key.charAt(0).toUpperCase() + key.slice(1),
                value: roleCount[key]
            }))

            // 3. Patients over time (last 7 days)
            const last7Days = [...Array(7)].map((_, i) => {
                const d = new Date()
                d.setDate(d.getDate() - i)
                return d.toISOString().split('T')[0]
            }).reverse()

            const patientsOverTime = last7Days.map(date => {
                const count = patients?.filter(p => p.created_at.startsWith(date)).length || 0
                return { date, count }
            })

            setStats({
                statusData,
                roleData,
                patientsOverTime,
                totalPatients: patients?.length || 0,
                totalStaff: staff?.length || 0
            })
            setLoading(false)
        }

        fetchData()
    }, [supabase])

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analytics</h1>
                    <p className="text-slate-500 mt-2">Detailed insights and statistics for your hospital performance.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Patients</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{stats?.totalPatients}</div>
                        <p className="text-xs text-green-600 mt-1 flex items-center">
                            <span className="font-medium">+12%</span>
                            <span className="text-slate-400 ml-1">from last month</span>
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Staff</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{stats?.totalStaff}</div>
                        <p className="text-xs text-slate-500 mt-1">Across all departments</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="col-span-1 border-slate-200 shadow-lg shadow-slate-200/50">
                    <CardHeader>
                        <CardTitle>Patient Admissions Trend</CardTitle>
                        <p className="text-sm text-slate-500">New patients registered over the last 7 days</p>
                    </CardHeader>
                    <CardContent className="h-[350px] pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.patientsOverTime}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { weekday: 'short' })}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1 border-slate-200 shadow-lg shadow-slate-200/50">
                    <CardHeader>
                        <CardTitle>Staff Distribution</CardTitle>
                        <p className="text-sm text-slate-500">Breakdown of staff roles</p>
                    </CardHeader>
                    <CardContent className="h-[350px] flex flex-col justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.roleData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats?.roleData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-6 mt-4">
                            {stats?.roleData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-sm font-medium text-slate-600">{entry.name}</span>
                                    <span className="text-sm text-slate-400">({entry.value})</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
