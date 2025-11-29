'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

export function DepartmentsManager({ hospitalId }: { hospitalId: string }) {
    const [departments, setDepartments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [newDept, setNewDept] = useState('')
    const [adding, setAdding] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const supabase = createClientComponentClient()

    const fetchDepartments = async () => {
        const { data, error } = await supabase
            .from('departments')
            .select('*')
            .eq('hospital_id', hospitalId)
            .order('created_at', { ascending: true })

        if (data) setDepartments(data)
        setLoading(false)
    }

    useEffect(() => {
        if (hospitalId) fetchDepartments()
    }, [hospitalId])

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newDept.trim()) return

        setAdding(true)
        setError(null)

        try {
            const { error } = await supabase
                .from('departments')
                .insert({ hospital_id: hospitalId, name: newDept.trim() })

            if (error) throw error

            setNewDept('')
            fetchDepartments()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setAdding(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This might affect staff assigned to this department.')) return

        try {
            const { error } = await supabase
                .from('departments')
                .delete()
                .eq('id', id)

            if (error) throw error
            fetchDepartments()
        } catch (err: any) {
            alert('Failed to delete: ' + err.message)
        }
    }

    if (loading) return <div>Loading departments...</div>

    return (
        <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
            <CardHeader>
                <CardTitle>Departments</CardTitle>
                <CardDescription>Manage your hospital departments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleAdd} className="flex gap-3">
                    <Input
                        placeholder="New Department Name (e.g. Cardiology)"
                        value={newDept}
                        onChange={(e) => setNewDept(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={adding || !newDept.trim()} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200">
                        {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                        Add Department
                    </Button>
                </form>

                <div className="space-y-3">
                    {departments.map((dept) => (
                        <div key={dept.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg bg-white hover:bg-slate-50 transition-colors shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                    <span className="text-xs font-bold">{dept.name.substring(0, 2).toUpperCase()}</span>
                                </div>
                                <span className="font-medium text-slate-700">{dept.name}</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(dept.id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                    {departments.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                            <p className="text-sm text-slate-500">No departments added yet.</p>
                            <p className="text-xs text-slate-400 mt-1">Add departments to organize your staff.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
