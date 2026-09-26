import { describe, it, expect } from 'vitest'
import { buildRegistrationCashReceipts } from '../../renderer/src/features/scrd/lib/registrationCashReceipts'
import {
  emptyRemittance,
  type TroopRegistration
} from '../../renderer/src/features/troopRegistration/types/troopRegistration.types'
import type {
  FlatFeePayment,
  MemberPayment,
  ScoutMember,
  Troop
} from '../../renderer/src/features/troops/types/troop.types'
import type { ReceiptRecord } from '../../renderer/src/shared/types/receipt.types'
import type { BarangayCommittee } from '../../renderer/src/features/barangayCommittee/types/barangayCommittee.types'
import type {
  IccgMember,
  MemberPayment as IccgMemberPayment
} from '../../renderer/src/features/iccgRegistration/types/iccgMember.types'
import type { OavfMember } from '../../renderer/src/features/oavf/types/oavfMember.types'
import type { OavfRegistration } from '../../renderer/src/features/oavf/types/oavf.types'
import type { HonoraryMember } from '../../renderer/src/features/honoraryMember/types/honoraryMember.types'
import type { HonoraryMemberRegistration } from '../../renderer/src/features/honoraryMember/types/honoraryMemberRegistration.types'
import type { AssociateMember } from '../../renderer/src/features/associateMember/types/associateMember.types'
import type { AssociateMemberRegistration } from '../../renderer/src/features/associateMember/types/associateMemberRegistration.types'

function emptySources() {
  return {
    troopRegistrations: [],
    troops: [],
    scoutMembers: [],
    barangayCommittees: [],
    districtCommittees: [],
    trefoilGuilds: [],
    oavfRegistrations: [],
    oavfMembers: [],
    iccgMembers: [],
    honoraryMemberRegistrations: [],
    honoraryMembers: [],
    associateMemberRegistrations: [],
    associateMembers: []
  }
}

function baseTroop(overrides: Partial<Troop> = {}): Troop {
  return {
    id: 'troop-1',
    troopNumber: '001',
    level: 'Junior',
    leaderName: 'Juana Dela Cruz',
    isActive: true,
    ...overrides
  }
}

function baseTroopRegistration(overrides: Partial<TroopRegistration> = {}): TroopRegistration {
  return {
    id: 'reg-1',
    troopId: 'troop-1',
    schoolYear: '2026-2027',
    dateApplied: '2026-09-25',
    troopStatus: 'new',
    ageLevel: 'Junior',
    leaders: [],
    members: [],
    submittedByName: 'Juana Dela Cruz',
    remittance: {
      ...emptyRemittance(),
      membershipFeeGirlsNew: 500
    },
    troopFee: 7.5,
    cardsIssued: {},
    createdAt: '2026-09-25T00:00:00.000Z',
    updatedAt: '2026-09-25T00:00:00.000Z',
    ...overrides
  }
}

function councilShareReceipt(overrides: Partial<ReceiptRecord> = {}): ReceiptRecord {
  return {
    receiptType: 'service_invoice',
    receiptNumber: 'CSR-0001',
    date: '2026-09-27T00:00:00.000Z',
    payorName: 'Juana Dela Cruz',
    modeOfPayment: 'cash',
    lines: [{ label: 'Membership Fee — Council Share', amount: 10 }],
    cashierName: 'Cashier',
    ...overrides
  }
}

function membershipPayment(overrides: Partial<MemberPayment> = {}): MemberPayment {
  return {
    id: 'pay-membership-1',
    date: '2026-09-26',
    amount: 500,
    category: 'membership',
    // Cash Receipts/SCRD/Budget/Daily Collections only recognize the council share once its
    // second, internal receipt has been printed (see findReceiptedCouncilShare) — defaulted to
    // "already receipted" here so every other test in this file keeps exercising its own
    // scenario; the dedicated gating test below overrides this back to undefined.
    councilShareReceipt: councilShareReceipt(),
    ...overrides
  }
}

function baseScoutMember(overrides: Partial<ScoutMember> = {}): ScoutMember {
  return {
    id: 'member-1',
    troopId: 'troop-1',
    fullName: 'Maria Clara',
    birthdate: '2015-01-01',
    membershipYear: '2026-2027',
    renewedAt: '2026-09-25',
    isActive: true,
    ...overrides
  }
}

