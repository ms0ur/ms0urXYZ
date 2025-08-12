// server/api/avatar-url.get.ts
import { H3Event, setResponseHeader } from 'h3'
import crypto from 'node:crypto'

const SECRET = process.env.AVATAR_TOKEN_SECRET || 'dev-secret' // положи в .env
const TTL_SEC = 60 // ссылка живет 60 секунд

function sign(payload: string) {
    return crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
}

export default defineEventHandler((event: H3Event) => {
    const exp = Math.floor(Date.now() / 1000) + TTL_SEC
    const payload = `exp=${exp}`
    const sig = sign(payload)
    const url = `/api/avatar?${payload}&sig=${sig}`

    // Кэшировать нельзя — ссылка краткоживущая
    setResponseHeader(event, 'Cache-Control', 'no-store')

    return { url }
})
