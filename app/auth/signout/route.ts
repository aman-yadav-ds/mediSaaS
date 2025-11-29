import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any })

    // Check if we have a user
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        await supabase.auth.signOut()
    }

    return NextResponse.redirect(new URL('/login', req.url), {
        status: 302,
    })
}

export async function GET(req: Request) {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any })

    // Check if we have a user
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        await supabase.auth.signOut()
    }

    return NextResponse.redirect(new URL('/login', req.url), {
        status: 302,
    })
}
