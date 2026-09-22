import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField } from '@/shared/components/ui/FormField'
import { SearchablePicker } from '@/shared/components/ui/SearchablePicker'
import type { Troop } from '@/features/troops/types/troop.types'

interface TroopPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  troops: Troop[]
  onPick: (troopId: string) => void
}

export function TroopPickerModal({ open, onOpenChange, troops, onPick }: TroopPickerModalProps) {
  const { t } = useTranslation()
  const [troopId, setTroopId] = useState('')

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('troopRegistration.troopPicker.title')}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" disabled={!troopId} onClick={() => onPick(troopId)}>
            {t('troopRegistration.troopPicker.continue')}
          </Button>
        </>
      }
    >
      <FormField label={t('troopRegistration.troopPicker.selectTroop')} required>
        <SearchablePicker
          items={troops.filter((tr) => tr.isActive)}
          value={troopId}
          onChange={setTroopId}
          getId={(tr) => tr.id}
          getLabel={(tr) => tr.troopNumber}
          getSubLabel={(tr) => tr.troopName || undefined}
          searchPlaceholder={t('troopRegistration.troopPicker.placeholder')}
        />
      </FormField>
    </Modal>
  )
}
