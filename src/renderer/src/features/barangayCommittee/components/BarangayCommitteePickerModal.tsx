import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField } from '@/shared/components/ui/FormField'
import { SearchablePicker } from '@/shared/components/ui/SearchablePicker'
import type { BarangayCommittee } from '../types/barangayCommittee.types'

interface BarangayCommitteePickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  committees: BarangayCommittee[]
  onPick: (barangayCommitteeId: string) => void
}

export function BarangayCommitteePickerModal({
  open,
  onOpenChange,
  committees,
  onPick
}: BarangayCommitteePickerModalProps) {
  const { t } = useTranslation()
  const [committeeId, setCommitteeId] = useState('')

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('barangayCommitteeRegistration.committeePicker.title')}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!committeeId}
            onClick={() => onPick(committeeId)}
          >
            {t('barangayCommitteeRegistration.committeePicker.continue')}
          </Button>
        </>
      }
    >
      <FormField
        label={t('barangayCommitteeRegistration.committeePicker.selectCommittee')}
        required
      >
        <SearchablePicker
          items={committees.filter((c) => c.isActive)}
          value={committeeId}
          onChange={setCommitteeId}
          getId={(c) => c.id}
          getLabel={(c) => c.name}
          searchPlaceholder={t('barangayCommitteeRegistration.committeePicker.placeholder')}
        />
      </FormField>
    </Modal>
  )
}
