// server/api/avatar-url.get.ts
import { defineEventHandler, getQuery, setResponseHeader } from 'h3'
import crypto from 'node:crypto'

const SECRET = process.env.AVATAR_TOKEN_SECRET || 'dev-secret' // положи в .env (одинаковый для обоих эндпоинтов)
const TTL_SEC = 60 // ссылка живёт 60 секунд

function sign(payload: string) {
    return crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
}

export default defineEventHandler((event) => {
    // хотим иметь возможность задавать размер прямо в запросе к генератору
    const q = getQuery(event) as { w?: string; h?: string; q?: string }

    // ⚠️ значения и порядок должны совпадать с server/api/avatar.get.ts
    const w = Math.max(1, Math.min(1024, Number(q.w ?? 320))) || 320
    const h = Math.max(1, Math.min(1024, Number(q.h ?? 320))) || 320
    const quality = Math.max(40, Math.min(95, Number(q.q ?? 72))) || 72

    const exp = Math.floor(Date.now() / 1000) + TTL_SEC
    const payload = `exp=${exp}&w=${w}&h=${h}&q=${quality}`
    const sig = sign(payload)
    const url = `/api/avatar?${payload}&sig=${sig}`

    // Генератор тоже без кэша (ссылка короткоживущая)
    setResponseHeader(event, 'Cache-Control', 'no-store')

    // Вернём полезные поля на всякий случай
    return { url, exp, w, h, q: quality, sig }
})
