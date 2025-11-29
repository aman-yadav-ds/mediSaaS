import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { InvoiceDialog } from "@/components/dashboard/invoice-dialog"
import { DollarSign, Receipt, Clock } from "lucide-react"

export default async function BillingPage() {
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

    if (!profile || (profile.role !== 'owner' && profile.role !== 'receptionist')) {
        redirect('/dashboard')
    }

    // Fetch data in parallel
    const [pendingVisitsResult, invoicesResult] = await Promise.all([
        supabase
            .from('visits')
            .select(`
                id,
                status,
                payment_status,
                visit_date,
                hospital_id,
                patient_id,
                patients (
                    full_name,
                    contact_number
                ),
                profiles:doctor_id (
                    full_name
                )
            `)
            .eq('status', 'waiting_billing')
            .eq('payment_status', 'pending')
            .eq('hospital_id', profile.hospital_id)
            .order('visit_date', { ascending: false }),
        supabase
            .from('invoices')
            .select(`
                id,
                total_amount,
                payment_method,
                created_at,
                patients (
                    full_name
                )
            `)
            .eq('hospital_id', profile.hospital_id)
            .order('created_at', { ascending: false })
            .limit(10)
    ])

    const pendingVisits = pendingVisitsResult.data
    const invoices = invoicesResult.data

    // Calculate Stats
    const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0
    const pendingCount = pendingVisits?.length || 0

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Billing & Invoices</h1>
                    <p className="text-slate-500 mt-2">Manage payments and generate invoices.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Revenue (Today)</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-slate-500 mt-1">From {invoices?.length || 0} invoices</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Pending Bills</CardTitle>
                        <Clock className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{pendingCount}</div>
                        <p className="text-xs text-slate-500 mt-1">Patients waiting for billing</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Pending Bills */}
                <Card className="border-slate-200 shadow-lg shadow-slate-200/50 h-full">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg text-slate-800">Pending Payments</CardTitle>
                        <CardDescription>Patients who have completed consultation.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-slate-50/50 border-b-slate-100">
                                    <TableHead className="pl-6">Patient</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead className="text-right pr-6">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingVisits?.map((visit: any) => (
                                    <TableRow key={visit.id} className="hover:bg-slate-50 transition-colors border-b-slate-100">
                                        <TableCell className="font-medium pl-6">
                                            <div className="flex flex-col">
                                                <span className="text-slate-900">{visit.patients?.full_name}</span>
                                                <span className="text-xs text-slate-500">{visit.patients?.contact_number}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-600">{visit.profiles?.full_name}</TableCell>
                                        <TableCell className="text-right pr-6">
                                            <InvoiceDialog visit={visit} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {pendingVisits?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-32 text-center text-slate-500">
                                            No pending bills.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Recent Invoices */}
                <Card className="border-slate-200 shadow-lg shadow-slate-200/50 h-full">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg text-slate-800">Recent Invoices</CardTitle>
                        <CardDescription>History of generated bills.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-slate-50/50 border-b-slate-100">
                                    <TableHead className="pl-6">Patient</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead className="text-right pr-6">Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices?.map((invoice: any) => (
                                    <TableRow key={invoice.id} className="hover:bg-slate-50 transition-colors border-b-slate-100">
                                        <TableCell className="font-medium pl-6">{invoice.patients?.full_name}</TableCell>
                                        <TableCell className="font-bold text-emerald-600">${invoice.total_amount}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize bg-slate-50 text-slate-600 border-slate-200">
                                                {invoice.payment_method}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6 text-slate-500 text-sm">
                                            <div className="flex items-center justify-end gap-4">
                                                <span>{new Date(invoice.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                <a href={`/invoices/${invoice.id}`} target="_blank" className="text-blue-600 hover:text-blue-700 font-medium text-xs flex items-center gap-1">
                                                    <Receipt className="w-3 h-3" />
                                                    View
                                                </a>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {invoices?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                                            No invoices generated yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
