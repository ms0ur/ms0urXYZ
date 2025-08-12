// server/api/avatar.get.ts
import { defineEventHandler, getQuery, setResponseHeader, createError } from 'h3'
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { Readable } from 'node:stream'

const SECRET = process.env.AVATAR_TOKEN_SECRET || 'dev-secret'
const AVATAR_PATH = path.resolve(process.cwd(), 'private/media/avatar.webp')

// Подписываем query payload вида "exp=...&w=...&h=...&q=..."
function sign(payload: string) {
    return crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
}

// Разрешаем только referer того же origin (или пустой — некоторые браузеры его не шлют)
function isAllowedReferer(host?: string, referer?: string) {
    if (!referer) return true
    if (!host) return false
    try {
        const r = new URL(referer)
        return r.host === host
    } catch {
        return false
    }
}

export default defineEventHandler(async (event) => {
    // 1) Валидация токена
    const q = getQuery(event) as {
        exp?: string
        sig?: string
        w?: string
        h?: string
        q?: string
    }

    const { exp, sig } = q
    if (!exp || !sig) {
        throw createError({ statusCode: 400, statusMessage: 'Bad token' })
    }

    // Собираем payload в том же порядке — важно для подписи
    const w = Math.max(1, Math.min(1024, Number(q.w ?? 320))) || 500
    const h = Math.max(1, Math.min(1024, Number(q.h ?? 320))) || 500
    const quality = Math.max(40, Math.min(95, Number(q.q ?? 72))) || 72

    const payload = `exp=${exp}&w=${w}&h=${h}&q=${quality}`
    const expected = sign(payload)
    if (sig !== expected) {
        throw createError({ statusCode: 403, statusMessage: 'Invalid signature' })
    }

    const now = Math.floor(Date.now() / 1000)
    if (now > Number(exp)) {
        throw createError({ statusCode: 403, statusMessage: 'Link expired' })
    }

    // 2) Анти-хотлинк по referer (same-origin)
    const host = event.node.req.headers.host
    const referer = event.node.req.headers.referer
    if (!isAllowedReferer(host, referer)) {
        throw createError({ statusCode: 403, statusMessage: 'Hotlink blocked' })
    }

    // 3) Читаем исходник и даунскейлим → webp (без кэша!)
    let input: Buffer
    try {
        input = await fs.readFile(AVATAR_PATH)
    } catch {
        throw createError({ statusCode: 404, statusMessage: 'Avatar not found' })
    }

    // Ленивая загрузка sharp (чтобы не грузить его в холодном старте без нужды)
    const { default: sharp } = await import('sharp')
    const out = await sharp(input)
        .resize(w, h, { fit: 'cover' })
        .webp({ quality, effort: 4 })
        .toBuffer()

    // 4) Заголовки (строго без кэширования)
    setResponseHeader(event, 'Content-Type', 'image/webp')
    setResponseHeader(event, 'Content-Disposition', 'inline; filename="avatar.webp"')
    setResponseHeader(event, 'Cross-Origin-Resource-Policy', 'same-origin')
    setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
    // Полный запрет кэширования
    setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate')
    setResponseHeader(event, 'Pragma', 'no-cache')
    setResponseHeader(event, 'Expires', '0')

    // (опционально) режем CORS для сторонних источников
    // Не ставим 'null' — просто не выставляем заголовок, чтобы браузер трактовал как same-origin
    // setResponseHeader(event, 'Access-Control-Allow-Origin', 'null') // <- лучше не нужно

    return new Readable({
        read() {
            this.push(out)
            this.push(null)
        }
    })
})
