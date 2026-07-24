import { useEffect, useRef, useState, type CSSProperties } from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import './App.css'
import {
  getHeaderMorphLayout,
  getHeaderRenderKey,
  isHeaderMorphEnabled,
  smoothHeaderProgress,
} from './headerMotion.ts'
import {
  HERO_FONT_SIZE_MAX,
  HERO_FONT_SIZE_MIN,
  getMobileHeroFontSize,
  heroFonts,
  normalizeHeroAlignment,
  normalizeHeroFont,
  normalizeHeroFontSize,
  type HeroAlignment,
  type HeroFont,
} from './heroTweaks.ts'

type HeaderVariant =
  | 'full-width'
  | 'floating'
  | 'split'
  | 'scroll-morph'
  | 'motion-morph'

const projects = [
  {
    number: '01',
    client: 'Microsoft 365 Copilot',
    year: '2025',
    title: 'Designing transparency into AI answers',
    summary:
      'A sources experience that makes cited, uncited, and searched information easier to inspect and trust.',
    outcome: 'A foundation for Copilot’s trust experience',
    href: 'https://www.paramranjan.com/sfc',
    visual: 'copilot',
  },
  {
    number: '02',
    client: 'Enterprise banking',
    year: '2022',
    title: 'Unifying complex payment workflows',
    summary:
      'A multi-year redesign that brought fragmented vendor payments into one clear, scalable corporate banking journey.',
    outcome: 'Shaped and validated a scalable MVP',
    href: 'https://www.paramranjan.com/_files/ugd/2fbc36_3860cad31dbe4c0fa1c1b8c28e4d0560.pdf',
    visual: 'banking',
  },
  {
    number: '03',
    client: 'Adobe design challenge',
    year: '2019',
    title: 'Making a blank canvas less intimidating',
    summary:
      'A three-day exploration of how Illustrator could help first-time users make confident document choices.',
    outcome: 'Concept, research, interaction and visual design',
    href: 'https://www.paramranjan.com/adc',
    visual: 'adobe',
  },
]

const playground = [
  {
    label: 'Sound',
    title: 'Stories for the dance floor',
    meta: 'DJ sets and sonic experiments as rhyms',
    href: 'https://soundcloud.com/rhymss',
    className: 'play-card--sound',
  },
  {
    label: 'Light',
    title: 'Looking a little closer',
    meta: 'Photography, fragments and visual observations',
    href: 'https://www.instagram.com/rhyms_/',
    className: 'play-card--light',
  },
  {
    label: 'Curiosity',
    title: 'Ideas outside the Figma file',
    meta: 'Psychology, F1, technology and unfinished thoughts',
    href: 'https://www.paramranjan.com/about',
    className: 'play-card--notes',
  },
]

function LocalTime() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(new Date()),
      )
    }

    updateTime()
    const timer = window.setInterval(updateTime, 60_000)
    return () => window.clearInterval(timer)
  }, [])

  return <span>{time || '--:--'} IST</span>
}

function CopilotVisual() {
  return (
    <div className="project-art project-art--copilot" aria-hidden="true">
      <div className="copilot-glow" />
      <div className="copilot-window">
        <div className="window-bar">
          <i />
          <i />
          <i />
        </div>
        <div className="answer-lines">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="source-chip source-chip--one">01</div>
        <div className="source-chip source-chip--two">02</div>
      </div>
      <div className="sources-panel">
        <div className="sources-heading">
          <span>Sources</span>
          <span>04</span>
        </div>
        {[1, 2, 3].map((item) => (
          <div className="source-row" key={item}>
            <span>0{item}</span>
            <i />
          </div>
        ))}
      </div>
      <div className="art-label">TRUST / TRANSPARENCY / AI</div>
    </div>
  )
}

