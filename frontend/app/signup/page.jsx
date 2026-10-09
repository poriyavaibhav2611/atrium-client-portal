import { AuthPage } from '@/components/auth-pages'
export const metadata = { title: 'Sign up | Atrium', description: 'Start your Atrium free trial.', robots: { index: false, follow: false } }
export default function SignupPage() { return <AuthPage mode="signup" /> }
