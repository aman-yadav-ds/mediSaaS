import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

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
                { error: 'Only owners can delete staff' },
                { status: 403 }
            )
        }

        // 2. Initialize Admin Client
        const supabaseAdmin = createSupabaseAdmin()

        // 3. Cleanup Foreign Keys (Manually handle constraints)
        // Set assigned_doctor_id to null for patients assigned to this doctor
        await supabaseAdmin
            .from('patients')
            .update({ assigned_doctor_id: null })
            .eq('assigned_doctor_id', id)

        // Set recorded_by to null for vitals recorded by this staff
        await supabaseAdmin
            .from('vitals')
            .update({ recorded_by: null })
            .eq('recorded_by', id)

        // Set doctor_id to null for prescriptions by this doctor
        await supabaseAdmin
            .from('prescriptions')
            .update({ doctor_id: null })
            .eq('doctor_id', id)

        // 4. Delete User from Auth
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(id)

        if (deleteError) {
            return NextResponse.json(
                { error: deleteError.message },
                { status: 400 }
            )
        }

        // 4. Delete Profile (Optional if cascade is on, but good practice to ensure cleanup)
        // We'll attempt it, but if the user is already gone (cascade), it might just return 0 rows.
        await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', id)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Delete error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
