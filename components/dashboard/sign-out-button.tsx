'use client'

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SignOutButtonProps {
    collapsed?: boolean
}

export function SignOutButton({ collapsed }: SignOutButtonProps) {
    return (
        <form action="/auth/signout" method="post">
            <Button
                variant="ghost"
                className={`w-full text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all ${collapsed ? "justify-center px-2" : "justify-start"
                    }`}
                type="submit"
                title="Sign Out"
            >
                <LogOut className={`w-5 h-5 ${collapsed ? "" : "mr-3"}`} />
                {!collapsed && "Sign Out"}
            </Button>
        </form>
    )
}
