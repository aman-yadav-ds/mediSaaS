import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function AppointmentsPage() {
    const cookieStore = await cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore as any })
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) redirect('/auth/signout')

    // Fetch data in parallel
    const [profileResult, activeVisitsResult] = await Promise.all([
        supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single(),
        supabase
            .from('visits')
            .select(`
                id,
                status,
                visit_date,
                patients (
                    full_name
                ),
                profiles:doctor_id (
                    full_name
                )
            `)
            .neq('status', 'completed')
            .order('visit_date', { ascending: true })
    ])

    const profile = profileResult.data
    const activeVisits = activeVisitsResult.data

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Active Appointments</h1>
                    <p className="text-slate-500 mt-2">Manage current patient visits and queue.</p>
                </div>
            </div>

            <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                    <CardTitle className="text-lg text-slate-800">Current Visits</CardTitle>
                    <CardDescription>Patients currently in the clinic.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-slate-50/50 border-b-slate-100">
                                <TableHead className="pl-6">Patient Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Time In</TableHead>
                                <TableHead className="text-right pr-6">Doctor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activeVisits?.map((visit: any) => (
                                <TableRow key={visit.id} className="hover:bg-slate-50 transition-colors border-b-slate-100">
                                    <TableCell className="font-medium pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                {visit.patients?.full_name?.[0] || 'P'}
                                            </div>
                                            {visit.patients?.full_name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`capitalize ${visit.status === 'waiting_doctor' ? 'border-purple-200 bg-purple-50 text-purple-700' :
                                            visit.status === 'waiting_vitals' ? 'border-orange-200 bg-orange-50 text-orange-700' :
                                                'border-blue-200 bg-blue-50 text-blue-700'
                                            }`}>
                                            {visit.status?.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-500">
                                        {new Date(visit.visit_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </TableCell>
                                    <TableCell className="text-right pr-6 text-slate-600">
                                        {visit.profiles?.full_name || <span className="text-slate-400 italic">Unassigned</span>}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {activeVisits?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                                        No active visits.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
