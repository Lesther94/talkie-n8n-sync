import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = Number(process.env.PORT) || 3000
const n8nUrl = process.env.N8N_WEBHOOK_URL
const n8nSecret = process.env.N8N_WEBHOOK_SECRET || ''
const allowedOrigin = process.env.ALLOWED_ORIGIN

if (!n8nUrl) {
  console.error('Missing N8N_WEBHOOK_URL')
  process.exit(1)
}

app.use(express.json({ limit: '1mb' }))
if (allowedOrigin) {
  app.use(cors({ origin: allowedOrigin, methods: ['POST','GET'] }))
}

app.get('/health', (_req, res) => res.status(200).send('ok'))

app.post('/api/sync', async (req, res) => {
  try {
    const r = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-webhook-token': n8nSecret
      },
      body: JSON.stringify(req.body)
    })
    const text = await r.text()
    res.status(r.status).send(text)
  } catch (e) {
    console.error('proxy_error', e)
    res.status(500).json({ error: 'proxy_error' })
  }
})

// Static files from Vite build
app.use(express.static(path.join(__dirname, 'dist')))
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(port, () => {
  console.log(`[talkie-n8n-sync] listening on :${port}`)
})
