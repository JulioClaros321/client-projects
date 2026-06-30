import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const dashboardHref = user ? '/dashboard' : '/auth'
  const dashboardText = user ? 'Dashboard' : 'Login / Register'

  return (
    <main className="home-page">
      <header className="top-bar">
        <div className="top-left-socials" aria-label="Social media links">
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-circle">
            𝕏
          </a>

          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-circle">
            f
          </a>

          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-circle">
            ◎
          </a>
        </div>

        <nav className="top-right-nav" aria-label="Desktop navigation">
          <Link href="/" className="nav-btn">Home</Link>
          <Link href="/about" className="nav-btn">About Us</Link>
          <Link href={dashboardHref} className="nav-btn">{dashboardText}</Link>
        </nav>

        <details className="mobile-menu">
          <summary aria-label="Open menu">☰</summary>

          <div className="mobile-menu-panel">
            <Link href="/" className="mobile-menu-link">Home</Link>
            <Link href="/about" className="mobile-menu-link">About Us</Link>
            <Link href={dashboardHref} className="mobile-menu-link">{dashboardText}</Link>
          </div>
        </details>
      </header>

      <section className="hero-section">
        <picture className="hero-picture">
          <source
            media="(max-width: 768px)"
            srcSet="/images/Invite%20Me%20to%20the%20Wedding%20AI%20Mobile%20v2.svg"
          />

          <img
            src="/images/Invite Me to the Wedding AI.svg"
            alt="Invite Me to the Wedding"
            className="hero-image"
          />
        </picture>

        <div className="hero-center-content">
          <Link href="/about" className="hero-main-btn">
            Start the Spark
          </Link>
        </div>
      </section>
    </main>
  )
}