// One-off cleanup — backs up then permanently deletes every document in `vouchers` and
// `dailyCollectionReports`. Scoped copy of wipeCollections.mjs for just these two.
//
// Usage:
//   node scripts/wipeVouchersAndDailyCollections.mjs --dry-run   # show doc counts only
//   node scripts/wipeVouchersAndDailyCollections.mjs --confirm   # back up, then delete
//
// Prerequisites: serviceAccountKey.json at the repo root.

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
const serviceAccountPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ?? join(repoRoot, 'serviceAccountKey.json')

const COLLECTIONS_TO_WIPE = ['vouchers', 'dailyCollectionReports']

const mode = process.argv[2]
if (mode !== '--dry-run' && mode !== '--confirm') {
  console.error('Usage: node scripts/wipeVouchersAndDailyCollections.mjs --dry-run | --confirm')
  process.exit(1)
}

if (!existsSync(serviceAccountPath)) {
  console.error(`Service account key not found at: ${serviceAccountPath}`)
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))
initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

function toPlainJson(value) {
  if (value && typeof value.toDate === 'function') return value.toDate().toISOString()
  if (Array.isArray(value)) return value.map(toPlainJson)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toPlainJson(v)]))
  }
  return value
}

async function deleteAll(docs) {
  const BATCH_SIZE = 400
  let deleted = 0
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = db.batch()
    for (const doc of docs.slice(i, i + BATCH_SIZE)) batch.delete(doc.ref)
    await batch.commit()
    deleted += Math.min(BATCH_SIZE, docs.length - i)
  }
  return deleted
}

async function main() {
  console.log(`Project: ${serviceAccount.project_id}`)
  console.log(`Mode: ${mode}\n`)

  const snapshots = {}
  for (const name of COLLECTIONS_TO_WIPE) {
    snapshots[name] = await db.collection(name).get()
  }

  const total = Object.values(snapshots).reduce((sum, snap) => sum + snap.size, 0)
  console.log('Document counts:')
  for (const name of COLLECTIONS_TO_WIPE) {
    console.log(`  ${name.padEnd(28)} ${snapshots[name].size}`)
  }
  console.log(`  ${'TOTAL'.padEnd(28)} ${total}\n`)

  if (mode === '--dry-run') {
    console.log('Dry run only — nothing was backed up or deleted.')
    return
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = join(repoRoot, 'backups', `vouchers-dailycollections-wipe-${stamp}`)
  mkdirSync(backupDir, { recursive: true })
  console.log(`Backing up to ${backupDir} ...`)
  for (const name of COLLECTIONS_TO_WIPE) {
    const docs = snapshots[name].docs.map((d) => toPlainJson({ id: d.id, ...d.data() }))
    writeFileSync(join(backupDir, `${name}.json`), JSON.stringify(docs, null, 2))
    console.log(`  backed up ${name} (${docs.length} docs)`)
  }
  console.log('Backup complete.\n')

  console.log('Deleting...')
  let grandTotal = 0
  for (const name of COLLECTIONS_TO_WIPE) {
    const deleted = await deleteAll(snapshots[name].docs)
    grandTotal += deleted
    console.log(`  deleted ${name} (${deleted} docs)`)
  }

  console.log(`\nDone. ${grandTotal} documents deleted. Backup saved at:\n  ${backupDir}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
