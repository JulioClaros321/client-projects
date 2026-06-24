import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="home-page">
      <header className="top-bar">
        <div className="top-left-socials">
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

        {/* Desktop buttons stay here */}
        <nav className="top-right-nav">
          <Link href="/" className="nav-btn">
            Home
          </Link>

          <Link href="/about" className="nav-btn">
            About Us
          </Link>

          {user ? (
            <Link href="/dashboard" className="nav-btn">
              Dashboard
            </Link>
          ) : (
            <Link href="/auth" className="nav-btn">
              Login / Register
            </Link>
          )}
        </nav>

        {/* Mobile dropdown only */}
        <details className="mobile-menu">
          <summary aria-label="Open menu">☰</summary>

          <div className="mobile-menu-panel">
            <Link href="/" className="mobile-menu-link">
              Home
            </Link>

            <Link href="/about" className="mobile-menu-link">
              About Us
            </Link>

            {user ? (
              <Link href="/dashboard" className="mobile-menu-link">
                Dashboard
              </Link>
            ) : (
              <Link href="/auth" className="mobile-menu-link">
                Login / Register
              </Link>
            )}
          </div>
        </details>
      </header>

      <section className="hero-section">
        <picture>
          <source
            media="(max-width: 768px)"
            srcSet="/images/Invite Me to the Wedding AI Mobile.svg"
          />

          <img
            src="/images/Invite Me to the Wedding AI.svg"
            alt="Invite Me to the Wedding"
            className="hero-image"
          />
        </picture>

        <div className="hero-center-content">
          <img
            src="/images/A Little Spark Never Hurts.svg"
            alt="A Little Spark Never Hurts"
            className="spark-tagline"
          />

          <Link href="/about" className="hero-main-btn">
            Start the Spark
          </Link>
        </div>
      </section>
    </main>
  )
}