describe('buildRegistrationCashReceipts — Troops', () => {
  it('credits nothing for a filed registration with no recorded payment (the reported bug)', () => {
    const rows = buildRegistrationCashReceipts({
      ...emptySources(),
      troops: [baseTroop()],
      troopRegistrations: [baseTroopRegistration()]
    })
    expect(rows).toHaveLength(0)
  })

  it('credits the council-share-of-membership-fee row only once a matching Payment-tab payment exists', () => {
    const rows = buildRegistrationCashReceipts({
      ...emptySources(),
      troops: [baseTroop()],
      troopRegistrations: [baseTroopRegistration()],
      scoutMembers: [baseScoutMember({ payments: [membershipPayment()] })]
    })
    expect(rows).toHaveLength(1)
    expect(rows[0].category).toBe('Membership')
    expect(rows[0].id).toBe('reg-1-troop-fees')
    // The council-share receipt's own date, not the underlying Troop-level payment's date —
    // that's when Council actually recognizes this as its own income.
    expect(rows[0].date).toBe('2026-09-27T00:00:00.000Z')
    // Default rate is ₱10 council share / ₱50 per-member total = a 0.2 ratio; the payment
    // above collected ₱500, so the row should carry ₱100, not the full ₱500.
    expect(rows[0].amount).toBe(100)
  })

  it('credits nothing until the council share has been receipted, even though the underlying membership payment is fully recorded', () => {
    const rows = buildRegistrationCashReceipts({
      ...emptySources(),
      troops: [baseTroop()],
      troopRegistrations: [baseTroopRegistration()],
      scoutMembers: [
        baseScoutMember({ payments: [membershipPayment({ councilShareReceipt: undefined })] })
      ]
    })
    expect(rows).toHaveLength(0)
  })

  it("credits only the council share of what has actually been collected, not the filing's full typed total (the reported bug)", () => {
    // Filed for a whole troop (₱500 total expected), but only one member has paid so far
    // (₱50, the default per-member rate) — the row must reflect ₱10 (₱50 × 0.2), not ₱100
    // (the filing's full ₱500 × 0.2) and not ₱50 (the gross amount collected).
    const rows = buildRegistrationCashReceipts({
      ...emptySources(),
      troops: [baseTroop()],
      troopRegistrations: [baseTroopRegistration()],
      scoutMembers: [baseScoutMember({ payments: [membershipPayment({ amount: 50 })] })]
    })
    expect(rows).toHaveLength(1)
    expect(rows[0].amount).toBe(10)
  })

  it('ignores a membership payment dated before the registration was filed', () => {
    const rows = buildRegistrationCashReceipts({
      ...emptySources(),
      troops: [baseTroop()],
      troopRegistrations: [baseTroopRegistration()],
      scoutMembers: [baseScoutMember({ payments: [membershipPayment({ date: '2025-01-01' })] })]
    })
    expect(rows).toHaveLength(0)
  })

  it('ignores a membership payment recorded for a troop whose latest registration is a different, newer filing', () => {
    const rows = buildRegistrationCashReceipts({
      ...emptySources(),
      troops: [baseTroop()],
      troopRegistrations: [
        baseTroopRegistration({ id: 'reg-old', dateApplied: '2025-09-25' }),
        baseTroopRegistration({ id: 'reg-new', dateApplied: '2026-09-25' })
      ],
      scoutMembers: [baseScoutMember({ payments: [membershipPayment({ date: '2026-09-26' })] })]
    })
    expect(rows).toHaveLength(1)
    expect(rows[0].id).toBe('reg-new-troop-fees')
  })

  it('credits Troop Fees / Thinking Day Fund from an actually recorded flat-fee payment, not the filing', () => {
    const flatFeePayments: FlatFeePayment[] = [
      { id: 'pay-1', date: '2026-09-25', amount: 7.5, category: 'troop_fee' },
      { id: 'pay-2', date: '2026-09-25', amount: 10, category: 'thinking_day' }
    ]
    const rows = buildRegistrationCashReceipts({
      ...emptySources(),
      troops: [baseTroop({ flatFeePayments })],
      // No membership remittance and no matching membership payment — only the flat-fee
      // payments should produce rows.
      troopRegistrations: [
        baseTroopRegistration({ remittance: emptyRemittance(), troopFee: undefined })
      ]
    })
    expect(rows).toHaveLength(2)
    expect(rows.map((r) => r.category).sort()).toEqual(['Thinking Day Fund', 'Troop Fees'])
  })
})

