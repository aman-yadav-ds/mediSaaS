import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function PatientsPage() {
    const cookieStore = await cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore as any })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile || (profile.role !== 'owner' && profile.role !== 'receptionist')) {
        redirect('/dashboard')
    }

    // Fetch patients with their latest visit status
    const { data: patients } = await supabase
        .from('patients')
        .select(`
            *,
            visits (
                status,
                visit_date
            )
        `)
        .eq('hospital_id', profile.hospital_id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Patients</h1>
                    <p className="text-slate-500 mt-2">Manage and view all patients registered in your hospital.</p>
                </div>
            </div>

            <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
                <CardHeader>
                    <CardTitle>Patient Registry</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-slate-50/50">
                                <TableHead className="w-[250px]">Name</TableHead>
                                <TableHead>Age</TableHead>
                                <TableHead>Gender</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Latest Status</TableHead>
                                <TableHead>Registered</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patients?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                        No patients found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                patients?.map((patient) => {
                                    // Find latest visit
                                    const latestVisit = patient.visits?.sort((a: any, b: any) =>
                                        new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime()
                                    )[0]

                                    const status = latestVisit?.status || 'registered'

                                    return (
                                        <TableRow key={patient.id} className="hover:bg-slate-50 transition-colors">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                        {patient.full_name?.[0] || 'P'}
                                                    </div>
                                                    {patient.full_name}
                                                </div>
                                            </TableCell>
                                            <TableCell>{patient.age}</TableCell>
                                            <TableCell className="capitalize">{patient.gender}</TableCell>
                                            <TableCell>{patient.contact_number}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`capitalize ${status === 'completed' ? 'border-green-200 bg-green-50 text-green-700' :
                                                    status === 'waiting_doctor' ? 'border-purple-200 bg-purple-50 text-purple-700' :
                                                        status === 'waiting_vitals' ? 'border-orange-200 bg-orange-50 text-orange-700' :
                                                            'border-slate-200 bg-slate-50 text-slate-700'
                                                    }`}>
                                                    {status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(patient.created_at).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
