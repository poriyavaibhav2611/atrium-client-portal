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
export const getClient = (id) => wait(mock.clients.find(c => c.id === id))
export const updateClient = (id, data) => { const idx = mock.clients.findIndex(c => c.id === id); if(idx !== -1) mock.clients[idx] = { ...mock.clients[idx], ...data }; return wait(mock.clients[idx]); }
export const archiveClient = (id) => { mock.clients = mock.clients.filter(c => c.id !== id); return wait({ ok: true }); }
export const resendInvite = (id) => wait({ ok: true });
export const togglePortalAccess = (id, hasAccess) => { const idx = mock.clients.findIndex(c => c.id === id); if(idx !== -1) { mock.clients[idx].portalAccess = hasAccess; mock.clients[idx].status = hasAccess ? 'Active' : 'Paused'; } return wait(mock.clients[idx]); }
export const saveClientNote = (id, note) => { const idx = mock.clients.findIndex(c => c.id === id); if(idx !== -1) mock.clients[idx].note = note; return wait(mock.clients[idx]); }
export const getFiles = () => wait(mock.files)
export const getThreads = () => wait(mock.messages)
export const getApprovals = () => wait(mock.approvals)
export const getInvoices = () => wait(mock.invoices)
export const getActivity = () => wait(mock.activity)
export const getSettings = () => wait(mock.settings)
