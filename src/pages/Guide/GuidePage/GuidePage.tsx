import { Chalkboard, Main, Mascot, PageHeader } from '@/components'
import {
  BellRing,
  Calculator,
  CalendarDays,
  CalendarHeart,
  ChartSpline,
  CircleGauge,
  CircleHelp,
  Footprints,
  Plus,
  Settings,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AlertsList, EnvelopeExplainer, FaqList, GuideSection, PushList, StepCard } from './comps'
import useScrollSpy from './hooks/useScrollSpy'

const sections = [
  { id: 'tyden', title: 'Tvůj týden' },
  { id: 'pocitani', title: 'Jak to počítám' },
  { id: 'obrazovky', title: 'Co kde najdeš' },
  { id: 'upozorneni', title: 'Na co upozorním' },
  { id: 'otazky', title: 'Když si nevíš rady' },
]

const screens: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: CalendarDays,
    title: 'Týden',
    text: 'Hlavní obrazovka. Nahoře co je potřeba udělat (jen když něco čeká), pak tržby a výdaje, den po dni, tabule s výplatou pro prodavačku a fixní náklady k odškrtnutí.',
  },
  {
    icon: CalendarHeart,
    title: 'Měsíc',
    text: 'Celý měsíc: jak jsi na tom s fixními náklady (pruh s týdny), tržby, výdaje, výplaty a výsledek měsíce (zeleně v plusu, červeně v mínusu), graf, týdny s uzávěrkami, fixní náklady k odškrtnutí a Zásilkovna.',
  },
  {
    icon: ChartSpline,
    title: 'Přehled',
    text: 'Delší čas: měsíc po měsíci, výsledky měsíců, jak rostou peníze obchodu a součty od otevření.',
  },
  {
    icon: CircleGauge,
    title: 'Kroužek v hlavičce',
    text: 'Vždycky na očích, na každé stránce. Oblouk ukazuje, kolik z fixních nákladů měsíce už máš odloženo, uprostřed je fajfka (odkládáš včas) nebo vykřičník (trochu pozadu) a kolečko s číslem říká, kolik věcí čeká. Klikni a uvidíš detail měsíce, peníze obchodu a úkoly.',
  },
  {
    icon: Plus,
    title: 'Přidat',
    text: 'Tlačítko nahoře (na mobilu kulaté uprostřed dole). Odtud zapíšeš tržbu, výdaj nebo Zásilkovnu.',
  },
  {
    icon: Settings,
    title: 'Nastavení',
    text: 'Fixní náklady, otevírací dny a zavírací doba, upozornění do mobilu, den otevření obchodu, počáteční peníze a skrytá upozornění. V menu pod tvou fotkou.',
  },
]

