'use client'

import { login, signup } from './actions'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function AuthForm() {
    const [isLogin, setIsLogin] = useState(true)
    const searchParams = useSearchParams()
    const message = searchParams.get('message')
    const error = searchParams.get('error')

    return (
        <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
            <h1 className="text-2xl font-bold mb-6 text-center">
                {isLogin ? 'Inicia sesión' : 'Crear cuenta'}
            </h1>

            <label className="text-md" htmlFor="email">
                Email
            </label>
            <input
                className="rounded-md px-4 py-2 bg-inherit border mb-6"
                name="email"
                placeholder="tu@email.com"
                required
            />

            <label className="text-md" htmlFor="password">
                Contraseña
            </label>
            <input
                className="rounded-md px-4 py-2 bg-inherit border mb-6"
                type="password"
                name="password"
                placeholder="••••••••"
                required
            />

            <button
                formAction={isLogin ? login : signup}
                className="bg-green-700 rounded-md px-4 py-2 text-white mb-4 hover:bg-green-800 transition-colors"
            >
                {isLogin ? 'Iniciar sesión' : 'Registrarse'}
            </button>

            <div className="text-center text-sm">
                <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-blue-600 hover:underline"
                >
                    {isLogin
                        ? '¿No tienes cuenta? Regístrate aquí'
                        : '¿Ya tienes cuenta? Inicia sesión'}
                </button>
            </div>

            {message && (
                <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center rounded-md">
                    {message}
                </p>
            )}
            {error && (
                <p className="mt-4 p-4 bg-red-100 text-red-600 text-center rounded-md border border-red-200">
                    {error}
                </p>
            )}
        </form>
    )
}
