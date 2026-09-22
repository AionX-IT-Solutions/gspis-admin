import { create } from 'zustand'
import {
  persistDoc,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import { deleteFile } from '@/shared/lib/storageSync'
import type { CouncilBoardMember } from '../types/councilBoard.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

interface CouncilBoardState {
  members: CouncilBoardMember[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  addMember: (member: Omit<CouncilBoardMember, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateMember: (
    id: string,
    patch: Partial<Omit<CouncilBoardMember, 'id' | 'createdAt' | 'updatedAt'>>
  ) => void
  deleteMember: (id: string) => void
}

export const useCouncilBoardStore = create<CouncilBoardState>()((set, get) => ({
  members: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const members = await hydrateCollection<CouncilBoardMember>('councilBoardMembers')
      set({ members, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[councilBoard.store] Failed to hydrate', err)
    }
  },

  addMember: (member) => {
    const now = new Date().toISOString()
    const created: CouncilBoardMember = {
      ...member,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    }
    set((s) => ({ members: [created, ...s.members] }))
    persistDoc('councilBoardMembers', created.id, created)
    appendAuditLog({
      action: 'council_board_member_created',
      actorName: actorName(),
      entityType: 'council_board_member',
      summary: `Council Board member ${created.fullName} added.`
    })
  },

  updateMember: (id, patch) => {
    const updatedAt = new Date().toISOString()
    set((s) => ({
      members: s.members.map((m) => (m.id === id ? { ...m, ...patch, updatedAt } : m))
    }))
    const member = get().members.find((m) => m.id === id)
    if (member) persistDoc('councilBoardMembers', id, member)
    appendAuditLog({
      action: 'council_board_member_updated',
      actorName: actorName(),
      entityType: 'council_board_member',
      summary: `Council Board member ${member?.fullName ?? id} updated.`
    })
  },

  deleteMember: (id) => {
    // Anyone who reported to the deleted member simply resurfaces as their own root in the
    // org chart next render (buildCouncilBoardTree's byId.has guard) — same as Employee.
    const member = get().members.find((m) => m.id === id)
    set((s) => ({ members: s.members.filter((m) => m.id !== id) }))
    deleteDocById('councilBoardMembers', id)
    if (member?.photoStoragePath) deleteFile(member.photoStoragePath)
    appendAuditLog({
      action: 'council_board_member_deleted',
      actorName: actorName(),
      entityType: 'council_board_member',
      summary: `Council Board member ${member?.fullName ?? id} deleted.`
    })
  }
}))
