import { create } from 'zustand'
import {
  persistDoc as persist,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { deleteFile } from '@/shared/lib/storageSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import type {
  MembershipDailyCollectionReport,
  MembershipReportAttachment
} from '../types/membershipDailyCollection.types'

function actorName(): string {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

interface MembershipDailyCollectionsState {
  reports: MembershipDailyCollectionReport[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  /** Upserts by date — one report per calendar date, matching the paper form. */
  saveReport: (
    report: Omit<MembershipDailyCollectionReport, 'id' | 'createdAt' | 'updatedAt' | 'attachments'>
  ) => void
  addAttachment: (date: string, attachment: MembershipReportAttachment) => void
  deleteAttachment: (reportId: string, attachmentId: string) => void
}

export const useMembershipDailyCollectionsStore = create<MembershipDailyCollectionsState>()(
  (set, get) => ({
    reports: [],
    hydrated: false,

    hydrate: async (force = false) => {
      if (get().hydrated && !force) return
      try {
        const reports = await hydrateCollection<MembershipDailyCollectionReport>(
          'membershipDailyCollectionReports'
        )
        set({ reports, hydrated: true })
      } catch (err) {
        reportHydrateFailure('[membershipDailyCollections.store] Failed to hydrate', err)
      }
    },

    saveReport: (report) => {
      const now = new Date().toISOString()
      const existing = get().reports.find((r) => r.date === report.date)
      const saved: MembershipDailyCollectionReport = existing
        ? { ...existing, ...report, updatedAt: now }
        : { ...report, id: crypto.randomUUID(), attachments: [], createdAt: now, updatedAt: now }
      set((s) => ({
        reports: existing
          ? s.reports.map((r) => (r.id === existing.id ? saved : r))
          : [saved, ...s.reports]
      }))
      persist('membershipDailyCollectionReports', saved.id, saved)
      appendAuditLog({
        action: existing
          ? 'membership_daily_collection_report_updated'
          : 'membership_daily_collection_report_created',
        actorName: actorName(),
        entityType: 'membership_daily_collection_report',
        summary: `Membership Daily Collection Report for ${report.date} ${existing ? 'updated' : 'created'}.`
      })
    },

    addAttachment: (date, attachment) => {
      const existing = get().reports.find((r) => r.date === date)
      const now = new Date().toISOString()
      const saved: MembershipDailyCollectionReport = existing
        ? { ...existing, attachments: [attachment, ...existing.attachments], updatedAt: now }
        : {
            id: crypto.randomUUID(),
            date,
            manualRows: [],
            rowOverrides: {},
            preparedBy: actorName(),
            attachments: [attachment],
            createdAt: now,
            updatedAt: now
          }
      set((s) => ({
        reports: existing
          ? s.reports.map((r) => (r.id === existing.id ? saved : r))
          : [saved, ...s.reports]
      }))
      persist('membershipDailyCollectionReports', saved.id, saved)
      appendAuditLog({
        action: 'membership_daily_collection_attachment_added',
        actorName: actorName(),
        entityType: 'membership_daily_collection_report',
        summary: `Attachment "${attachment.name}" added to Membership Daily Collection Report for ${date}.`
      })
    },

    deleteAttachment: (reportId, attachmentId) => {
      const report = get().reports.find((r) => r.id === reportId)
      if (!report) return
      const attachment = report.attachments.find((a) => a.id === attachmentId)
      const updated: MembershipDailyCollectionReport = {
        ...report,
        attachments: report.attachments.filter((a) => a.id !== attachmentId),
        updatedAt: new Date().toISOString()
      }
      set((s) => ({ reports: s.reports.map((r) => (r.id === reportId ? updated : r)) }))
      persist('membershipDailyCollectionReports', reportId, updated)
      if (attachment) deleteFile(attachment.storagePath)
      appendAuditLog({
        action: 'membership_daily_collection_attachment_deleted',
        actorName: actorName(),
        entityType: 'membership_daily_collection_report',
        summary: `Attachment "${attachment?.name ?? attachmentId}" deleted from Membership Daily Collection Report for ${report.date}.`
      })
    }
  })
)
