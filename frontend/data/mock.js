export const user = { name: 'Jamie Taylor', email: 'jamie@taylorco.studio', role: 'Owner', workspace: 'Taylor & Co.', plan: 'Studio' }
export const clients = [
  { id: 'fold-studio', name: 'Fold Studio', contact: 'Maya Chen', role: 'Founder', email: 'maya@foldstudio.co', phone: '+1 415 555 0142', timezone: 'Pacific Time', since: 'Mar 2026', status: 'Active', lastActive: '12m ago', portalAccess: true, note: 'Prefers Friday check-ins. Send mockups as Figma links.' },
  { id: 'northstar', name: 'Northstar', contact: 'Jon Reyes', role: 'Creative Director', email: 'jon@northstar.co', phone: '+1 212 555 0178', timezone: 'Eastern Time', since: 'Jan 2026', status: 'Active', lastActive: 'Yesterday', portalAccess: true, note: '' },
  { id: 'goodwork', name: 'Goodwork', contact: 'Ava Lee', role: 'Partner', email: 'ava@goodwork.co', phone: '+44 20 7946 0123', timezone: 'GMT', since: 'Feb 2026', status: 'Active', lastActive: 'Mon', portalAccess: true, note: '' },
  { id: 'helios', name: 'Helios', contact: 'Jordan Kim', role: 'Head of Marketing', email: 'jordan@helios.co', phone: '+1 303 555 0166', timezone: 'Mountain Time', since: 'Apr 2026', status: 'Active', lastActive: '1h ago', portalAccess: true, note: '' },
  { id: 'studio-a', name: 'Studio A', contact: 'Sam Rivera', role: 'Operations Lead', email: 'sam@studioa.co', phone: '+1 646 555 0119', timezone: 'Eastern Time', since: 'May 2026', status: 'Active', lastActive: '3h ago', portalAccess: true, note: '' }
]
const project = (id, name, client, progress, status, due, team = ['JT', 'MC']) => ({ id, name, client, progress, status, due, team })
export const projects = [project(1,'Homepage v3','Fold Studio',72,'On track','Oct 30'),project(2,'Brand refresh','Northstar',48,'In review','Nov 12'),project(3,'Q4 campaign','Helios',26,'Delayed','Nov 20'),project(4,'Mobile app UI','Goodwork',64,'On track','Nov 8'),project(5,'Pricing page redesign','Studio A',85,'On track','Oct 24'),project(6,'Email templates','Fold Studio',40,'In review','Nov 3'),project(7,'Product launch video','Helios',55,'On track','Dec 1'),project(8,'Design system','Northstar',33,'On track','Dec 10'),project(9,'Blog redesign','Goodwork',70,'On track','Nov 15'),project(10,'Onboarding flow','Studio A',20,'Delayed','Nov 28'),project(11,'Social kit','Fold Studio',90,'On track','Oct 20'),project(12,'Annual report','Northstar',15,'In review','Dec 15')]
export const approvals = [{ id: 1, title: 'Homepage v3 · Mobile layouts', client: 'Fold Studio', comments: 2, due: 'Due tomorrow' }, { id: 2, title: 'Brand refresh · Logo concepts', client: 'Northstar', comments: 0, due: 'Due Nov 3' }, { id: 3, title: 'Brand refresh · Color palette', client: 'Northstar', comments: 0, due: 'Due Nov 5' }, { id: 4, title: 'Q4 campaign · Landing copy', client: 'Helios', comments: 0, due: 'Due Nov 7' }]
export const invoices = [{ id: '#1042', client: 'Fold Studio', amount: 2400, status: 'Paid', due: 'Oct 24, 2026' },{ id: '#1041', client: 'Studio A', amount: 3800, status: 'Paid' },{ id: '#1040', client: 'Northstar', amount: 5200, status: 'Paid' },{ id: '#1039', client: 'Helios', amount: 4600, status: 'Paid' },{ id: '#1038', client: 'Goodwork', amount: 2420, status: 'Paid' },{ id: '#1043', client: 'Fold Studio', amount: 3200, status: 'Sent', due: 'Nov 5' },{ id: '#1044', client: 'Northstar', amount: 1800, status: 'Overdue' }]
export const files = [{ name: 'Homepage-v3.fig', size: '4.8 MB', version: 'v3', client: 'Fold Studio' },{ name: 'hero-final.png', size: '2.1 MB', version: 'v3', client: 'Fold Studio' },{ name: 'Project-brief.pdf', size: '860 KB', version: 'v3', client: 'Fold Studio' },{ name: 'brand-assets.zip', size: '24 MB', version: 'v1', client: 'Helios' }]
export const activity = [{ text: 'Maya Chen approved Homepage v3', time: '12m ago', initials: 'MC', clientId: 'fold-studio' },{ text: 'Jordan Kim uploaded brand assets', time: '1h ago', initials: 'JK', clientId: 'helios' },{ text: 'Studio A paid Invoice #1041', time: '3h ago', initials: 'SA', clientId: 'studio-a' }]
export const messages = [{ client: 'Fold Studio', text: 'Amazing, shipping it today.', time: '10:45' },{ client: 'Northstar', text: 'The logo directions look great.', time: 'Yesterday' },{ client: 'Goodwork', text: 'Can we review the mobile flow?', time: 'Mon' },{ client: 'Helios', text: 'Assets are uploaded.', time: 'Sun' }]
export const overview = { activeProjects: 12, pendingApprovals: 4, revenue: 18420 }
export const settings = { workspace: 'Taylor & Co.', plan: 'Studio' } 
export const timeline = [{ text: 'New comment', time: 'Today, 10:42' }, { text: 'File uploaded', time: 'Yesterday' }, { text: 'Invoice paid', time: 'Oct 18' }, { text: 'Project approved', time: 'Oct 16' }] 
export const workspaceBranding = { name: "Taylor & Co.", slug: "taylorco", accentColor: "#4F46E5", logoUrl: null }
export const paymentSettings = { connected: true, onlinePayments: true, receipts: true, terms: 'Net 15' }
export const notificationSettings = {
  newMessage: true,
  approvalUpdates: true,
  invoicePaid: true,
  weeklySummary: false
}
export const securitySettings = { tfaEnabled: false, setupDate: null };
export const mock = { user, clients, projects, approvals, invoices, files, activity, messages, overview, settings, timeline, workspaceBranding, paymentSettings, notificationSettings, securitySettings }
export default mock
