import { AuthPage } from '@/components/auth-pages'
export const metadata = { title: 'Log in | Atrium', description: 'Sign in to your Atrium workspace.', robots: { index: false, follow: false } }
export default function LoginPage() { return <AuthPage mode="login" /> }
