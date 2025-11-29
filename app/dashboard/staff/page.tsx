import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { InviteStaffDialog } from "@/components/dashboard/invite-staff-dialog"
import { DeleteStaffButton } from "@/components/dashboard/delete-staff-button"
import { EditStaffDialog } from "@/components/dashboard/edit-staff-dialog"

export default async function StaffPage() {
    const cookieStore = await cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore as any })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'owner') {
        redirect('/dashboard')
    }

    // Fetch Staff
    const { data: staff } = await supabase
        .from('profiles')
        .select('*')
        .eq('hospital_id', profile.hospital_id)
        .neq('id', user.id) // Exclude self
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Staff Management</h1>
                    <p className="text-slate-500 mt-2">Invite new staff members and manage their roles and access.</p>
                </div>
                <InviteStaffDialog />
            </div>

            <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
                <CardHeader>
                    <CardTitle>Staff Directory</CardTitle>
                    <CardDescription>A list of all medical and administrative staff in your hospital.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-slate-50/50">
                                <TableHead className="w-[250px]">Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staff?.map((member) => (
                                <TableRow key={member.id} className="hover:bg-slate-50 transition-colors">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                {member.full_name?.[0] || 'U'}
                                            </div>
                                            {member.full_name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-600">{member.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`capitalize ${member.role === 'doctor' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                                                member.role === 'nurse' ? 'border-purple-200 bg-purple-50 text-purple-700' :
                                                    member.role === 'receptionist' ? 'border-orange-200 bg-orange-50 text-orange-700' :
                                                        'border-slate-200 bg-slate-50 text-slate-700'
                                            }`}>
                                            {member.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-500">{new Date(member.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <EditStaffDialog staff={member} />
                                        <DeleteStaffButton userId={member.id} userName={member.full_name} />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {staff?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                                        No staff members found. Invite someone to get started.
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
