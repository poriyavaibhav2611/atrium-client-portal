'use client'

import { useState } from 'react'
import { ArrowLeft, CalendarDays, Check, FileText, MessageSquare, MoreHorizontal, CheckCircle2, Clock, Activity, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { files, projects } from '@/data/mock'
import { AvatarStack, Button, Card, Chip, PageHeader } from '@/components/dashboard/ui'

const tone = { 'On track': 'indigo', 'In review': 'amber', Delayed: 'red' }
const bar = { 'On track': 'bg-indigo-600', 'In review': 'bg-amber-500', Delayed: 'bg-red-500' }

export default function ProjectDetailsPage() {
  const params = useParams()
  // Mock data lookup (in a real app this would be a fetch)
  const projectBase = projects.find(p => p.id.toString() === params.id) || projects[0]
  
  const [project, setProject] = useState(projectBase)
  
  const milestones = [
    { title: 'Kickoff complete', status: 'completed' },
    { title: 'Design direction approved', status: 'completed' },
    { title: 'First round delivered', status: 'current' },
    { title: 'Client review', status: 'pending' },
    { title: 'Final assets handed over', status: 'pending' },
  ]
  
  const teams = [['JT', 'MC', 'JR'], ['MC', 'JR'], ['JK', 'AL', 'SR'], ['AL', 'JT'], ['SR', 'JK', 'MC'], ['JR', 'AL'], ['JK', 'JT', 'SR'], ['MC', 'JR', 'JK'], ['AL', 'SR'], ['JT', 'JK', 'MC'], ['MC', 'AL'], ['JR', 'SR', 'JT']]
  const projectIndex = projects.findIndex(p => p.id.toString() === params.id)
  const team = teams[projectIndex >= 0 ? projectIndex % teams.length : 0]
  const fullNames = { 'JT': 'Jamie Taylor', 'MC': 'Maya Chen', 'JR': 'Jordan Riley', 'JK': 'Jordan Kim', 'AL': 'Alex Lee', 'SR': 'Sarah Reed' }

  if (!project) return null

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-6 pb-10 pt-6 lg:px-8">
      <div className="animate-slide-up-fade" style={{ animationDelay: '0ms' }}>
        <div className="mb-4">
          <Link href="/dashboard/projects" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="size-4" /> Back to projects
          </Link>
        </div>
        
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">{project.name}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-300">{project.client}</span>
              <span>·</span>
              <span className="flex items-center gap-1.5"><CalendarDays className="size-4" /> Due {project.due}</span>
              <span>·</span>
              <div className="flex flex-wrap items-center gap-2">
                {team.map(initials => (
                  <div key={initials} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white pr-2.5 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.04]">
                    <span className="flex size-6 items-center justify-center rounded-full bg-indigo-500/15 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                      {initials}
                    </span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {fullNames[initials] || initials}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" className="gap-2">
              <Edit className="size-4" /> Edit project
            </Button>
            <Button variant="primary" className="gap-2 bg-red-600 hover:bg-red-700 shadow-red-600/25 hover:shadow-red-600/40 border-red-600">
              <Trash2 className="size-4" /> Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
        {/* Main Content */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Overview</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              This project involves a comprehensive redesign of the main marketing site to improve conversion rates and align with the new brand guidelines. We will be delivering wireframes, high-fidelity mockups, and a fully functional frontend build.
            </p>
            
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{project.progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-white/[0.08]">
              <div className={`h-full rounded-full transition-all duration-500 ${bar[project.status]}`} style={{ width: `${project.progress}%` }} />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Milestones & Tasks</h2>
              <Button size="sm"><CheckCircle2 className="size-4 mr-2" />Add task</Button>
            </div>
            <div className="flex flex-col gap-4">
              {milestones.map((item, index) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="mt-0.5 flex flex-col items-center">
                    <span className={`flex size-6 items-center justify-center rounded-full border ${item.status === 'completed' ? 'border-indigo-600 bg-indigo-600 text-white' : item.status === 'current' ? 'border-indigo-500 text-indigo-500 dark:border-indigo-400 dark:text-indigo-400' : 'border-slate-200 text-transparent dark:border-white/10'}`}>
                      {item.status === 'completed' ? <Check className="size-3.5" /> : <div className={`size-2 rounded-full ${item.status === 'current' ? 'bg-indigo-500 dark:bg-indigo-400' : 'bg-transparent'}`} />}
                    </span>
                    {index < milestones.length - 1 && <div className={`h-6 w-px my-1 ${item.status === 'completed' ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-white/10'}`} />}
                  </div>
                  <div className="pb-4">
                    <p className={`text-sm font-medium ${item.status === 'pending' ? 'text-slate-500 dark:text-slate-400' : ''}`}>{item.title}</p>
                    {item.status === 'current' && <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">In progress</p>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <h3 className="font-semibold mb-4">Status</h3>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-white/[0.04]">
              <span className="text-sm font-medium">Current Status</span>
              <Chip tone={tone[project.status]}>{project.status}</Chip>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recent Files</h3>
              <button className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">View all</button>
            </div>
            <div className="flex flex-col gap-2">
              {files.filter(file => file.client === project.client).slice(0, 3).map(file => (
                <div key={file.name} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm dark:bg-white/[0.04] transition hover:bg-slate-100 dark:hover:bg-white/[0.08] cursor-pointer">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="size-4 shrink-0 text-slate-400" />
                    <span className="truncate font-medium">{file.name}</span>
                  </div>
                  <span className="ml-3 text-xs text-slate-500 shrink-0">{file.size}</span>
                </div>
              ))}
              {files.filter(file => file.client === project.client).length === 0 && (
                <p className="text-sm text-slate-500 italic">No files attached yet.</p>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-4">Activity</h3>
            <div className="flex flex-col gap-4 relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200 dark:bg-white/10" />
              <div className="relative flex gap-3 z-10">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border-4 border-white bg-indigo-100 text-indigo-600 dark:border-[#111113] dark:bg-indigo-500/20"><Activity className="size-3" /></span>
                <div>
                  <p className="text-sm"><span className="font-medium">Jamie Taylor</span> changed status</p>
                  <p className="text-xs text-slate-500 mt-0.5">Today at 10:42 AM</p>
                </div>
              </div>
              <div className="relative flex gap-3 z-10">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border-4 border-white bg-slate-100 text-slate-500 dark:border-[#111113] dark:bg-white/10"><MessageSquare className="size-3" /></span>
                <div>
                  <p className="text-sm"><span className="font-medium">Maya Chen</span> left a comment</p>
                  <p className="text-xs text-slate-500 mt-0.5">Yesterday</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
