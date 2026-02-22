import Sidebar from '@/components/layout/Sidebar'

export default function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
