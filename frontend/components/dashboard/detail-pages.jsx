'use client'
import { useMemo, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Check, CheckCircle2, Clock, Copy, Download, FileText, MessageSquare, MoreHorizontal, Paperclip, Plus, Receipt, Send, Upload, Users, X, Globe, Monitor, Smartphone, Search, AlignJustify, Loader2, User, Palette, CreditCard, Wallet, ShieldCheck, Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SiStripe } from 'react-icons/si'
import { approvals as seedApprovals, invoices as seedInvoices, activity as seedActivity, user, clients } from '@/data/mock'
import { checkSlug, getPaymentSettings, updatePaymentSettings, connectStripe, disconnectStripe, getNotificationSettings, updateNotificationSettings, changePassword, getSecuritySettings, enableTwoFactor, disableTwoFactor, regenerateRecoveryCodes, signOutOtherSessions } from '@/services/api'
import { PasswordInput, strength } from '@/components/auth-pages'
import { useWorkspaceBranding } from '@/hooks/use-workspace-branding'
import { Dropdown } from '@/components/ui/dropdown'
import { DatePicker } from '@/components/ui/datepicker'

const money = (n) => `$${n.toLocaleString()}`
function Modal({ title, children, onClose }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><div role="dialog" aria-modal="true" className="w-full max-w-md rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#111113] p-5 shadow-2xl"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">{title}</h2><button aria-label="Close" onClick={onClose}><X className="size-4" /></button></div>{children}</div></div> }
function Button({ children, primary, ...props }) { return <button {...props} className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${primary ? 'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700' : 'border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] hover:bg-muted'} ${props.className || ''}`}>{children}</button> }
function Input({ label, ...props }) { return <label className="flex flex-col gap-1.5 text-sm"><span className="font-medium">{label}</span><input {...props} className="h-9 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-3 outline-none focus:border-indigo-500" /></label> }

export function ApprovalsPage() { const [items, setItems] = useState(seedApprovals.map((x) => ({ ...x, status: 'Pending' }))); const [tab, setTab] = useState('Pending'); const [feedback, setFeedback] = useState(null); const pending = items.filter((x) => x.status === 'Pending'); const approved = items.filter((x) => x.status === 'Approved'); return <div className="flex flex-col gap-6"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-semibold">Approvals</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review deliverables and keep projects moving.</p></div></div><div className="mb-5 flex gap-1 border-b border-slate-200 dark:border-white/[0.08]"><button onClick={() => setTab('Pending')} className={`border-b-2 px-3 py-2 text-sm ${tab === 'Pending' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 dark:text-slate-400'}`}>Pending ({pending.length})</button><button onClick={() => setTab('Approved')} className={`border-b-2 px-3 py-2 text-sm ${tab === 'Approved' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 dark:text-slate-400'}`}>Approved</button><button onClick={() => setTab('Changes')} className={`border-b-2 px-3 py-2 text-sm ${tab === 'Changes' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 dark:text-slate-400'}`}>Changes requested</button></div>{tab === 'Changes' ? <Empty text="No changes requested" /> : tab === 'Approved' ? <div className="grid gap-3">{approved.length ? approved.map((item) => <ApprovalCard key={item.id} item={item} approved />) : <Empty text="No approvals yet" />}</div> : <div className="grid gap-3 md:grid-cols-2">{pending.map((item) => <ApprovalCard key={item.id} item={item} onApprove={() => setItems((all) => all.map((x) => x.id === item.id ? { ...x, status: 'Approved' } : x))} onChanges={() => setFeedback(item)} />)}</div>}{feedback && <Modal title="Request changes" onClose={() => setFeedback(null)}><p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Tell the client what needs another pass on “{feedback.title}”.</p><textarea autoFocus className="min-h-24 w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-3 text-sm outline-none focus:border-indigo-500" placeholder="Add feedback…" /><Button primary className="mt-3 w-full" onClick={() => setFeedback(null)}>Send feedback</Button></Modal>}</div> }
function ApprovalCard({ item, onApprove, onChanges, approved }) { return <article className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#111113] p-4"><div className="flex gap-3"><div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500"><FileText className="size-5" /></div><div className="min-w-0 flex-1"><h3 className="font-medium">{item.title}</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.client} · {item.client === 'Fold Studio' ? 'Homepage v3' : item.client === 'Northstar' ? 'Brand refresh' : 'Q4 campaign'}</p><p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{approved ? 'Approved by Maya Chen · 12m ago' : 'Awaiting your approval'}</p><div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400"><span><MessageSquare className="mr-1 inline size-3.5" />{item.comments || 0} comments</span><span><Clock className="mr-1 inline size-3.5" />{item.due}</span></div></div></div>{!approved && <div className="mt-4 grid grid-cols-2 gap-2"><Button onClick={onChanges}>Request changes</Button><Button primary onClick={onApprove}><Check className="size-4" />Approve</Button></div>}</article> }
function Empty({ text }) { return <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/[0.08] p-12 text-center text-sm text-slate-500 dark:text-slate-400">{text}</div> }

export function InvoicesPage() { const [rows, setRows] = useState(seedInvoices.map((x) => ({ ...x, due: x.due || 'Nov 7, 2026' }))); const [selected, setSelected] = useState(null); const [newOpen, setNewOpen] = useState(false); const totals = { Paid: rows.filter((x) => x.status === 'Paid').reduce((a, x) => a + x.amount, 0), Sent: rows.filter((x) => x.status === 'Sent').reduce((a, x) => a + x.amount, 0), Overdue: rows.filter((x) => x.status === 'Overdue').reduce((a, x) => a + x.amount, 0) }; return <div className="flex flex-col gap-6"><div className="mb-5 flex items-end justify-between"><div><h2 className="text-xl font-semibold">Invoices</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track client payments and outstanding work.</p></div><Button primary onClick={() => setNewOpen(true)}><Plus className="size-4" />New invoice</Button></div><div className="mb-5 grid gap-3 sm:grid-cols-3">{[['Paid this month', totals.Paid],['Outstanding', totals.Sent],['Overdue', totals.Overdue]].map(([label, value]) => <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#111113] p-4" key={label}><p className="text-sm text-slate-500 dark:text-slate-400">{label}</p><p className="mt-2 text-2xl font-semibold">{money(value)}</p></div>)}</div><div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#111113]"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-slate-200 dark:border-white/[0.08] text-xs text-slate-500 dark:text-slate-400"><tr>{['Invoice','Client','Amount','Due date','Status',''].map((h) => <th className="px-4 py-3 font-medium" key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id} onClick={() => setSelected(row)} className="cursor-pointer border-b border-slate-200 dark:border-white/[0.08] last:border-0 hover:bg-muted/50"><td className="px-4 py-3 font-medium">{row.id}</td><td className="px-4 py-3">{row.client}</td><td className="px-4 py-3">{money(row.amount)}</td><td className="px-4 py-3 text-slate-500 dark:text-slate-400">{row.due}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs ${row.status === 'Paid' ? 'bg-emerald-500/15 text-emerald-600' : row.status === 'Overdue' ? 'bg-red-500/15 text-red-600' : 'bg-amber-500/15 text-amber-600'}`}>{row.status}</span></td><td className="px-4 py-3"><MoreHorizontal className="size-4 text-slate-500 dark:text-slate-400" /></td></tr>)}</tbody></table></div></div>{selected && <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-md border-l border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#111113] p-5 shadow-2xl"><div className="flex items-center justify-between"><h2 className="font-semibold">Invoice preview</h2><button onClick={() => setSelected(null)} aria-label="Close"><X className="size-4" /></button></div><div className="mt-8"><p className="text-sm text-slate-500 dark:text-slate-400">{selected.id}</p><h3 className="mt-1 text-2xl font-semibold">{selected.client}</h3><p className="mt-5 text-sm text-slate-500 dark:text-slate-400">Issued Oct 12, 2026 · Due {selected.due}</p><div className="my-6 border-y border-slate-200 dark:border-white/[0.08] py-4"><div className="flex justify-between"><span>Creative services</span><span>{money(selected.amount)}</span></div><div className="mt-4 flex justify-between font-semibold"><span>Total</span><span>{money(selected.amount)}</span></div></div>{selected.status === 'Paid' && <p className="text-sm text-emerald-600">Paid via Stripe · Visa ending 4242</p>}<div className="mt-6 flex gap-2"><Button><Download className="size-4" />Download PDF</Button><Button onClick={() => navigator.clipboard?.writeText(`https://atrium.app/pay/${selected.id}`)}><Copy className="size-4" />Copy payment link</Button></div></div></aside>}{newOpen && <Modal title="New invoice" onClose={() => setNewOpen(false)}><form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); setRows((r) => [{ id: `#${1045 + r.length}`, client: f.get('client'), amount: Number(f.get('amount')), due: f.get('due'), status: 'Sent' }, ...r]); setNewOpen(false) }}><Input label="Client" name="client" required placeholder="Client name" /><Input label="Amount" name="amount" type="number" required placeholder="3200" /><label className="flex flex-col gap-1.5 text-sm"><span className="font-medium">Due date</span><DatePicker name="due" required /></label><textarea name="description" className="min-h-20 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-3 text-sm" placeholder="Description" /><Button primary type="submit">Create invoice</Button></form></Modal>}</div> }

export function ActivityPage() { const [filter, setFilter] = useState('All'); const events = [{ text: 'Maya Chen approved Homepage v3', time: '12m ago', type: 'Approvals', icon: CheckCircle2, day: 'Today' },{ text: 'Jordan Kim uploaded brand assets', time: '1h ago', type: 'Files', icon: Upload, day: 'Today' },{ text: 'Studio A paid Invoice #1041', time: '3h ago', type: 'Invoices', icon: Receipt, day: 'Today' },{ text: 'New comment', time: 'Today 10:42', type: 'Comments', icon: MessageSquare, day: 'Today' },{ text: 'File uploaded', time: 'Yesterday', type: 'Files', icon: Upload, day: 'Yesterday' },{ text: 'Invoice paid', time: 'Oct 18', type: 'Invoices', icon: Receipt, day: 'Earlier' },{ text: 'Project approved', time: 'Oct 16', type: 'Approvals', icon: CheckCircle2, day: 'Earlier' }]; const visible = filter === 'All' ? events : events.filter((x) => x.type === filter); return <div className="flex flex-col gap-6"><h2 className="text-xl font-semibold">Activity</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Everything happening across your workspace.</p><div className="my-5 flex flex-wrap gap-2">{['All','Comments','Files','Invoices','Approvals'].map((x) => <button key={x} onClick={() => setFilter(x)} className={`rounded-full border px-3 py-1.5 text-sm ${filter === x ? 'border-indigo-600 bg-indigo-500/10 text-indigo-600' : 'border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400'}`}>{x}</button>)}</div><div className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#111113] p-5">{['Today','Yesterday','Earlier'].map((day) => { const group = visible.filter((e) => e.day === day); return group.length ? <section key={day} className="relative mb-6 last:mb-0"><h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{day}</h3>{group.map((event, i) => <div className="relative flex gap-3 pb-5 last:pb-0" key={event.text + event.time}><div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-500"><event.icon className="size-4" /></div><div><p className="text-sm font-medium">{event.text}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{event.time} · Atrium workspace</p></div>{i < group.length - 1 && <span className="absolute left-[15px] top-8 h-full w-0.5 bg-indigo-500/25" />}</div>)}</section> : null })}</div></div> }

export function SettingsPage() {
  const [tab, setTab] = useState('Profile');
  const [saved, setSaved] = useState(false);
  const [billingYearly, setBillingYearly] = useState(false);
  const [timezone, setTimezone] = useState('America/Los_Angeles');
  
  const scrollRef = useRef(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector('[aria-current="page"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [tab]);

  const save = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const navGroups = [
    {
      label: 'Account',
      items: [
        { id: 'Profile', icon: User, show: true },
        { id: 'Security', icon: ShieldCheck, show: true },
        { id: 'Email notifications', icon: Mail, show: true },
      ]
    },
    {
      label: 'Workspace',
      items: [
        { id: 'Workspace and branding', icon: Palette, show: true },
        { id: 'Team', icon: Users, show: true },
        { id: 'Billing', icon: CreditCard, show: true },
        { id: 'Payments', icon: Wallet, show: true },
      ]
    }
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col px-6 pb-10 pt-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Settings</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your profile, workspace and billing.</p>
        </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
        <nav 
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:sticky lg:top-20 lg:self-start"
        >
          {navGroups.map((group, groupIdx) => {
            const visibleItems = group.items.filter(item => item.show);
            if (visibleItems.length === 0) return null;
            
            return (
              <div key={group.label} className={`flex shrink-0 gap-2 lg:shrink lg:flex-col lg:gap-1 ${groupIdx > 0 ? 'lg:mt-6' : ''}`}>
                <h3 className="hidden lg:block mb-2 px-3 text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                  {group.label}
                </h3>
                {visibleItems.map(({ id, icon: Icon }) => {
                  const isActive = tab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setTab(id)}
                      aria-current={isActive ? "page" : undefined}
                      className={`
                        relative flex shrink-0 snap-start items-center whitespace-nowrap outline-none transition-all duration-150 focus-visible:ring-2 focus-visible:ring-indigo-500
                        /* Mobile pill */
                        h-9 rounded-full px-4 text-sm gap-2
                        ${isActive 
                          ? 'bg-indigo-600 text-white font-medium lg:bg-indigo-50 lg:text-indigo-700 lg:dark:bg-indigo-500/15 lg:dark:text-indigo-300' 
                          : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400 lg:bg-transparent lg:dark:bg-transparent lg:hover:bg-slate-100 lg:dark:hover:bg-white/[0.05]'
                        }
                        /* Desktop item */
                        lg:h-10 lg:w-full lg:rounded-lg lg:px-3 lg:gap-3 lg:font-normal
                        ${isActive ? 'lg:font-medium' : ''}
                      `}
                    >
                      {isActive && (
                        <span className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-r-full bg-indigo-600 dark:bg-indigo-400" />
                      )}
                      <Icon className={`hidden lg:block size-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span>{id}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
        
        <div className="min-w-0">
          {tab === 'Profile' && (
            <form onSubmit={save} className="max-w-xl rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#111113] p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white">Profile</h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 sm:col-span-2">
                  <span className="flex size-14 items-center justify-center rounded-full bg-indigo-500/15 font-semibold text-indigo-600">JT</span>
                  <Button type="button"><Upload className="size-4" />Upload avatar</Button>
                </div>
                <Input label="Full name" defaultValue={user.name} />
                <Input label="Email" type="email" defaultValue={user.email} />
                <label className="text-sm">
                  <span className="mb-1.5 block font-medium text-slate-900 dark:text-white">Role</span>
                  <input disabled value="Owner" className="h-9 w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-muted px-3 text-slate-500 dark:text-slate-400" />
                </label>
                <label className="text-sm">
                  <span className="mb-1.5 block font-medium text-slate-900 dark:text-white">Timezone</span>
                  <Dropdown options={['America/Los_Angeles', 'Asia/Kolkata']} value={timezone} onChange={setTimezone} className="w-full" />
                </label>
              </div>
              <Button primary type="submit" className="mt-5">{saved ? 'Saved' : 'Save changes'}</Button>
            </form>
          )}
          {tab === 'Workspace and branding' && <Branding />}
          {tab === 'Team' && <Team />}
          {tab === 'Billing' && <Billing yearly={billingYearly} setYearly={setBillingYearly} />}
          {tab === 'Payments' && <Payments />}
          {tab === 'Security' && <Security save={save} saved={saved} />}
          {tab === 'Email notifications' && <EmailNotifications />}
        </div>
      </div>
    </div>
  );
}
function getLuminance(hexColor) { const hex = hexColor.replace('#', ''); const r = parseInt(hex.substr(0, 2), 16) / 255; const g = parseInt(hex.substr(2, 2), 16) / 255; const b = parseInt(hex.substr(4, 2), 16) / 255; const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))); return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722; }
function isLowContrast(hexColor) { const L = getLuminance(hexColor); const LWhite = getLuminance('#FFFFFF'); const LBlack = getLuminance('#111113'); const cWhite = (Math.max(LWhite, L) + 0.05) / (Math.min(LWhite, L) + 0.05); const cBlack = (Math.max(LBlack, L) + 0.05) / (Math.min(LBlack, L) + 0.05); return Math.max(cWhite, cBlack) < 3.0; }
function isDarkText(hexColor) { const L = getLuminance(hexColor); const LWhite = getLuminance('#FFFFFF'); const LBlack = getLuminance('#111113'); const cWhite = (Math.max(LWhite, L) + 0.05) / (Math.min(LWhite, L) + 0.05); const cBlack = (Math.max(LBlack, L) + 0.05) / (Math.min(LBlack, L) + 0.05); return cBlack > cWhite; }
function Branding() { const { workspace, update, loading } = useWorkspaceBranding(); const canEditBranding = user.role === 'Owner'; const [name, setName] = useState(''); const [slug, setSlug] = useState(''); const [accent, setAccent] = useState('#4f46e5'); const [logoUrl, setLogoUrl] = useState(null); const [slugStatus, setSlugStatus] = useState(null); const [darkPreview, setDarkPreview] = useState(false); const [mobilePreview, setMobilePreview] = useState(false); const [savedStatus, setSavedStatus] = useState(''); useEffect(() => { if (workspace) { setName(workspace.name || ''); setSlug(workspace.slug || ''); setAccent(workspace.accentColor || '#4f46e5'); setLogoUrl(workspace.logoUrl || null); } }, [workspace]); const isDirty = workspace && (name !== workspace.name || slug !== workspace.slug || accent !== workspace.accentColor || logoUrl !== workspace.logoUrl); useEffect(() => { const handleBeforeUnload = (e) => { if (isDirty) { e.preventDefault(); e.returnValue = ''; } }; window.addEventListener('beforeunload', handleBeforeUnload); return () => window.removeEventListener('beforeunload', handleBeforeUnload); }, [isDirty]); useEffect(() => { if (!workspace || slug === workspace.slug || !slug || slug.length < 3) { setSlugStatus(null); return; } setSlugStatus('checking'); const timer = setTimeout(() => { checkSlug(slug).then((res) => { setSlugStatus(res.available ? 'available' : 'taken'); }); }, 400); return () => clearTimeout(timer); }, [slug, workspace]); const handleSave = async (e) => { e.preventDefault(); if (!isDirty || !canEditBranding) return; await update({ name, slug, accentColor: accent, logoUrl }); setSavedStatus('Saved successfully'); setTimeout(() => setSavedStatus(''), 3000); }; const handleLogoUpload = (e) => { const file = e.target.files?.[0]; if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/svg+xml') && file.size <= 2 * 1024 * 1024) { const url = URL.createObjectURL(file); setLogoUrl(url); } else { alert('Please upload a valid PNG, JPG, or SVG up to 2 MB.'); } }; const swatches = [ { label: 'Indigo', value: '#4f46e5' }, { label: 'Violet', value: '#7c3aed' }, { label: 'Pink', value: '#db2777' }, { label: 'Red', value: '#dc2626' }, { label: 'Green', value: '#059669' }, { label: 'Cyan', value: '#0891b2' }, ]; if (loading || !workspace) return <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-white/[0.02]" />; const initials = name ? name.split(' ').map((x) => x[0]).join('').substring(0, 2).toUpperCase() : 'W'; const contrastWarning = isLowContrast(accent); const headerTextDark = isDarkText(accent); return <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"><form onSubmit={handleSave} className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#111113]"><div><h3 className="text-lg font-semibold text-slate-900 dark:text-white">Workspace and branding</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">This is how clients see your portal.</p></div>{!canEditBranding && <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">Only the workspace owner can change branding.</div>}<fieldset disabled={!canEditBranding} className="flex flex-col gap-6"><div><label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">Logo</label><div className="flex items-start gap-4">{logoUrl ? <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-white/10"><img src={logoUrl} alt="Logo" className="h-full w-full object-contain" /></div> : <div className="flex size-16 shrink-0 items-center justify-center rounded-lg text-xl font-bold shadow-sm" style={{ backgroundColor: accent, color: headerTextDark ? '#111113' : '#ffffff' }}>{initials}</div>}<div className="flex-1"><div className="relative flex w-full items-center justify-center rounded-lg border-2 border-dashed border-slate-200 p-4 transition-colors hover:border-indigo-400 dark:border-white/[0.08] dark:hover:border-indigo-500/50"><input type="file" accept=".png,.jpg,.jpeg,.svg" onChange={handleLogoUpload} className="absolute inset-0 z-10 w-full cursor-pointer opacity-0" /><div className="text-center text-sm text-slate-500"><span className="font-medium text-indigo-600 dark:text-indigo-400">Drag a logo here or browse</span><p className="mt-1 text-xs">PNG, JPG or SVG, up to 2 MB</p></div></div>{logoUrl && <div className="mt-2 flex gap-2"><Button type="button" onClick={() => setLogoUrl(null)} className="h-7 px-2 text-xs">Remove</Button></div>}</div></div></div><div><div className="mb-1 flex items-center justify-between"><label className="text-sm font-medium text-slate-900 dark:text-white">Workspace name</label><span className="text-xs text-slate-400">{name.length}/40</span></div><input required maxLength={40} value={name} onChange={(e) => setName(e.target.value)} className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white" /></div><div><label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">Accent color</label><div className="flex flex-wrap items-center gap-3">{swatches.map((s) => <button type="button" key={s.value} onClick={() => setAccent(s.value)} aria-label={s.label} className="relative flex size-8 items-center justify-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-[#111113]" style={{ backgroundColor: s.value, boxShadow: accent === s.value ? `0 0 0 2px var(--bg), 0 0 0 4px ${s.value}` : 'none' }}>{accent === s.value && <Check className="size-4 text-white drop-shadow-sm" />}</button>)}<div className="relative flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.05]" style={{ boxShadow: !swatches.find((x) => x.value === accent) ? `0 0 0 2px var(--bg), 0 0 0 4px ${accent}` : 'none' }}><input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label="Custom" /><div className="size-4 rounded-full" style={{ backgroundColor: accent }} /></div>{!swatches.find((x) => x.value === accent) && <input type="text" value={accent} onChange={(e) => setAccent(e.target.value)} pattern="^#[0-9A-Fa-f]{6}$" className="ml-2 h-8 w-20 rounded-md border border-slate-200 bg-white px-2 font-mono text-xs uppercase dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white" />}</div></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.05] dark:bg-white/[0.02]"><div className="mb-3 flex items-start justify-between"><div className="flex items-center gap-2 text-slate-400"><Globe className="size-4" /><span className="text-sm font-medium">Custom domain</span></div><span className="rounded-full bg-slate-200/50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-500 dark:bg-white/10 dark:text-slate-400">AGENCY PLAN</span></div><div className="relative"><input disabled value="portal.yourcompany.com" className="h-9 w-full rounded-lg border border-slate-200 bg-white/50 px-3 text-sm text-slate-400 dark:border-white/[0.05] dark:bg-white/[0.01]" /></div><p className="mt-3 text-xs text-slate-500"><a href="#" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">Upgrade your plan</a> to use a custom domain.</p></div><div><label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">Client portal URL</label><div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-colors focus-within:border-indigo-500 dark:border-white/[0.08] dark:bg-white/[0.03]"><input required pattern="^[a-z0-9\-]{3,30}$" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} className="h-9 w-full bg-transparent px-3 text-right text-sm font-medium outline-none dark:text-white" style={{ direction: 'rtl' }} /><span className="flex h-9 items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-slate-400" style={{ direction: 'ltr' }}>.atrium.app</span></div><div className="mt-2 flex items-center justify-between"><div className="text-xs font-medium">{slugStatus === 'checking' ? <span className="flex items-center gap-1 text-slate-500"><span className="size-2 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" /> Checking...</span> : slugStatus === 'available' ? <span className="flex items-center gap-1 text-emerald-600"><Check className="size-3" /> {slug}.atrium.app is available</span> : slugStatus === 'taken' ? <span className="text-red-500">This address is taken</span> : null}</div><div className="flex gap-2"><Button type="button" onClick={() => { navigator.clipboard?.writeText(`https://${slug}.atrium.app`); setSavedStatus('Copied'); setTimeout(() => setSavedStatus(''), 2000); }} className="h-7 px-2 text-xs" title="Copy"><Copy className="size-3" /></Button><Button type="button" onClick={() => alert('Portal preview coming soon')} className="h-7 px-2 text-xs" title="Open"><Globe className="size-3" /> Preview</Button></div></div></div></fieldset><div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-5 dark:border-white/[0.08]"><div className="text-sm font-medium">{savedStatus ? <span className="flex items-center gap-1 text-emerald-600"><Check className="size-4" /> {savedStatus}</span> : isDirty ? <span className="flex items-center gap-1 text-amber-600"><span className="size-2 animate-pulse rounded-full bg-amber-500" /> Unsaved changes</span> : null}</div><div className="flex gap-3">{isDirty && <Button type="button" onClick={() => { setName(workspace.name); setSlug(workspace.slug); setAccent(workspace.accentColor); setLogoUrl(workspace.logoUrl); }}>Discard</Button>}<Button type="submit" primary disabled={!isDirty || !canEditBranding || slugStatus === 'taken'}>Save branding</Button></div></div></form><div className="self-start lg:sticky lg:top-8"><div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#111113]"><div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold text-slate-900 dark:text-white">Client portal preview</h3><div className="flex items-center gap-2"><div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-white/[0.08] dark:bg-white/[0.02]"><button type="button" onClick={() => setDarkPreview(false)} className={`rounded-md p-1 ${!darkPreview ? 'bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}><Monitor className="size-3.5" /></button><button type="button" onClick={() => setDarkPreview(true)} className={`rounded-md p-1 ${darkPreview ? 'bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}><svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg></button></div><div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-white/[0.08] dark:bg-white/[0.02]"><button type="button" onClick={() => setMobilePreview(false)} className={`rounded-md p-1 ${!mobilePreview ? 'bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}><Monitor className="size-3.5" /></button><button type="button" onClick={() => setMobilePreview(true)} className={`rounded-md p-1 ${mobilePreview ? 'bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}><Smartphone className="size-3.5" /></button></div></div></div><div className={`mx-auto overflow-hidden rounded-xl border border-slate-300 shadow-xl transition-all duration-300 dark:border-white/20 ${mobilePreview ? 'w-[320px]' : 'w-full'}`} style={{ '--brand': accent, '--brand-text': headerTextDark ? '#111113' : '#ffffff' }}><div className={`flex h-10 items-center gap-3 border-b px-4 ${darkPreview ? 'border-white/10 bg-[#1a1a1c]' : 'border-slate-200 bg-slate-100'}`}><div className="flex gap-1.5"><span className="size-2.5 rounded-full bg-red-400" /><span className="size-2.5 rounded-full bg-amber-400" /><span className="size-2.5 rounded-full bg-emerald-400" /></div><div className={`flex flex-1 items-center justify-center rounded-md px-2 py-1 text-[11px] font-medium ${darkPreview ? 'bg-white/5 text-slate-400' : 'bg-white text-slate-500'}`}><Search className="mr-1.5 size-3" />{slug || 'taylorco'}.atrium.app</div></div><div className={`relative flex h-[500px] flex-col overflow-hidden ${darkPreview ? 'bg-[#111113] text-slate-300' : 'bg-slate-50 text-slate-600'}`}><header className="flex h-14 shrink-0 items-center justify-between px-5 transition-colors duration-200" style={{ backgroundColor: 'var(--brand)', color: 'var(--brand-text)' }}><div className="flex items-center gap-3">{logoUrl ? <div className="size-8 overflow-hidden rounded bg-white shadow-sm"><img src={logoUrl} className="h-full w-full object-contain" /></div> : <div className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/20 text-[13px] font-bold shadow-sm backdrop-blur-md">{initials}</div>}<span className="text-sm font-semibold tracking-wide">{name || 'Workspace'}</span></div>{mobilePreview ? <AlignJustify className="size-5 opacity-80" /> : <nav className="flex items-center gap-5 text-[13px] font-medium"><div className="relative opacity-100">Overview<span className="absolute -bottom-1.5 left-0 right-0 h-[2px] rounded-full bg-current" /></div><div className="relative opacity-70 transition-opacity hover:opacity-100">Projects</div><div className="relative opacity-70 transition-opacity hover:opacity-100">Approvals</div></nav>}</header><div className="flex-1 overflow-y-auto p-5"><h1 className={`text-xl font-semibold tracking-tight ${darkPreview ? 'text-white' : 'text-slate-900'}`}>Welcome to your client portal</h1><p className="mt-1 text-xs">Everything for your project, in one calm place.</p><div className="mt-6 flex flex-col gap-4"><div className={`rounded-xl border p-4 shadow-sm ${darkPreview ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white'}`}><div className="flex items-center justify-between"><div><h4 className={`text-sm font-semibold ${darkPreview ? 'text-white' : 'text-slate-900'}`}>Homepage v3</h4><p className="mt-0.5 text-[11px]">Fold Studio</p></div><span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-600">On track</span></div><div className="mt-4 flex items-center gap-3"><div className={`h-1.5 flex-1 rounded-full ${darkPreview ? 'bg-white/10' : 'bg-slate-100'}`}><div className="h-full w-[72%] rounded-full transition-colors duration-200" style={{ backgroundColor: 'var(--brand)' }} /></div><span className={`text-[11px] font-medium ${darkPreview ? 'text-white' : 'text-slate-900'}`}>72%</span></div></div><div className={`rounded-xl border p-4 shadow-sm ${darkPreview ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white'}`}><div className="flex gap-3"><div className="flex size-10 items-center justify-center rounded-lg transition-colors duration-200" style={{ backgroundColor: 'color-mix(in srgb, var(--brand) 15%, transparent)', color: 'var(--brand)' }}><CheckCircle2 className="size-5" /></div><div><h4 className={`text-sm font-semibold ${darkPreview ? 'text-white' : 'text-slate-900'}`}>Mobile layouts</h4><p className="mt-0.5 text-[11px]">Awaiting your approval</p></div></div><div className="mt-4 flex gap-2"><button className="flex-1 rounded-lg border border-transparent py-1.5 text-xs font-medium shadow-sm transition-colors duration-200" style={{ backgroundColor: 'var(--brand)', color: 'var(--brand-text)' }}>Approve</button><button className={`flex-1 rounded-lg border py-1.5 text-xs font-medium shadow-sm ${darkPreview ? 'border-white/10 bg-white/5 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>Request changes</button></div></div><div className={`flex items-center justify-between rounded-xl border p-3 shadow-sm ${darkPreview ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white'}`}><div><h4 className={`text-xs font-semibold ${darkPreview ? 'text-white' : 'text-slate-900'}`}>Invoice #1043</h4><p className="mt-0.5 text-[10px]">$3,200 · Due Nov 5</p></div><button className="rounded-lg border border-transparent px-3 py-1.5 text-xs font-medium shadow-sm transition-colors duration-200" style={{ backgroundColor: 'var(--brand)', color: 'var(--brand-text)' }}>Pay now</button></div></div><p className="mt-8 text-center text-[10px] font-medium opacity-50">Powered by Atrium</p></div></div></div>{contrastWarning && <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"><span className="size-1.5 shrink-0 animate-pulse rounded-full bg-amber-500" />This color may be hard to read. Try a darker or lighter shade.</div>}</div></div></div>; }
function TeamMemberRow({ name, initialRole }) { const [role, setRole] = useState(initialRole); return <div className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-white/[0.08] p-3"><span className="flex size-9 items-center justify-center rounded-full bg-indigo-500/15 text-xs font-semibold text-indigo-600">{name.split(' ').map((x) => x[0]).join('')}</span><span className="flex-1 text-sm font-medium">{name}</span><Dropdown options={['Owner', 'Designer', 'Project manager']} value={role} onChange={setRole} className="w-40" /></div> }
function Team() { return <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#111113] p-5"><div className="flex items-center justify-between"><div><h3 className="font-semibold">Team</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">3 of 5 team members used</p></div><Button primary><Plus className="size-4" />Invite member</Button></div><div className="mt-4 h-2 rounded-full bg-muted"><div className="h-full w-3/5 rounded-full bg-indigo-600" /></div><div className="mt-5 grid gap-3">{[['Jamie Taylor','Owner'],['Alex Morgan','Designer'],['Priya Shah','Project manager']].map(([name, role]) => <TeamMemberRow key={name} name={name} initialRole={role} />)}</div></div> }
function Billing({ yearly, setYearly }) { const allInvoices = [{ id: 'AT-2026-09', date: 'Sep 1, 2026', amount: '$49', status: 'Paid' }, { id: 'AT-2026-08', date: 'Aug 1, 2026', amount: '$49', status: 'Paid' }, { id: 'AT-2026-07', date: 'Jul 1, 2026', amount: '$49', status: 'Paid' }, { id: 'AT-2026-06', date: 'Jun 1, 2026', amount: '$49', status: 'Paid' }]; const [editMenuOpen, setEditMenuOpen] = useState(false); const [activeModal, setActiveModal] = useState(null); const [card, setCard] = useState({ brand: 'VISA', last4: '4242', exp: '12/28' }); const editMenuRef = useRef(null); useEffect(() => { const handleClickOutside = (e) => { if (editMenuRef.current && !editMenuRef.current.contains(e.target)) setEditMenuOpen(false); }; document.addEventListener('mousedown', handleClickOutside); return () => document.removeEventListener('mousedown', handleClickOutside); }, []); return <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"><div className="relative rounded-2xl border border-indigo-200 bg-white p-6 shadow-sm dark:border-indigo-500/30 dark:bg-[#111113] dark:shadow-indigo-500/10"><div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"><div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50 dark:via-indigo-400" /><div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-500/5" /></div><div className="relative"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><h3 className="text-xl font-bold text-slate-900 dark:text-white">Studio</h3><span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">Active</span></div><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Everything you need to manage your agency.</p></div><div className="text-right"><span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">${yearly ? '39' : '49'}</span><span className="block text-xs font-medium text-slate-500 dark:text-slate-400">/ month</span></div></div><div className="my-6 flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-white/[0.05] dark:bg-white/[0.02]"><button onClick={() => setYearly(false)} className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${!yearly ? 'bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}>Monthly</button><button onClick={() => setYearly(true)} className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${yearly ? 'bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}>Yearly <span className="ml-1 text-[10px] text-emerald-500">-20%</span></button></div><ul className="grid gap-3 text-sm text-slate-600 dark:text-slate-300">{['5 team members', 'Unlimited clients', 'Custom branding', 'Approval workflows', 'Invoice tracking', 'Priority support'].map((x) => <li key={x} className="flex items-center gap-3"><div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20"><Check className="size-3 text-emerald-600 dark:text-emerald-400" /></div>{x}</li>)}</ul><div className="mt-8 border-t border-slate-200 pt-6 dark:border-white/[0.08]">{card ? <div className="mb-4 flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:border-slate-300 dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-white/20"><div className="flex h-8 w-12 items-center justify-center rounded bg-slate-100 dark:bg-white/10"><span className="text-xs font-bold italic text-blue-800 dark:text-blue-300">{card.brand}</span></div><div className="flex-1"><p className="text-sm font-medium text-slate-900 dark:text-white">{card.brand === 'VISA' ? 'Visa' : card.brand} ending in {card.last4}</p><p className="text-xs text-slate-500 dark:text-slate-400">Expires {card.exp}</p></div><div className="relative" ref={editMenuRef}><button onClick={() => setEditMenuOpen(!editMenuOpen)} className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">Edit</button>{editMenuOpen && <div className="absolute right-0 top-full z-10 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-white/10 dark:bg-[#1a1a1c]"><button className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5" onClick={() => { setEditMenuOpen(false); setActiveModal('update_payment'); }}>Update payment method</button><button className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5" onClick={() => { setEditMenuOpen(false); setActiveModal('edit_billing'); }}>Edit billing details</button><div className="my-1 h-px bg-slate-200 dark:bg-white/10" /><button className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10" onClick={() => { setEditMenuOpen(false); setActiveModal('remove_card'); }}>Remove card</button></div>}</div></div> : <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-dashed border-slate-200 p-3 dark:border-white/[0.08]"><p className="text-sm text-slate-500 dark:text-slate-400">No payment method added.</p><Button onClick={() => setActiveModal('update_payment')}>Add card</Button></div>}<div className="flex gap-3"><Button primary className="flex-1 justify-center">Upgrade plan</Button><Button className="flex-1 justify-center">Cancel</Button></div></div></div></div><div className="flex flex-col gap-6"><div className="flex flex-1 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#111113]"><div className="mb-6 flex items-center justify-between"><h3 className="text-lg font-semibold text-slate-900 dark:text-white">Invoice history</h3><Link href="/dashboard/invoices" className="rounded-md px-3 py-1.5 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10">View all</Link></div><div className="grid gap-4">{allInvoices.map((inv) => <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/[0.01] p-4 transition-colors hover:border-slate-300 dark:border-white/[0.08] dark:hover:border-white/20" key={inv.id}><div className="flex items-center gap-4"><div className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400"><Receipt className="size-4" /></div><div><p className="text-sm font-medium text-slate-900 dark:text-white">{inv.id}</p><p className="text-xs text-slate-500 dark:text-slate-400">{inv.date}</p></div></div><div className="flex items-center gap-4"><span className="text-sm font-semibold text-slate-900 dark:text-white">{inv.amount}</span><button className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-white/[0.08] dark:text-slate-400 dark:hover:bg-white/[0.05]" title="Download receipt"><Download className="size-4" /></button></div></div>)}</div></div><div className="group relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm transition-all hover:shadow-md dark:border-indigo-500/20 dark:from-indigo-500/10 dark:to-[#111113]"><div className="absolute -right-4 -top-4 size-24 rounded-full bg-indigo-500/10 blur-2xl transition-all group-hover:bg-indigo-500/20" /><div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-4"><div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm dark:bg-white/5 dark:shadow-none"><MessageSquare className="size-5 text-indigo-600 dark:text-indigo-400" /></div><div><h4 className="text-base font-semibold text-slate-900 dark:text-white">Need help with billing?</h4><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Our support team is available 24/7 to help you.</p></div></div><button className="whitespace-nowrap rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md dark:bg-indigo-500 dark:hover:bg-indigo-400">Contact Support</button></div></div></div>{activeModal === 'update_payment' && <Modal title={card ? 'Update payment method' : 'Add payment method'} onClose={() => setActiveModal(null)}><form onSubmit={(e) => { e.preventDefault(); setCard({ brand: 'MASTERCARD', last4: '8899', exp: '10/29' }); setActiveModal(null); }} className="grid gap-4"><Input label="Card number" required placeholder="0000 0000 0000 0000" /><div className="grid grid-cols-2 gap-4"><Input label="Expiry date" required placeholder="MM/YY" /><Input label="CVC" required placeholder="123" /></div><Input label="Name on card" required placeholder="Jamie Taylor" /><div className="mt-2 flex gap-3"><Button type="button" className="flex-1" onClick={() => setActiveModal(null)}>Cancel</Button><Button primary type="submit" className="flex-1">Save card</Button></div></form></Modal>}{activeModal === 'edit_billing' && <Modal title="Edit billing details" onClose={() => setActiveModal(null)}><form onSubmit={(e) => { e.preventDefault(); setActiveModal(null); }} className="grid gap-4"><Input label="Company name" defaultValue="Taylor & Co." required /><Input label="Billing email" type="email" defaultValue="jamie@taylor.co" required /><Input label="VAT / Tax ID" placeholder="Optional" /><Input label="Billing address" defaultValue="123 Creative Street, SF" required /><div className="mt-2 flex gap-3"><Button type="button" className="flex-1" onClick={() => setActiveModal(null)}>Cancel</Button><Button primary type="submit" className="flex-1">Save details</Button></div></form></Modal>}{activeModal === 'remove_card' && <Modal title="Remove payment method?" onClose={() => setActiveModal(null)}><p className="text-sm text-slate-500 dark:text-slate-400">Are you sure you want to remove your card ending in {card?.last4}? Your subscription might be interrupted if you don't add a new payment method before the next billing cycle.</p><div className="mt-5 flex gap-3"><Button className="flex-1" onClick={() => setActiveModal(null)}>Cancel</Button><button type="button" className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500" onClick={() => { setCard(null); setActiveModal(null); }}>Yes, remove</button></div></Modal>}</div>; }
function Payments() { const [settings, setSettings] = useState(null); const [connecting, setConnecting] = useState(false); const [disconnecting, setDisconnecting] = useState(false); const [showDisconnectModal, setShowDisconnectModal] = useState(false); const [savingSettings, setSavingSettings] = useState(false); const [savedSettings, setSavedSettings] = useState(false); useEffect(() => { getPaymentSettings().then(setSettings); }, []); const handleConnect = async () => { setConnecting(true); await connectStripe(); const newSettings = await getPaymentSettings(); setSettings(newSettings); setConnecting(false); alert('Stripe connected'); }; const handleDisconnect = async () => { setDisconnecting(true); await disconnectStripe(); const newSettings = await getPaymentSettings(); setSettings(newSettings); setDisconnecting(false); setShowDisconnectModal(false); }; const handleSaveSettings = async (e) => { e.preventDefault(); setSavingSettings(true); await updatePaymentSettings(settings); setSavingSettings(false); setSavedSettings(true); setTimeout(() => setSavedSettings(false), 2000); }; if (!settings) return <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-white/[0.02]" />; const payouts = [{ ...seedInvoices.find(x => x.id === '#1042'), date: 'Oct 9, 2026' }, { ...seedInvoices.find(x => x.id === '#1041'), date: 'Oct 8, 2026' }, { ...seedInvoices.find(x => x.id === '#1040'), date: 'Oct 7, 2026' }]; return <div className="flex max-w-3xl flex-col gap-6"><div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/[0.08] dark:bg-[#111113]"><div className="flex items-start gap-4"><div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#635BFF]/10 text-[#635BFF]"><SiStripe className="size-6" /></div><div className="flex-1"><div className="flex items-center gap-2"><h3 className="text-lg font-semibold text-slate-900 dark:text-white">Stripe</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${settings.connected ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400'}`}>{settings.connected ? 'Connected' : 'Not connected'}</span></div><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Accept card payments from your clients on their invoices.</p>{settings.connected && <div className="mt-4 flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300"><p><span className="font-medium text-slate-900 dark:text-white">Payouts:</span> daily to bank account ending 6789</p><p><span className="font-medium text-slate-900 dark:text-white">Currency:</span> USD</p></div>}<div className="mt-5 flex gap-3">{settings.connected ? <><Button onClick={() => alert('Opens Stripe dashboard')}>Manage in Stripe</Button><Button onClick={() => setShowDisconnectModal(true)} className="border-transparent bg-transparent !text-red-600 hover:border-red-200 hover:!bg-red-50 dark:!text-red-400 dark:hover:border-red-500/20 dark:hover:!bg-red-500/10">Disconnect</Button></> : <Button primary onClick={handleConnect} disabled={connecting}>{connecting ? 'Connecting...' : 'Connect Stripe'}</Button>}</div></div></div></div><form onSubmit={handleSaveSettings} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/[0.08] dark:bg-[#111113]"><h3 className="font-semibold text-slate-900 dark:text-white">Payment settings</h3><div className="mt-5 grid gap-6"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-medium text-slate-900 dark:text-white">Let clients pay invoices online</p>{!settings.connected && <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-500">Requires Stripe to be connected.</p>}</div><button type="button" role="switch" aria-checked={settings.onlinePayments} disabled={!settings.connected} onClick={() => setSettings(s => ({ ...s, onlinePayments: !s.onlinePayments }))} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${settings.onlinePayments ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-white/10'} ${!settings.connected ? 'cursor-not-allowed opacity-50' : ''}`}><span className={`inline-block size-4 transform rounded-full bg-white shadow transition-transform ${settings.onlinePayments ? 'translate-x-6' : 'translate-x-1'}`} /></button></div><div className="flex items-center justify-between gap-4"><p className="text-sm font-medium text-slate-900 dark:text-white">Send a receipt email after payment</p><button type="button" role="switch" aria-checked={settings.receipts} onClick={() => setSettings(s => ({ ...s, receipts: !s.receipts }))} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${settings.receipts ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-white/10'}`}><span className={`inline-block size-4 transform rounded-full bg-white shadow transition-transform ${settings.receipts ? 'translate-x-6' : 'translate-x-1'}`} /></button></div><div><label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">Payment terms</label><Dropdown options={['Due on receipt', 'Net 7', 'Net 15', 'Net 30']} value={settings.terms} onChange={(v) => setSettings(s => ({ ...s, terms: v }))} className="w-full sm:w-64" /></div></div><div className="mt-6 border-t border-slate-200 pt-5 dark:border-white/[0.08]"><Button primary type="submit" disabled={savingSettings}>{savingSettings ? 'Saving...' : savedSettings ? 'Saved' : 'Save settings'}</Button></div></form><div className="flex flex-col rounded-xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#111113]"><div className="border-b border-slate-200 p-5 dark:border-white/[0.08]"><h3 className="font-semibold text-slate-900 dark:text-white">Recent payouts</h3></div><div className="flex flex-col sm:hidden">{payouts.map((row) => <div key={row.id} className="flex items-center justify-between border-b border-slate-200 p-5 last:border-0 dark:border-white/[0.08]"><div><p className="font-medium text-slate-900 dark:text-white">{row.id} · {row.client}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{row.date} · {money(row.amount)}</p></div><span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs text-emerald-600">Paid</span></div>)}</div><div className="hidden sm:block overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-slate-200 text-xs text-slate-500 dark:border-white/[0.08] dark:text-slate-400"><tr><th className="px-5 py-3 font-medium">Date</th><th className="px-5 py-3 font-medium">Invoice</th><th className="px-5 py-3 font-medium">Client</th><th className="px-5 py-3 font-medium">Amount</th><th className="px-5 py-3 font-medium">Status</th></tr></thead><tbody>{payouts.map((row) => <tr key={row.id} className="border-b border-slate-200 hover:bg-muted/50 last:border-0 dark:border-white/[0.08]"><td className="px-5 py-3 text-slate-500 dark:text-slate-400">{row.date}</td><td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{row.id}</td><td className="px-5 py-3 text-slate-700 dark:text-slate-300">{row.client}</td><td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{money(row.amount)}</td><td className="px-5 py-3"><span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs text-emerald-600">Paid</span></td></tr>)}</tbody></table></div></div>{showDisconnectModal && <Modal title="Disconnect Stripe?" onClose={() => setShowDisconnectModal(false)}><p className="text-sm text-slate-500 dark:text-slate-400">Clients will not be able to pay invoices online until you reconnect.</p><div className="mt-5 flex gap-3"><Button className="flex-1" onClick={() => setShowDisconnectModal(false)}>Cancel</Button><button type="button" className="flex-1 rounded-lg border border-red-600 bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50" onClick={handleDisconnect} disabled={disconnecting}>{disconnecting ? 'Disconnecting...' : 'Disconnect'}</button></div></Modal>}</div>; }
function CodeInput({ value, onChange }) {
  const inputs = useRef([]);
  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) return;
    const newArr = value.split('');
    newArr[idx] = val.slice(-1);
    onChange(newArr.join(''));
    if (idx < 5 && val) inputs.current[idx + 1].focus();
  };
  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      const newArr = value.split('');
      if (newArr[idx]) {
        newArr[idx] = '';
        onChange(newArr.join(''));
      } else if (idx > 0) {
        inputs.current[idx - 1].focus();
        newArr[idx - 1] = '';
        onChange(newArr.join(''));
      }
    }
  };
  const handlePaste = (e) => {
    const val = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (val) {
      e.preventDefault();
      onChange(val);
      if (inputs.current[Math.min(val.length, 5)]) inputs.current[Math.min(val.length, 5)].focus();
    }
  };
  return (
    <div className="flex justify-between gap-2" onPaste={handlePaste}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input key={i} ref={(el) => (inputs.current[i] = el)} type="text" inputMode="numeric" maxLength={2} value={value[i] || ''} onChange={(e) => handleChange(e, i)} onKeyDown={(e) => handleKeyDown(e, i)} className="h-12 w-10 rounded-lg border border-slate-200 bg-white text-center text-lg font-medium outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 dark:border-white/10 dark:bg-white/5 sm:w-12" />
      ))}
    </div>
  );
}

function Security() {
  const [settings, setSettings] = useState(null);
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loadingPass, setLoadingPass] = useState(false);
  const [passErrors, setPassErrors] = useState({});
  const [lastChanged, setLastChanged] = useState('Last changed 3 months ago');

  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [tfaLoading, setTfaLoading] = useState(false);
  const [tfaError, setTfaError] = useState('');
  const [shake, setShake] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [savedCodesChecked, setSavedCodesChecked] = useState(false);

  const [disableModal, setDisableModal] = useState(false);
  const [disablePass, setDisablePass] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState('');

  const [sessions, setSessions] = useState([
    { id: 1, name: 'This device', desc: 'Chrome on Windows · Surat, India', active: true },
    { id: 2, name: 'iPhone', desc: 'Safari · Mumbai, India', time: '2 days ago' }
  ]);

  useEffect(() => {
    getSecuritySettings().then(setSettings);
  }, []);

  const score = strength(newPass);

  const handlePassSubmit = async (e) => {
    e.preventDefault();
    setPassErrors({});
    let errs = {};
    if (!current) errs.current = 'Current password is required.';
    if (newPass.length < 8) errs.newPass = 'Use at least 8 characters.';
    else if (newPass === current) errs.newPass = 'New password must be different.';
    if (newPass !== confirm) errs.confirm = 'Passwords must match.';
    
    if (Object.keys(errs).length > 0) return setPassErrors(errs);
    setLoadingPass(true);
    const res = await changePassword(current, newPass);
    setLoadingPass(false);
    if (res.ok) {
      alert('Password updated');
      setCurrent('');
      setNewPass('');
      setConfirm('');
      setLastChanged('Last changed just now');
    } else {
      setPassErrors({ current: 'Current password is incorrect.' });
    }
  };

  const handleVerifyTfa = async () => {
    if (code.length < 6) return;
    setTfaLoading(true);
    const res = await enableTwoFactor(code);
    setTfaLoading(false);
    if (res.ok) {
      setStep(3);
      setTfaError('');
    } else {
      setTfaError('Invalid code, try again.');
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  const handleDisableTfa = async (e) => {
    e.preventDefault();
    setDisableLoading(true);
    const res = await disableTwoFactor(disablePass);
    setDisableLoading(false);
    if (res.ok) {
      setSettings(await getSecuritySettings());
      setDisableModal(false);
      setDisablePass('');
      setDisableError('');
    } else {
      setDisableError('Current password is incorrect.');
    }
  };

  if (!settings) return <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-white/[0.02]" />;

  return (
    <div className="grid items-stretch gap-6 lg:grid-cols-2">
      <form onSubmit={handlePassSubmit} className="self-start flex flex-col rounded-xl border border-slate-200 bg-white p-5 dark:border-white/[0.08] dark:bg-[#111113]">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Change password</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{lastChanged}</p>
          <div className="mt-6 flex flex-col gap-5">
            <div>
              <label htmlFor="current" className="mb-1.5 block text-sm font-medium text-slate-900 dark:text-slate-300">Current password</label>
              <PasswordInput id="current" value={current} onChange={e => setCurrent(e.target.value)} error={passErrors.current} placeholder="Enter current password" />
            </div>
            <div>
              <label htmlFor="newPass" className="mb-1.5 block text-sm font-medium text-slate-900 dark:text-slate-300">New password</label>
              <PasswordInput id="newPass" value={newPass} onChange={e => setNewPass(e.target.value)} error={passErrors.newPass} placeholder="At least 8 characters" />
              <div className="mt-2">
                <div className="flex gap-1">
                  {[0,1,2,3].map((s) => (
                    <span key={s} className={`h-1 flex-1 rounded-full ${s < score ? ['bg-red-500','bg-amber-500','bg-lime-500','bg-emerald-500'][s] : 'bg-slate-200 dark:bg-white/10'}`} />
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Use 8+ characters with a number and a symbol</p>
              </div>
            </div>
            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-slate-900 dark:text-slate-300">Confirm new password</label>
              <PasswordInput id="confirm" value={confirm} onChange={e => setConfirm(e.target.value)} error={passErrors.confirm} placeholder="Re-enter new password" />
            </div>
          </div>
        </div>
        <div className="mt-6 border-t border-slate-200 pt-5 dark:border-white/[0.08]">
          <Button primary type="submit" disabled={loadingPass}>
            {loadingPass && <Loader2 className="size-4 animate-spin" />}
            Update password
          </Button>
        </div>
      </form>

      <div className="flex flex-col gap-6">
        <div className="flex flex-1 flex-col rounded-xl border border-slate-200 bg-white p-5 dark:border-white/[0.08] dark:bg-[#111113]">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 dark:text-white">Two-factor authentication</h3>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${settings.tfaEnabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400'}`}>{settings.tfaEnabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Add an extra layer of security to your account.</p>
            
            {!settings.tfaEnabled ? (
              <div className="mt-6">
                <ul className="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-300">
                  {['Protects your account even if your password leaks', 'Works with Google Authenticator, Authy and 1Password', 'Takes about a minute to set up'].map(txt => (
                    <li key={txt} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>{txt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-6 text-sm text-slate-600 dark:text-slate-300">
                <p>Authenticator app · Set up on {settings.setupDate}</p>
                <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-white/[0.08]">
                  <span className="font-medium">Recovery codes: 8 remaining</span>
                  <button onClick={() => alert('Regenerate codes')} className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">Regenerate codes</button>
                </div>
              </div>
            )}
          </div>
          <div className="mt-6 border-t border-slate-200 pt-5 dark:border-white/[0.08]">
            {!settings.tfaEnabled ? (
              <Button primary onClick={() => { setStep(1); setCode(''); setSavedCodesChecked(false); setModalOpen(true); }}>Enable two-factor</Button>
            ) : (
              <Button onClick={() => setDisableModal(true)} className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10">Disable two-factor</Button>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/[0.08] dark:bg-[#111113]">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Active sessions</h3>
          <div className="mt-4 flex flex-col gap-4">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400">
                    {s.name === 'iPhone' ? <Smartphone className="size-4" /> : <Monitor className="size-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{s.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{s.desc}</p>
                  </div>
                </div>
                {s.active ? (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active now</span>
                ) : (
                  <span className="text-xs text-slate-500">{s.time}</span>
                )}
              </div>
            ))}
          </div>
          {sessions.length > 1 && (
            <Button onClick={() => { signOutOtherSessions(); setSessions([sessions[0]]); alert('Signed out of other sessions'); }} className="mt-5 w-full">Sign out other sessions</Button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
            <motion.div role="dialog" aria-modal="true" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/[0.08] dark:bg-[#111113]">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex gap-2">
                  {[1,2,3].map(i => <div key={i} className={`h-1.5 w-10 rounded-full ${step >= i ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-white/10'}`} />)}
                </div>
                <button aria-label="Close" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-500"><X className="size-5" /></button>
              </div>
              
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Scan QR code</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Use your authenticator app (like Google Authenticator or 1Password) to scan this QR code.</p>
                  <div className="my-8 flex justify-center">
                    <div className="flex size-48 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-4 dark:border-white/10">
                      <svg width="100%" height="100%" viewBox="0 0 100 100" fill="currentColor" className="text-slate-900 dark:text-white">
                        <path d="M0,0h30v30h-30z M10,10h10v10h-10z M70,0h30v30h-30z M80,10h10v10h-10z M0,70h30v30h-30z M10,80h10v10h-10z" />
                        <rect x="40" y="0" width="10" height="10" /><rect x="50" y="10" width="10" height="10" /><rect x="40" y="20" width="10" height="10" />
                        <rect x="0" y="40" width="10" height="10" /><rect x="10" y="50" width="10" height="10" /><rect x="20" y="40" width="10" height="10" />
                        <rect x="70" y="40" width="10" height="10" /><rect x="80" y="50" width="10" height="10" /><rect x="90" y="60" width="10" height="10" />
                        <rect x="40" y="40" width="20" height="20" /><rect x="40" y="70" width="10" height="10" /><rect x="50" y="80" width="10" height="10" />
                        <rect x="60" y="70" width="10" height="10" /><rect x="70" y="70" width="10" height="10" /><rect x="80" y="80" width="10" height="10" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-center text-sm">
                    <span className="text-slate-500">Can't scan? Enter this key: </span>
                    <button onClick={() => { navigator.clipboard.writeText('JBSWY3DPEHPK3PXP'); setCopiedKey(true); setTimeout(() => setCopiedKey(false), 2000) }} className="mt-1 font-mono font-medium text-slate-900 hover:text-indigo-600 dark:text-white">{copiedKey ? 'Copied!' : 'JBSWY3DPEHPK3PXP'}</button>
                  </div>
                  <Button primary className="mt-8 w-full" onClick={() => setStep(2)}>Next</Button>
                </motion.div>
              )}
              
              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Verify</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Enter the 6-digit code from your authenticator app.</p>
                  <div className={`mt-8 ${shake ? 'animate-[shake_0.4s_ease-in-out] motion-reduce:animate-none' : ''}`}>
                    <CodeInput value={code} onChange={setCode} />
                    {tfaError && <p className="mt-3 text-center text-sm text-red-500">{tfaError}</p>}
                  </div>
                  <div className="mt-8 flex gap-3">
                    <Button onClick={() => setStep(1)} className="flex-1">Back</Button>
                    <Button primary onClick={handleVerifyTfa} disabled={tfaLoading || code.length < 6} className="flex-1">
                      {tfaLoading && <Loader2 className="size-4 animate-spin" />}
                      Verify
                    </Button>
                  </div>
                </motion.div>
              )}
              
              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Save recovery codes</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">If you lose access to your device, you can use these recovery codes to sign in. Keep them somewhere safe.</p>
                  <div className="my-6 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-4 font-mono text-sm tracking-widest text-slate-700 dark:bg-white/5 dark:text-slate-300">
                    {['2849-1834','8273-1934','0928-8374','8374-1029','2938-4857','8374-2938','1029-3847','5647-3829'].map(c => <div key={c}>{c}</div>)}
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => { navigator.clipboard.writeText('...'); setCopiedCodes(true); setTimeout(() => setCopiedCodes(false), 2000) }} className="flex-1 text-xs">
                      {copiedCodes ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                      {copiedCodes ? 'Copied' : 'Copy all'}
                    </Button>
                    <Button className="flex-1 text-xs"><Download className="size-4" />Download .txt</Button>
                  </div>
                  <label className="mt-6 flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <input type="checkbox" checked={savedCodesChecked} onChange={e => setSavedCodesChecked(e.target.checked)} className="mt-1 accent-indigo-600" />
                    I have saved these codes somewhere safe
                  </label>
                  <Button primary className="mt-6 w-full" disabled={!savedCodesChecked} onClick={async () => { await getSecuritySettings().then(setSettings); setModalOpen(false); alert('Two-factor authentication enabled'); }}>Done</Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {disableModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setDisableModal(false)} />
            <motion.div role="dialog" aria-modal="true" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/[0.08] dark:bg-[#111113]">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Disable two-factor?</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your account will be less secure. Enter your password to continue.</p>
              <form onSubmit={handleDisableTfa} className="mt-5">
                <PasswordInput id="disablePass" value={disablePass} onChange={e => setDisablePass(e.target.value)} error={disableError} />
                <div className="mt-6 flex gap-3">
                  <Button type="button" onClick={() => setDisableModal(false)} className="flex-1">Cancel</Button>
                  <button type="submit" disabled={disableLoading || !disablePass} className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50">
                    {disableLoading && <Loader2 className="size-4 animate-spin" />}
                    Disable
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
function EmailNotifications() { const [settings, setSettings] = useState(null); const [saving, setSaving] = useState(false); const [saved, setSaved] = useState(false); useEffect(() => { getNotificationSettings().then(setSettings); }, []); const handleToggle = async (key) => { if (!settings) return; const newSettings = { ...settings, [key]: !settings[key] }; setSettings(newSettings); setSaving(true); try { await updateNotificationSettings(newSettings); setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); } catch (e) { alert('Failed to save settings.'); setSettings(settings); setSaving(false); } }; if (!settings) return <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-white/[0.02]" />; const isOwnerManager = user.role === 'Owner' || user.role === 'Manager'; const rows = [{ key: 'newMessage', title: 'New message', desc: 'When a client or teammate sends you a message.', show: true }, { key: 'approvalUpdates', title: 'Approval updates', desc: 'When a client approves or requests changes on a deliverable.', show: true }, { key: 'invoicePaid', title: 'Invoice paid', desc: 'When a client pays an invoice.', show: isOwnerManager }, { key: 'weeklySummary', title: 'Weekly summary email', desc: 'A Monday recap of your projects and approvals.', show: true }].filter(r => r.show); return <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/[0.08] dark:bg-[#111113]"><div className="flex items-center gap-2"><h3 className="font-semibold text-slate-900 dark:text-white">Email notifications</h3>{saved && <span className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400"><Check className="mr-1 size-3" />Saved</span>}{saving && <span className="text-xs text-slate-500">Saving...</span>}</div><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose which emails you want to receive.</p><div className="mt-5 divide-y divide-slate-200 dark:divide-white/[0.08]">{rows.map((row) => <div className="flex items-center justify-between py-4" key={row.key}><div><p className="text-sm font-medium text-slate-900 dark:text-white">{row.title}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{row.desc}</p></div><button type="button" role="switch" aria-checked={settings[row.key]} onClick={() => handleToggle(row.key)} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#111113] ${settings[row.key] ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-white/10'}`}><span className={`inline-block size-4 transform rounded-full bg-white shadow transition-transform ${settings[row.key] ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>)}</div></div>; }
