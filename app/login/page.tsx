import AuthForm from './AuthForm'
import { Suspense } from 'react'

export default function LoginPage() {
    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto min-h-screen">
            <Suspense fallback={<div>Cargando...</div>}>
                <AuthForm />
            </Suspense>
        </div>
    )
}

