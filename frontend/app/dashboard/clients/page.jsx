'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, X, Edit, Trash2, Users } from 'lucide-react'
import { getClients, archiveClient, getProjects, getApprovals, getInvoices } from '@/services/api'
import { Button, Card, Chip, Input, PageHeader } from '@/components/dashboard/ui'

// Mock toast function for now
function toast(message) {
  console.log('Toast:', message);
}

function ConfirmDelete({ client, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/40 p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-xl border-t sm:border border-slate-200 bg-white p-6 sm:p-5 shadow-2xl dark:border-white/10 dark:bg-[#111113] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold text-red-600">Archive {client.name}?</h2>
        </div>
        <p className="mb-6 text-sm text-slate-500">Are you sure you want to archive this client? Their projects and invoices are kept.</p>
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <Button onClick={onClose} className="w-full sm:w-auto">Cancel</Button>
          <button className="w-full sm:w-auto rounded-lg bg-red-600 px-4 py-2.5 sm:py-2 text-sm font-medium text-white hover:bg-red-500" onClick={onConfirm}>Archive</button>
        </div>
      </div>
    </div>
  )
}

export default function ClientsPage() { 
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [data, setData] = useState(null)
  const [deleteClient, setDeleteClient] = useState(null)
  
  useEffect(() => {
    Promise.all([getClients(), getProjects(), getApprovals(), getInvoices()])
      .then(([clients, projects, approvals, invoices]) => {
        setData({ clients, projects, approvals, invoices })
      })
  }, [])

  const filtered = data?.clients.filter(client => `${client.name} ${client.contact}`.toLowerCase().includes(query.toLowerCase())) || []
  
  const handleDelete = () => {
    const id = deleteClient.id
    setDeleteClient(null)
    archiveClient(id).then(() => {
      setData(prev => ({ ...prev, clients: prev.clients.filter(c => c.id !== id) }))
      toast(`Archived ${deleteClient.name}. Undo available.`)
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-6 pb-10 pt-6 lg:px-8">
      <div className="animate-slide-up-fade" style={{ animationDelay: '0ms' }}>
        <PageHeader title="Clients" subtitle="Give every client a clear, calm place to work with you." actions={
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" />
              <Input aria-label="Search clients" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search clients" className="w-48 pl-9" />
            </div>
            <Button variant="primary"><Plus />Invite client</Button>
          </>
        } />
      </div>
      
      {!data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1,2,3].map(i => <div key={i} className="h-64 rounded-2xl bg-slate-100 dark:bg-white/[0.04] animate-pulse" />)}
        </div>
      ) : data.clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-16 dark:border-white/10">
          <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 dark:bg-white/[0.04] mb-4">
            <Users className="size-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No clients</h3>
          <p className="mt-1 text-sm text-slate-500 text-center max-w-sm mb-6">You don't have any clients yet. Invite your first client to get started.</p>
          <Button variant="primary">Invite client</Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-16 dark:border-white/10">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No results found</h3>
          <p className="mt-1 text-sm text-slate-500 text-center max-w-sm mb-6">Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
          {filtered.map(client => { 
            const clientProjects = data.projects.filter(p => p.client === client.name)
            const clientApprovals = data.approvals.filter(a => a.client === client.name)
            const clientInvoices = data.invoices.filter(i => i.client === client.name)
            
            const activeProjectsCount = clientProjects.length
            const pendingApprovalsCount = clientApprovals.length
            
            let outstanding = 0
            let hasOverdue = false
            clientInvoices.forEach(inv => {
              if (inv.status !== 'Paid') {
                outstanding += inv.amount
                if (inv.status === 'Overdue') hasOverdue = true
              }
            })

            return (
              <ClientCard 
                key={client.id} 
                client={client} 
                stats={{
                  activeProjectsCount,
                  pendingApprovalsCount,
                  outstanding,
                  hasOverdue
                }}
                onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                onDelete={(e) => { e.stopPropagation(); setDeleteClient(client) }} 
                onEdit={(e) => { e.stopPropagation(); }} 
                onPortal={(e) => { e.stopPropagation(); }}
              />
            )
          })}
        </div>
      )}
      
      {deleteClient && <ConfirmDelete client={deleteClient} onClose={() => setDeleteClient(null)} onConfirm={handleDelete} />}
    </div> 
  )
}

function ClientCard({ client, stats, onClick, onDelete, onEdit, onPortal }) {
  const statusColor = client.status === 'Active' ? 'emerald' : client.status === 'Invited' ? 'amber' : 'slate';
  
  return (
    <Card className="h-full flex flex-col" onClick={onClick}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
            {client.name.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">{client.name}</h2>
              <Chip tone={statusColor}>{client.status}</Chip>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{client.contact}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button aria-label="Edit client" onClick={onEdit} className="rounded-lg p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-white/[0.05]">
            <Edit className="size-4" />
          </button>
          <button aria-label="Delete client" onClick={onDelete} className="rounded-lg p-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-white/[0.05]">
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{client.role}</p>
      <div className="my-5 border-t border-slate-100 dark:border-white/[0.06]" />
      
      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-lg font-semibold">{stats.activeProjectsCount}</p>
          <p className="text-[11px] leading-tight text-slate-500">Active projects</p>
        </div>
        <div>
          <p className="text-lg font-semibold">{stats.pendingApprovalsCount}</p>
          <p className="text-[11px] leading-tight text-slate-500">Pending approvals</p>
        </div>
        <div>
          <div className="flex items-center gap-1">
            <p className={`text-lg font-semibold ${stats.hasOverdue ? 'text-red-600 dark:text-red-400' : ''}`}>
              ${stats.outstanding.toLocaleString()}
            </p>
            {stats.hasOverdue && <Chip tone="red">Overdue</Chip>}
          </div>
          <p className="text-[11px] leading-tight text-slate-500">Outstanding</p>
        </div>
      </div>

      <div className="mt-auto pt-5">
        <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">Last active {client.lastActive}</p>
        <Button className="w-full" onClick={onPortal}>Open portal</Button>
      </div>
    </Card>
  )
}
