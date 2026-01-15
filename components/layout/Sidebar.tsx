'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    BookOpen,
    FileText,
    Settings,
    LogOut,
    Menu,
    X
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/classes', icon: BookOpen, label: 'Clases' },
    // Placeholder links for future expansion
    { href: '/billing', icon: FileText, label: 'Facturación' },
    { href: '/settings', icon: Settings, label: 'Configuración' },
]

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-md shadow-sm border"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar Container */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    {/* Logo Area */}
                    <div className="h-16 flex items-center px-6 border-b border-slate-800">
                        <h1 className="text-xl font-bold tracking-wider">ISDI<span className="text-blue-500">_Control</span></h1>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-6 px-3 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                                    )}
                                >
                                    <Icon size={18} />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User Footer */}
                    <div className="p-4 border-t border-slate-800">
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 w-full transition-colors"
                        >
                            <LogOut size={18} />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
