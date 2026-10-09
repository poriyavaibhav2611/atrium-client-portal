'use client'

import { useState } from 'react'
import { Mail, Plus, Search, X, Edit, Trash2, Users } from 'lucide-react'
import { clients as initialClients } from '@/data/mock'
import { Button, Card, Chip, Input, PageHeader } from '@/components/dashboard/ui'

const stats = { 'Fold Studio': [3, 1, '$3,200', '12m ago'], Northstar: [3, 2, '$1,800', 'Yesterday'], Goodwork: [2, 0, '$0', 'Mon'], Helios: [2, 1, '$0', '1h ago'], 'Studio A': [2, 0, '$0', '3h ago'] }

function Modal({ client, onClose, onSave, mode = 'create' }) {
  const [name, setName] = useState(client ? client.name : '');
  const [contact, setContact] = useState(client ? client.contact : '');
  const [role, setRole] = useState(client ? client.role : 'Founder');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim() || !contact.trim()) {
      setError('Name and contact email are required.');
      return;
    }
    onSave({ name, contact, role });
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-[#111113]"><div className="mb-5 flex items-center justify-between"><h2 className="font-semibold">{mode === 'edit' ? 'Edit Client' : 'Invite Client'}</h2><button onClick={onClose} aria-label="Close"><X className="size-4" /></button></div><div className="flex flex-col gap-3">{error && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 p-2 rounded">{error}</div>}<input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Company / Client Name" className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/[0.03]" /><input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Contact email" type="email" className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/[0.03]" /><input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role (e.g. Founder, Marketing)" className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/[0.03]" /><Button variant="primary" onClick={handleSave}>{mode === 'edit' ? 'Save changes' : 'Send invite'}</Button></div></div></div>
}

function ConfirmDelete({ onClose, onConfirm }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-[#111113]"><div className="mb-2 flex items-center justify-between"><h2 className="font-semibold text-red-600">Delete Client?</h2></div><p className="mb-6 text-sm text-slate-500">Are you sure you want to remove this client? This will unlink their projects and access.</p><div className="flex gap-3 justify-end"><Button onClick={onClose}>Cancel</Button><button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500" onClick={onConfirm}>Delete</button></div></div></div>
}

export default function ClientsPage() { 
  const [query, setQuery] = useState(''); 
  const [clients, setClients] = useState(initialClients);
  const [modalOpen, setModalOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [deleteClient, setDeleteClient] = useState(null);
  
  const filtered = clients.filter(client => `${client.name} ${client.contact}`.toLowerCase().includes(query.toLowerCase())); 

  const handleCreate = (data) => {
    setClients(current => [...current, data])
    setModalOpen(false)
  }

  const handleEdit = (data) => {
    setClients(current => current.map(c => c.name === editClient.name ? data : c))
    setEditClient(null)
  }

  const handleDelete = () => {
    setClients(current => current.filter(c => c.name !== deleteClient.name))
    setDeleteClient(null)
  }

  return <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-6 pb-10 pt-6 lg:px-8"><div className="animate-slide-up-fade" style={{ animationDelay: '0ms' }}><PageHeader title="Clients" subtitle="Give every client a clear, calm place to work with you." actions={<><div className="relative"><Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" /><Input aria-label="Search clients" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search clients" className="w-48 pl-9" /></div><Button variant="primary" onClick={() => setModalOpen(true)}><Plus />Invite client</Button></>} /></div>
  
  {filtered.length === 0 ? (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-16 dark:border-white/10">
      <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 dark:bg-white/[0.04] mb-4">
        <Users className="size-6 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">No clients found</h3>
      <p className="mt-1 text-sm text-slate-500 text-center max-w-sm mb-6">You don't have any clients matching this search. Try adjusting your filters or invite a new client.</p>
      <Button variant="primary" onClick={() => setModalOpen(true)}>Invite client</Button>
    </div>
  ) : (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 animate-slide-up-fade" style={{ animationDelay: '100ms' }}>{filtered.map(client => { const [active, approvals, outstanding, lastActive] = stats[client.name] || [0, 0, '$0', 'Never']; const overdue = client.name === 'Northstar'; return <Card key={client.name} className="h-full flex flex-col"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">{client.name.slice(0, 2).toUpperCase()}</span><div><h2 className="font-semibold">{client.name}</h2><p className="text-sm text-slate-500 dark:text-slate-400">{client.contact}</p></div></div><div className="flex items-center gap-1"><button aria-label="Edit client" onClick={() => setEditClient(client)} className="rounded-lg p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-white/[0.05]"><Edit className="size-4" /></button><button aria-label="Delete client" onClick={() => setDeleteClient(client)} className="rounded-lg p-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-white/[0.05]"><Trash2 className="size-4" /></button></div></div><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{client.role}</p><div className="my-5 border-t border-slate-100 dark:border-white/[0.06]" /><div className="grid grid-cols-3 gap-2"><div><p className="text-lg font-semibold">{active}</p><p className="text-[11px] leading-tight text-slate-500">Active projects</p></div><div><p className="text-lg font-semibold">{approvals}</p><p className="text-[11px] leading-tight text-slate-500">Pending approvals</p></div><div><div className="flex items-center gap-1"><p className={`text-lg font-semibold ${overdue ? 'text-red-600 dark:text-red-400' : ''}`}>{outstanding}</p>{overdue && <Chip tone="red">Overdue</Chip>}</div><p className="text-[11px] leading-tight text-slate-500">Outstanding</p></div></div><div className="mt-auto pt-5"><p className="mb-4 text-xs text-slate-500 dark:text-slate-400">Last active {lastActive}</p><Button className="w-full">Open portal</Button></div></Card> })}</div>
  )}
  {modalOpen && <Modal mode="create" onClose={() => setModalOpen(false)} onSave={handleCreate} />}
  {editClient && <Modal mode="edit" client={editClient} onClose={() => setEditClient(null)} onSave={handleEdit} />}
  {deleteClient && <ConfirmDelete onClose={() => setDeleteClient(null)} onConfirm={handleDelete} />}
  </div> 
}
