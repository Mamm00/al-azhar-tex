import { useI18n } from '../../lib/i18n'
export function EmptyState({ onReset }: { onReset?: () => void }) {
  const { t } = useI18n()
  return (
    <div className="empty-state">
      <p>{t('catalog.empty')}</p>
      {onReset && (
        <button className="btn btn--ghost btn--sm" onClick={onReset} style={{ minInlineSize: '44px', minBlockSize: '44px' }}>
          {t('catalog.reset')}
        </button>
      )}
    </div>
  )
}
