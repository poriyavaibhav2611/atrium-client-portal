import { AuthPage } from '@/components/auth-pages'
export const metadata = { title: 'Reset password | Atrium', description: 'Reset your Atrium password.', robots: { index: false, follow: false } }
export default function ForgotPasswordPage() { return <AuthPage mode="forgot" /> }
