'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2, Loader2, Receipt, CreditCard } from "lucide-react"

interface InvoiceItem {
    description: string
    quantity: number
    unitPrice: number
}

export function InvoiceDialog({ visit }: { visit: any }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState('cash')
    const [items, setItems] = useState<InvoiceItem[]>([
        { description: 'Consultation Fee', quantity: 1, unitPrice: 500 }
    ])

    const router = useRouter()
    const supabase = createClientComponentClient()

    // Auto-fill medications from prescription
    useEffect(() => {
        const fetchPrescription = async () => {
            if (open) {
                const { data, error } = await supabase
                    .from('prescriptions')
                    .select('medications')
                    .eq('visit_id', visit.id)
                    .single()

                if (data && data.medications) {
                    const prescriptionItems = data.medications.map((med: any) => ({
                        description: `${med.name} (${med.dosage} - ${med.duration})`,
                        quantity: 1,
                        unitPrice: 0 // Receptionist fills this
                    }))

                    // Add consultation fee + prescription items
                    setItems([
                        { description: 'Consultation Fee', quantity: 1, unitPrice: 500 },
                        ...prescriptionItems
                    ])
                }
            }
        }

        fetchPrescription()
    }, [open, visit.id, supabase])

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unitPrice: 0 }])
    }

    const removeItem = (index: number) => {
        const newItems = [...items]
        newItems.splice(index, 1)
        setItems(newItems)
    }

    const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...items]
        // @ts-ignore
        newItems[index][field] = value
        setItems(newItems)
    }

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const totalAmount = calculateTotal()

            // Fetch user profile to get hospital_id (fallback)
            const { data: profile } = await supabase
                .from('profiles')
                .select('hospital_id')
                .eq('id', user.id)
                .single()

            const hospitalId = visit.hospital_id || profile?.hospital_id
            if (!hospitalId) throw new Error('Hospital ID not found')

            // 1. Create Invoice
            const { data: invoice, error: invoiceError } = await supabase
                .from('invoices')
                .insert({
                    hospital_id: hospitalId,
                    visit_id: visit.id,
                    patient_id: visit.patient_id,
                    total_amount: totalAmount,
                    status: 'paid',
                    payment_method: paymentMethod
                })
                .select()
                .single()

            if (invoiceError) throw invoiceError

            // 2. Create Invoice Items
            const invoiceItems = items.map(item => ({
                invoice_id: invoice.id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                total: item.quantity * item.unitPrice
            }))

            const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(invoiceItems)

            if (itemsError) throw itemsError

            // 3. Update Visit Payment Status
            const { error: visitError } = await supabase
                .from('visits')
                .update({
                    payment_status: 'paid',
                    status: 'completed'
                })
                .eq('id', visit.id)

            if (visitError) throw visitError

            setOpen(false)
            router.refresh()
            // Redirect to the printable invoice page
            router.push(`/invoices/${invoice.id}`)
        } catch (error) {
            console.error('Error creating invoice:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-200 text-white">
                    <Receipt className="w-4 h-4 mr-2" />
                    Generate Bill
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Generate Invoice</DialogTitle>
                    <DialogDescription>
                        Create a bill for {visit.patients?.full_name}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="text-sm">
                                <span className="text-slate-500">Patient:</span>
                                <span className="font-medium ml-2 text-slate-900">{visit.patients?.full_name}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-slate-500">Date:</span>
                                <span className="font-medium ml-2 text-slate-900">{new Date().toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium text-slate-500 uppercase">Bill Items</Label>
                                <Button type="button" variant="ghost" size="sm" onClick={addItem} className="h-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Item
                                </Button>
                            </div>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                {items.map((item, index) => (
                                    <div key={index} className="flex gap-2 items-start">
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Description"
                                                value={item.description}
                                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                required
                                                className="h-9"
                                            />
                                        </div>
                                        <div className="w-20">
                                            <Input
                                                type="number"
                                                placeholder="Qty"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                                min="1"
                                                required
                                                className="h-9"
                                            />
                                        </div>
                                        <div className="w-24">
                                            <Input
                                                type="number"
                                                placeholder="Price"
                                                value={item.unitPrice}
                                                onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                min="0"
                                                required
                                                className="h-9"
                                            />
                                        </div>
                                        <div className="w-20 py-2 text-right font-medium text-slate-700 text-sm">
                                            ${(item.quantity * item.unitPrice).toFixed(2)}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(index)}
                                            disabled={items.length === 1}
                                            className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <div className="w-1/2 space-y-3">
                                <div className="flex justify-between items-center text-lg font-bold text-slate-900">
                                    <span>Total Amount:</span>
                                    <span>${calculateTotal().toFixed(2)}</span>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-500 uppercase">Payment Method</Label>
                                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="card">Card</SelectItem>
                                            <SelectItem value="upi">UPI / Digital</SelectItem>
                                            <SelectItem value="insurance">Insurance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200/50">
                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
                            Confirm Payment & Print
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