function BankingVisual() {
  return (
    <div className="project-art project-art--banking" aria-hidden="true">
      <div className="bank-grid" />
      <div className="bank-window">
        <div className="bank-sidebar">
          <strong>PR</strong>
          {[1, 2, 3, 4].map((item) => (
            <i key={item} />
          ))}
        </div>
        <div className="bank-content">
          <div className="bank-title">
            <span />
            <i />
          </div>
          <div className="bank-stat-row">
            <div>
              <small>PAYMENTS</small>
              <strong>248</strong>
            </div>
            <div>
              <small>APPROVALS</small>
              <strong>32</strong>
            </div>
          </div>
          <div className="bank-table">
            {[1, 2, 3, 4].map((item) => (
              <span key={item}>
                <i />
                <b />
                <em />
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="orbit orbit--one" />
      <div className="orbit orbit--two" />
      <div className="art-label">SYSTEMS / WORKFLOWS / SCALE</div>
    </div>
  )
}

function AdobeVisual() {
  return (
    <div className="project-art project-art--adobe" aria-hidden="true">
      <div className="adobe-word">NEW</div>
      <div className="preset preset--one">
        <span>A4</span>
      </div>
      <div className="preset preset--two">
        <span>WEB</span>
      </div>
      <div className="preset preset--three">
        <span>POST</span>
      </div>
      <div className="adobe-cursor">↖</div>
      <div className="art-label">ONBOARDING / CLARITY / CRAFT</div>
    </div>
  )
}

function ProjectVisual({ type }: { type: string }) {
  if (type === 'copilot') return <CopilotVisual />
  if (type === 'banking') return <BankingVisual />
  return <AdobeVisual />
}

function App() {
  const [afterHours, setAfterHours] = useState(false)
  const [headerVariant, setHeaderVariant] = useState<HeaderVariant>(() => {
    const saved = localStorage.getItem('portfolio-header-variant')
    return saved === 'floating' ||
      saved === 'split' ||
      saved === 'scroll-morph' ||
      saved === 'motion-morph'
      ? saved
      : 'full-width'
  })
  const [tweaksOpen, setTweaksOpen] = useState(false)
  const [heroAlignment, setHeroAlignment] = useState<HeroAlignment>(() =>
    normalizeHeroAlignment(
      localStorage.getItem('portfolio-hero-alignment'),
    ),
  )
  const [heroFontSize, setHeroFontSize] = useState(() =>
    normalizeHeroFontSize(localStorage.getItem('portfolio-hero-font-size')),
  )
  const [heroFont, setHeroFont] = useState<HeroFont>(() =>
    normalizeHeroFont(localStorage.getItem('portfolio-hero-font')),
  )
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth)
  const headerRef = useRef<HTMLElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const { scrollY } = useScroll()
  const motionProgress = useMotionValue(
    Math.min(Math.max(window.scrollY / 180, 0), 1),
  )
  const motionEnabled =
    headerVariant === 'motion-morph' &&
    isHeaderMorphEnabled(viewportWidth, shouldReduceMotion)
  const hybridEnabled =
    headerVariant === 'scroll-morph' &&
    isHeaderMorphEnabled(viewportWidth, shouldReduceMotion)
  const { pagePadding, floatingInset } =
    getHeaderMorphLayout(viewportWidth)
  const selectedHeroFont =
    heroFonts.find((font) => font.value === heroFont) ?? heroFonts[0]
  const heroStyle: CSSProperties & {
    '--hero-font-family': string
    '--hero-font-size': string
    '--hero-mobile-font-size': string
  } = {
    '--hero-font-family': selectedHeroFont.family,
    '--hero-font-size': `${heroFontSize}px`,
    '--hero-mobile-font-size': `${getMobileHeroFontSize(heroFontSize)}px`,
  }
  const motionTop = useTransform(motionProgress, [0, 1], [0, 14])
  const motionInset = useTransform(
    motionProgress,
    [0, 1],
    [0, floatingInset],
  )
  const motionHeight = useTransform(motionProgress, [0, 1], [72, 54])
  const motionPadding = useTransform(
    motionProgress,
    [0, 1],
    [pagePadding, 22],
  )
  const motionRadius = useTransform(motionProgress, [0, 1], [0, 999])
  const motionBorderColor = useTransform(
    motionProgress,
    [0, 1],
    ['rgba(241, 240, 235, 0)', 'rgba(241, 240, 235, 0.18)'],
  )
  const motionDivider = useTransform(
    motionProgress,
    [0, 1],
    [
      'inset 0 -1px 0 rgba(241, 240, 235, 0.18)',
      'inset 0 -1px 0 rgba(241, 240, 235, 0)',
    ],
  )
  const motionHeaderStyle = motionEnabled
    ? {
        top: motionTop,
        right: motionInset,
        left: motionInset,
        height: motionHeight,
        paddingLeft: motionPadding,
        paddingRight: motionPadding,
        borderRadius: motionRadius,
        borderColor: motionBorderColor,
        boxShadow: motionDivider,
      }
    : undefined

  useAnimationFrame(() => {
    if (!motionEnabled) return

    const targetProgress = Math.min(Math.max(scrollY.get() / 180, 0), 1)
    const currentProgress = motionProgress.get()
    const nextProgress = smoothHeaderProgress(
      currentProgress,
      targetProgress,
    )

    if (nextProgress !== currentProgress) {
      motionProgress.set(nextProgress)
    }
  })

  useEffect(() => {
    localStorage.setItem('portfolio-header-variant', headerVariant)
  }, [headerVariant])

  useEffect(() => {
    localStorage.setItem('portfolio-hero-alignment', heroAlignment)
  }, [heroAlignment])

  useEffect(() => {
    localStorage.setItem('portfolio-hero-font-size', String(heroFontSize))
  }, [heroFontSize])

  useEffect(() => {
    localStorage.setItem('portfolio-hero-font', heroFont)
  }, [heroFont])

  useEffect(() => {
    if (!motionEnabled) return

    motionProgress.set(Math.min(Math.max(scrollY.get() / 180, 0), 1))
  }, [motionEnabled, motionProgress, scrollY])

  useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(window.innerWidth)

    window.addEventListener('resize', updateViewportWidth)
    return () => window.removeEventListener('resize', updateViewportWidth)
  }, [])

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    if (!hybridEnabled) {
      header.style.removeProperty('--hybrid-top')
      header.style.removeProperty('--hybrid-inset')
      header.style.removeProperty('--hybrid-height')
      header.style.removeProperty('--hybrid-radius')
      header.style.removeProperty('--hybrid-padding')
      header.style.removeProperty('--hybrid-border-opacity')
      header.style.removeProperty('--hybrid-divider-opacity')
      return
    }

    let currentProgress = Math.min(Math.max(window.scrollY / 180, 0), 1)
    let targetProgress = currentProgress
    let frame = 0

    const render = () => {
      currentProgress = smoothHeaderProgress(
        currentProgress,
        targetProgress,
      )

      const { pagePadding, floatingInset } = getHeaderMorphLayout(
        window.innerWidth,
      )
      const padding = pagePadding + (22 - pagePadding) * currentProgress

      header.style.setProperty(
        '--hybrid-top',
        `${14 * currentProgress}px`,
      )
      header.style.setProperty(
        '--hybrid-inset',
        `${floatingInset * currentProgress}px`,
      )
      header.style.setProperty(
        '--hybrid-height',
        `${72 - 18 * currentProgress}px`,
      )
      header.style.setProperty(
        '--hybrid-radius',
        `${999 * currentProgress}px`,
      )
      header.style.setProperty('--hybrid-padding', `${padding}px`)
      header.style.setProperty(
        '--hybrid-border-opacity',
        `${0.18 * currentProgress}`,
      )
      header.style.setProperty(
        '--hybrid-divider-opacity',
        `${0.18 * (1 - currentProgress)}`,
      )

      if (currentProgress !== targetProgress) {
        frame = window.requestAnimationFrame(render)
      }
    }

    const updateTarget = () => {
      targetProgress = Math.min(Math.max(window.scrollY / 180, 0), 1)
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(render)
    }

    render()
    window.addEventListener('scroll', updateTarget, { passive: true })
    window.addEventListener('resize', updateTarget)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', updateTarget)
      window.removeEventListener('resize', updateTarget)
    }
  }, [hybridEnabled])

  return (
    <div className={afterHours ? 'site site--after-hours' : 'site'}>
      <div className="noise-overlay" aria-hidden="true">
        <div className="noise-overlay__tile" />
      </div>
      <motion.header
        key={getHeaderRenderKey(motionEnabled)}
        ref={headerRef}
        className="site-header"
        data-variant={headerVariant}
        style={motionHeaderStyle}
      >
        <a className="wordmark" href="#top" aria-label="Param Ranjan, home">
          PR<span>®</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#work">Work</a>
          <span className="header-disabled" aria-disabled="true">
            About
          </span>
          <a href="#playground">Playground</a>
        </nav>
        <a className="header-contact" href="#contact">
          Connect <span>↗</span>
        </a>
      </motion.header>

      <main>
        <section
          className="hero"
          id="top"
          data-hero-alignment={heroAlignment}
          data-hero-font={heroFont}
          style={heroStyle}
        >
          <div className="hero-copy">
            <p className="eyebrow">Designer / DJ / Perpetually curious</p>
            <h1>
              Product designer working at the intersection of{' '}
              <em>scale, craft and complex systems.</em> Currently working at
              Microsoft.
            </h1>
          </div>

          <div className="hero-footer">
            <a href="#work">
              Selected work <span>↓</span>
            </a>
          </div>
        </section>

        <section className="work section-shell" id="work">
          <div className="section-heading">
            <p className="section-kicker">01 / Selected work</p>
            <h2>Shipped with intent.</h2>
            <p>
              A selection of enterprise systems and product experiences shaped
              through research, collaboration and attention to detail.
            </p>
          </div>

          <div className="project-list">
            {projects.map((project) => (
              <article className="project-card" key={project.number}>
                <a
                  href={project.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`View ${project.title} case study`}
                >
                  <ProjectVisual type={project.visual} />
                  <div className="project-content">
                    <div className="project-topline">
                      <span>{project.number}</span>
                      <span>{project.client}</span>
                      <span>{project.year}</span>
                    </div>
                    <h3>{project.title}</h3>
                    <div className="project-details">
                      <p>{project.summary}</p>
                      <p className="project-outcome">
                        <span>Outcome</span>
                        {project.outcome}
                      </p>
                    </div>
                    <div className="project-link">
                      View case study <span>↗</span>
                    </div>
                  </div>
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="playground section-shell" id="playground">
          <div className="section-heading section-heading--playground">
            <div>
              <p className="section-kicker">02 / Playground</p>
              <h2>Outside the Figma file.</h2>
            </div>
            <p>
              The other things that keep my eyes open and my brain pleasantly
              noisy.
            </p>
          </div>

          <div className="play-grid">
            {playground.map((item, index) => (
              <a
                className={`play-card ${item.className}`}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                key={item.title}
              >
                <div className="play-card__visual" aria-hidden="true">
                  <span className="play-card__index">0{index + 1}</span>
                  <div className="play-card__shape" />
                </div>
                <div className="play-card__content">
                  <span>{item.label}</span>
                  <h3>{item.title}</h3>
                  <p>{item.meta}</p>
                </div>
                <span className="play-card__arrow">↗</span>
              </a>
            ))}
          </div>
        </section>

        <section className="currently">
          <p className="section-kicker">Currently</p>
          <div className="currently-track">
            <span>Designing for M365 Copilot</span>
            <i />
            <span>Mixing as rhyms</span>
            <i />
            <span>Nerding out on human psychology</span>
            <i />
            <span>Following Formula 1</span>
            <i />
            <span>Growing a small jungle</span>
          </div>
        </section>
      </main>

      <footer id="contact">
        <div className="footer-grid">
          <p>
            Always Observing, Always Learning.
          </p>
          <div className="footer-links">
            <a
              href="https://www.paramranjan.com/_files/ugd/2fbc36_10176191bfd34a29918a4aac3b727f4b.pdf"
              target="_blank"
              rel="noreferrer"
            >
              Resume <span>↗</span>
            </a>
            <a
              href="https://soundcloud.com/rhymss"
              target="_blank"
              rel="noreferrer"
            >
              SoundCloud <span>↗</span>
            </a>
            <a
              href="https://www.instagram.com/rhyms_/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram <span>↗</span>
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Param Ranjan</span>
          <span className="footer-location">
            Hyderabad, IN <LocalTime />
          </span>
          <button
            type="button"
            className="after-hours-toggle"
            aria-pressed={afterHours}
            onClick={() => setAfterHours((current) => !current)}
          >
            <span className="toggle-dot" />
            {afterHours ? 'Work mode' : 'After hours'}
          </button>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>

      <div className="header-tweaks">
        {tweaksOpen && (
          <div className="header-tweaks__panel">
            <div className="header-tweaks__heading">
              <div>
                <span>Design tweaks</span>
                <strong>Experiments</strong>
              </div>
              <button
                type="button"
                aria-label="Close tweaks"
                onClick={() => setTweaksOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="header-tweaks__section">
              <span className="header-tweaks__label">Header layout</span>
              <div className="header-tweaks__options">
                {(
                  [
                    ['full-width', 'Full width'],
                    ['floating', 'Floating'],
                    ['split', 'Split'],
                    ['scroll-morph', 'Hybrid scroll'],
                    ['motion-morph', 'Motion morph'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    type="button"
                    aria-pressed={headerVariant === value}
                    onClick={() => setHeaderVariant(value)}
                    key={value}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="header-tweaks__section">
              <span className="header-tweaks__label">Hero alignment</span>
              <div className="header-tweaks__options">
                {(
                  [
                    ['left', 'Left aligned'],
                    ['center', 'Center aligned'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    type="button"
                    aria-pressed={heroAlignment === value}
                    onClick={() => setHeroAlignment(value)}
                    key={value}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="header-tweaks__section">
              <label
                className="header-tweaks__range-label"
                htmlFor="hero-font-size"
              >
                <span>Hero font size</span>
                <output htmlFor="hero-font-size">{heroFontSize}px</output>
              </label>
              <input
                id="hero-font-size"
                className="header-tweaks__range"
                type="range"
                min={HERO_FONT_SIZE_MIN}
                max={HERO_FONT_SIZE_MAX}
                step="1"
                value={heroFontSize}
                onChange={(event) =>
                  setHeroFontSize(
                    normalizeHeroFontSize(event.currentTarget.value),
                  )
                }
              />
            </div>

            <div className="header-tweaks__section">
              <span className="header-tweaks__label">Hero font</span>
              <div className="header-tweaks__options header-tweaks__options--fonts">
                {heroFonts.map((font) => (
                  <button
                    type="button"
                    aria-pressed={heroFont === font.value}
                    onClick={() => setHeroFont(font.value)}
                    style={{ fontFamily: font.family }}
                    key={font.value}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        <button
          type="button"
          className="header-tweaks__trigger"
          aria-expanded={tweaksOpen}
          onClick={() => setTweaksOpen((open) => !open)}
        >
          Tweaks
        </button>
      </div>
    </div>
  )
}

export default App
