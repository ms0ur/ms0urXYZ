// server/api/projects/index.ts
import { defineEventHandler, getQuery } from 'h3'
import { loadProjects, filterProjects, paginate, sortProjects, ProjectQuery } from '../../utils/projects'

export default defineEventHandler(async (event) => {
    const q = getQuery(event)

    const page = Number(q.page ?? 1)
    const limit = Number(q.limit ?? 10)
    const search = typeof q.q === 'string' ? q.q : undefined

    const tags = typeof q.tags === 'string' && q.tags.trim()
        ? q.tags.split(',').map(s => s.trim()).filter(Boolean)
        : undefined

    const tech = typeof q.tech === 'string' && q.tech.trim()
        ? q.tech.split(',').map(s => s.trim()).filter(Boolean)
        : undefined

    const featured = typeof q.featured === 'string'
        ? q.featured === 'true'
        : undefined

    const sort = (q.sort === 'title' ? 'title' : 'recent') as ProjectQuery['sort']

    const all = await loadProjects()
    const filtered = filterProjects(all, search, tags, tech, featured)
    const sorted = sortProjects(filtered, sort)
    const paged = paginate(sorted, page, limit)

    return paged
})
