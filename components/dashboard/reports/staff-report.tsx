'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Printer } from "lucide-react"
import { Profile } from '@/types'

interface StaffReportProps {
    hospitalId: string
}

export function StaffReport({ hospitalId }: StaffReportProps) {
    const [loading, setLoading] = useState(true)
    const [staff, setStaff] = useState<Profile[]>([])
    const supabase = createClientComponentClient()

    // Filters
    const [roleFilter, setRoleFilter] = useState<string>('all')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    useEffect(() => {
        const fetchStaff = async () => {
            setLoading(true)
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('hospital_id', hospitalId)
                .neq('role', 'owner') // Exclude owner from staff report usually
                .order('created_at', { ascending: false })
                .returns<Profile[]>()

            if (data) {
                setStaff(data)
            }
            setLoading(false)
        }

        fetchStaff()
    }, [hospitalId, supabase])

    const filteredStaff = useMemo(() => {
        let result = staff

        // Filter by Role
        if (roleFilter !== 'all') {
            result = result.filter(s => s.role === roleFilter)
        }

        // Filter by Date
        if (startDate) {
            result = result.filter(s => new Date(s.created_at) >= new Date(startDate))
        }
        if (endDate) {
            const end = new Date(endDate)
            end.setDate(end.getDate() + 1)
            result = result.filter(s => new Date(s.created_at) < end)
        }

        return result
    }, [staff, roleFilter, startDate, endDate])

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="space-y-6">
            {/* Filters - Hidden when printing */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 print:hidden">
                <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="bg-white">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="doctor">Doctor</SelectItem>
                            <SelectItem value="nurse">Nurse</SelectItem>
                            <SelectItem value="receptionist">Receptionist</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Joined After</Label>
                    <Input
                        type="date"
                        className="bg-white"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Joined Before</Label>
                    <Input
                        type="date"
                        className="bg-white"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <div className="flex items-end">
                    <Button onClick={handlePrint} className="w-full bg-slate-800 hover:bg-slate-900">
                        <Printer className="w-4 h-4 mr-2" />
                        Print Report
                    </Button>
                </div>
            </div>

            {/* Print Header */}
            <div className="hidden print:block mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Staff Directory</h1>
                <p className="text-slate-500">Generated on {new Date().toLocaleDateString()}</p>
            </div>

            {/* Table */}
            <div className="rounded-md border border-slate-200">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead>Staff Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Joined On</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                                </TableCell>
                            </TableRow>
                        ) : filteredStaff.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                                    No staff members found matching filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredStaff.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="font-medium">{member.full_name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`capitalize ${member.role === 'doctor' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                                            member.role === 'nurse' ? 'border-purple-200 bg-purple-50 text-purple-700' :
                                                member.role === 'receptionist' ? 'border-orange-200 bg-orange-50 text-orange-700' :
                                                    'border-slate-200 bg-slate-50 text-slate-700'
                                            }`}>
                                            {member.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell>{member.department || '-'}</TableCell>
                                    <TableCell>{new Date(member.created_at).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: landscape;
                        margin: 1cm;
                    }
                    
                    /* Reset Layout */
                    body, html {
                        height: auto !important;
                        overflow: visible !important;
                    }
                    
                    /* Hide Sidebar and other layout elements */
                    aside, nav, header {
                        display: none !important;
                    }
                    
                    /* Reset Main Content Area */
                    main {
                        position: static !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        overflow: visible !important;
                        display: block !important;
                    }

                    /* Hide everything else */
                    body * {
                        visibility: hidden;
                    }

                    /* Show our report */
                    .space-y-6, .space-y-6 * {
                        visibility: visible;
                    }

                    /* Position report */
                    .space-y-6 {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        background-color: white;
                        z-index: 9999;
                    }

                    .print\\:hidden {
                        display: none !important;
                    }
                    
                    .print\\:block {
                        display: block !important;
                    }

                    .border, .shadow-lg, .rounded-md {
                        border: 1px solid #e2e8f0 !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                    }
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        font-size: 12px !important;
                    }
                    th, td {
                        border: 1px solid #e2e8f0 !important;
                        padding: 8px !important;
                        text-align: left !important;
                    }
                    th {
                        background-color: #f8fafc !important;
                        font-weight: bold !important;
                        color: #0f172a !important;
                    }
                }
            `}</style>
        </div>
    )
}
