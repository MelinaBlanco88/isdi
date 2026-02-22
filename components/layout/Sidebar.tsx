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
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/classes', icon: BookOpen, label: 'Clases' },
    { href: '/billing', icon: FileText, label: 'Facturación' },
    { href: '/settings', icon: Settings, label: 'Configuración' },
]

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)
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
                className="lg:hidden fixed top-4 right-4 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar Container */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static flex-shrink-0",
                isCollapsed ? "w-[72px]" : "w-64",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full relative">
                    {/* Collapse Toggle Button (Desktop only) */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex absolute -right-3 top-20 z-50 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center shadow-md hover:bg-slate-50 hover:shadow-lg transition-all text-slate-600 cursor-pointer"
                    >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>

                    {/* Logo Area */}
                    <div className={cn(
                        "h-16 flex items-center border-b border-slate-800/50 transition-all duration-300",
                        isCollapsed ? "px-4 justify-center" : "px-6"
                    )}>
                        {isCollapsed ? (
                            <span className="text-xl font-bold text-blue-400">I</span>
                        ) : (
                            <h1 className="text-xl font-bold tracking-wider">
                                ISDI<span className="text-blue-400">_Facturas</span>
                            </h1>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className={cn(
                        "flex-1 py-6 space-y-1 transition-all duration-300",
                        isCollapsed ? "px-2" : "px-3"
                    )}>
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    title={isCollapsed ? item.label : undefined}
                                    className={cn(
                                        "flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200",
                                        isCollapsed ? "px-3 py-3 justify-center" : "px-3 py-2.5",
                                        isActive
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <Icon size={18} className="flex-shrink-0" />
                                    {!isCollapsed && <span>{item.label}</span>}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User Footer */}
                    <div className="p-3 border-t border-slate-800/50">
                        <button
                            onClick={handleSignOut}
                            title={isCollapsed ? "Cerrar Sesión" : undefined}
                            className={cn(
                                "flex items-center gap-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-white/5 w-full transition-all duration-200",
                                isCollapsed ? "px-3 py-3 justify-center" : "px-3 py-2.5"
                            )}
                        >
                            <LogOut size={18} className="flex-shrink-0" />
                            {!isCollapsed && <span>Cerrar Sesión</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
