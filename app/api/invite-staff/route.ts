import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { email, role, fullName, department } = await req.json()

        // Validate Role
        const allowedRoles = ['doctor', 'nurse', 'receptionist']
        if (!allowedRoles.includes(role)) {
            return NextResponse.json(
                { error: 'Invalid role. Must be doctor, nurse, or receptionist.' },
                { status: 400 }
            )
        }

        // 1. Verify the requester is an Owner
        const cookieStore = await cookies()
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any })
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: requesterProfile } = await supabase
            .from('profiles')
            .select('hospital_id, role')
            .eq('id', user.id)
            .single()

        if (!requesterProfile || requesterProfile.role !== 'owner') {
            return NextResponse.json(
                { error: 'Only owners can invite staff' },
                { status: 403 }
            )
        }

        // 2. Initialize Admin Client for Invite
        const supabaseAdmin = createSupabaseAdmin()

        // 3. Invite User via Email
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
            email,
            {
                redirectTo: `${new URL(req.url).origin}/auth/callback`,
                data: {
                    full_name: fullName,
                    is_password_set: false
                },
            }
        )

        if (inviteError) {
            return NextResponse.json(
                { error: inviteError.message },
                { status: 400 }
            )
        }

        // 4. Create Profile for Invited User
        // Note: inviteUserByEmail creates the user in Auth, but we need to link them to the hospital
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
                id: inviteData.user.id,
                email: email,
                full_name: fullName,
                hospital_id: requesterProfile.hospital_id,
                role: role,
                department: department || null,
            })

        if (profileError) {
            // If profile creation fails, we might want to delete the auth user, but for now just error
            return NextResponse.json(
                { error: 'Failed to create staff profile' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Invite error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
