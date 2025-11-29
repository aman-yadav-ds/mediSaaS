'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

export function WaitingTime({ startTime }: { startTime: string }) {
    const [elapsed, setElapsed] = useState<string>('')
    const [isLongWait, setIsLongWait] = useState(false)

    useEffect(() => {
        const calculateTime = () => {
            const start = new Date(startTime).getTime()
            const now = new Date().getTime()
            const diff = now - start

            const minutes = Math.floor(diff / 60000)
            const hours = Math.floor(minutes / 60)

            if (minutes > 30) setIsLongWait(true)
            else setIsLongWait(false)

            if (hours > 0) {
                const remainingMins = minutes % 60
                setElapsed(`${hours}h ${remainingMins}m`)
            } else {
                setElapsed(`${minutes}m`)
            }
        }

        calculateTime()
        const interval = setInterval(calculateTime, 60000) // Update every minute

        return () => clearInterval(interval)
    }, [startTime])

    return (
        <div className={`flex items-center gap-1.5 text-sm font-medium ${isLongWait ? 'text-red-600' : 'text-slate-600'}`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{elapsed}</span>
        </div>
    )
}
