// server/utils/projects.ts
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export interface Tag {
    name: string
    color: string
}
export interface Tech {
    name: string
    icon: string
    color: string
}
export interface Project {
    id: string
    slug: string
    title: string
    shortDescription: string
    fullDescription: string
    tags: Tag[]
    images: string[]
    tech: Tech[]
    featured: boolean
    links?: { demo?: string; repo?: string }
    createdAt?: string
    updatedAt?: string
    status?: 'done' | 'wip' | 'archived'
}

export interface ProjectQuery {
    page?: number
    limit?: number
    q?: string
    tags?: string[]        // название тега (через запятую в query)
    tech?: string[]        // название технологии
    featured?: boolean     // true/false
    sort?: 'recent' | 'title'
}

let cache: Project[] | null = null

export async function loadProjects(): Promise<Project[]> {
    if (cache) return cache
    const file = join(process.cwd(), 'server', 'data', 'projects.json')
    const raw = await readFile(file, 'utf-8')
    cache = JSON.parse(raw) as Project[]
    return cache
}

export function filterProjects(list: Project[], q?: string, tags?: string[], tech?: string[], featured?: boolean) {
    let res = list
    if (typeof featured === 'boolean') {
        res = res.filter(p => p.featured === featured)
    }
    if (q && q.trim()) {
        const needle = q.trim().toLowerCase()
        res = res.filter(p =>
            p.title.toLowerCase().includes(needle) ||
            p.shortDescription.toLowerCase().includes(needle) ||
            p.fullDescription.toLowerCase().includes(needle) ||
            p.tags.some(t => t.name.toLowerCase().includes(needle)) ||
            p.tech.some(t => t.name.toLowerCase().includes(needle))
        )
    }
    if (tags && tags.length) {
        const set = new Set(tags.map(t => t.toLowerCase()))
        res = res.filter(p => p.tags.some(t => set.has(t.name.toLowerCase())))
    }
    if (tech && tech.length) {
        const set = new Set(tech.map(t => t.toLowerCase()))
        res = res.filter(p => p.tech.some(t => set.has(t.name.toLowerCase())))
    }
    return res
}

export function sortProjects(list: Project[], sort: ProjectQuery['sort']) {
    if (sort === 'title') {
        return [...list].sort((a, b) => a.title.localeCompare(b.title))
    }
    // recent (по updatedAt/createdAt)
    return [...list].sort((a, b) => {
        const aDate = Date.parse(a.updatedAt || a.createdAt || '1970-01-01')
        const bDate = Date.parse(b.updatedAt || b.createdAt || '1970-01-01')
        return bDate - aDate
    })
}

export function paginate<T>(list: T[], page = 1, limit = 10) {
    const total = list.length
    const pages = Math.max(1, Math.ceil(total / limit))
    const current = Math.min(Math.max(1, page), pages)
    const start = (current - 1) * limit
    const end = start + limit
    return {
        items: list.slice(start, end),
        meta: { total, page: current, pages, limit }
    }
}
