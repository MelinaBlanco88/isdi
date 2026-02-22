import AuthForm from './AuthForm'
import { Suspense } from 'react'

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 selection:bg-blue-100 overflow-hidden relative">
            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="absolute w-[800px] h-[800px] bg-gradient-to-br from-blue-100/40 to-transparent rounded-full blur-3xl -top-[200px] -right-[200px] mix-blend-multiply opacity-70"></div>
                <div className="absolute w-[600px] h-[600px] bg-gradient-to-tr from-violet-100/40 to-transparent rounded-full blur-3xl -bottom-[100px] -left-[100px] mix-blend-multiply opacity-70"></div>
            </div>

            <div className="w-full max-w-md relative z-10 my-8">
                <Suspense fallback={
                    <div className="flex justify-center p-12 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl shadow-slate-200/50">
                        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin"></div>
                    </div>
                }>
                    <AuthForm />
                </Suspense>

                <p className="text-center text-xs text-slate-400 mt-8 font-medium">
                    Plataforma Administrativa &bull; Profesores
                </p>
            </div>
        </div>
    )
}
