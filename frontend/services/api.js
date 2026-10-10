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
// Future backend will store Workspace { name, slug, accentColor, logoUrl } and client portal will read it by slug.
export const getWorkspace = () => wait(mock.workspaceBranding)
export const updateWorkspace = (data) => {
  mock.workspaceBranding = { ...mock.workspaceBranding, ...data }
  return wait(mock.workspaceBranding)
}
export const checkSlug = (slug) => {
  const taken = ['atrium', 'app', 'admin', 'www', 'api', 'taken']
  return wait({ available: !taken.includes(slug) }, 400)
}
export const getPaymentSettings = () => wait(mock.paymentSettings, 400)
export const updatePaymentSettings = (data) => {
  mock.paymentSettings = { ...mock.paymentSettings, ...data };
  return wait(mock.paymentSettings, 400);
}
export const connectStripe = () => {
  mock.paymentSettings = { ...mock.paymentSettings, connected: true, onlinePayments: true };
  return wait({ ok: true }, 600);
}
export const disconnectStripe = () => {
  mock.paymentSettings = { ...mock.paymentSettings, connected: false, onlinePayments: false };
  return wait({ ok: true }, 400);
}
export const getNotificationSettings = () => wait(mock.notificationSettings, 400)
export const updateNotificationSettings = (data) => {
  mock.notificationSettings = { ...mock.notificationSettings, ...data };
  return wait(mock.notificationSettings, 400);
}

// Future backend will use TOTP (otplib), store the secret encrypted and hash the recovery codes.
export const changePassword = (current, next) => wait({ ok: current === 'Demo@1234' ? true : false }, 600)
export const getSecuritySettings = () => wait(mock.securitySettings, 400)
export const enableTwoFactor = (code) => {
  if (code === '123456') {
    mock.securitySettings.tfaEnabled = true;
    mock.securitySettings.setupDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return wait({ ok: true }, 400);
  }
  return wait({ ok: false }, 400);
}
export const disableTwoFactor = (password) => {
  if (password === 'Demo@1234') {
    mock.securitySettings.tfaEnabled = false;
    mock.securitySettings.setupDate = null;
    return wait({ ok: true }, 400);
  }
  return wait({ ok: false }, 400);
}
export const regenerateRecoveryCodes = () => wait({ ok: true }, 400)
export const signOutOtherSessions = () => wait({ ok: true }, 400)
