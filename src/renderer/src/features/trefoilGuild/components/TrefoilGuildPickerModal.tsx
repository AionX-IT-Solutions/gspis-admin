import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField } from '@/shared/components/ui/FormField'
import { SearchablePicker } from '@/shared/components/ui/SearchablePicker'
import type { TrefoilGuild } from '../types/trefoilGuild.types'

interface TrefoilGuildPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guilds: TrefoilGuild[]
  onPick: (trefoilGuildId: string) => void
}

export function TrefoilGuildPickerModal({
  open,
  onOpenChange,
  guilds,
  onPick
}: TrefoilGuildPickerModalProps) {
  const { t } = useTranslation()
  const [guildId, setGuildId] = useState('')

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('trefoilGuildRegistration.guildPicker.title')}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" disabled={!guildId} onClick={() => onPick(guildId)}>
            {t('trefoilGuildRegistration.guildPicker.continue')}
          </Button>
        </>
      }
    >
      <FormField label={t('trefoilGuildRegistration.guildPicker.selectGuild')} required>
        <SearchablePicker
          items={guilds.filter((g) => g.isActive)}
          value={guildId}
          onChange={setGuildId}
          getId={(g) => g.id}
          getLabel={(g) => g.name}
          searchPlaceholder={t('trefoilGuildRegistration.guildPicker.placeholder')}
        />
      </FormField>
    </Modal>
  )
}
