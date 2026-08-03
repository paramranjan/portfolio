import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { motion } from 'motion/react'
import './App.css'
import {
  getHeaderMorphLayout,
  getResponsiveHeaderProgress,
  getHeaderScrollProgress,
  getHeaderShapeProgress,
  isHeaderMorphEnabled,
} from './headerMotion.ts'
import {
  ASCII_ASSEMBLY_END_DEFAULT,
  ASCII_COPY_DELAY_DEFAULT,
  ASCII_COPY_DURATION_DEFAULT,
  ASCII_COPY_RISE_DEFAULT,
  ASCII_DENSITY_MAX,
  ASCII_DENSITY_MIN,
  ASCII_DEPTH_MAX,
  ASCII_DEPTH_MIN,
  ASCII_DURATION_MAX,
  ASCII_DURATION_MIN,
  ASCII_PLAY_INTENSITY_DEFAULT,
  ASCII_PLAY_SPEED_DEFAULT,
  ASCII_SCALE_MAX,
  ASCII_SCALE_MIN,
  ASCII_REVEAL_DURATION_DEFAULT,
  ASCII_ROTATION_END_DEFAULT,
  ASCII_START_ROTATION_DEFAULT,
  ASCII_TILT_MAX,
  ASCII_TILT_MIN,
  ASCII_TRAVEL_DURATION_MAX,
  ASCII_TRAVEL_DURATION_MIN,
  ASCII_TRAVEL_DURATION_DEFAULT,
  asciiPalettes,
  getAsciiEasingCss,
  normalizeAsciiCameraResponse,
  normalizeAsciiDensity,
  normalizeAsciiDepth,
  normalizeAsciiDuration,
  normalizeAsciiPalette,
  normalizeAsciiRestState,
  normalizeAsciiScale,
  normalizeAsciiTilt,
  normalizeAsciiTravelDuration,
  type AsciiCameraResponse,
  type AsciiPalette,
} from './asciiTweaks.ts'
import {
  getMobileHeroFontSize,
  heroFonts,
  type HeroAlignment,
  type HeroFont,
} from './heroTweaks.ts'
import { AsciiLogo } from './AsciiLogo.tsx'
import { HeaderAsciiMark } from './HeaderAsciiMark.tsx'
import { CursorBallLauncher } from './CursorBallLauncher.tsx'
import { normalizeCursorBallEnabled } from './cursorBallPhysics.ts'
import {
  HEADER_ASCII_REVEAL_DELAY_MAX,
  HEADER_ASCII_REVEAL_DELAY_MIN,
  getHeaderTitleText,
  headerMarkOptions,
  headerTitleOptions,
  normalizeHeaderAsciiDensity,
  normalizeHeaderAsciiRevealDelay,
  normalizeHeaderMark,
  normalizeHeaderTitle,
  type HeaderMark,
  type HeaderTitle,
} from './headerIdentity.ts'
import {
  normalizePortfolioLayout,
  portfolioLayoutOptions,
  type PortfolioLayout,
} from './layoutTweaks.ts'

type HeaderVariant =
  | 'full-width'
  | 'floating'
  | 'split'
  | 'scroll-morph'
  | 'motion-morph'

function useLiveReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )
    const updatePreference = () => setReducedMotion(mediaQuery.matches)

    updatePreference()
    mediaQuery.addEventListener('change', updatePreference)
    return () => mediaQuery.removeEventListener('change', updatePreference)
  }, [])

  return reducedMotion
}

const HERO_REPLAY_PROXIMITY_MARGIN = 160
const IMPROVED_HEADLINE_STAGGER = 50
const PORTFOLIO_LAYOUT_STORAGE_KEY = 'portfolio-page-layout-v1'
const CURSOR_BALL_STORAGE_KEY = 'portfolio-cursor-ball-v1'
const HEADER_IDENTITY_STORAGE_KEYS = {
  title: 'portfolio-header-title-v1',
  mark: 'portfolio-header-mark-v1',
  scale: 'portfolio-header-ascii-scale-v1',
  density: 'portfolio-header-ascii-density-v2',
  depth: 'portfolio-header-ascii-depth-v1',
  tilt: 'portfolio-header-ascii-tilt-v1',
  palette: 'portfolio-header-ascii-palette-v1',
  cameraResponse: 'portfolio-header-ascii-camera-response-v1',
  revealDelay: 'portfolio-header-ascii-reveal-delay-v1',
  revealDuration: 'portfolio-header-ascii-reveal-duration-v1',
} as const
const ASCII_STORAGE_KEYS = {
  scale: 'portfolio-ascii-scale-v3',
  density: 'portfolio-ascii-density-v3',
  depth: 'portfolio-ascii-depth-v3',
  tilt: 'portfolio-ascii-tilt-v3',
  duration: 'portfolio-ascii-duration-v3',
  palette: 'portfolio-ascii-palette-v3',
  restState: 'portfolio-ascii-rest-state-v3',
  cameraResponse: 'portfolio-ascii-camera-response-v1',
} as const

function isHeroInOrNearViewport(hero: HTMLElement | null) {
  if (!hero) return true

  const bounds = hero.getBoundingClientRect()
  return (
    bounds.bottom >= -HERO_REPLAY_PROXIMITY_MARGIN &&
    bounds.top <= window.innerHeight + HERO_REPLAY_PROXIMITY_MARGIN
  )
}

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

type StudioTab = 'work' | 'sides' | 'about'

