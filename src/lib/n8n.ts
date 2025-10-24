export async function runSync<T = unknown>(payload: unknown) {
const r = await fetch('/api/sync', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(payload)
})
if (!r.ok) throw new Error(await r.text())
return (await r.json()) as T
}
