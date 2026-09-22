import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField } from '@/shared/components/ui/FormField'
import { SearchablePicker } from '@/shared/components/ui/SearchablePicker'
import type { DistrictCommittee } from '../types/districtCommittee.types'

interface DistrictCommitteePickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  committees: DistrictCommittee[]
  onPick: (districtCommitteeId: string) => void
}

export function DistrictCommitteePickerModal({
  open,
  onOpenChange,
  committees,
  onPick
}: DistrictCommitteePickerModalProps) {
  const { t } = useTranslation()
  const [committeeId, setCommitteeId] = useState('')

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('districtCommitteeRegistration.committeePicker.title')}
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
            {t('districtCommitteeRegistration.committeePicker.continue')}
          </Button>
        </>
      }
    >
      <FormField
        label={t('districtCommitteeRegistration.committeePicker.selectCommittee')}
        required
      >
        <SearchablePicker
          items={committees.filter((c) => c.isActive)}
          value={committeeId}
          onChange={setCommitteeId}
          getId={(c) => c.id}
          getLabel={(c) => c.name}
          searchPlaceholder={t('districtCommitteeRegistration.committeePicker.placeholder')}
        />
      </FormField>
    </Modal>
  )
}