describe('buildRegistrationCashReceipts — Troop Training/Camping Fees', () => {
  // Unlike the GSP Membership Fee, Training/Camping Fees have no National HQ pass-through
  // split, so they're pure Council income credited at face value as soon as the Payment tab
  // records them — no second Council Share Receipt gate, same as the flat Troop Fee/Thinking
  // Day Fund tested above. This is also the only path a Council Budget "Source" rule can now
  // link these to, since the 'troopPayment' Source type was removed in favor of it.
  it('credits nothing when no training/camping payment has been recorded', () => {
    const rows = buildRegistrationCashReceipts({
      ...emptySources(),
      scoutMembers: [baseScoutMember()]
    })
    expect(rows).toHaveLength(0)
  })

  it('credits a Training Fees row at face value from a recorded training payment', () => {
    const rows = buildRegistrationCashReceipts({
      ...emptySources(),
      scoutMembers: [
        baseScoutMember({
          payments: [
            { id: 'pay-training-1', date: '2026-09-25', amount: 150, category: 'training' }
          ]
        })
      ]
    })
    expect(rows).toHaveLength(1)
    expect(rows[0].category).toBe('Training Fees')
    expect(rows[0].amount).toBe(150)
  })

  it('credits a Camping Fees row at face value from a recorded camping payment', () => {
    const rows = buildRegistrationCashReceipts({
      ...emptySources(),
      scoutMembers: [
        baseScoutMember({
          payments: [{ id: 'pay-camping-1', date: '2026-09-25', amount: 300, category: 'camping' }]
        })
      ]
    })
    expect(rows).toHaveLength(1)
    expect(rows[0].category).toBe('Camping Fees')
    expect(rows[0].amount).toBe(300)
  })

  it('never credits a membership-category payment here — that money is handled entirely by the council-share flow above', () => {
    const rows = buildRegistrationCashReceipts({
      ...emptySources(),
      scoutMembers: [baseScoutMember({ payments: [membershipPayment()] })]
    })
    // No troopRegistrations passed in, so the council-share row (which needs a matching
    // registration) can't appear either — confirms this membership payment produces zero rows
    // by itself, not a stray 'Membership' row from this file's training/camping path.
    expect(rows).toHaveLength(0)
  })
})

describe('buildRegistrationCashReceipts — Barangay Committee', () => {
  it('credits nothing from bcGroupFee typed on a registration — only a real flat-fee payment counts', () => {
    const committee: BarangayCommittee = { id: 'bc-1', name: 'Barangay Poblacion', isActive: true }
    const rowsNoPayment = buildRegistrationCashReceipts({
      ...emptySources(),
      barangayCommittees: [committee]
    })
    expect(rowsNoPayment).toHaveLength(0)

    const rowsWithPayment = buildRegistrationCashReceipts({
      ...emptySources(),
      barangayCommittees: [
        {
          ...committee,
          flatFeePayments: [{ id: 'p1', date: '2026-09-25', amount: 200, category: 'bc_group_fee' }]
        }
      ]
    })
    expect(rowsWithPayment).toHaveLength(1)
    expect(rowsWithPayment[0].category).toBe('BC Group Fee')
  })
})

describe('buildRegistrationCashReceipts — ICCG', () => {
  function baseIccgMember(overrides: Partial<IccgMember> = {}): IccgMember {
    return {
      id: 'iccg-member-1',
      troopId: 'troop-1',
      role: 'girl',
      fullName: 'Maria Clara',
      isActive: true,
      ...overrides
    }
  }

  function iccgMembershipPayment(overrides: Partial<IccgMemberPayment> = {}): IccgMemberPayment {
    return {
      id: 'iccg-pay-1',
      date: '2026-09-26',
      amount: 20,
      councilShareAmount: 5,
      category: 'girls_fee',
      // Cash Receipts/SCRD/Budget/Daily Collections only recognize the council share once its
      // second, internal receipt has been printed (see setCouncilShareReceipt) — defaulted to
      // "already receipted" here, same convention as membershipPayment() above.
      councilShareReceipt: {
        receiptType: 'service_invoice',
        receiptNumber: 'CSR-ICCG-0001',
        date: '2026-09-27T00:00:00.000Z',
        payorName: 'Juana Dela Cruz',
        modeOfPayment: 'cash',
        lines: [{ label: 'Council Share', amount: 5 }],
        cashierName: 'Cashier'
      },
      ...overrides
    }
  }

  it('credits nothing for a filed registration with no recorded payment', () => {
    const rows = buildRegistrationCashReceipts({
      ...emptySources(),
      troops: [baseTroop()],
      iccgMembers: [baseIccgMember()]
    })
    expect(rows).toHaveLength(0)
  })

  it('credits the council-share row from the same Payment-tab roster ledger the ICCG registration itself never touches', () => {
    const rows = buildRegistrationCashReceipts({
      ...emptySources(),
      troops: [baseTroop()],
      iccgMembers: [baseIccgMember({ payments: [iccgMembershipPayment()] })]
    })
    expect(rows).toHaveLength(1)
    expect(rows[0].category).toBe('ICCG Registration Fee')
    expect(rows[0].amount).toBe(5)
    // The council-share receipt's own date, not the underlying payment's date.
    expect(rows[0].date).toBe('2026-09-27T00:00:00.000Z')
  })

  it('credits nothing until the council share has been receipted, even though the underlying payment is fully recorded', () => {
    const rows = buildRegistrationCashReceipts({
      ...emptySources(),
      troops: [baseTroop()],
      iccgMembers: [
        baseIccgMember({ payments: [iccgMembershipPayment({ councilShareReceipt: undefined })] })
      ]
    })
    expect(rows).toHaveLength(0)
  })
})

