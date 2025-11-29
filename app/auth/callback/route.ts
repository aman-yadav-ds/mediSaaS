import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {

        const cookieStore = await cookies()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any })
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error('Auth Callback: Error exchanging code', error)
            return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url))
        }

        const next = requestUrl.searchParams.get('next')
        return NextResponse.redirect(new URL(next || '/dashboard', request.url))
    }


    return NextResponse.redirect(new URL('/login?error=no_code', request.url))
}
