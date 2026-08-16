import { BackStrip, Section, Sheet } from '@/components/ui'
import { dict } from '@/lib/i18n'
import { getLang } from '@/lib/lang'
import { NewEndpointForm } from './new-form'

export const dynamic = 'force-dynamic'

export default async function NewEndpointPage() {
  const lang = await getLang()
  const t = dict[lang]

  return (
    <Sheet>
      <BackStrip href="/">{t.events.back}</BackStrip>

      <Section className="px-6 py-6">
        <h1 className="font-serif text-xl font-semibold tracking-tight">{t.newEndpoint.title}</h1>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-muted">
          {t.newEndpoint.intro}
        </p>
        <NewEndpointForm lang={lang} />
      </Section>
    </Sheet>
  )
}
