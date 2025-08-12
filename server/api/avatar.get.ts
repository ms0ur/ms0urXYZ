// server/api/avatar.get.ts
import { H3Event, getQuery, setResponseHeader, sendStream, createError } from 'h3'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { Readable } from 'node:stream'

const SECRET = process.env.AVATAR_TOKEN_SECRET || 'dev-secret'
const AVATAR_PATH = path.resolve(process.cwd(), 'private/media/avatar.jpg')

function sign(payload: string) {
    return crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
}

// Простая анти-хотлинк проверка по Referer (не панацея, но шум добавляет)
function isAllowedReferer(event: H3Event) {
    const ref = event.node.req.headers.referer || ''
    const host = event.node.req.headers.host
    return !!host && ref.startsWith(`https://${host}`) || ref.startsWith(`http://${host}`)
}

export default defineEventHandler(async (event: H3Event) => {
    const { exp, sig } = getQuery(event) as { exp?: string; sig?: string }
    if (!exp || !sig) { throw createError({ statusCode: 400, statusMessage: 'Bad token' }) }

    const payload = `exp=${exp}`
    const expected = sign(payload)
    if (sig !== expected) { throw createError({ statusCode: 403, statusMessage: 'Invalid signature' }) }

    const now = Math.floor(Date.now() / 1000)
    if (now > Number(exp)) { throw createError({ statusCode: 403, statusMessage: 'Link expired' }) }

    if (!isAllowedReferer(event)) { throw createError({ statusCode: 403, statusMessage: 'Hotlink blocked' }) }

    // Не даем браузеру легко кэшировать/шерить ссылку
    setResponseHeader(event, 'Cache-Control', 'private, no-store')
    setResponseHeader(event, 'Content-Type', 'image/jpeg')
    setResponseHeader(event, 'Content-Disposition', 'inline; filename="avatar.jpg')
    // отключим CORS на всякий случай
    setResponseHeader(event, 'Access-Control-Allow-Origin', 'null')

    const stream = fs.createReadStream(AVATAR_PATH)
    return sendStream(event, Readable.toWeb(stream) as unknown as ReadableStream)
})
