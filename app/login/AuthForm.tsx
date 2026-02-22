'use client'

import { login, signup } from './actions'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle, Briefcase } from 'lucide-react'

export default function AuthForm() {
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const searchParams = useSearchParams()
    const message = searchParams.get('message')
    const error = searchParams.get('error')

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 border border-white p-8 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-xl shadow-slate-900/20 mb-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-y-full group-hover:translate-y-[-100%] transition-transform duration-700"></div>
                    <Briefcase size={28} className="relative z-10" />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                    {isLogin ? 'Bienvenido' : 'Crea tu cuenta'}
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                    {isLogin
                        ? 'Ingresa tus credenciales para continuar'
                        : 'Únete para gestionar tus clases y facturas'}
                </p>
            </div>

            <form
                className="space-y-6"
                onSubmit={() => setLoading(true)}
            >
                {/* Email Field */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block" htmlFor="email">
                        Correo Electrónico
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            className="w-full rounded-xl pl-11 pr-4 py-3.5 bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-slate-300 outline-none text-slate-900 placeholder:text-slate-300 shadow-sm"
                            name="email"
                            type="email"
                            placeholder="tu@email.com"
                            required
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-slate-700 block" htmlFor="password">
                            Contraseña
                        </label>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            className="w-full rounded-xl pl-11 pr-4 py-3.5 bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-slate-300 outline-none text-slate-900 placeholder:text-slate-300 shadow-sm"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                {/* Submit Logic */}
                <button
                    formAction={isLogin ? login : signup}
                    onClick={() => setLoading(true)}
                    className="w-full bg-slate-900 text-white rounded-xl px-4 py-3.5 font-semibold shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer mt-8"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <span>{isLogin ? 'Iniciar sesión' : 'Crear cuenta'}</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>

                {/* Switch mode */}
                <div className="pt-5 pb-1 text-center border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-slate-500 hover:text-slate-900 transition-colors cursor-pointer font-medium inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-50"
                    >
                        {isLogin
                            ? '¿No tienes cuenta? Crea una aquí'
                            : '¿Ya tienes cuenta? Inicia sesión'}
                    </button>
                </div>

                {/* Alerts */}
                {message && (
                    <div className="mt-4 p-4 bg-emerald-50 text-emerald-800 text-sm font-medium rounded-xl border border-emerald-100/50 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                        <Sparkles size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                        <p>{message}</p>
                    </div>
                )}
                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-800 text-sm font-medium rounded-xl border border-red-100/50 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                        <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}
            </form>
        </div>
    )
}
