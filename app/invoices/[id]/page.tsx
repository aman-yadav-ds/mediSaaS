import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ArrowLeft } from "lucide-react"
import { PrintButton } from "@/components/invoice/print-button"
import Link from 'next/link'

interface Medication {
    name: string
    dosage: string
    frequency: string
    duration: string
}

interface InvoiceItem {
    description: string
    quantity: number
    unit_price: number
    total: number
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const cookieStore = await cookies()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerComponentClient({ cookies: () => cookieStore as any })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch Invoice with all details
    const { data: invoice } = await supabase
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
                ),
                prescriptions (
                    diagnosis,
                    notes,
                    medications
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
                <div className="bg-slate-900 text-white p-3 flex justify-between items-center print:hidden">
                    <Link href="/dashboard/billing" className="text-slate-300 hover:text-white flex items-center gap-2 text-sm">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Billing
                    </Link>
                    <PrintButton />
                </div>

                {/* Invoice Content */}
                <div className="p-8">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-slate-100 pb-6 mb-6">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">{invoice.hospitals?.name || 'Hospital Name'}</h1>
                            <div className="text-slate-500 mt-1 text-sm space-y-0.5">
                                <p>123 Health Street, Medical District</p>
                                <p>Ph: +1 234 567 890</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold text-slate-200 uppercase tracking-widest">Invoice</h2>
                            <div className="text-slate-500 mt-1 space-y-0.5">
                                <p className="font-mono font-medium text-slate-700">#{invoice.id.slice(0, 8).toUpperCase()}</p>
                                <p className="text-xs">Date: {new Date(invoice.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Patient & Doctor Info */}
                    <div className="grid grid-cols-2 gap-6 mb-6 bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                        <div>
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Billed To</h3>
                            <p className="font-bold text-slate-900">{invoice.patients?.full_name}</p>
                            <div className="text-slate-600 text-xs mt-0.5">
                                <span>{invoice.patients?.age} Yrs / {invoice.patients?.gender}</span>
                                <span className="mx-2">•</span>
                                <span>{invoice.patients?.contact_number}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Consulting Doctor</h3>
                            <p className="font-medium text-slate-900">{invoice.visits?.profiles?.full_name || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Medical Instructions */}
                    {invoice.visits?.prescriptions?.[0] && (
                        <div className="mb-6 border border-slate-200 rounded-lg overflow-hidden">
                            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Medical Instructions</h3>
                            </div>

                            <div className="p-4 grid gap-4 text-sm">
                                <div className="grid grid-cols-[100px_1fr] gap-4">
                                    <span className="font-medium text-slate-500">Diagnosis</span>
                                    <span className="font-medium text-slate-900">{invoice.visits.prescriptions[0].diagnosis}</span>
                                </div>

                                <div className="grid grid-cols-[100px_1fr] gap-4">
                                    <span className="font-medium text-slate-500">Medications</span>
                                    <div className="space-y-1">
                                        {invoice.visits.prescriptions[0].medications?.map((med: Medication, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2 text-slate-700">
                                                <span className="font-semibold text-slate-900">{med.name}</span>
                                                <span className="text-slate-400 text-xs">|</span>
                                                <span>{med.dosage}</span>
                                                <span className="text-slate-400 text-xs">|</span>
                                                <span>{med.frequency}</span>
                                                <span className="text-slate-400 text-xs">|</span>
                                                <span>{med.duration}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {invoice.visits.prescriptions[0].notes && (
                                    <div className="grid grid-cols-[100px_1fr] gap-4">
                                        <span className="font-medium text-slate-500">Note</span>
                                        <span className="italic text-slate-600">{invoice.visits.prescriptions[0].notes}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Items Table */}
                    <table className="w-full mb-6">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-2 text-xs font-bold text-slate-500 uppercase">Description</th>
                                <th className="text-center py-2 text-xs font-bold text-slate-500 uppercase w-16">Qty</th>
                                <th className="text-right py-2 text-xs font-bold text-slate-500 uppercase w-24">Price</th>
                                <th className="text-right py-2 text-xs font-bold text-slate-500 uppercase w-24">Total</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {invoice.invoice_items?.map((item: InvoiceItem, index: number) => (
                                <tr key={index} className="border-b border-slate-50 last:border-0">
                                    <td className="py-2 text-slate-800">{item.description}</td>
                                    <td className="py-2 text-center text-slate-600">{item.quantity}</td>
                                    <td className="py-2 text-right text-slate-600">${item.unit_price.toFixed(2)}</td>
                                    <td className="py-2 text-right font-medium text-slate-900">${item.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-8">
                        <div className="w-56 space-y-2">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Subtotal:</span>
                                <span>${invoice.total_amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Tax (0%):</span>
                                <span>$0.00</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-slate-900 border-t border-slate-200 pt-2 mt-2">
                                <span>Total:</span>
                                <span>${invoice.total_amount.toFixed(2)}</span>
                            </div>
                            <div className="text-right text-[10px] text-slate-400 uppercase tracking-wider">
                                Paid via {invoice.payment_method}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center border-t border-slate-100 pt-6 text-slate-400 text-xs">
                        <p className="font-medium text-slate-600">Thank you for choosing {invoice.hospitals?.name}.</p>
                        <p className="mt-1">This is a computer-generated invoice.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
