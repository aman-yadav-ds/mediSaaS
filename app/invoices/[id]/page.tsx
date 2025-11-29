import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Printer, ArrowLeft } from "lucide-react"
import { PrintButton } from "@/components/invoice/print-button"
import Link from 'next/link'

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const cookieStore = await cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore as any })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch Invoice with all details
    const { data: invoice, error } = await supabase
        .from('invoices')
        .select(`
            *,
            patients (
                full_name,
                contact_number,
                age,
                gender,
                aadhar_number
            ),
            visits (
                visit_date,
                profiles:doctor_id (
                    full_name
                )
            ),
            invoice_items (
                description,
                quantity,
                unit_price,
                total
            ),
            hospitals (
                name
            )
        `)
        .eq('id', id)
        .single()

    if (!invoice) {
        return <div className="p-8 text-center">Invoice not found</div>
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8 print:p-0 print:bg-white">
            <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden print:shadow-none print:rounded-none">
                {/* Toolbar - Hidden in Print */}
                <div className="bg-slate-900 text-white p-4 flex justify-between items-center print:hidden">
                    <Link href="/dashboard/billing" className="text-slate-300 hover:text-white flex items-center gap-2 text-sm">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Billing
                    </Link>
                    <PrintButton />
                </div>

                {/* Invoice Content */}
                <div className="p-8 md:p-12">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-slate-100 pb-8 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{invoice.hospitals?.name || 'Hospital Name'}</h1>
                            <p className="text-slate-500 mt-1 max-w-xs text-sm">123 Health Street, Medical District</p>
                            <p className="text-slate-500 text-sm">Ph: +1 234 567 890</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-bold text-slate-200 uppercase tracking-widest">Invoice</h2>
                            <p className="text-slate-500 mt-2 font-mono">#{invoice.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-slate-500 text-sm mt-1">
                                Date: {new Date(invoice.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Patient & Doctor Info */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</h3>
                            <p className="font-bold text-slate-900 text-lg">{invoice.patients?.full_name}</p>
                            <p className="text-slate-600 text-sm">{invoice.patients?.age} Yrs / {invoice.patients?.gender}</p>
                            <p className="text-slate-600 text-sm">{invoice.patients?.contact_number}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Consulting Doctor</h3>
                            <p className="font-medium text-slate-900">{invoice.visits?.profiles?.full_name || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b-2 border-slate-100">
                                <th className="text-left py-3 text-sm font-bold text-slate-600 uppercase">Description</th>
                                <th className="text-center py-3 text-sm font-bold text-slate-600 uppercase w-20">Qty</th>
                                <th className="text-right py-3 text-sm font-bold text-slate-600 uppercase w-32">Price</th>
                                <th className="text-right py-3 text-sm font-bold text-slate-600 uppercase w-32">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.invoice_items?.map((item: any, index: number) => (
                                <tr key={index} className="border-b border-slate-50">
                                    <td className="py-4 text-slate-800">{item.description}</td>
                                    <td className="py-4 text-center text-slate-600">{item.quantity}</td>
                                    <td className="py-4 text-right text-slate-600">${item.unit_price.toFixed(2)}</td>
                                    <td className="py-4 text-right font-medium text-slate-900">${item.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-12">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal:</span>
                                <span>${invoice.total_amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Tax (0%):</span>
                                <span>$0.00</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-slate-900 border-t-2 border-slate-900 pt-3">
                                <span>Total:</span>
                                <span>${invoice.total_amount.toFixed(2)}</span>
                            </div>
                            <div className="text-right text-xs text-slate-400 uppercase tracking-wider pt-1">
                                Paid via {invoice.payment_method}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center border-t border-slate-100 pt-8 text-slate-500 text-sm">
                        <p>Thank you for choosing {invoice.hospitals?.name}.</p>
                        <p className="mt-1 text-xs">This is a computer-generated invoice.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
