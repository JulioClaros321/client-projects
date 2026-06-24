import Link from 'next/link'

export default function PendingApprovalPage() {
  return (
    <main className="auth-page-wrapper">
      <section
        style={{
          maxWidth: '700px',
          margin: '120px auto',
          textAlign: 'center',
        }}
      >
        <div className="auth-card">
          <p className="auth-kicker">Account Pending</p>

          <h1>Awaiting Approval</h1>

          <p className="auth-subtext" style={{ marginTop: '20px' }}>
            Your account has been created successfully and is currently
            awaiting manual approval from our matchmaking team.
          </p>

          <p
            className="auth-subtext"
            style={{
              marginTop: '14px',
              opacity: 0.75,
            }}
          >
            Once approved, you’ll be able to log in normally.
          </p>

          <Link href="/auth" className="pending-approval-btn">
            Return to Login
          </Link>
        </div>
      </section>
    </main>
  )
}