// server/api/projects/[slug].get.ts
import { defineEventHandler, createError } from 'h3'
import { loadProjects } from '../../utils/projects'

export default defineEventHandler(async (event) => {
    const slug = event.context.params?.slug
    if (!slug) {
        throw createError({ statusCode: 400, statusMessage: 'Slug is required' })
    }
    const list = await loadProjects()
    const found = list.find(p => p.slug === slug)
    if (!found) {
        throw createError({ statusCode: 404, statusMessage: 'Project not found' })
    }
    return found
})
