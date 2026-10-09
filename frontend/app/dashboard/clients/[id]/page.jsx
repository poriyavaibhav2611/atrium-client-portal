'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MoreHorizontal, MessageSquare, Copy, Mail, ShieldAlert, FileText, CheckCircle2, Clock, Upload, Send, Activity, Info, Phone, Mail as MailIcon, Globe, MapPin, Power } from 'lucide-react'
import { getClient, getProjects, getApprovals, getInvoices, getFiles, getThreads, getActivity, togglePortalAccess, resendInvite, saveClientNote } from '@/services/api'
import { Button, Card, Chip, PageHeader } from '@/components/dashboard/ui'

// Mock toast
function toast(msg) { console.log('Toast:', msg); }

const tone = { 'On track': 'indigo', 'In review': 'amber', 'Delayed': 'red' }
const bar = { 'On track': 'bg-indigo-600', 'In review': 'bg-amber-500', 'Delayed': 'bg-red-500' }
const invoiceTone = { 'Paid': 'green', 'Sent': 'amber', 'Overdue': 'red' }

function Stat({ label, value, highlight, extra }) {
  return (
    <Card className="p-5 flex flex-col justify-between">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <div className="mt-4 flex items-center justify-between">
        <p className={`text-3xl font-bold tracking-tight ${highlight ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>{value}</p>
        {extra}
      </div>
    </Card>
  )
}

function ConfirmModal({ title, description, onConfirm, onClose, confirmText = 'Confirm', variant = 'danger' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/40 p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-xl border-t sm:border border-slate-200 bg-white p-6 sm:p-5 shadow-2xl dark:border-white/10 dark:bg-[#111113] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95">
        <div className="mb-2 flex items-center justify-between">
          <h2 className={`font-semibold ${variant === 'danger' ? 'text-red-600' : ''}`}>{title}</h2>
        </div>
        <p className="mb-6 text-sm text-slate-500">{description}</p>
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <Button onClick={onClose} className="w-full sm:w-auto">Cancel</Button>
          <button className={`w-full sm:w-auto rounded-lg px-4 py-2.5 sm:py-2 text-sm font-medium text-white ${variant === 'danger' ? 'bg-red-600 hover:bg-red-500' : 'bg-indigo-600 hover:bg-indigo-500'}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'

  const [client, setClient] = useState(null)
  const [data, setData] = useState(null)
  const [notFound, setNotFound] = useState(false)
  
  const [note, setNote] = useState('')
  const [noteSaving, setNoteSaving] = useState(false)
  
  const [kebabOpen, setKebabOpen] = useState(false)
  const [portalConfirm, setPortalConfirm] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(c => c - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [cooldown])

  useEffect(() => {
    Promise.all([
      getClient(params.id),
      getProjects(),
      getApprovals(),
      getInvoices(),
      getFiles(),
      getThreads(),
      getActivity()
    ]).then(([c, projects, approvals, invoices, files, threads, activity]) => {
      if (!c) {
        setNotFound(true)
        return
      }
      setClient(c)
      setNote(c.note)
      setData({
        projects: projects.filter(p => p.client === c.name),
        approvals: approvals.filter(a => a.client === c.name),
        invoices: invoices.filter(i => i.client === c.name),
        files: files.filter(f => f.client === c.name),
        messages: threads.filter(m => m.client === c.name),
        activity: activity.filter(a => a.clientId === c.id)
      })
    })
  }, [params.id])

  if (notFound) {
    return (
      <div className="mx-auto flex h-[80vh] w-full max-w-[1200px] flex-col items-center justify-center gap-4 px-6">
        <ShieldAlert className="size-12 text-slate-400" />
        <h1 className="text-xl font-semibold">Client not found</h1>
        <p className="text-sm text-slate-500">The client you are looking for does not exist or was removed.</p>
        <Link href="/dashboard/clients" className="mt-4 text-sm font-medium text-indigo-600">← Back to clients</Link>
      </div>
    )
  }

  if (!client || !data) {
    return <div className="mx-auto max-w-[1200px] p-8 animate-pulse"><div className="h-8 w-64 bg-slate-200 dark:bg-white/10 rounded" /></div>
  }

  // Compute stats
  const activeProjectsCount = data.projects.length
  const pendingApprovalsCount = data.approvals.length
  let outstanding = 0
  let hasOverdue = false
  let totalPaid = 0
  
  data.invoices.forEach(inv => {
    if (inv.status === 'Paid') {
      totalPaid += inv.amount
    } else {
      outstanding += inv.amount
      if (inv.status === 'Overdue') hasOverdue = true
    }
  })

  const handleTogglePortal = () => {
    if (client.portalAccess) {
      setPortalConfirm(true)
    } else {
      togglePortalAccess(client.id, true).then(c => {
        setClient(c)
        toast('Portal access restored.')
      })
    }
  }

  const confirmPausePortal = () => {
    togglePortalAccess(client.id, false).then(c => {
      setClient(c)
      setPortalConfirm(false)
      toast('Portal access paused.')
    })
  }

  const handleResendInvite = () => {
    if (cooldown > 0) return
    resendInvite(client.id).then(() => {
      toast(`Invite sent to ${client.email}`)
      setCooldown(30)
    })
    setKebabOpen(false)
  }

  const handleCopyLink = () => {
    toast('Portal link copied to clipboard')
    setKebabOpen(false)
  }
  
  const handleSaveNote = () => {
    setNoteSaving(true)
    saveClientNote(client.id, note).then(() => {
      setNoteSaving(false)
      toast('Note saved locally.')
    })
  }

  const tabs = ['Overview', 'Projects', 'Invoices', 'Files', 'Messages', 'Activity']
  
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <div className="animate-slide-up-fade" style={{ animationDelay: '0ms' }}>
        <div className="mb-6">
          <Link href="/dashboard/clients" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="size-4" /> Back to clients
          </Link>
        </div>
        
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
              {client.name.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">{client.name}</h1>
                <Chip tone={client.status === 'Active' ? 'emerald' : client.status === 'Invited' ? 'amber' : 'slate'}>{client.status}</Chip>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="font-medium text-slate-700 dark:text-slate-300">{client.contact}</span>
                <span>·</span>
                <span>{client.role}</span>
                <span>·</span>
                <span>{client.email}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="hidden sm:flex gap-3">
              <Button variant="secondary" onClick={() => toast('Portal preview coming soon')}>Open portal</Button>
              <Button variant="primary" className="gap-2"><MessageSquare className="size-4" /> Message</Button>
            </div>
            
            <div className="sm:hidden flex gap-2">
              <Button variant="primary" className="gap-2"><MessageSquare className="size-4" /> Message</Button>
            </div>
            
            <div className="relative">
              <Button variant="secondary" className="px-2" onClick={() => setKebabOpen(!kebabOpen)}>
                <MoreHorizontal className="size-4" />
              </Button>
              {kebabOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#111113] z-50 animate-in fade-in zoom-in-95">
                  <button onClick={handleResendInvite} disabled={cooldown > 0} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.06] disabled:opacity-50">
                    <Mail className="size-4" /> {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend invite'}
                  </button>
                  <button onClick={handleCopyLink} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.06]">
                    <Copy className="size-4" /> Copy portal link
                  </button>
                  <div className="my-1 h-px bg-slate-100 dark:bg-white/10" />
                  <button onClick={() => { setKebabOpen(false); handleTogglePortal() }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.06]">
                    <Power className="size-4" /> {client.portalAccess ? 'Pause portal access' : 'Restore access'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
        <Stat label="Active projects" value={activeProjectsCount} />
        <Stat label="Pending approvals" value={pendingApprovalsCount} />
        <Stat label="Outstanding" value={`$${outstanding.toLocaleString()}`} highlight={hasOverdue} extra={hasOverdue ? <Chip tone="red">Overdue</Chip> : null} />
        <Stat label="Total paid" value={`$${totalPaid.toLocaleString()}`} />
      </div>

      <div className="border-b border-slate-200 dark:border-white/10 animate-slide-up-fade" style={{ animationDelay: '150ms' }}>
        <nav className="-mb-px flex gap-6 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab.toLowerCase() === tab.toLowerCase()
            return (
              <button key={tab} onClick={() => router.push(`?tab=${tab.toLowerCase()}`, { scroll: false })} className={`whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors ${isActive ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:hover:border-slate-700 dark:hover:text-slate-300'}`}>
                {tab}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="animate-slide-up-fade" style={{ animationDelay: '200ms' }}>
        {activeTab === 'overview' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Contact details</h3>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-3"><span className="w-6 text-slate-400"><Info className="size-4" /></span><span>{client.contact} · {client.role}</span></div>
                <div className="flex items-center gap-3"><span className="w-6 text-slate-400"><MailIcon className="size-4" /></span><span>{client.email}</span></div>
                <div className="flex items-center gap-3"><span className="w-6 text-slate-400"><Phone className="size-4" /></span><span>{client.phone}</span></div>
                <div className="flex items-center gap-3"><span className="w-6 text-slate-400"><Globe className="size-4" /></span><span>{client.timezone}</span></div>
                <div className="flex items-center gap-3"><span className="w-6 text-slate-400"><Clock className="size-4" /></span><span>Client since {client.since}</span></div>
              </div>
            </Card>

            <Card className="p-6 flex flex-col">
              <h3 className="font-semibold mb-4">Client Notes</h3>
              <textarea 
                value={note} 
                onChange={e => setNote(e.target.value)} 
                placeholder="Add private notes about this client..."
                className="w-full flex-1 resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-indigo-500 focus:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:focus:bg-[#111113]"
              />
              <div className="mt-4 flex justify-end">
                <Button variant="secondary" size="sm" onClick={handleSaveNote}>{noteSaving ? 'Saving...' : 'Save note'}</Button>
              </div>
            </Card>

            <Card className="p-6 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Portal access</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">{client.portalAccess ? 'On' : 'Off'}</span>
                  <button role="switch" aria-checked={client.portalAccess} onClick={handleTogglePortal} className={`relative h-5 w-9 rounded-full transition-colors ${client.portalAccess ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <span className={`inline-block size-4 transform rounded-full bg-white transition-transform ${client.portalAccess ? 'translate-x-4' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-6">{client.portalAccess ? `Active. Last logged in ${client.lastActive}.` : 'Paused. The client cannot view their portal.'}</p>
              
              <div className="mt-auto flex flex-col gap-3">
                <Button variant="secondary" className="w-full" onClick={handleCopyLink}>Copy portal link</Button>
                <Button variant="secondary" className="w-full" onClick={handleResendInvite} disabled={cooldown > 0}>{cooldown > 0 ? `Wait ${cooldown}s` : 'Resend invite email'}</Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.projects.map(project => (
              <Card key={project.id} className="p-5 flex flex-col" onClick={() => router.push(`/dashboard/projects/${project.id}`)}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold">{project.name}</h3>
                  <Chip tone={tone[project.status]}>{project.status}</Chip>
                </div>
                <div className="mt-auto">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/[0.08] mb-4">
                    <div className={`h-full rounded-full ${bar[project.status]}`} style={{ width: `${project.progress}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5"><Clock className="size-3" /> Due {project.due}</p>
                </div>
              </Card>
            ))}
            {data.projects.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">No projects found.</div>
            )}
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <Card className="overflow-hidden hidden sm:block">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 dark:bg-white/[0.04]">
                    <tr><th className="px-4 py-3 font-medium">Invoice</th><th className="px-4 py-3 font-medium">Amount</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium text-right">Due Date</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                    {data.invoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-medium">{inv.id}</td>
                        <td className="px-4 py-3">${inv.amount.toLocaleString()}</td>
                        <td className="px-4 py-3"><Chip tone={invoiceTone[inv.status]}>{inv.status}</Chip></td>
                        <td className="px-4 py-3 text-right text-slate-500">{inv.due || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.invoices.length === 0 && <div className="py-12 text-center text-slate-500 text-sm">No invoices found.</div>}
              </Card>
              
              <div className="sm:hidden flex flex-col gap-3">
                {data.invoices.map(inv => (
                  <Card key={inv.id} className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{inv.id}</span>
                      <Chip tone={invoiceTone[inv.status]}>{inv.status}</Chip>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Amount</span>
                      <span className="font-medium">${inv.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Due</span>
                      <span className="font-medium text-slate-900 dark:text-white">{inv.due || '—'}</span>
                    </div>
                  </Card>
                ))}
                {data.invoices.length === 0 && <Card className="p-8 text-center text-slate-500 text-sm">No invoices found.</Card>}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <Card className="p-5">
                <h3 className="font-semibold mb-4">Payment history</h3>
                <div className="flex flex-col gap-4">
                  {data.invoices.filter(i => i.status === 'Paid').map(inv => (
                    <div key={inv.id} className="flex flex-col gap-1 border-b border-slate-100 pb-3 last:border-0 last:pb-0 dark:border-white/[0.06]">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">${inv.amount.toLocaleString()}</span>
                        <span className="text-xs text-slate-500">Oct 18, 2026</span>
                      </div>
                      <p className="text-xs text-slate-500">Paid via Stripe · Visa ending 4242</p>
                    </div>
                  ))}
                  {data.invoices.filter(i => i.status === 'Paid').length === 0 && <p className="text-sm text-slate-500 italic">No payments yet.</p>}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="p-2">
                {data.files.map(file => (
                  <div key={file.name} className="flex items-center justify-between rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-white/[0.04]">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"><FileText className="size-5" /></div>
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-slate-500">{file.size} · Uploaded by {file.client}</p>
                      </div>
                    </div>
                    <Chip tone="slate">{file.version}</Chip>
                  </div>
                ))}
                {data.files.length === 0 && <div className="py-12 text-center text-slate-500 text-sm">No files uploaded.</div>}
              </Card>
            </div>
            <div>
              <Card className="p-5 flex flex-col items-center justify-center text-center border-dashed">
                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100 dark:bg-white/[0.04]">
                  <Upload className="size-5 text-slate-400" />
                </div>
                <h3 className="font-medium">Upload file</h3>
                <p className="mb-4 mt-1 text-xs text-slate-500">Share files securely with the client.</p>
                <Button variant="secondary" size="sm">Choose file</Button>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <Card className="max-w-2xl">
            <div className="p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
              <h3 className="font-semibold">Recent messages</h3>
            </div>
            <div className="p-5 flex flex-col gap-4">
              {data.messages.map((msg, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium dark:bg-white/10">{msg.client.slice(0, 2).toUpperCase()}</div>
                  <div className="flex-1 rounded-2xl rounded-tl-sm bg-slate-100 p-3 text-sm dark:bg-white/[0.04]">
                    <p>{msg.text}</p>
                    <p className="mt-1 text-xs text-slate-500">{msg.time}</p>
                  </div>
                </div>
              ))}
              {data.messages.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No messages yet.</p>}
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]">
              <Button className="w-full">Open full conversation</Button>
            </div>
          </Card>
        )}

        {activeTab === 'activity' && (
          <Card className="max-w-2xl p-6">
            <h3 className="font-semibold mb-6">Client activity</h3>
            <div className="flex flex-col gap-5 relative">
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200 dark:bg-white/10" />
              {data.activity.map((item, i) => (
                <div key={i} className="relative flex gap-4 z-10">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border-4 border-white bg-indigo-100 text-[10px] font-semibold text-indigo-700 dark:border-[#111113] dark:bg-indigo-500/20 dark:text-indigo-300">
                    {item.initials}
                  </span>
                  <div className="pt-1.5">
                    <p className="text-sm font-medium">{item.text}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.time}</p>
                  </div>
                </div>
              ))}
              {data.activity.length === 0 && <p className="text-sm text-slate-500 py-4">No activity found.</p>}
            </div>
          </Card>
        )}
      </div>

      {portalConfirm && (
        <ConfirmModal 
          title="Pause portal access?"
          description="The client will immediately lose access to their portal. You can restore access at any time."
          onConfirm={confirmPausePortal}
          onClose={() => setPortalConfirm(false)}
          confirmText="Pause access"
          variant="danger"
        />
      )}
    </div>
  )
}
