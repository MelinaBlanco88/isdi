import { cn } from "@/lib/utils"

interface StatCardProps {
    label: string
    value: string
    icon: any
    color: 'green' | 'blue' | 'orange' | 'slate'
}

export default function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
    const colorStyles = {
        green: "bg-green-50 text-green-600",
        blue: "bg-blue-50 text-blue-600",
        orange: "bg-orange-50 text-orange-600",
        slate: "bg-slate-50 text-slate-600",
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            </div>
            <div className={cn("p-3 rounded-lg", colorStyles[color])}>
                <Icon size={24} />
            </div>
        </div>
    )
}
