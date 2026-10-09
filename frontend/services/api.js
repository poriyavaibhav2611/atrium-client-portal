import mock from '@/data/mock'

const wait = (value, delay = 400) => new Promise((resolve) => setTimeout(() => resolve(value), delay))
const persistSession = (nextUser) => { document.cookie = 'atrium_session=1; path=/; max-age=604800'; localStorage.setItem('atrium_user', JSON.stringify(nextUser)) }
export async function login({ email, password }) { if (!email || !password) throw new Error('Email and password are required.') ; const nextUser = { ...mock.user, email }; persistSession(nextUser); return wait({ ok: true, user: nextUser }, 600) }
export async function signup({ name, email, company, password }) { if (!name || !email || !password) throw new Error('Please complete all required fields.'); const nextUser = { ...mock.user, name, email, workspace: company || mock.user.workspace }; persistSession(nextUser); return wait({ ok: true, user: nextUser }, 600) }
export function logout() { document.cookie = 'atrium_session=; path=/; max-age=0'; localStorage.removeItem('atrium_user') }
export const requestPasswordReset = (email) => wait({ ok: true, email })
export const getOverview = () => wait(mock.overview)
export const getProjects = () => wait(mock.projects)
export const getClients = () => wait(mock.clients)
export const getFiles = () => wait(mock.files)
export const getThreads = () => wait(mock.messages)
export const getApprovals = () => wait(mock.approvals)
export const getInvoices = () => wait(mock.invoices)
export const getActivity = () => wait(mock.activity)
export const getSettings = () => wait(mock.settings)