function StudioSplitLayout({
  asciiScale,
  asciiDensity,
  asciiDepth,
  asciiTilt,
  asciiDuration,
  asciiPalette,
  asciiRestStateEnabled,
  asciiCameraResponse,
  shouldReduceMotion,
}: {
  asciiScale: number
  asciiDensity: number
  asciiDepth: number
  asciiTilt: number
  asciiDuration: number
  asciiPalette: AsciiPalette
  asciiRestStateEnabled: boolean
  asciiCameraResponse: AsciiCameraResponse
  shouldReduceMotion: boolean
}) {
  const [activeTab, setActiveTab] = useState<StudioTab>('work')

  return (
    <main className="studio-layout">
      <section className="studio-layout__identity" aria-label="Introduction">
        <div className="studio-layout__logo" aria-hidden="true">
          <AsciiLogo
            scale={asciiScale / 100}
            density={asciiDensity}
            depth={asciiDepth / 100}
            tilt={asciiTilt}
            duration={asciiDuration}
            palette={asciiPalette}
            startRotation={ASCII_START_ROTATION_DEFAULT}
            rotationEnd={ASCII_ROTATION_END_DEFAULT}
            assemblyEnd={ASCII_ASSEMBLY_END_DEFAULT}
            revealDuration={ASCII_REVEAL_DURATION_DEFAULT}
            easing="out"
            playIntensity={ASCII_PLAY_INTENSITY_DEFAULT}
            playSpeed={ASCII_PLAY_SPEED_DEFAULT}
            restMode={asciiRestStateEnabled}
            cameraResponse={asciiCameraResponse}
            restStartDelay={ASCII_COPY_DELAY_DEFAULT}
            optimized
            reducedMotion={shouldReduceMotion}
          />
        </div>
        <div className="studio-layout__intro">
          <h1>
            Product designer working at the intersection of{' '}
            <em>scale, craft and complex systems.</em> Currently working at{' '}
            {'\u00a0'}
            <span className="microsoft-lockup">
              <span className="microsoft-bitmap" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </span>
              Microsoft.
            </span>
          </h1>
        </div>
        <div className="studio-layout__meta">
          <span>Param Ranjan</span>
          <span>Hyderabad, IN</span>
        </div>
      </section>

      <section className="studio-layout__canvas">
        <nav
          className="studio-tabs"
          aria-label="Portfolio sections"
          role="tablist"
        >
          {(
            [
              ['work', 'Work'],
              ['sides', 'Sides'],
              ['about', 'About'],
            ] as const
          ).map(([value, label]) => (
            <button
              type="button"
              aria-controls="studio-tab-panel"
              aria-selected={activeTab === value}
              className="studio-tabs__button"
              id={`studio-tab-${value}`}
              onClick={() => setActiveTab(value)}
              role="tab"
              key={value}
            >
              {label}
            </button>
          ))}
        </nav>

        <div
          className="studio-layout__content"
          id="studio-tab-panel"
          aria-labelledby={`studio-tab-${activeTab}`}
          role="tabpanel"
        >
          {activeTab === 'work' && (
            <div className="studio-work">
              <div className="studio-section-heading">
                <p>Selected work / 2025</p>
              </div>
              <div className="studio-work__list">
                {projects.map((project) => (
                  <a
                    className="studio-project"
                    href={project.href}
                    target="_blank"
                    rel="noreferrer"
                    key={project.number}
                  >
                    <div className="studio-project__topline">
                      <span>{project.number}</span>
                      <span>{project.client}</span>
                      <span>{project.year}</span>
                    </div>
                    <h2>{project.title}</h2>
                    <p>{project.summary}</p>
                    <span className="studio-project__arrow">↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sides' && (
            <div className="studio-sides">
              <div className="studio-section-heading">
                <p>Outside the Figma file</p>
                <h1>Other ways of looking.</h1>
              </div>
              <div className="studio-sides__grid">
                {playground.map((item, index) => (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    key={item.title}
                  >
                    <span>0{index + 1} / {item.label}</span>
                    <h2>{item.title}</h2>
                    <p>{item.meta}</p>
                    <i>↗</i>
                  </a>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="studio-about">
              <div className="studio-section-heading">
                <p>About</p>
                <h1>Always observing, always learning.</h1>
              </div>
              <div className="studio-about__body">
                <p>
                  I design products for complex systems, with a focus on making
                  scale feel understandable and interaction feel considered.
                </p>
                <p>
                  Away from product work, I mix music as rhyms, photograph
                  small details and follow Formula 1.
                </p>
              </div>
              <div className="studio-about__links">
                <a
                  href="https://www.paramranjan.com/about"
                  target="_blank"
                  rel="noreferrer"
                >
                  Connect <span>↗</span>
                </a>
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
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

function HeaderContents({
  title,
  mark,
  asciiScale,
  asciiDensity,
  asciiDepth,
  asciiTilt,
  asciiPalette,
  asciiCameraResponse,
}: {
  title: HeaderTitle
  mark: HeaderMark
  asciiScale: number
  asciiDensity: number
  asciiDepth: number
  asciiTilt: number
  asciiPalette: AsciiPalette
  asciiCameraResponse: AsciiCameraResponse
}) {
  return (
    <>
      <a className="wordmark" href="#top" aria-label="Param Ranjan, home">
        <span className="wordmark__stage" aria-hidden="true">
          <span className="wordmark__text">
            {getHeaderTitleText(title)}
            <span className="wordmark__registered">®</span>
          </span>
          <HeaderAsciiMark
            mark={mark}
            scale={asciiScale / 100}
            density={asciiDensity}
            depth={asciiDepth}
            tilt={asciiTilt}
            palette={asciiPalette}
            cameraResponse={asciiCameraResponse}
          />
        </span>
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
    </>
  )
}

function App() {
  const [portfolioLayout, setPortfolioLayout] =
    useState<PortfolioLayout>(() =>
      normalizePortfolioLayout(
        localStorage.getItem(PORTFOLIO_LAYOUT_STORAGE_KEY),
      ),
    )
  const [headerVariant, setHeaderVariant] = useState<HeaderVariant>(() => {
    const saved = localStorage.getItem('portfolio-header-variant')
    return saved === 'floating' ||
      saved === 'split' ||
      saved === 'scroll-morph' ||
      saved === 'motion-morph'
      ? saved
      : 'full-width'
  })
  const [cursorBallEnabled, setCursorBallEnabled] = useState(() =>
    normalizeCursorBallEnabled(
      localStorage.getItem(CURSOR_BALL_STORAGE_KEY),
    ),
  )
  const [tweaksOpen, setTweaksOpen] = useState(false)
  const [headerTitle, setHeaderTitle] = useState<HeaderTitle>(() =>
    normalizeHeaderTitle(
      localStorage.getItem(HEADER_IDENTITY_STORAGE_KEYS.title),
    ),
  )
  const [headerMark, setHeaderMark] = useState<HeaderMark>(() =>
    normalizeHeaderMark(
      localStorage.getItem(HEADER_IDENTITY_STORAGE_KEYS.mark),
    ),
  )
  const [headerAsciiScale, setHeaderAsciiScale] = useState(() =>
    normalizeAsciiScale(
      localStorage.getItem(HEADER_IDENTITY_STORAGE_KEYS.scale),
    ),
  )
  const [headerAsciiDensity, setHeaderAsciiDensity] = useState(() =>
    normalizeHeaderAsciiDensity(
      localStorage.getItem(HEADER_IDENTITY_STORAGE_KEYS.density),
    ),
  )
  const [headerAsciiDepth, setHeaderAsciiDepth] = useState(() =>
    normalizeAsciiDepth(
      localStorage.getItem(HEADER_IDENTITY_STORAGE_KEYS.depth),
    ),
  )
  const [headerAsciiTilt, setHeaderAsciiTilt] = useState(() =>
    normalizeAsciiTilt(
      localStorage.getItem(HEADER_IDENTITY_STORAGE_KEYS.tilt),
    ),
  )
  const [headerAsciiPalette, setHeaderAsciiPalette] =
    useState<AsciiPalette>(() =>
      normalizeAsciiPalette(
        localStorage.getItem(HEADER_IDENTITY_STORAGE_KEYS.palette),
      ),
    )
  const [headerAsciiCameraResponse, setHeaderAsciiCameraResponse] =
    useState<AsciiCameraResponse>(() =>
      normalizeAsciiCameraResponse(
        localStorage.getItem(HEADER_IDENTITY_STORAGE_KEYS.cameraResponse),
      ),
    )
  const [headerAsciiRevealDelay, setHeaderAsciiRevealDelay] = useState(() =>
    normalizeHeaderAsciiRevealDelay(
      localStorage.getItem(HEADER_IDENTITY_STORAGE_KEYS.revealDelay),
    ),
  )
  const [headerAsciiRevealDuration, setHeaderAsciiRevealDuration] =
    useState(() =>
      normalizeAsciiTravelDuration(
        localStorage.getItem(
          HEADER_IDENTITY_STORAGE_KEYS.revealDuration,
        ),
      ),
    )
  const heroAlignment: HeroAlignment = 'center'
  const heroFontSize = 60
  const heroFont: HeroFont = 'pp-mondwest'
  const [asciiScale, setAsciiScale] = useState(() =>
    normalizeAsciiScale(localStorage.getItem(ASCII_STORAGE_KEYS.scale)),
  )
  const [asciiDensity, setAsciiDensity] = useState(() =>
    normalizeAsciiDensity(localStorage.getItem(ASCII_STORAGE_KEYS.density)),
  )
  const [asciiDepth, setAsciiDepth] = useState(() =>
    normalizeAsciiDepth(localStorage.getItem(ASCII_STORAGE_KEYS.depth)),
  )
  const [asciiTilt, setAsciiTilt] = useState(() =>
    normalizeAsciiTilt(localStorage.getItem(ASCII_STORAGE_KEYS.tilt)),
  )
  const [asciiDuration, setAsciiDuration] = useState(() =>
    normalizeAsciiDuration(localStorage.getItem(ASCII_STORAGE_KEYS.duration)),
  )
  const [asciiPalette, setAsciiPalette] = useState<AsciiPalette>(() =>
    normalizeAsciiPalette(localStorage.getItem(ASCII_STORAGE_KEYS.palette)),
  )
  const [asciiRestStateEnabled, setAsciiRestStateEnabled] = useState(() =>
    normalizeAsciiRestState(
      localStorage.getItem(ASCII_STORAGE_KEYS.restState),
    ),
  )
  const [asciiCameraResponse, setAsciiCameraResponse] =
    useState<AsciiCameraResponse>(() =>
      normalizeAsciiCameraResponse(
        localStorage.getItem(ASCII_STORAGE_KEYS.cameraResponse),
      ),
    )
  const [asciiReplayKey, setAsciiReplayKey] = useState(0)
  const [asciiReady, setAsciiReady] = useState(false)
  const [asciiComplete, setAsciiComplete] = useState(false)
  const [
    asciiEntranceSettledWithoutAnimation,
    setAsciiEntranceSettledWithoutAnimation,
  ] = useState(false)
  const [entranceComplete, setEntranceComplete] = useState(false)
  const [postHeroContentVisible, setPostHeroContentVisible] =
    useState(false)
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth)
  const headerRef = useRef<HTMLElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const hideHeaderForEntranceRef = useRef(true)
  const shouldReduceMotion = useLiveReducedMotion()
  const eventDrivenMorphEnabled =
    (headerVariant === 'scroll-morph' ||
      headerVariant === 'motion-morph') &&
    isHeaderMorphEnabled(viewportWidth, shouldReduceMotion)
  const selectedHeroFont =
    heroFonts.find((font) => font.value === heroFont) ?? heroFonts[0]
  const heroStyle: CSSProperties & {
    '--hero-font-family': string
    '--hero-font-size': string
    '--hero-mobile-font-size': string
    '--ascii-logo-delay': string
    '--ascii-logo-duration': string
    '--ascii-copy-delay': string
    '--ascii-copy-duration': string
    '--ascii-copy-rise': string
    '--ascii-footer-delay': string
    '--ascii-footer-duration': string
    '--ascii-motion-ease': string
    '--ascii-improved-copy-delay': string
    '--ascii-improved-headline-delay': string
    '--ascii-improved-footer-delay': string
  } = {
    '--hero-font-family': selectedHeroFont.family,
    '--hero-font-size': `${heroFontSize}px`,
    '--hero-mobile-font-size': `${getMobileHeroFontSize(heroFontSize)}px`,
    '--ascii-logo-delay': `${asciiDuration}ms`,
    '--ascii-logo-duration': `${ASCII_TRAVEL_DURATION_DEFAULT}ms`,
    '--ascii-copy-delay': `${asciiDuration + ASCII_COPY_DELAY_DEFAULT}ms`,
    '--ascii-copy-duration': `${ASCII_COPY_DURATION_DEFAULT}ms`,
    '--ascii-copy-rise': `${ASCII_COPY_RISE_DEFAULT}px`,
    '--ascii-footer-delay': `${asciiDuration + ASCII_COPY_DELAY_DEFAULT + 250}ms`,
    '--ascii-footer-duration': `${ASCII_COPY_DURATION_DEFAULT - 100}ms`,
    '--ascii-motion-ease': getAsciiEasingCss('out'),
    '--ascii-improved-copy-delay': `${ASCII_COPY_DELAY_DEFAULT}ms`,
    '--ascii-improved-headline-delay': `${ASCII_COPY_DELAY_DEFAULT + IMPROVED_HEADLINE_STAGGER}ms`,
    '--ascii-improved-footer-delay': `${ASCII_COPY_DELAY_DEFAULT + 250}ms`,
  }
  const headerStyle: CSSProperties & {
    '--header-ascii-duration': string
  } = {
    '--header-ascii-duration': `${headerAsciiRevealDuration}ms`,
  }

  useEffect(() => {
    localStorage.setItem(PORTFOLIO_LAYOUT_STORAGE_KEY, portfolioLayout)
  }, [portfolioLayout])

  useEffect(() => {
    localStorage.setItem(
      CURSOR_BALL_STORAGE_KEY,
      String(cursorBallEnabled),
    )
  }, [cursorBallEnabled])

  useEffect(() => {
    localStorage.setItem('portfolio-header-variant', headerVariant)
  }, [headerVariant])

  useEffect(() => {
    localStorage.setItem(HEADER_IDENTITY_STORAGE_KEYS.title, headerTitle)
  }, [headerTitle])

  useEffect(() => {
    localStorage.setItem(HEADER_IDENTITY_STORAGE_KEYS.mark, headerMark)
  }, [headerMark])

  useEffect(() => {
    localStorage.setItem(
      HEADER_IDENTITY_STORAGE_KEYS.scale,
      String(headerAsciiScale),
    )
  }, [headerAsciiScale])

  useEffect(() => {
    localStorage.setItem(
      HEADER_IDENTITY_STORAGE_KEYS.density,
      String(headerAsciiDensity),
    )
  }, [headerAsciiDensity])

  useEffect(() => {
    localStorage.setItem(
      HEADER_IDENTITY_STORAGE_KEYS.depth,
      String(headerAsciiDepth),
    )
  }, [headerAsciiDepth])

  useEffect(() => {
    localStorage.setItem(
      HEADER_IDENTITY_STORAGE_KEYS.tilt,
      String(headerAsciiTilt),
    )
  }, [headerAsciiTilt])

  useEffect(() => {
    localStorage.setItem(
      HEADER_IDENTITY_STORAGE_KEYS.palette,
      headerAsciiPalette,
    )
  }, [headerAsciiPalette])

  useEffect(() => {
    localStorage.setItem(
      HEADER_IDENTITY_STORAGE_KEYS.cameraResponse,
      headerAsciiCameraResponse,
    )
  }, [headerAsciiCameraResponse])

  useEffect(() => {
    localStorage.setItem(
      HEADER_IDENTITY_STORAGE_KEYS.revealDelay,
      String(headerAsciiRevealDelay),
    )
  }, [headerAsciiRevealDelay])

  useEffect(() => {
    localStorage.setItem(
      HEADER_IDENTITY_STORAGE_KEYS.revealDuration,
      String(headerAsciiRevealDuration),
    )
  }, [headerAsciiRevealDuration])

  useEffect(() => {
    localStorage.setItem(ASCII_STORAGE_KEYS.scale, String(asciiScale))
  }, [asciiScale])

  useEffect(() => {
    localStorage.setItem(ASCII_STORAGE_KEYS.density, String(asciiDensity))
  }, [asciiDensity])

  useEffect(() => {
    localStorage.setItem(ASCII_STORAGE_KEYS.depth, String(asciiDepth))
  }, [asciiDepth])

  useEffect(() => {
    localStorage.setItem(ASCII_STORAGE_KEYS.tilt, String(asciiTilt))
  }, [asciiTilt])

  useEffect(() => {
    localStorage.setItem(ASCII_STORAGE_KEYS.duration, String(asciiDuration))
  }, [asciiDuration])

  useEffect(() => {
    localStorage.setItem(ASCII_STORAGE_KEYS.palette, asciiPalette)
  }, [asciiPalette])

  useEffect(() => {
    localStorage.setItem(
      ASCII_STORAGE_KEYS.restState,
      String(asciiRestStateEnabled),
    )
  }, [asciiRestStateEnabled])

  useEffect(() => {
    localStorage.setItem(
      ASCII_STORAGE_KEYS.cameraResponse,
      asciiCameraResponse,
    )
  }, [asciiCameraResponse])

  useEffect(() => {
    if (shouldReduceMotion) {
      setPostHeroContentVisible(true)
      return
    }

    if (!asciiComplete) return

    if (!hideHeaderForEntranceRef.current) {
      setPostHeroContentVisible(true)
      return
    }

    const timer = window.setTimeout(
      () => setPostHeroContentVisible(true),
      ASCII_COPY_DELAY_DEFAULT + IMPROVED_HEADLINE_STAGGER,
    )

    return () => window.clearTimeout(timer)
  }, [asciiComplete, shouldReduceMotion])

  useEffect(() => {
    if (!asciiComplete) return

    if (shouldReduceMotion) {
      setAsciiEntranceSettledWithoutAnimation(true)
      setEntranceComplete(true)
      hideHeaderForEntranceRef.current = true
      return
    }

    const postAssemblyDuration = Math.max(
      ASCII_TRAVEL_DURATION_DEFAULT,
      ASCII_COPY_DELAY_DEFAULT + ASCII_COPY_DURATION_DEFAULT,
    )
    const timer = window.setTimeout(() => {
      setEntranceComplete(true)
      hideHeaderForEntranceRef.current = true
    }, postAssemblyDuration)

    return () => window.clearTimeout(timer)
  }, [asciiComplete, shouldReduceMotion])

  useEffect(() => {
    if (asciiComplete || entranceComplete) {
      return
    }

    const hero = heroRef.current
    if (!hero) return

    const revealHeader = () => {
      setEntranceComplete(true)
    }

    if (!isHeroInOrNearViewport(hero)) {
      revealHeader()
      return
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) return

      revealHeader()
      observer.disconnect()
    }, {
      rootMargin: `${HERO_REPLAY_PROXIMITY_MARGIN}px 0px`,
    })
    observer.observe(hero)

    return () => observer.disconnect()
  }, [
    asciiComplete,
    asciiReplayKey,
    entranceComplete,
  ])

  useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(window.innerWidth)

    window.addEventListener('resize', updateViewportWidth)
    return () => window.removeEventListener('resize', updateViewportWidth)
  }, [])

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    if (!eventDrivenMorphEnabled) {
      header.style.removeProperty('--hybrid-top')
      header.style.removeProperty('--hybrid-inset')
      header.style.removeProperty('--hybrid-height')
      header.style.removeProperty('--hybrid-radius')
      header.style.removeProperty('--hybrid-padding')
      header.style.removeProperty('--hybrid-border-opacity')
      header.style.removeProperty('--hybrid-divider-opacity')
      return
    }

    let currentProgress = getHeaderScrollProgress(window.scrollY)
    let targetProgress = currentProgress
    let previousTargetProgress = targetProgress
    let frame = 0

    const render = () => {
      frame = 0
      currentProgress = getResponsiveHeaderProgress(
        currentProgress,
        targetProgress,
        previousTargetProgress,
      )
      previousTargetProgress = targetProgress

      const { pagePadding, floatingInset } = getHeaderMorphLayout(
        window.innerWidth,
      )
      const padding = pagePadding + (22 - pagePadding) * currentProgress
      const shapeProgress = getHeaderShapeProgress(currentProgress)

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
        `${999 * shapeProgress}px`,
      )
      header.style.setProperty('--hybrid-padding', `${padding}px`)
      header.style.setProperty(
        '--hybrid-border-opacity',
        `${0.18 * shapeProgress}`,
      )
      header.style.setProperty(
        '--hybrid-divider-opacity',
        `${0.18 * (1 - shapeProgress)}`,
      )

      if (currentProgress !== targetProgress) {
        frame = window.requestAnimationFrame(render)
      }
    }

    const updateTarget = () => {
      previousTargetProgress = targetProgress
      targetProgress = getHeaderScrollProgress(window.scrollY)
      if (frame === 0) {
        frame = window.requestAnimationFrame(render)
      }
    }

    render()
    window.addEventListener('scroll', updateTarget, { passive: true })
    window.addEventListener('resize', updateTarget)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', updateTarget)
      window.removeEventListener('resize', updateTarget)
    }
  }, [eventDrivenMorphEnabled])

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    let frame = 0
    let revealTimer = 0
    const updateIdentity = () => {
      frame = 0
      window.clearTimeout(revealTimer)

      if (getHeaderScrollProgress(window.scrollY) < 0.56) {
        header.dataset.identity = 'text'
        return
      }

      revealTimer = window.setTimeout(() => {
        if (getHeaderScrollProgress(window.scrollY) >= 0.56) {
          header.dataset.identity = 'ascii'
        }
      }, headerAsciiRevealDelay)
    }
    const scheduleUpdate = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(updateIdentity)
      }
    }

    updateIdentity()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(revealTimer)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [headerAsciiRevealDelay])

  const replayAsciiEntrance = useCallback(() => {
    const hideHeaderForEntrance = isHeroInOrNearViewport(heroRef.current)
    hideHeaderForEntranceRef.current = hideHeaderForEntrance
    setAsciiReady(false)
    setAsciiComplete(false)
    setAsciiEntranceSettledWithoutAnimation(false)
    setEntranceComplete(!hideHeaderForEntrance)
    setPostHeroContentVisible(!hideHeaderForEntrance)
    setAsciiReplayKey((key) => key + 1)
  }, [])

  const handleAsciiReady = useCallback(() => {
    setAsciiReady(true)
  }, [])

  const handleAsciiComplete = useCallback(() => {
    setAsciiComplete(true)
  }, [])

  return (
    <div
      className="site"
      data-layout={portfolioLayout}
      data-motion-profile="improved"
      data-post-hero-content-visible={postHeroContentVisible}
      data-cursor-launcher={
        cursorBallEnabled && !shouldReduceMotion
      }
    >
      <div className="noise-overlay" aria-hidden="true">
        <div className="noise-overlay__tile" />
      </div>
      <CursorBallLauncher
        enabled={cursorBallEnabled && !shouldReduceMotion}
      />
      {portfolioLayout === 'current' ? (
        <>
          <motion.header
            ref={headerRef}
            className="site-header"
            data-variant={headerVariant}
            data-identity="text"
            data-entrance-visible={entranceComplete}
            aria-hidden={!entranceComplete}
            style={headerStyle}
          >
            <HeaderContents
              title={headerTitle}
              mark={headerMark}
              asciiScale={headerAsciiScale}
              asciiDensity={headerAsciiDensity}
              asciiDepth={headerAsciiDepth}
              asciiTilt={headerAsciiTilt}
              asciiPalette={headerAsciiPalette}
              asciiCameraResponse={headerAsciiCameraResponse}
            />
          </motion.header>

          <main>
        <section
          ref={heroRef}
          className="hero"
          id="top"
          key={asciiReplayKey}
          data-hero-alignment={heroAlignment}
          data-hero-font={heroFont}
          data-ascii-ready={asciiReady}
          data-ascii-complete={asciiComplete}
          data-ascii-settled-without-animation={
            asciiEntranceSettledWithoutAnimation
          }
          style={heroStyle}
        >
          <AsciiLogo
            scale={asciiScale / 100}
            density={asciiDensity}
            depth={asciiDepth / 100}
            tilt={asciiTilt}
            duration={asciiDuration}
            palette={asciiPalette}
            startRotation={ASCII_START_ROTATION_DEFAULT}
            rotationEnd={ASCII_ROTATION_END_DEFAULT}
            assemblyEnd={ASCII_ASSEMBLY_END_DEFAULT}
            revealDuration={ASCII_REVEAL_DURATION_DEFAULT}
            easing="out"
            playIntensity={ASCII_PLAY_INTENSITY_DEFAULT}
            playSpeed={ASCII_PLAY_SPEED_DEFAULT}
            restMode={asciiRestStateEnabled}
            cameraResponse={asciiCameraResponse}
            restStartDelay={
              shouldReduceMotion
                ? 0
                : ASCII_COPY_DELAY_DEFAULT + IMPROVED_HEADLINE_STAGGER
            }
            optimized
            reducedMotion={shouldReduceMotion === true}
            onReady={handleAsciiReady}
            onComplete={handleAsciiComplete}
          />

          <div className="hero-copy">
            <p className="eyebrow">Designer / DJ / Perpetually curious</p>
            <h1>
              Product designer working at the intersection of{' '}
              <em>scale, craft and complex systems.</em> Currently working at{' \u00a0'}
              <span className="microsoft-lockup">
                <span className="microsoft-bitmap" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                </span>
                Microsoft.
              </span>
            </h1>
          </div>

          <div
            className="hero-footer"
            aria-hidden={!postHeroContentVisible}
            inert={!postHeroContentVisible}
          >
            <a href="#work">
              Selected work <span>↓</span>
            </a>
          </div>
        </section>

        <section className="work section-shell" id="work">
          <div className="section-heading section-heading--work">
            <div className="section-heading__intro">
              <p className="section-kicker">01 / Selected work</p>
              <h2>Featured projects</h2>
            </div>
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
          <a href="#top">Back to top ↑</a>
        </div>
          </footer>
        </>
      ) : (
        <StudioSplitLayout
          asciiScale={asciiScale}
          asciiDensity={asciiDensity}
          asciiDepth={asciiDepth}
          asciiTilt={asciiTilt}
          asciiDuration={asciiDuration}
          asciiPalette={asciiPalette}
          asciiRestStateEnabled={asciiRestStateEnabled}
          asciiCameraResponse={asciiCameraResponse}
          shouldReduceMotion={shouldReduceMotion}
        />
      )}

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
              <span className="header-tweaks__label">Page layout</span>
              <div className="header-tweaks__options">
                {portfolioLayoutOptions.map((option) => (
                  <button
                    type="button"
                    aria-pressed={portfolioLayout === option.value}
                    onClick={() => setPortfolioLayout(option.value)}
                    key={option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="header-tweaks__section">
              <span className="header-tweaks__label">Cursor launcher</span>
              <div className="header-tweaks__options">
                {(
                  [
                    [true, 'On'],
                    [false, 'Off'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    type="button"
                    aria-pressed={cursorBallEnabled === value}
                    onClick={() => setCursorBallEnabled(value)}
                    key={label}
                  >
                    {label}
                  </button>
                ))}
              </div>
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
              <span className="header-tweaks__label">Header title</span>
              <div className="header-tweaks__options">
                {headerTitleOptions.map((option) => (
                  <button
                    type="button"
                    aria-pressed={headerTitle === option.value}
                    onClick={() => setHeaderTitle(option.value)}
                    style={{
                      fontFamily:
                        "'PP Mondwest', 'PP Mori', Arial, sans-serif",
                    }}
                    key={option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="header-tweaks__section">
              <span className="header-tweaks__label">Header mark</span>
              <div className="header-tweaks__options">
                {headerMarkOptions.map((option) => (
                  <button
                    type="button"
                    aria-pressed={headerMark === option.value}
                    onClick={() => setHeaderMark(option.value)}
                    key={option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="header-tweaks__section">
              <span className="header-tweaks__label">
                Header ASCII palette
              </span>
              <div className="header-tweaks__options header-tweaks__options--three">
                {asciiPalettes.map((palette) => (
                  <button
                    type="button"
                    aria-pressed={headerAsciiPalette === palette.value}
                    onClick={() => setHeaderAsciiPalette(palette.value)}
                    key={palette.value}
                  >
                    {palette.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="header-tweaks__section">
              <label
                className="header-tweaks__range-label"
                htmlFor="header-ascii-scale"
              >
                <span>Header ASCII scale</span>
                <output htmlFor="header-ascii-scale">
                  {headerAsciiScale}%
                </output>
              </label>
              <input
                id="header-ascii-scale"
                className="header-tweaks__range"
                type="range"
                min={ASCII_SCALE_MIN}
                max={ASCII_SCALE_MAX}
                step="1"
                value={headerAsciiScale}
                onChange={(event) =>
                  setHeaderAsciiScale(
                    normalizeAsciiScale(event.currentTarget.value),
                  )
                }
              />
            </div>

            <div className="header-tweaks__section">
              <label
                className="header-tweaks__range-label"
                htmlFor="header-ascii-density"
              >
                <span>Header ASCII density</span>
                <output htmlFor="header-ascii-density">
                  {headerAsciiDensity}
                </output>
              </label>
              <input
                id="header-ascii-density"
                className="header-tweaks__range"
                type="range"
                min={ASCII_DENSITY_MIN}
                max={ASCII_DENSITY_MAX}
                step="1"
                value={headerAsciiDensity}
                onChange={(event) =>
                  setHeaderAsciiDensity(
                    normalizeHeaderAsciiDensity(event.currentTarget.value),
                  )
                }
              />
            </div>

            <div className="header-tweaks__section">
              <label
                className="header-tweaks__range-label"
                htmlFor="header-ascii-depth"
              >
                <span>Header 3D depth</span>
                <output htmlFor="header-ascii-depth">
                  {headerAsciiDepth}
                </output>
              </label>
              <input
                id="header-ascii-depth"
                className="header-tweaks__range"
                type="range"
                min={ASCII_DEPTH_MIN}
                max={ASCII_DEPTH_MAX}
                step="1"
                value={headerAsciiDepth}
                onChange={(event) =>
                  setHeaderAsciiDepth(
                    normalizeAsciiDepth(event.currentTarget.value),
                  )
                }
              />
            </div>

            <div className="header-tweaks__section">
              <span className="header-tweaks__label">
                Header camera response
              </span>
              <div className="header-tweaks__options">
                {(
                  [
                    ['off', 'Off'],
                    ['subtle', 'Subtle'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    type="button"
                    aria-pressed={headerAsciiCameraResponse === value}
                    onClick={() => setHeaderAsciiCameraResponse(value)}
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
                htmlFor="header-ascii-tilt"
              >
                <span>Header final tilt</span>
                <output htmlFor="header-ascii-tilt">
                  {headerAsciiTilt}°
                </output>
              </label>
              <input
                id="header-ascii-tilt"
                className="header-tweaks__range"
                type="range"
                min={ASCII_TILT_MIN}
                max={ASCII_TILT_MAX}
                step="1"
                value={headerAsciiTilt}
                onChange={(event) =>
                  setHeaderAsciiTilt(
                    normalizeAsciiTilt(event.currentTarget.value),
                  )
                }
              />
            </div>

            <div className="header-tweaks__section">
              <label
                className="header-tweaks__range-label"
                htmlFor="header-ascii-reveal-delay"
              >
                <span>Header reveal delay</span>
                <output htmlFor="header-ascii-reveal-delay">
                  {headerAsciiRevealDelay}ms
                </output>
              </label>
              <input
                id="header-ascii-reveal-delay"
                className="header-tweaks__range"
                type="range"
                min={HEADER_ASCII_REVEAL_DELAY_MIN}
                max={HEADER_ASCII_REVEAL_DELAY_MAX}
                step="50"
                value={headerAsciiRevealDelay}
                onChange={(event) =>
                  setHeaderAsciiRevealDelay(
                    normalizeHeaderAsciiRevealDelay(
                      event.currentTarget.value,
                    ),
                  )
                }
              />
            </div>

            <div className="header-tweaks__section">
              <label
                className="header-tweaks__range-label"
                htmlFor="header-ascii-reveal-duration"
              >
                <span>Header reveal speed</span>
                <output htmlFor="header-ascii-reveal-duration">
                  {(headerAsciiRevealDuration / 1000).toFixed(1)}s
                </output>
              </label>
              <input
                id="header-ascii-reveal-duration"
                className="header-tweaks__range"
                type="range"
                min={ASCII_TRAVEL_DURATION_MIN}
                max={ASCII_TRAVEL_DURATION_MAX}
                step="50"
                value={headerAsciiRevealDuration}
                onChange={(event) =>
                  setHeaderAsciiRevealDuration(
                    normalizeAsciiTravelDuration(
                      event.currentTarget.value,
                    ),
                  )
                }
              />
            </div>

            <div className="header-tweaks__divider" />

            <div className="header-tweaks__section">
              <span className="header-tweaks__label">ASCII palette</span>
              <div className="header-tweaks__options header-tweaks__options--three">
                {asciiPalettes.map((palette) => (
                  <button
                    type="button"
                    aria-pressed={asciiPalette === palette.value}
                    onClick={() => setAsciiPalette(palette.value)}
                    key={palette.value}
                  >
                    {palette.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="header-tweaks__section">
              <span className="header-tweaks__label">ASCII rest state</span>
              <div className="header-tweaks__options">
                {(
                  [
                    [false, 'Off'],
                    [true, 'Mono breathe'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    type="button"
                    aria-pressed={asciiRestStateEnabled === value}
                    onClick={() => setAsciiRestStateEnabled(value)}
                    key={label}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="header-tweaks__section">
              <label
                className="header-tweaks__range-label"
                htmlFor="ascii-scale"
              >
                <span>ASCII scale</span>
                <output htmlFor="ascii-scale">{asciiScale}%</output>
              </label>
              <input
                id="ascii-scale"
                className="header-tweaks__range"
                type="range"
                min={ASCII_SCALE_MIN}
                max={ASCII_SCALE_MAX}
                step="1"
                value={asciiScale}
                onChange={(event) =>
                  setAsciiScale(
                    normalizeAsciiScale(event.currentTarget.value),
                  )
                }
              />
            </div>

            <div className="header-tweaks__section">
              <label
                className="header-tweaks__range-label"
                htmlFor="ascii-density"
              >
                <span>ASCII density</span>
                <output htmlFor="ascii-density">{asciiDensity}</output>
              </label>
              <input
                id="ascii-density"
                className="header-tweaks__range"
                type="range"
                min={ASCII_DENSITY_MIN}
                max={ASCII_DENSITY_MAX}
                step="1"
                value={asciiDensity}
                onChange={(event) =>
                  setAsciiDensity(
                    normalizeAsciiDensity(event.currentTarget.value),
                  )
                }
              />
            </div>

            <div className="header-tweaks__section">
              <label
                className="header-tweaks__range-label"
                htmlFor="ascii-depth"
              >
                <span>3D depth</span>
                <output htmlFor="ascii-depth">{asciiDepth}</output>
              </label>
              <input
                id="ascii-depth"
                className="header-tweaks__range"
                type="range"
                min={ASCII_DEPTH_MIN}
                max={ASCII_DEPTH_MAX}
                step="1"
                value={asciiDepth}
                onChange={(event) =>
                  setAsciiDepth(
                    normalizeAsciiDepth(event.currentTarget.value),
                  )
                }
              />
            </div>

            <div className="header-tweaks__section">
              <span className="header-tweaks__label">Camera response</span>
              <div className="header-tweaks__options">
                {(
                  [
                    ['off', 'Off'],
                    ['subtle', 'Subtle'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    type="button"
                    aria-pressed={asciiCameraResponse === value}
                    onClick={() => setAsciiCameraResponse(value)}
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
                htmlFor="ascii-tilt"
              >
                <span>Final tilt</span>
                <output htmlFor="ascii-tilt">{asciiTilt}°</output>
              </label>
              <input
                id="ascii-tilt"
                className="header-tweaks__range"
                type="range"
                min={ASCII_TILT_MIN}
                max={ASCII_TILT_MAX}
                step="1"
                value={asciiTilt}
                onChange={(event) =>
                  setAsciiTilt(normalizeAsciiTilt(event.currentTarget.value))
                }
              />
            </div>

            <div className="header-tweaks__section">
              <label
                className="header-tweaks__range-label"
                htmlFor="ascii-duration"
              >
                <span>Entrance speed</span>
                <output htmlFor="ascii-duration">
                  {(asciiDuration / 1000).toFixed(1)}s
                </output>
              </label>
              <input
                id="ascii-duration"
                className="header-tweaks__range"
                type="range"
                min={ASCII_DURATION_MIN}
                max={ASCII_DURATION_MAX}
                step="100"
                value={asciiDuration}
                onChange={(event) =>
                  setAsciiDuration(
                    normalizeAsciiDuration(event.currentTarget.value),
                  )
                }
              />
            </div>

            <button
              type="button"
              className="header-tweaks__action"
              onClick={replayAsciiEntrance}
            >
              Replay ASCII entrance
            </button>
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
