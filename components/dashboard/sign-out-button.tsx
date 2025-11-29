'use client'

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SignOutButton() {
    return (
        <form action="/auth/signout" method="post">
            <Button
                variant="ghost"
                className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50"
                type="submit"
            >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
            </Button>
        </form>
    )
}
