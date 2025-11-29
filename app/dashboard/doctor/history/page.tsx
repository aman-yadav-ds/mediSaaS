import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Prescription, Patient, Visit } from "@/types"

export default async function DoctorHistoryPage() {
    const cookieStore = await cookies()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerComponentClient({ cookies: () => cookieStore as any })
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) redirect('/auth/signout')

    // Fetch Profile to check role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'doctor') {
        redirect('/dashboard')
    }

    // Fetch patients consulted by this doctor (from prescriptions)
    const { data: history } = await supabase
        .from('prescriptions')
        .select(`
            id,
            created_at,
            diagnosis,
            patients!inner (
                full_name,
                age,
                gender
            ),
            visits (
                status
            )
        `)
        .eq('doctor_id', user.id)
        .order('created_at', { ascending: false })
        .returns<(Prescription & { patients: Patient, visits: Visit })[]>()

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Consultation History</h1>
                    <p className="text-slate-500 mt-2">Patients you have treated.</p>
                </div>
            </div>

            <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                    <CardTitle className="text-lg text-slate-800">Past Consultations</CardTitle>
                    <CardDescription>Record of prescriptions and diagnoses.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-slate-50/50 border-b-slate-100">
                                <TableHead className="pl-6">Patient Name</TableHead>
                                <TableHead>Diagnosis</TableHead>
                                <TableHead>Date & Time</TableHead>
                                <TableHead className="text-right pr-6">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history?.map((record: Prescription & { patients: Patient, visits: Visit }) => (
                                <TableRow key={record.id} className="hover:bg-slate-50 transition-colors border-b-slate-100">
                                    <TableCell className="font-medium pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                {record.patients?.full_name?.[0] || 'P'}
                                            </div>
                                            {record.patients?.full_name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-600 font-medium">{record.diagnosis}</TableCell>
                                    <TableCell className="text-slate-500 text-sm">
                                        {new Date(record.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Badge variant="outline" className={`capitalize ${record.visits?.status === 'completed' ? 'border-green-200 bg-green-50 text-green-700' :
                                            'border-slate-200 bg-slate-50 text-slate-700'
                                            }`}>
                                            {record.visits?.status?.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {history?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                                        No consultations found.
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
