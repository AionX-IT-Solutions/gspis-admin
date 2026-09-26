// One-time cleanup: deletes Journal Vouchers that were auto-created (and auto-approved) by
// the now-removed voucher-sync helpers (troopRegistration/lib/remittanceVoucher.ts,
// troops/lib/flatFeeVoucher.ts, barangayCommittee/lib/bcVoucher.ts, districtCommittee/lib/
// dcVoucher.ts, trefoilGuild/lib/tgVoucher.ts, oavf/lib/oavfVoucher.ts, iccgRegistration/lib/
// iccgVoucher.ts, honoraryMember/lib/honoraryMemberVoucher.ts, associateMember/lib/
// associateMemberVoucher.ts) before Cash Receipts/Council Budget were switched to read those
// modules' registration/payment records directly (see features/scrd/lib/
// registrationCashReceipts.ts). A voucher only ever carries one of RESERVED_CATEGORIES on a
// credit line if one of those deleted helpers created it — nothing else in the app has ever
// written these exact category strings — so matching on that is a safe, precise identifier
// for "auto-created", with no risk of catching a genuinely manual Journal Voucher or any Check
// Voucher (disbursement).
//
// Defaults to a DRY RUN — prints what would be deleted, deletes nothing. Pass --apply to
// actually delete.
//
// Run with:
//   node scripts/deleteAutoCreatedVouchers.mjs           (dry run)
//   node scripts/deleteAutoCreatedVouchers.mjs --apply   (deletes for real)

import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
const serviceAccountPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ?? join(repoRoot, 'serviceAccountKey.json')
const apply = process.argv.includes('--apply')

if (!existsSync(serviceAccountPath)) {
  console.error(`Service account key not found at: ${serviceAccountPath}`)
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))
initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

const RESERVED_CATEGORIES = new Set([
  'Troop Fees',
  'Thinking Day Fund',
  'BC Group Fee',
  'DC Group Fee',
  'TG Group Fee',
  'OAVF/Career Woman Membership Fee',
  'ICCG Registration Fee',
  'Honorary Member Fee',
  'Associate Member Fee'
])

function isAutoCreated(voucher) {
  if (voucher.voucherType !== 'journal_voucher') return false
  return (voucher.accountLines ?? []).some(
    (line) => line.credit > 0 && RESERVED_CATEGORIES.has((line.account ?? '').trim())
  )
}

async function main() {
  const snap = await db.collection('vouchers').get()
  console.log(`${snap.size} document(s) in vouchers. Mode: ${apply ? 'APPLY (deleting)' : 'DRY RUN (no deletes)'}\n`)

  let matched = 0
  for (const doc of snap.docs) {
    const voucher = doc.data()
    if (!isAutoCreated(voucher)) continue
    matched++
    console.log(
      `  - delete vouchers/${doc.id}  [${voucher.voucherNumber ?? '?'}]  ${voucher.particulars ?? ''}  ₱${voucher.amount ?? '?'}`
    )
    if (apply) await doc.ref.delete()
  }

  console.log(`\n${matched} document(s) ${apply ? 'deleted' : 'would be deleted'}.`)
  if (!apply && matched > 0) console.log('Re-run with --apply to delete these for real.')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Cleanup failed:', err)
    process.exit(1)
  })
