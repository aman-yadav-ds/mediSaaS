import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const aadhar = searchParams.get('aadhar')

        if (!aadhar) {
            return NextResponse.json({ error: 'Aadhar number is required' }, { status: 400 })
        }

        // 1. Verify Authentication
        const cookieStore = await cookies()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any })
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Get Requester's Hospital ID
        const { data: requesterProfile } = await supabase
            .from('profiles')
            .select('hospital_id')
            .eq('id', user.id)
            .single()

        if (!requesterProfile?.hospital_id) {
            return NextResponse.json({ error: 'Hospital ID not found' }, { status: 403 })
        }

        // 3. Initialize Admin Client to bypass RLS (Global Search)
        const supabaseAdmin = createSupabaseAdmin()

        // 4. Search for patient (Scoped to Hospital)
        const { data: patients, error } = await supabaseAdmin
            .from('patients')
            .select('id, full_name, age, gender, contact_number, aadhar_number')
            .eq('aadhar_number', aadhar)
            .eq('hospital_id', requesterProfile.hospital_id) // CRITICAL SECURITY FIX
            .limit(1)

        if (error) throw error

        return NextResponse.json({ patient: patients && patients.length > 0 ? patients[0] : null })

    } catch (error: unknown) {
        console.error('Search error:', error)
        const message = error instanceof Error ? error.message : 'Internal server error'
        return NextResponse.json(
            { error: message },
            { status: 500 }
        )
    }
}
