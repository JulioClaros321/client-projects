import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="about-page">
      <header className="top-bar">
        <div className="welcome-left">
          <Link href="/" className="site-logo-link">
            <img
              src="/images/Invite Me to the Wedding Logo.svg"
              alt="Invite Me to the Wedding"
              className="site-logo"
            />
          </Link>
        </div>

        <nav className="top-right-nav">
          <Link href="/" className="nav-btn">
            Home
          </Link>

          <Link href="/about" className="nav-btn">
            About Us
          </Link>

          <Link href="/auth" className="nav-btn">
            Login / Register
          </Link>
        </nav>

        <details className="mobile-menu">
          <summary aria-label="Open menu">☰</summary>

          <div className="mobile-menu-panel">
            <Link href="/" className="mobile-menu-link">
              Home
            </Link>

            <Link href="/about" className="mobile-menu-link">
              About Us
            </Link>

            <Link href="/auth" className="mobile-menu-link">
              Login / Register
            </Link>
          </div>
        </details>
      </header>

      <section className="about-art-hero">
        <img
          src="/images/about page art.svg"
          alt="Couple enjoying coffee"
          className="about-main-art"
        />

        <div className="about-title-panel">
          <img
            src="/images/about page art title.svg"
            alt="Invite Me to the Wedding"
            className="about-title-art"
          />

          <div className="about-title-button-wrap">
            <a href="#learn-more" className="learn-more-btn">
              Learn More
            </a>
          </div>
        </div>
      </section>

      <section id="learn-more" className="about-learn-more">
        <div className="about-process-header">
          <p className="section-label">How It Works</p>
          <h1>Meet someone with intention, not endless swiping.</h1>
          <p>
            Invite Me to the Wedding is free to join. You sign up, complete
            your survey, and a connector uses your information to help identify
            thoughtful matches.
          </p>
        </div>

        <div className="about-flow">
          <div className="about-flow-card signup-card">
            <span>
              <b>01</b>
            </span>
            <h2>Sign up for free</h2>
            <p>
              Create your account to begin the process. If you already have an
              account, you can sign in instead.
            </p>

            <div className="signup-actions">
              <Link href="/auth" className="about-primary-btn">
                Sign Up
              </Link>

              <Link href="/auth" className="about-text-btn">
                Sign In
              </Link>
            </div>
          </div>

          <div className="about-flow-card">
            <span>
              <b>02</b>
            </span>
            <h2>Fill out your survey</h2>
            <p>
              Share your personality, interests, values, and what kind of
              connection you are looking for.
            </p>
          </div>

          <div className="about-flow-card">
            <span>
              <b>03</b>
            </span>
            <h2>A connector reviews your information</h2>
            <p>
              A connector carefully reviews your responses and looks for
              compatibility beyond surface-level matching.
            </p>
          </div>

          <div className="about-flow-card">
            <span>
              <b>04</b>
            </span>
            <h2>Get matched with intention</h2>
            <p>
              When there is a thoughtful match, your connector helps move the
              introduction forward with care and purpose.
            </p>
          </div>
        </div>

        <div className="connector-cta-card">
          <p className="section-label">For Connectors</p>
          <h2>Interested in becoming a connector?</h2>

          <a
            href="mailto:julio.claros321@gmail.com"
            className="connector-email-btn"
          >
            Become a Connector
          </a>
        </div>
      </section>
    </main>
  )
}