const GuidePage = () => {
  const activeId = useScrollSpy(sections.map(section => section.id))

  return (
    <Main>
      <PageHeader subtitle='Jak s Obláčkem pracovat a co pro tebe dělá' title='Návod' />

      <div className='grid gap-10 lg:grid-cols-[13rem_1fr]'>
        {/* Table of contents: sticky on desktop, chips on mobile. */}
        <nav className='lg:sticky lg:top-28 lg:self-start'>
          <ul className='flex flex-wrap gap-2 lg:flex-col lg:gap-1'>
            {sections.map(section => (
              <li key={section.id}>
                <a
                  aria-current={activeId === section.id ? 'location' : undefined}
                  className={cn(
                    'block rounded-full px-3 py-1.5 text-sm font-semibold transition-colors',
                    activeId === section.id
                      ? 'bg-olive text-cream shadow-sm'
                      : 'bg-secondary/70 text-olive-soft hover:text-olive lg:bg-transparent lg:hover:bg-secondary/70'
                  )}
                  href={`#${section.id}`}
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className='flex min-w-0 flex-col gap-12'>
          <div className='relative pt-14 md:pt-16'>
            <Mascot className='absolute top-0 right-6 w-20 md:right-10 md:w-24' />
            <Chalkboard title='Ahoj, já jsem Obláček'>
              <p className='font-chalk chalk-text text-2xl leading-snug md:text-3xl'>
                Každý týden ti řeknu, kolik můžeš dát prodavačce, aby zbylo na nákupy i na nájem.
              </p>
              <p className='mt-3 max-w-xl text-sm text-chalk-dim md:text-base'>
                Ty jen zapisuješ tržby a výdaje, já hlídám zbytek: počítám, odkládám, připomínám.
                Nikdy nemusíš nic počítat ručně a ke každému číslu ti ukážu, jak vzniklo.
              </p>
            </Chalkboard>
          </div>

          <GuideSection
            icon={Footprints}
            id='tyden'
            intro='Pár zvyků, a je hotovo. Všechno zapisuj ke dni, kdy se to stalo, ne kdy na to máš čas.'
            title='Tvůj týden'
          >
            <ol className='flex flex-col gap-4'>
              <StepCard
                number={1}
                title='Zapiš tržbu'
                when='Každý den po zavření'
                why='Z tržeb počítám výplatu. Bez nich nevím, kolik peněz obchod má.'
              >
                <p>
                  Nejrychleji v přehledu „Den po dni“: u dnešního dne je políčko{' '}
                  <strong>Tržba dnes</strong>, napiš částku a dej Enter. Jinak{' '}
                  <strong>Přidat → Tržba</strong>. Stačí jedno číslo za den.
                </p>
                <p>Když bylo výjimečně zavřeno, zapiš 0.</p>
              </StepCard>
              <StepCard
                number={2}
                title='Zapiš výdaje'
                when='Kdykoli něco zaplatíš z peněz obchodu'
                why='Výdaje snižují, kolik zbyde. A z nich taky odhadnu, kolik si nechat na nákupy.'
              >
                <p>
                  Zboží, drobnosti, tašky… <strong>Přidat → Výdaj</strong>, částka a den z bločku.
                  Do poznámky napiš, kde to bylo. Poznámky, které píšeš často, ti nabídnu k ťuknutí.
                </p>
                <p>Nájem, elektřinu a další fixní platby sem nepiš, ty mají vlastní místo.</p>
              </StepCard>
              <StepCard
                number={3}
                title='Uzavři týden'
                when='Poslední otevřený den po zavření (teď v pátek)'
                why='Uzávěrka rozdělí peníze: co dostane prodavačka, co se odloží na nájem a co zůstane na nákupy.'
              >
                <p>
                  Na tabuli <strong>„Prodavačce tento týden“</strong> uvidíš, kolik doporučuji
                  vyplatit. Když si chceš nechat na nákupy víc nebo míň, přepiš částku v políčku.
                  Nebo klikni přímo na výplatu a napiš svoji, na nákupy se dopočítá samo.
                </p>
                <p>
                  Pak <strong>Uzavřít týden</strong> a zapiš, kolik jsi prodavačce opravdu dala.
                  Uzavřít jde, až jsou zapsané tržby za všechny otevřené dny.
                </p>
              </StepCard>
              <StepCard
                number={4}
                title='Nakup zboží'
                when='O víkendu'
                why='Platíš z peněz, které sis při uzávěrce nechala na nákupy. Na tabuli pak uvidíš, kolik z nich zbývá.'
              >
                <p>
                  Výdaj zapiš se dnem, kdy jsi nakupovala, třeba v neděli. Patří ještě do uzavřeného
                  týdne a odečte se z peněz na nákupy.
                </p>
              </StepCard>
              <StepCard
                number={5}
                title='Odškrtni zaplacené fixní náklady'
                when='Když zaplatíš nájem, elektřinu…'
                why='Tak vím, co už je zaplacené, a hlídám splatnost toho, co ještě ne.'
              >
                <p>
                  Na tabuli <strong>Fixní náklady</strong> (na Týdnu i na Měsíci) klikni na položku
                  a křídou se odškrtne.
                </p>
              </StepCard>
              <StepCard
                number={6}
                title='Zapiš Zásilkovnu'
                when='Jednou za měsíc, až přijde platba'
                why='Je to příjem navíc a jde rovnou na fixní náklady, takže pak zbyde víc na výplaty.'
              >
                <p>
                  <strong>Přidat → Zásilkovna</strong> a vyber měsíc, za který platba je. Obvykle to
                  je minulý měsíc.
                </p>
              </StepCard>
              <StepCard
                number={7}
                title='Mrkni na kroužek'
                when='Kdykoli otevřeš aplikaci'
                why='Na první pohled víš, jestli je všechno v pořádku, a nic důležitého ti neuteče.'
              >
                <p>
                  Vpravo nahoře je kroužek. <strong>Fajfka</strong> znamená, že na fixní náklady
                  odkládáš včas, <strong>vykřičník</strong>, že je to trochu pozadu. Kolečko s
                  číslem ukazuje, kolik věcí čeká. Klikni na kroužek a uvidíš podrobnosti.
                </p>
              </StepCard>
            </ol>
          </GuideSection>

          <GuideSection
            icon={Calculator}
            id='pocitani'
            intro='Žádná magie, jen pár jednoduchých kroků. U každého čísla v aplikaci je odkaz „Jak se to počítá“.'
            title='Jak to počítám'
          >
            <EnvelopeExplainer />
            <div className='mt-6 rounded-2xl border border-border bg-card p-5'>
              <h3 className='font-bold'>Jak jsi na tom s fixními náklady</h3>
              <p className='mt-1.5 text-sm leading-relaxed text-muted-foreground'>
                Kroužek v hlavičce a pruh na stránce Měsíc ukazují, kolik z fixních nákladů měsíce
                už máš odloženo. Pruh má zářez za každý týden a červenohnědá čárka značí, kolik by
                mělo být odloženo po skončených týdnech, aby na konci měsíce bylo dost. Když jsi
                před ní, <strong>odkládáš včas</strong> a v kroužku je fajfka. Když za ní, je to{' '}
                <strong>trochu pozadu</strong> (v kroužku vykřičník) a dorovná se to v dalších
                týdnech.
              </p>
            </div>
            <ul className='mt-6 grid gap-3 text-sm sm:grid-cols-2'>
              <li className='rounded-2xl bg-secondary/60 p-4'>
                <strong>Nájem nevadí, když zaplatíš dřív.</strong> Zaplacení sníží peníze i to, co
                ještě zbývá zaplatit, takže výpočet zůstane stejný.
              </li>
              <li className='rounded-2xl bg-secondary/60 p-4'>
                <strong>Slabší týden se dorovná.</strong> Když na fixní náklady něco chybí, rozložím
                to do dalších týdnů.
              </li>
              <li className='rounded-2xl bg-secondary/60 p-4'>
                <strong>Zpětné zápisy jsou v pořádku.</strong> Všechno se přepočítá a nic se nezmění
                potichu.
              </li>
              <li className='rounded-2xl bg-secondary/60 p-4'>
                <strong>Týden patří k měsíci podle čtvrtka.</strong> Týden přes přelom měsíce se tak
                nikdy nedělí.
              </li>
            </ul>
          </GuideSection>

          <GuideSection
            icon={Sparkles}
            id='obrazovky'
            intro='Všechno podstatné je na Týdnu. Ostatní obrazovky jsou na delší pohled.'
            title='Co kde najdeš'
          >
            <ul className='grid gap-3 sm:grid-cols-2'>
              {screens.map(({ icon: Icon, title, text }) => (
                <li className='flex gap-3 rounded-2xl border border-border bg-card p-4' key={title}>
                  <span className='flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-olive-soft'>
                    <Icon className='size-4' />
                  </span>
                  <div>
                    <h3 className='text-sm font-bold'>{title}</h3>
                    <p className='mt-0.5 text-sm text-muted-foreground'>{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </GuideSection>

          <GuideSection
            icon={BellRing}
            id='upozorneni'
            intro='Na Týdnu je panel „Co je potřeba udělat“ a jejich počet vidíš i v kroužku v hlavičce. Ozvu se jen, když je opravdu co dělat, a u každé věci je tlačítko, které tě tam rovnou dovede. Kontroly typu „je to správně?“ můžeš skrýt ikonou oka, v Nastavení je zase zobrazíš.'
            title='Na co upozorním'
          >
            <AlertsList />
            <PushList />
          </GuideSection>

          <GuideSection icon={CircleHelp} id='otazky' title='Když si nevíš rady'>
            <FaqList />
          </GuideSection>
        </div>
      </div>
    </Main>
  )
}

export default GuidePage
