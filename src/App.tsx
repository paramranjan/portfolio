import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useTransform,
} from 'motion/react'
import './App.css'
import {
  getHeaderMorphLayout,
  getHeaderRenderKey,
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
  ASCII_TRAVEL_DURATION_DEFAULT,
  asciiPalettes,
  getAsciiEasingCss,
  normalizeAsciiDensity,
  normalizeAsciiDepth,
  normalizeAsciiDuration,
  normalizeAsciiPalette,
  normalizeAsciiRestState,
  normalizeAsciiScale,
  normalizeAsciiTilt,
  type AsciiPalette,
} from './asciiTweaks.ts'
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
import { AsciiLogo } from './AsciiLogo.tsx'
import {
  normalizeMotionProfile,
  type MotionProfile,
} from './motionProfile.ts'

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

function HeaderContents() {
  return (
    <>
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
    </>
  )
}

function OriginalMotionHeader({
  entranceComplete,
  viewportWidth,
}: {
  entranceComplete: boolean
  viewportWidth: number
}) {
  const { scrollY } = useScroll()
  const motionProgress = useMotionValue(getHeaderScrollProgress(window.scrollY))
  const motionTargetRef = useRef(getHeaderScrollProgress(window.scrollY))
  const { pagePadding, floatingInset } =
    getHeaderMorphLayout(viewportWidth)
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
  const motionShapeProgress = useTransform(
    motionProgress,
    [0, 0.03, 1],
    [0, 0, 1],
  )
  const motionRadius = useTransform(motionShapeProgress, [0, 1], [0, 999])
  const motionBorderColor = useTransform(
    motionShapeProgress,
    [0, 1],
    ['rgba(241, 240, 235, 0)', 'rgba(241, 240, 235, 0.18)'],
  )
  const motionDivider = useTransform(
    motionShapeProgress,
    [0, 1],
    [
      'inset 0 -1px 0 rgba(241, 240, 235, 0.18)',
      'inset 0 -1px 0 rgba(241, 240, 235, 0)',
    ],
  )

  useAnimationFrame(() => {
    const targetProgress = getHeaderScrollProgress(scrollY.get())
    const currentProgress = motionProgress.get()
    const nextProgress = getResponsiveHeaderProgress(
      currentProgress,
      targetProgress,
      motionTargetRef.current,
    )
    motionTargetRef.current = targetProgress

    if (nextProgress !== currentProgress) {
      motionProgress.set(nextProgress)
    }
  })

  useEffect(() => {
    const progress = getHeaderScrollProgress(scrollY.get())
    motionTargetRef.current = progress
    motionProgress.set(progress)
  }, [motionProgress, scrollY])

  return (
    <motion.header
      className="site-header"
      data-variant="motion-morph"
      data-entrance-visible={entranceComplete}
      aria-hidden={!entranceComplete}
      style={{
        top: motionTop,
        right: motionInset,
        left: motionInset,
        height: motionHeight,
        paddingLeft: motionPadding,
        paddingRight: motionPadding,
        borderRadius: motionRadius,
        borderColor: motionBorderColor,
        boxShadow: motionDivider,
      }}
    >
      <HeaderContents />
    </motion.header>
  )
}

