'use client'

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export function PrintButton() {
    return (
        <Button onClick={() => window.print()} variant="secondary" size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white border-none">
            <Printer className="w-4 h-4 mr-2" />
            Print Invoice
        </Button>
    )
}
