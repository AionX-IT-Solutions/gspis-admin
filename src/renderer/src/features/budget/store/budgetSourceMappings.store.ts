import { create } from 'zustand'
import {
  persistDoc,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import { normalizeCategoryName } from '../lib/budgetAutoActuals'
import type {
  BudgetSourceMapping,
  BudgetSourceRule,
  BudgetSourceType
} from '../types/budgetSourceMapping.types'

/** A rule as it may still exist in Firestore from before a rule's `sourceType` (one value)
 *  became `sourceTypes` (an array, so one rule can combine more than one kind at once) — see
 *  BudgetSourceRule. Normalized on every load so `rule.sourceTypes.includes(...)` never sees
 *  `undefined` from an old-shape document. */
function normalizeRule(
  rule: BudgetSourceRule & { sourceType?: BudgetSourceType }
): BudgetSourceRule {
  if (Array.isArray(rule.sourceTypes)) return rule
  const { sourceType, ...rest } = rule
  return { ...rest, sourceTypes: sourceType ? [sourceType] : [] }
}

function normalizeMapping(mapping: BudgetSourceMapping): BudgetSourceMapping {
  return { ...mapping, rules: mapping.rules.map(normalizeRule) }
}

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

// Firestore document ids can't contain "/", which a normalized category name like
// "troop, bc/dc fees" does — sanitized to a safe, still-readable id (e.g.
// "troop-bc-dc-fees"). The mapping's own `categoryName` field keeps the real normalized name
// for display, so nothing is lost by sanitizing the id.
function mappingDocId(normalizedCategoryName: string): string {
  const cleaned = normalizedCategoryName.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return cleaned || 'uncategorized'
}

interface BudgetSourceMappingsState {
  mappings: BudgetSourceMapping[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  /** Looks up a category's configured source rules by its (un-normalized) name — the same
   *  category identity budgetAutoActuals.ts already keys on, so a mapping survives a budget
   *  category being re-seeded each fiscal year. */
  getMapping: (categoryName: string) => BudgetSourceMapping | undefined
  /** Replaces a category's rule list wholesale. An empty array deletes the mapping entirely,
   *  reverting the line to budgetAutoActuals.ts's built-in default rule (if it has one)
   *  instead of leaving a stale empty-rules doc behind. */
  setMapping: (categoryName: string, rules: BudgetSourceRule[]) => void
}

export const useBudgetSourceMappingsStore = create<BudgetSourceMappingsState>()((set, get) => ({
  mappings: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const mappings = await hydrateCollection<BudgetSourceMapping>('budgetSourceMappings')
      set({ mappings: mappings.map(normalizeMapping), hydrated: true })
    } catch (err) {
      reportHydrateFailure('[budgetSourceMappings.store] Failed to hydrate', err)
    }
  },

  getMapping: (categoryName) => {
    const normalized = normalizeCategoryName(categoryName)
    return get().mappings.find((m) => m.categoryName === normalized)
  },

  setMapping: (categoryName, rules) => {
    const normalized = normalizeCategoryName(categoryName)
    const id = mappingDocId(normalized)

    if (rules.length === 0) {
      set((s) => ({ mappings: s.mappings.filter((m) => m.id !== id) }))
      deleteDocById('budgetSourceMappings', id)
      appendAuditLog({
        action: 'budget_source_unlinked',
        actorName: actorName(),
        entityType: 'budget_source_mapping',
        summary: `Source unlinked for "${categoryName}" — back to the built-in default.`
      })
      return
    }

    const mapping: BudgetSourceMapping = {
      id,
      categoryName: normalized,
      rules,
      updatedAt: new Date().toISOString(),
      updatedBy: actorName()
    }
    set((s) => ({ mappings: [...s.mappings.filter((m) => m.id !== id), mapping] }))
    persistDoc('budgetSourceMappings', id, mapping)
    appendAuditLog({
      action: 'budget_source_linked',
      actorName: actorName(),
      entityType: 'budget_source_mapping',
      summary: `Source linked for "${categoryName}" (${rules.length} rule${rules.length === 1 ? '' : 's'}).`
    })
  }
}))
