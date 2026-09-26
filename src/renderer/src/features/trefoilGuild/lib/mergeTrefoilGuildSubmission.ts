import { useOrgSettingsStore } from '@/app/store/orgSettings.store'
import { todayLocalIso } from '@/shared/lib/utils'
import { getMembershipYearLabel } from '@/features/troops/lib/membershipYear'
import type { LeaderTrefoilGuildSubmission } from '@/features/troopLeaderSubmissions/types/trefoilGuildSubmission.types'
import { useTrefoilGuildStore } from '../store/trefoilGuild.store'
import { useTrefoilGuildRegistrationStore } from '../store/trefoilGuildRegistration.store'
import {
  emptyRemittance,
  type RegistrationMember,
  type TrefoilGuildRegistration
} from '../types/trefoilGuildRegistration.types'
import type { TrefoilGuild, TrefoilGuildMember } from '../types/trefoilGuild.types'

// Matches the Registration form's own default (useTrefoilGuildRegistrationForm.ts's
// `useState('200.00')`) — the same starting figure staff would see filing this by hand.
const TG_GROUP_FEE_DEFAULT = 200

function norm(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase()
}

/** See features/troops/lib/mergeTroopSubmission.ts for the full rationale — identical pattern
 *  for Trefoil Guild: match-or-create the guild by name, match-or-create each roster member by
 *  fullName+birthdate, then file a Registration with an auto-computed Members fee (count × the
 *  form's own default per-member rate) and the standard T.G. Group Fee default. */
export function mergeTrefoilGuildSubmission(submission: LeaderTrefoilGuildSubmission): void {
  if (!submission.name.trim()) {
    throw new Error('Submission has no Guild Name — cannot file a registration for it.')
  }
  if (submission.members.length === 0) {
    throw new Error('Submission has no members — cannot file a registration for it.')
  }

  const { guilds, members, addGuild, updateGuild, addMember, updateMember } =
    useTrefoilGuildStore.getState()
  const { addRegistration } = useTrefoilGuildRegistrationStore.getState()
  const membershipYear = getMembershipYearLabel(
    useOrgSettingsStore.getState().membershipYearStartMonth
  )
  const today = todayLocalIso()
  const now = new Date().toISOString()

  const nameKey = norm(submission.name)
  const existingGuild = guilds.find((g) => norm(g.name) === nameKey)

  let guild: TrefoilGuild
  if (existingGuild) {
    guild = {
      ...existingGuild,
      guildNumber: submission.guildNumber || existingGuild.guildNumber,
      address: submission.address || existingGuild.address,
      telNo: submission.telNo || existingGuild.telNo,
      email: submission.email || existingGuild.email,
      district: submission.district || existingGuild.district,
      region: submission.region || existingGuild.region,
      council: submission.council || existingGuild.council
    }
    updateGuild(guild.id, guild)
  } else {
    guild = {
      id: crypto.randomUUID(),
      name: submission.name,
      guildNumber: submission.guildNumber,
      address: submission.address,
      telNo: submission.telNo,
      email: submission.email,
      district: submission.district,
      region: submission.region,
      council: submission.council,
      isActive: true
    }
    addGuild(guild)
  }

  const existingRoster = members.filter((m) => m.trefoilGuildId === guild.id)
  const registrationMembers: RegistrationMember[] = []
  let newCount = 0
  let reRegCount = 0

  for (const sm of submission.members) {
    const match = existingRoster.find(
      (m) => norm(m.fullName) === norm(sm.fullName) && m.birthdate === sm.birthdate
    )
    if (match) {
      reRegCount++
      updateMember(match.id, {
        position: sm.position || match.position,
        beneficiary: sm.beneficiary || match.beneficiary,
        lastRegistrationStatus: 're-reg',
        isActive: true
      })
      registrationMembers.push({
        memberId: match.id,
        position: sm.position,
        fullName: sm.fullName,
        birthdate: sm.birthdate,
        regStatus: 're-reg',
        beneficiary: sm.beneficiary || match.beneficiary
      })
    } else {
      newCount++
      const newMemberId = crypto.randomUUID()
      const newMember: TrefoilGuildMember = {
        id: newMemberId,
        trefoilGuildId: guild.id,
        position: sm.position,
        fullName: sm.fullName,
        birthdate: sm.birthdate,
        beneficiary: sm.beneficiary,
        isActive: true,
        payments: [],
        lastRegistrationStatus: 'new'
      }
      addMember(newMember)
      registrationMembers.push({
        memberId: newMemberId,
        position: sm.position,
        fullName: sm.fullName,
        birthdate: sm.birthdate,
        regStatus: 'new',
        beneficiary: sm.beneficiary
      })
    }
  }

  // No dedicated "Submitted By" field on the mobile submission — the roster's own Chairman row
  // is who actually signs that line; fall back to whoever's account submitted this otherwise.
  const chairman = submission.members.find((m) => /chair/i.test(m.position))

  const rate = emptyRemittance()
  const memberFeeTotal = (newCount + reRegCount) * rate.memberFeePerMember
  const remittance = {
    ...rate,
    memberFeeTotal,
    totalRemittance:
      memberFeeTotal + rate.programDevelopmentFund + rate.mutualAssistanceFundContribution
  }

  const registration: TrefoilGuildRegistration = {
    id: crypto.randomUUID(),
    trefoilGuildId: guild.id,
    schoolYear: membershipYear,
    dateApplied: today,
    registrationStatus: existingGuild ? 're-registered' : 'new',
    members: registrationMembers,
    submittedByName: chairman?.fullName || submission.submittedByName,
    remittance,
    tgGroupFee: TG_GROUP_FEE_DEFAULT,
    cardsIssued: {},
    createdAt: now,
    updatedAt: now
  }
  addRegistration(registration)
}
