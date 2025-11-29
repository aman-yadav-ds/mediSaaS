import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PatientSearch } from "@/components/dashboard/patient-search"
import { Visit, Patient } from "@/types"

export default async function ReceptionPage() {
    const cookieStore = await cookies()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerComponentClient({ cookies: () => cookieStore as any })
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) redirect('/auth/signout')

    // Fetch data in parallel
    const [profileResult, visitsResult] = await Promise.all([
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
                )
            `)
            .order('visit_date', { ascending: false })
            .limit(10)
            .returns<(Visit & { patients: Patient })[]>()
    ])

    const profile = profileResult.data
    const visits = visitsResult.data

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reception Dashboard</h1>
                    <p className="text-slate-500 mt-2">Manage patient registrations and view recent activity.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200">
                        Today: {new Date().toLocaleDateString()}
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {profile?.role === 'receptionist' && (
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-slate-200 shadow-lg shadow-slate-200/50 h-full">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                                <CardTitle className="text-lg text-slate-800">New Registration</CardTitle>
                                <CardDescription>Search for existing patients or register new ones.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <PatientSearch />
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className={profile?.role === 'receptionist' ? "lg:col-span-2" : "lg:col-span-3"}>
                    <Card className="border-slate-200 shadow-lg shadow-slate-200/50 h-full">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg text-slate-800">Recent Registrations</CardTitle>
                                    <CardDescription>Patients registered today.</CardDescription>
                                </div>
                                <Badge variant="outline" className="bg-white">
                                    {visits?.length || 0} Today
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-slate-50/50 border-b-slate-100">
                                        <TableHead className="pl-6">Patient Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right pr-6">Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visits?.map((visit: Visit & { patients: Patient }) => (
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
                                                <Badge variant="outline" className={`capitalize ${visit.status === 'completed' ? 'border-green-200 bg-green-50 text-green-700' :
                                                    visit.status === 'waiting_vitals' ? 'border-orange-200 bg-orange-50 text-orange-700' :
                                                        'border-blue-200 bg-blue-50 text-blue-700'
                                                    }`}>
                                                    {visit.status?.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-6 text-slate-500">
                                                {new Date(visit.visit_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {visits?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-32 text-center text-slate-500">
                                                No patients registered today.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
