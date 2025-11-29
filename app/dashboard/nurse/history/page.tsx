import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function NurseHistoryPage() {
    const cookieStore = await cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore as any })
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) redirect('/auth/signout')

    // Fetch Profile to check role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, hospital_id')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'nurse') {
        redirect('/dashboard')
    }

    // Fetch visits that have been processed (not waiting_vitals)
    // This ensures we see all patients, even if no vitals were recorded (e.g. emergency)
    const { data: history } = await supabase
        .from('visits')
        .select(`
            id,
            id,
            visit_date,
            status,
            is_emergency,
            patients (
                full_name,
                age,
                gender
            ),
            vitals (
                blood_pressure,
                heart_rate,
                temperature,
                recorded_by
            )
        `)
        .eq('hospital_id', profile.hospital_id)
        .neq('status', 'waiting_vitals')
        .order('visit_date', { ascending: false })

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">History</h1>
                    <p className="text-slate-500 mt-2">Record of all patients attended to.</p>
                </div>
            </div>

            <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                    <CardTitle className="text-lg text-slate-800">Visit History</CardTitle>
                    <CardDescription>Past patient visits and vitals.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-slate-50/50 border-b-slate-100">
                                <TableHead className="pl-6">Patient Name</TableHead>
                                <TableHead>Vitals (BP / HR / Temp)</TableHead>
                                <TableHead>Date & Time</TableHead>
                                <TableHead className="text-right pr-6">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history?.map((visit: any) => {
                                const vital = visit.vitals?.[0] // Assuming one set of vitals per visit
                                return (
                                    <TableRow key={visit.id} className="hover:bg-slate-50 transition-colors border-b-slate-100">
                                        <TableCell className="font-medium pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                    {visit.patients?.full_name?.[0] || 'P'}
                                                </div>
                                                {visit.patients?.full_name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {visit.is_emergency ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                                    🚨 Emergency
                                                    {vital?.blood_pressure && <span className="text-red-600/70 font-normal ml-1">({vital.blood_pressure})</span>}
                                                </span>
                                            ) : (
                                                <span className="text-slate-600 text-sm font-mono">
                                                    {vital?.blood_pressure || '-'} <span className="text-slate-300">|</span> {vital?.heart_rate || '-'} bpm <span className="text-slate-300">|</span> {vital?.temperature || '-'}°F
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-sm">
                                            {new Date(visit.visit_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Badge variant="outline" className={`capitalize ${visit.status === 'completed' ? 'border-green-200 bg-green-50 text-green-700' :
                                                visit.status === 'waiting_doctor' ? 'border-purple-200 bg-purple-50 text-purple-700' :
                                                    'border-slate-200 bg-slate-50 text-slate-700'
                                                }`}>
                                                {visit.status?.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                            {history?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                                        No history found.
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
