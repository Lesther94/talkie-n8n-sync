import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


const app = express()
const port = process.env.PORT || 3000
const n8nUrl = process.env.N8N_WEBHOOK_URL
const n8nSecret = process.env.N8N_WEBHOOK_SECRET || ''
const allowedOrigin = process.env.ALLOWED_ORIGIN


if (!n8nUrl) throw new Error('N8N_WEBHOOK_URL manquant')


app.use(express.json({ limit: '1mb' }))
if (allowedOrigin) {
app.use(cors({ origin: allowedOrigin, methods: ['POST','GET'], credentials: false }))
}


app.get('/health', (_req, res) => res.status(200).send('ok'))


app.post('/api/sync', async (req, res) => {
try {
const r = await fetch(n8nUrl, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'X-Webhook-Token': n8nSecret,
},
body: JSON.stringify(req.body),
})
const text = await r.text()
res.status(r.status).send(text)
} catch (e) {
res.status(500).json({ error: e?.message || 'proxy_error' })
}
})


// Static files from Vite build
app.use(express.static(path.join(__dirname, 'dist')))
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')))


app.listen(port, () => console.log(`[talkie-n8n-sync] on :${port}`))
```ts
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'
import cors from 'cors'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


const app = express()
const port = process.env.PORT || 3000
const n8nUrl = process.env.N8N_WEBHOOK_URL
const n8nSecret = process.env.N8N_WEBHOOK_SECRET || ''
const allowedOrigin = process.env.ALLOWED_ORIGIN


if (!n8nUrl) throw new Error('N8N_WEBHOOK_URL manquant')


app.use(express.json({ limit: '1mb' }))
if (allowedOrigin) {
app.use(cors({ origin: allowedOrigin, methods: ['POST','GET'], credentials: false }))
}


app.get('/health', (_req, res) => res.status(200).send('ok'))


app.post('/api/sync', async (req, res) => {
try {
const r = await fetch(n8nUrl, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'X-Webhook-Token': n8nSecret,
},
body: JSON.stringify(req.body),
})
const text = await r.text()
res.status(r.status).send(text)
} catch (e:any) {
res.status(500).json({ error: e.message }) }
})


// Static files from Vite build
app.use(express.static(path.join(__dirname, 'dist')))
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')))


app.listen(port, () => console.log(`[talkie-n8n-sync] on :${port}`))
