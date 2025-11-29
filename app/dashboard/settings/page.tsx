'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DepartmentsManager } from "@/components/dashboard/departments-manager"
import { Hospital } from "@/types"

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [hospital, setHospital] = useState<Hospital | null>(null)
    const [name, setName] = useState('')
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const supabase = createClientComponentClient()
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('hospital_id')
                .eq('id', user.id)
                .single()

            if (!profile) return

            const { data: hospitalData } = await supabase
                .from('hospitals')
                .select('*')
                .eq('id', profile.hospital_id)
                .single()

            if (hospitalData) {
                setHospital(hospitalData)
                setName(hospitalData.name)
            }
            setLoading(false)
        }

        fetchData()
    }, [supabase])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage(null)

        try {
            const { error } = await supabase
                .from('hospitals')
                .update({ name })
                .eq('id', hospital?.id)

            if (error) throw error

            setMessage({ type: 'success', text: 'Hospital settings updated successfully.' })
            router.refresh()
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred'
            setMessage({ type: 'error', text: errorMessage })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
                    <p className="text-slate-500 mt-2">Manage your hospital configuration and preferences.</p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-slate-200 shadow-lg shadow-slate-200/50">
                        <CardHeader>
                            <CardTitle>General Information</CardTitle>
                            <CardDescription>Update your hospital&apos;s public profile and details.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSave}>
                            <CardContent className="space-y-4">
                                {message && (
                                    <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className={message.type === 'success' ? 'bg-green-50 text-green-900 border-green-200' : ''}>
                                        <AlertDescription>{message.text}</AlertDescription>
                                    </Alert>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Hospital Name</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="max-w-md"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Subscription Status</Label>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${hospital?.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
                                            hospital?.subscription_status === 'trial' ? 'bg-blue-100 text-blue-800' :
                                                'bg-slate-100 text-slate-800'
                                            }`}>
                                            {hospital?.subscription_status} Plan
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-slate-50/50 border-t border-slate-100 py-4">
                                <Button type="submit" disabled={saving}>
                                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {hospital && <DepartmentsManager hospitalId={hospital.id} />}
                </div>

                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm bg-blue-50/50">
                        <CardHeader>
                            <CardTitle className="text-blue-900">Need Help?</CardTitle>
                            <CardDescription className="text-blue-700/80">
                                Contact our support team for assistance with your hospital configuration.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800">
                                Contact Support
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
