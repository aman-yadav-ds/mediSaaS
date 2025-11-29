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

import { Loader2, Printer, Search } from "lucide-react"
import { Patient } from '@/types'

interface PatientReportProps {
    hospitalId: string
}

export function PatientReport({ hospitalId }: PatientReportProps) {
    const [loading, setLoading] = useState(true)
    const [patients, setPatients] = useState<Patient[]>([])
    const supabase = createClientComponentClient()

    // Filters
    const [searchName, setSearchName] = useState('')
    const [genderFilter, setGenderFilter] = useState<string>('all')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    useEffect(() => {
        const fetchPatients = async () => {
            setLoading(true)
            const { data } = await supabase
                .from('patients')
                .select('*')
                .eq('hospital_id', hospitalId)
                .order('created_at', { ascending: false })
                .returns<Patient[]>()

            if (data) {
                setPatients(data)
            }
            setLoading(false)
        }

        fetchPatients()
    }, [hospitalId, supabase])

    const filteredPatients = useMemo(() => {
        let result = patients

        // Filter by Name
        if (searchName) {
            result = result.filter(p =>
                p.full_name.toLowerCase().includes(searchName.toLowerCase()) ||
                p.aadhar_number?.includes(searchName)
            )
        }

        // Filter by Gender
        if (genderFilter !== 'all') {
            result = result.filter(p => p.gender === genderFilter)
        }

        // Filter by Date
        if (startDate) {
            result = result.filter(p => new Date(p.created_at) >= new Date(startDate))
        }
        if (endDate) {
            // Add one day to include the end date fully
            const end = new Date(endDate)
            end.setDate(end.getDate() + 1)
            result = result.filter(p => new Date(p.created_at) < end)
        }

        return result
    }, [patients, searchName, genderFilter, startDate, endDate])

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="space-y-6">
            {/* Filters - Hidden when printing */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 print:hidden">
                <div className="space-y-2">
                    <Label>Search</Label>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Name or Aadhar..."
                            className="pl-9 bg-white"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={genderFilter} onValueChange={setGenderFilter}>
                        <SelectTrigger className="bg-white">
                            <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                        type="date"
                        className="bg-white"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>End Date</Label>
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
                <h1 className="text-2xl font-bold text-slate-900">Patient Records</h1>
                <p className="text-slate-500">Generated on {new Date().toLocaleDateString()}</p>
            </div>

            {/* Table */}
            <div className="rounded-md border border-slate-200">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead>Patient Name</TableHead>
                            <TableHead>Age/Gender</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Aadhar</TableHead>
                            <TableHead>Registered On</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                                </TableCell>
                            </TableRow>
                        ) : filteredPatients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                                    No patients found matching filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPatients.map((patient) => (
                                <TableRow key={patient.id}>
                                    <TableCell className="font-medium">{patient.full_name}</TableCell>
                                    <TableCell>{patient.age} / {patient.gender}</TableCell>
                                    <TableCell>{patient.contact_number}</TableCell>
                                    <TableCell>{patient.aadhar_number || '-'}</TableCell>
                                    <TableCell>{new Date(patient.created_at).toLocaleDateString()}</TableCell>
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
