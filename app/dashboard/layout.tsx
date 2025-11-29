import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Sidebar } from "@/components/dashboard/sidebar"
import { SetPasswordDialog } from "@/components/dashboard/set-password-dialog"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore as any })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) {
        redirect('/login')
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar role={profile.role} fullName={profile.full_name} />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative">
                {/* Header Background Gradient */}
                <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-50/80 to-transparent -z-10 pointer-events-none" />

                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
            <SetPasswordDialog user={user} />
        </div>
    )
}