describe('buildRegistrationCashReceipts — OAVF/Career Woman', () => {
  function baseOavfMember(overrides: Partial<OavfMember> = {}): OavfMember {
    return {
      id: 'oavf-member-1',
      lastName: 'Reyes',
      firstName: 'Ana',
      middleInitial: '',
      civilStatus: 'Single',
      sex: 'Female',
      birthdate: '1990-01-01',
      mobileNo: '',
      email: '',
      homeAddress: '',
      religion: '',
      educationalAttainment: '',
      profession: '',
      occupation: '',
      interests: '',
      otherOrgAffiliated: '',
      beneficiary: '',
      beneficiaryContactNo: '',
      council: '',
      region: '',
      isActive: true,
      ...overrides
    }
  }

  function baseOavfRegistration(overrides: Partial<OavfRegistration> = {}): OavfRegistration {
    return {
      id: 'oavf-reg-1',
      oavfMemberId: 'oavf-member-1',
      schoolYear: '2026-2027',
      dateApplied: '2026-09-25',
      wasGirlScout: false,
      gsRegion: '',
      gsCouncil: '',
      dateLastRegistered: '',
      gsPosition: '',
      membershipFeeTotal: 100,
      membershipFeeCouncilShare: 25,
      arNumber: 'AR-0001',
      arDate: '2026-09-25',
      processedByName: 'Cashier',
      createdAt: '2026-09-25T00:00:00.000Z',
      createdBy: 'Cashier',
      ...overrides
    }
  }

  it('credits nothing for a registration with no council share recorded yet', () => {
    const rows = buildRegistrationCashReceipts({
      ...emptySources(),
      oavfMembers: [baseOavfMember()],
      oavfRegistrations: [baseOavfRegistration({ membershipFeeCouncilShare: 0 })]
    })
    expect(rows).toHaveLength(0)
  })

  it('credits nothing until the council share receipt has been printed, even though the applicant-facing payment is fully recorded', () => {
    const rows = buildRegistrationCashReceipts({
      ...emptySources(),
      oavfMembers: [baseOavfMember()],
      oavfRegistrations: [baseOavfRegistration()]
    })
    expect(rows).toHaveLength(0)
  })

  it('credits the council share once its own receipt has been printed, dated by that receipt', () => {
    const rows = buildRegistrationCashReceipts({
      ...emptySources(),
      oavfMembers: [baseOavfMember()],
      oavfRegistrations: [
        baseOavfRegistration({
          councilShareReceipt: {
            receiptType: 'service_invoice',
            receiptNumber: 'CSR-0001',
            date: '2026-09-27T00:00:00.000Z',
            payorName: 'Ana Reyes',
            modeOfPayment: 'cash',
            lines: [{ label: 'Council Share', amount: 25 }],
            cashierName: 'Cashier'
          }
        })
      ]
    })
    expect(rows).toHaveLength(1)
    expect(rows[0].category).toBe('OAVF/Career Woman Membership Fee')
    expect(rows[0].amount).toBe(25)
    expect(rows[0].date).toBe('2026-09-27T00:00:00.000Z')
    expect(rows[0].referenceNumber).toBe('CSR-0001')
  })
})

