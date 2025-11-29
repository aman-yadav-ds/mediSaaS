import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PatientReport } from "@/components/dashboard/reports/patient-report"
import { StaffReport } from "@/components/dashboard/reports/staff-report"

export default async function ReportsPage() {
    const cookieStore = await cookies()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    if (!profile || profile.role !== 'owner') {
        redirect('/dashboard')
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reports</h1>
                <p className="text-slate-500 mt-2">Generate and print reports for patients and staff.</p>
            </div>

            <Tabs defaultValue="patients" className="space-y-6">
                <TabsList className="bg-white border border-slate-200 p-1 shadow-sm">
                    <TabsTrigger value="patients" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Patient Reports</TabsTrigger>
                    <TabsTrigger value="staff" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Staff Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="patients">
                    <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
                        <CardHeader>
                            <CardTitle>Patient Records</CardTitle>
                            <CardDescription>Filter and view patient history and status.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PatientReport hospitalId={profile.hospital_id} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="staff">
                    <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
                        <CardHeader>
                            <CardTitle>Staff Directory</CardTitle>
                            <CardDescription>View staff details and joining dates.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <StaffReport hospitalId={profile.hospital_id} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