function App() {
  const [motionProfile, setMotionProfile] = useState<MotionProfile>(() =>
    normalizeMotionProfile(
      localStorage.getItem('portfolio-motion-profile'),
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
  const [tweaksOpen, setTweaksOpen] = useState(false)
  const [heroAlignment, setHeroAlignment] = useState<HeroAlignment>(() =>
    normalizeHeroAlignment(
      localStorage.getItem('portfolio-hero-alignment-v2') ?? 'center',
    ),
  )
  const [heroFontSize, setHeroFontSize] = useState(() =>
    normalizeHeroFontSize(localStorage.getItem('portfolio-hero-font-size')),
  )
  const [heroFont, setHeroFont] = useState<HeroFont>(() =>
    normalizeHeroFont(localStorage.getItem('portfolio-hero-font')),
  )
  const [asciiScale, setAsciiScale] = useState(() =>
    normalizeAsciiScale(localStorage.getItem('portfolio-ascii-scale')),
  )
  const [asciiDensity, setAsciiDensity] = useState(() =>
    normalizeAsciiDensity(localStorage.getItem('portfolio-ascii-density-v2')),
  )
  const [asciiDepth, setAsciiDepth] = useState(() =>
    normalizeAsciiDepth(localStorage.getItem('portfolio-ascii-depth')),
  )
  const [asciiTilt, setAsciiTilt] = useState(() =>
    normalizeAsciiTilt(localStorage.getItem('portfolio-ascii-tilt')),
  )
  const [asciiDuration, setAsciiDuration] = useState(() =>
    normalizeAsciiDuration(localStorage.getItem('portfolio-ascii-duration')),
  )
  const [asciiPalette, setAsciiPalette] = useState<AsciiPalette>(() =>
    normalizeAsciiPalette(localStorage.getItem('portfolio-ascii-palette')),
  )
  const [asciiRestStateEnabled, setAsciiRestStateEnabled] = useState(() =>
    normalizeAsciiRestState(
      localStorage.getItem('portfolio-ascii-rest-state'),
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
  const originalMotionEnabled =
    motionProfile === 'original' &&
    headerVariant === 'motion-morph' &&
    isHeaderMorphEnabled(viewportWidth, shouldReduceMotion)
  const eventDrivenMorphEnabled =
    ((motionProfile === 'original' &&
      headerVariant === 'scroll-morph') ||
      (motionProfile === 'improved' &&
        (headerVariant === 'scroll-morph' ||
          headerVariant === 'motion-morph'))) &&
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

  useEffect(() => {
    localStorage.setItem('portfolio-header-variant', headerVariant)
  }, [headerVariant])

  useEffect(() => {
    localStorage.setItem('portfolio-motion-profile', motionProfile)
  }, [motionProfile])

  useEffect(() => {
    localStorage.setItem('portfolio-hero-alignment-v2', heroAlignment)
  }, [heroAlignment])

  useEffect(() => {
    localStorage.setItem('portfolio-hero-font-size', String(heroFontSize))
  }, [heroFontSize])

  useEffect(() => {
    localStorage.setItem('portfolio-hero-font', heroFont)
  }, [heroFont])

  useEffect(() => {
    localStorage.setItem('portfolio-ascii-scale', String(asciiScale))
  }, [asciiScale])

  useEffect(() => {
    localStorage.setItem('portfolio-ascii-density-v2', String(asciiDensity))
  }, [asciiDensity])

  useEffect(() => {
    localStorage.setItem('portfolio-ascii-depth', String(asciiDepth))
  }, [asciiDepth])

  useEffect(() => {
    localStorage.setItem('portfolio-ascii-tilt', String(asciiTilt))
  }, [asciiTilt])

  useEffect(() => {
    localStorage.setItem('portfolio-ascii-duration', String(asciiDuration))
  }, [asciiDuration])

  useEffect(() => {
    localStorage.setItem('portfolio-ascii-palette', asciiPalette)
  }, [asciiPalette])

  useEffect(() => {
    localStorage.setItem(
      'portfolio-ascii-rest-state',
      String(asciiRestStateEnabled),
    )
  }, [asciiRestStateEnabled])

  useEffect(() => {
    if (motionProfile !== 'original') return

    if (shouldReduceMotion) {
      setEntranceComplete(true)
      setPostHeroContentVisible(true)
      hideHeaderForEntranceRef.current = true
      return
    }

    if (hideHeaderForEntranceRef.current) {
      setEntranceComplete(false)
      setPostHeroContentVisible(false)
    } else {
      setPostHeroContentVisible(true)
    }
    const contentTimer = hideHeaderForEntranceRef.current
      ? window.setTimeout(
          () => setPostHeroContentVisible(true),
          asciiDuration + ASCII_COPY_DELAY_DEFAULT,
        )
      : 0
    const totalDuration =
      asciiDuration +
      Math.max(
        ASCII_TRAVEL_DURATION_DEFAULT,
        ASCII_COPY_DELAY_DEFAULT + ASCII_COPY_DURATION_DEFAULT,
      )
    const timer = window.setTimeout(() => {
      setEntranceComplete(true)
      hideHeaderForEntranceRef.current = true
    }, totalDuration)

    return () => {
      window.clearTimeout(contentTimer)
      window.clearTimeout(timer)
    }
  }, [
    asciiDuration,
    asciiReplayKey,
    motionProfile,
    shouldReduceMotion,
  ])

  useEffect(() => {
    if (motionProfile !== 'improved') return

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
  }, [asciiComplete, motionProfile, shouldReduceMotion])

  useEffect(() => {
    if (motionProfile !== 'improved' || !asciiComplete) return

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
  }, [asciiComplete, motionProfile, shouldReduceMotion])

  useEffect(() => {
    if (
      motionProfile !== 'improved' ||
      asciiComplete ||
      entranceComplete
    ) {
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
    motionProfile,
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

  const selectMotionProfile = useCallback(
    (profile: MotionProfile) => {
      if (profile === motionProfile) return
      setMotionProfile(profile)
      replayAsciiEntrance()
    },
    [motionProfile, replayAsciiEntrance],
  )

  const handleAsciiReady = useCallback(() => {
    setAsciiReady(true)
  }, [])

  const handleAsciiComplete = useCallback(() => {
    setAsciiComplete(true)
  }, [])

  return (
    <div
      className="site"
      data-motion-profile={motionProfile}
      data-post-hero-content-visible={postHeroContentVisible}
    >
      <div className="noise-overlay" aria-hidden="true">
        <div className="noise-overlay__tile" />
      </div>
      {originalMotionEnabled ? (
        <OriginalMotionHeader
          key={getHeaderRenderKey(true)}
          entranceComplete={entranceComplete}
          viewportWidth={viewportWidth}
        />
      ) : (
        <motion.header
          key={getHeaderRenderKey(false)}
          ref={headerRef}
          className="site-header"
          data-variant={headerVariant}
          data-entrance-visible={entranceComplete}
          aria-hidden={!entranceComplete}
        >
          <HeaderContents />
        </motion.header>
      )}

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
            restStartDelay={
              shouldReduceMotion
                ? 0
                : motionProfile === 'improved'
                  ? ASCII_COPY_DELAY_DEFAULT + IMPROVED_HEADLINE_STAGGER
                  : ASCII_COPY_DELAY_DEFAULT
            }
            optimized={motionProfile === 'improved'}
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
              <span className="header-tweaks__label">Motion profile</span>
              <div className="header-tweaks__options">
                {(
                  [
                    ['improved', 'Improved'],
                    ['original', 'Original'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    type="button"
                    aria-pressed={motionProfile === value}
                    onClick={() => selectMotionProfile(value)}
                    key={value}
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