describe('buildRegistrationCashReceipts — Honorary Member', () => {
  function baseHonoraryMember(overrides: Partial<HonoraryMember> = {}): HonoraryMember {
    return {
      id: 'honorary-member-1',
      lastName: 'Santos',
      firstName: 'Pedro',
      middleInitial: '',
      civilStatus: 'Married',
      sex: 'Male',
      council: '',
      region: '',
      nhq: '',
      homeAddress: '',
      phone: '',
      email: '',
      businessAddress: '',
      businessPhone: '',
      profession: '',
      occupation: '',
      beneficiary: '',
      isActive: true,
      ...overrides
    }
  }

  function baseHonoraryMemberRegistration(
    overrides: Partial<HonoraryMemberRegistration> = {}
  ): HonoraryMemberRegistration {
    return {
      id: 'honorary-reg-1',
      honoraryMemberId: 'honorary-member-1',
      schoolYear: '2026-2027',
      dateApplied: '2026-09-25',
      wasGirlScout: false,
      dateLastRegistered: '',
      position: '',
      membershipFeeTotal: 150,
      membershipFeeCouncilShare: 60,
      arNumber: 'AR-0001',
      arDate: '2026-09-25',
      processedByName: 'Cashier',
      createdAt: '2026-09-25T00:00:00.000Z',
      createdBy: 'Cashier',
      ...overrides
    }
  }

  it('credits nothing until the council share receipt has been printed, even though the honoree-facing payment is fully recorded', () => {
    const rows = buildRegistrationCashReceipts({
      ...emptySources(),
      honoraryMembers: [baseHonoraryMember()],
      honoraryMemberRegistrations: [baseHonoraryMemberRegistration()]
    })
    expect(rows).toHaveLength(0)
  })

  it('credits the council share once its own receipt has been printed, dated by that receipt', () => {
    const rows = buildRegistrationCashReceipts({
      ...emptySources(),
      honoraryMembers: [baseHonoraryMember()],
      honoraryMemberRegistrations: [
        baseHonoraryMemberRegistration({
          councilShareReceipt: {
            receiptType: 'service_invoice',
            receiptNumber: 'CSR-0002',
            date: '2026-09-28T00:00:00.000Z',
            payorName: 'Pedro Santos',
            modeOfPayment: 'cash',
            lines: [{ label: 'Council Share', amount: 60 }],
            cashierName: 'Cashier'
          }
        })
      ]
    })
    expect(rows).toHaveLength(1)
    expect(rows[0].category).toBe('Honorary Member Fee')
    expect(rows[0].amount).toBe(60)
    expect(rows[0].date).toBe('2026-09-28T00:00:00.000Z')
    expect(rows[0].referenceNumber).toBe('CSR-0002')
  })
})

describe('buildRegistrationCashReceipts — Associate Member', () => {
  function baseAssociateMember(overrides: Partial<AssociateMember> = {}): AssociateMember {
    return {
      id: 'associate-member-1',
      lastName: 'Cruz',
      firstName: 'Liza',
      middleInitial: '',
      civilStatus: 'Single',
      sex: 'Female',
      council: '',
      region: '',
      homeAddress: '',
      phone: '',
      email: '',
      businessAddress: '',
      businessPhone: '',
      profession: '',
      occupation: '',
      beneficiary: '',
      isActive: true,
      ...overrides
    }
  }

  function baseAssociateMemberRegistration(
    overrides: Partial<AssociateMemberRegistration> = {}
  ): AssociateMemberRegistration {
    return {
      id: 'associate-reg-1',
      associateMemberId: 'associate-member-1',
      amfNumber: '001',
      series: '2026',
      schoolYear: '2026-2027',
      dateApplied: '2026-09-25',
      wasGirlScout: false,
      dateLastRegistered: '',
      position: '',
      membershipFeeTotal: 50,
      membershipFeeCouncilShare: 20,
      arNumber: 'AR-0001',
      arDate: '2026-09-25',
      processedByName: 'Cashier',
      createdAt: '2026-09-25T00:00:00.000Z',
      createdBy: 'Cashier',
      ...overrides
    }
  }

  it('credits nothing until the council share receipt has been printed, even though the applicant-facing payment is fully recorded', () => {
    const rows = buildRegistrationCashReceipts({
      ...emptySources(),
      associateMembers: [baseAssociateMember()],
      associateMemberRegistrations: [baseAssociateMemberRegistration()]
    })
    expect(rows).toHaveLength(0)
  })

  it('credits the council share once its own receipt has been printed, dated by that receipt', () => {
    const rows = buildRegistrationCashReceipts({
      ...emptySources(),
      associateMembers: [baseAssociateMember()],
      associateMemberRegistrations: [
        baseAssociateMemberRegistration({
          councilShareReceipt: {
            receiptType: 'service_invoice',
            receiptNumber: 'CSR-0003',
            date: '2026-09-29T00:00:00.000Z',
            payorName: 'Liza Cruz',
            modeOfPayment: 'cash',
            lines: [{ label: 'Council Share', amount: 20 }],
            cashierName: 'Cashier'
          }
        })
      ]
    })
    expect(rows).toHaveLength(1)
    expect(rows[0].category).toBe('Associate Member Fee')
    expect(rows[0].amount).toBe(20)
    expect(rows[0].date).toBe('2026-09-29T00:00:00.000Z')
    expect(rows[0].referenceNumber).toBe('CSR-0003')
  })
})
