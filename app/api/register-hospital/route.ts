import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { hospitalName, email, password, fullName, website } = await req.json()

        // Honeypot Check
        if (website) {
            // Silently fail or return error. Returning error for now.
            return NextResponse.json(
                { error: 'Spam detected' },
                { status: 400 }
            )
        }

        if (!hospitalName || !email || !password || !fullName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Initialize Supabase Admin Client
        const supabaseAdmin = createSupabaseAdmin()

        // 1. Create User
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email for now to simplify flow
            user_metadata: {
                full_name: fullName,
                is_password_set: true
            }
        })

        if (userError) {
            console.error('User creation error:', userError)
            return NextResponse.json(
                { error: userError.message },
                { status: 400 }
            )
        }

        const userId = userData.user.id

        // 2. Create Hospital
        const { data: hospital, error: hospitalError } = await supabaseAdmin
            .from('hospitals')
            .insert({
                name: hospitalName,
                subscription_status: 'active',
            })
            .select()
            .single()

        if (hospitalError) {
            console.error('Hospital creation error:', hospitalError)
            // Rollback user creation
            await supabaseAdmin.auth.admin.deleteUser(userId)
            return NextResponse.json(
                { error: 'Failed to create hospital' },
                { status: 500 }
            )
        }

        // 3. Create Profile for Owner
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
                id: userId,
                email: email,
                full_name: fullName,
                hospital_id: hospital.id,
                role: 'owner',
            })

        if (profileError) {
            console.error('Profile creation error:', profileError)
            // Rollback hospital and user
            await supabaseAdmin.from('hospitals').delete().eq('id', hospital.id)
            await supabaseAdmin.auth.admin.deleteUser(userId)

            return NextResponse.json(
                { error: 'Failed to create profile' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true, hospitalId: hospital.id })
    } catch (error: any) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
