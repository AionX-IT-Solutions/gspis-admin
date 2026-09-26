import { describe, it, expect, vi } from 'vitest'

vi.mock('@/shared/lib/firebase', () => ({ auth: {}, db: {} }))
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn()
}))
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn()
}))

import { MEMBERSHIP_CATEGORIES } from '../../renderer/src/features/troopLeaderSubmissions/config/membershipCategories'

// The 8 Troops & Membership self-registration categories are wired independently across
// firestore.rules, per-category store factories, and this config array — nothing enforces
// they stay in sync at compile time, so this is a cheap drift check.
describe('MEMBERSHIP_CATEGORIES', () => {
  it('has exactly 8 categories', () => {
    expect(MEMBERSHIP_CATEGORIES).toHaveLength(8)
  })

  it('has a unique key per category', () => {
    const keys = MEMBERSHIP_CATEGORIES.map((c) => c.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('has a unique Firestore collection name per category, matching firestore.rules', () => {
    const collectionNames = MEMBERSHIP_CATEGORIES.map((c) => c.collectionName)
    expect(new Set(collectionNames).size).toBe(collectionNames.length)
    expect(collectionNames.sort()).toEqual(
      [
        'troopLeaderSubmissions',
        'barangayCommitteeSubmissions',
        'districtCommitteeSubmissions',
        'trefoilGuildSubmissions',
        'oavfSubmissions',
        'honoraryMemberSubmissions',
        'associateMemberSubmissions',
        'iccgSubmissions'
      ].sort()
    )
  })

  it('every category has at least one detail field and a roster flag', () => {
    for (const category of MEMBERSHIP_CATEGORIES) {
      expect(category.detailFields.length).toBeGreaterThan(0)
      expect(typeof category.hasRoster).toBe('boolean')
    }
  })
})
