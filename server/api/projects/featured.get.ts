// server/api/projects/featured.get.ts
import { defineEventHandler } from 'h3'
import { loadProjects, filterProjects, sortProjects } from '../../utils/projects'

export default defineEventHandler(async () => {
    const all = await loadProjects()
    const only = filterProjects(all, undefined, undefined, undefined, true)
    const sorted = sortProjects(only, 'recent')
    return { items: sorted.slice(0, 3) }
})
