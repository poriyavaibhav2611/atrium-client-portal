'use client'

import { useMemo, useState } from 'react'
import { CalendarDays, Edit, Grid2X2, LayoutList, MoreHorizontal, Plus, Search, Trash2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { projects } from '@/data/mock'
import { AvatarStack, Button, Card, Chip, Input, PageHeader } from '@/components/dashboard/ui'
import { Dropdown } from '@/components/ui/dropdown'
import { DatePicker } from '@/components/ui/datepicker'

const filters = ['All', 'On track', 'In review', 'Delayed']
const tone = { 'On track': 'indigo', 'In review': 'amber', Delayed: 'red' }
const bar = { 'On track': 'bg-indigo-600', 'In review': 'bg-amber-500', Delayed: 'bg-red-500' }
const teams = [['JT', 'MC', 'JR'], ['MC', 'JR'], ['JK', 'AL', 'SR'], ['AL', 'JT'], ['SR', 'JK', 'MC'], ['JR', 'AL'], ['JK', 'JT', 'SR'], ['MC', 'JR', 'JK'], ['AL', 'SR'], ['JT', 'JK', 'MC'], ['MC', 'AL'], ['JR', 'SR', 'JT']]

function Status({ value }) { return <Chip tone={tone[value]}>{value}</Chip> }
function Progress({ project }) { return <div className="flex min-w-[140px] max-w-[220px] items-center gap-3"><div className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-white/[0.08]"><div className={`h-full rounded-full transition-all duration-1000 ${bar[project.status]}`} style={{ width: `${project.progress}%` }} /></div><span className="w-8 text-right text-xs font-medium text-slate-500 dark:text-slate-400">{project.progress}%</span></div> }

function Modal({ project, onClose, onSave, mode = 'create' }) {
  const [name, setName] = useState(project ? project.name : '');
  const [client, setClient] = useState(project ? project.client : 'Fold Studio');
  const [due, setDue] = useState(project ? project.due : '');
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-[#111113]"><div className="mb-5 flex items-center justify-between"><h2 className="font-semibold">{mode === 'edit' ? 'Edit project' : 'New project'}</h2><button onClick={onClose} aria-label="Close"><X className="size-4" /></button></div><div className="flex flex-col gap-3"><input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/[0.03]" /><Dropdown value={client} onChange={setClient} options={['Fold Studio', 'Northstar', 'Helios', 'Studio A', 'Goodwork']} className="w-full" /><DatePicker value={due} onChange={setDue} className="w-full" placeholder="Select due date" /><Button variant="primary" onClick={() => name && onSave(name, client, due)}>{mode === 'edit' ? 'Save changes' : 'Create project'}</Button></div></div></div>
}

function ConfirmDelete({ onClose, onConfirm }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-[#111113]"><div className="mb-2 flex items-center justify-between"><h2 className="font-semibold text-red-600">Delete Project?</h2></div><p className="mb-6 text-sm text-slate-500">Are you sure you want to delete this project? This action cannot be undone.</p><div className="flex gap-3 justify-end"><Button onClick={onClose}>Cancel</Button><button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500" onClick={onConfirm}>Delete</button></div></div></div>
}

export default function ProjectsPage() {
  const router = useRouter()
  const [query, setQuery] = useState(''); const [filter, setFilter] = useState('All'); const [view, setView] = useState('list');
  const [modalOpen, setModalOpen] = useState(false); const [editProject, setEditProject] = useState(null); const [deleteProject, setDeleteProject] = useState(null);
  const [localProjects, setLocalProjects] = useState(projects)

  const filtered = useMemo(() => localProjects.map((project, index) => ({ ...project, team: teams[index % teams.length] })).filter(project => (filter === 'All' || project.status === filter) && `${project.name} ${project.client}`.toLowerCase().includes(query.toLowerCase())), [query, filter, localProjects])

  const handleCreate = (name, client, due) => {
    setLocalProjects(current => [{ id: Date.now(), name, client, progress: 0, status: 'On track', due: due || 'TBD' }, ...current])
    setModalOpen(false)
  }

  const handleEdit = (name, client, due) => {
    setLocalProjects(current => current.map(p => p.id === editProject.id ? { ...p, name, client, due: due || p.due } : p))
    setEditProject(null)
  }

  const handleDelete = () => {
    setLocalProjects(current => current.filter(p => p.id !== deleteProject.id))
    setDeleteProject(null)
  }

  return <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-6 pb-10 pt-6 lg:px-8"><div className="animate-slide-up-fade" style={{ animationDelay: '0ms' }}><PageHeader title="Projects" subtitle="Keep every deliverable moving from kickoff to done." actions={<div className="flex flex-wrap items-center gap-3"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" /><Input aria-label="Search projects" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search projects" className="h-10 w-56 rounded-xl border border-slate-200 bg-white/50 pl-10 pr-4 text-sm backdrop-blur-xl transition-all focus-visible:bg-white dark:border-white/10 dark:bg-black/20 dark:focus-visible:bg-[#111113]" /></div><div className="flex h-10 items-center rounded-xl border border-slate-200 bg-white/50 p-1 backdrop-blur-xl dark:border-white/10 dark:bg-black/20">{filters.map(item => <button key={item} onClick={() => setFilter(item)} className={`rounded-lg px-3 py-1 text-sm font-medium transition-all ${filter === item ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}>{item}</button>)}</div><div className="flex h-10 items-center rounded-xl border border-slate-200 bg-white/50 p-1 backdrop-blur-xl dark:border-white/10 dark:bg-black/20"><button aria-label="List view" onClick={() => setView('list')} className={`rounded-lg p-1.5 transition-all ${view === 'list' ? 'bg-slate-100 text-indigo-600 dark:bg-white/10 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}><LayoutList className="size-4.5" /></button><button aria-label="Board view" onClick={() => setView('board')} className={`rounded-lg p-1.5 transition-all ${view === 'board' ? 'bg-slate-100 text-indigo-600 dark:bg-white/10 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}><Grid2X2 className="size-4.5" /></button></div><Button variant="primary" className="h-10 px-5 shadow-indigo-600/25 dark:shadow-indigo-500/20" onClick={() => setModalOpen(true)}><Plus className="size-4.5" />New project</Button></div>} /></div>{view === 'list' ? <div className="animate-slide-up-fade" style={{ animationDelay: '100ms' }}><Card className="h-full overflow-hidden p-0"><div className="hidden min-w-[900px] grid-cols-[40px_2fr_1fr_1fr_1.5fr_1fr_100px] gap-6 border-b border-slate-200 px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-500 dark:border-white/[0.08] md:grid"><span>#</span><span>Project</span><span>Team</span><span>Status</span><span>Progress</span><span>Due date</span><span className="text-right">Actions</span></div>{filtered.map((project, index) => <div key={project.id} className="group/row grid w-full items-center gap-6 border-b border-slate-100 px-6 py-4 text-left transition hover:bg-slate-50 dark:border-white/[0.06] dark:hover:bg-white/[0.03] md:grid-cols-[40px_2fr_1fr_1fr_1.5fr_1fr_100px] cursor-pointer" onClick={() => router.push(`/dashboard/projects/${project.id}`)}><span className="text-sm font-medium text-slate-400">{index + 1}</span><div><p className="font-medium group-hover/row:text-indigo-600 transition-colors dark:group-hover/row:text-indigo-400">{project.name}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{project.client}</p></div><div><AvatarStack names={project.team} /></div><Status value={project.status} /><Progress project={project} /><span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400"><CalendarDays className="size-4" />{project.due}</span><div className="flex justify-end" onClick={e => e.stopPropagation()}><button onClick={() => router.push(`/dashboard/projects/${project.id}`)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-slate-100">View details</button></div></div>)}</Card></div> : <div className="grid gap-4 lg:grid-cols-3 animate-slide-up-fade" style={{ animationDelay: '100ms' }}>{filters.slice(1).map(column => <div key={column} className="flex flex-col gap-3"><div className="flex items-center justify-between"><h2 className="font-semibold">{column}</h2><Chip tone={tone[column]}>{filtered.filter(project => project.status === column).length}</Chip></div>{filtered.filter(project => project.status === column).map(project => <Card key={project.id} onClick={() => router.push(`/dashboard/projects/${project.id}`)} className="p-4"><div className="flex items-start justify-between"><p className="font-medium group-hover/row:text-indigo-600 transition-colors dark:group-hover/row:text-indigo-400">{project.name}</p><Status value={project.status} /></div><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{project.client}</p><div className="mt-4"><Progress project={project} /></div><div className="mt-4 flex items-center justify-between text-xs text-slate-500"><span>{project.due}</span><div className="flex items-center" onClick={e => e.stopPropagation()}><AvatarStack names={project.team} /></div></div></Card>)}</div>)}</div>}
  {modalOpen && <Modal mode="create" onClose={() => setModalOpen(false)} onSave={handleCreate} />}
  {editProject && <Modal mode="edit" project={editProject} onClose={() => setEditProject(null)} onSave={handleEdit} />}
  {deleteProject && <ConfirmDelete onClose={() => setDeleteProject(null)} onConfirm={handleDelete} />}
  </div>
}
