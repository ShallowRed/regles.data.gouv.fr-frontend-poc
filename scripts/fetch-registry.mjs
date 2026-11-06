import { mkdirSync, writeFileSync } from 'node:fs'
import process from 'node:process'

const url = process.env.REGISTRY_URL ?? 'https://datagouv.github.io/regles.data.gouv.fr/registry.json'
const dir = new URL('../.registry/', import.meta.url)

const response = await fetch(url)
if (!response.ok) {
  throw new Error(`${url} answered ${response.status}`)
}
const { records } = await response.json()
mkdirSync(dir, { recursive: true })
writeFileSync(new URL('records.json', dir), `${JSON.stringify(records, null, 2)}\n`)
console.log(`${records.length} records from ${url}`)
