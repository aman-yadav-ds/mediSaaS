import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { OverviewCards } from "@/components/dashboard/overview-cards"
import { DashboardActivityChart } from "@/components/dashboard/dashboard-activity-chart"
import { InviteStaffDialog } from "@/components/dashboard/invite-staff-dialog"
import { Patient, Profile } from "@/types"

export default async function DashboardPage() {
    const cookieStore = await cookies()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerComponentClient({ cookies: () => cookieStore as any })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Who is this user?
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) {
        redirect('/login')
    }

    if (profile.role !== 'owner') {
        // Not the owner? Send them to their own corner.
        if (profile.role === 'receptionist') redirect('/dashboard/reception')
        if (profile.role === 'nurse') redirect('/dashboard/nurse')
        if (profile.role === 'doctor') redirect('/dashboard/doctor')
    }

    // Get the team list (Owner only)
    const { data: staff } = await supabase
        .from('profiles')
        .select('*')
        .eq('hospital_id', profile.hospital_id)
        .neq('id', user.id) // Exclude self
        .order('created_at', { ascending: false })
        .returns<Profile[]>()

    // How many patients do we have?
    const { count: patientCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('hospital_id', profile.hospital_id)

    // Grab recent patient data for the chart (Last 7 Days)
    // eslint-disable-next-line react-hooks/purity
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: recentPatients } = await supabase
        .from('patients')
        .select('created_at, status')
        .eq('hospital_id', profile.hospital_id)
        .gte('created_at', sevenDaysAgo)
        .returns<Patient[]>()

    // Crunch the numbers for the graph
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - i)
        return d.toISOString().split('T')[0]
    }).reverse()

    const activityData = last7Days.map(date => {
        const count = recentPatients?.filter((p: Patient) => p.created_at.startsWith(date)).length || 0
        return { date, count }
    })

    // Count up the staff members
    const doctorCount = staff?.filter((m: Profile) => m.role === 'doctor').length || 0
    const nurseCount = staff?.filter((m: Profile) => m.role === 'nurse').length || 0
    const receptionistCount = staff?.filter((m: Profile) => m.role === 'receptionist').length || 0

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
                    <p className="text-slate-500 mt-2">Welcome back, {profile.full_name}. Here&apos;s what&apos;s happening today.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200">
                        Last updated: Just now
                    </div>
                </div>
            </div>

            <OverviewCards
                patientCount={patientCount || 0}
                doctorCount={doctorCount}
                nurseCount={nurseCount}
                receptionistCount={receptionistCount}
            />

            {/* Recent Activity / Quick Actions */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Hospital Activity</h3>
                    <div className="h-[300px] w-full">
                        <DashboardActivityChart data={activityData} />
                    </div>
                </div>
                <div className="col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <InviteStaffDialog>
                            <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-between group">
                                <span className="font-medium">Register New Staff</span>
                                <span className="text-slate-400 group-hover:text-blue-500">→</span>
                            </button>
                        </InviteStaffDialog>

                        <Link href="/dashboard/patients" className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-between group">
                            <span className="font-medium">View Patient Reports</span>
                            <span className="text-slate-400 group-hover:text-blue-500">→</span>
                        </Link>

                        <Link href="/dashboard/settings" className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-between group">
                            <span className="font-medium">Manage Departments</span>
                            <span className="text-slate-400 group-hover:text-blue-500">→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
