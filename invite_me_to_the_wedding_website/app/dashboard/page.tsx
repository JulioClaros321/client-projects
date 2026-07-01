import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/app/components/LogoutButton'
import QuestionnaireForm from '@/app/components/QuestionnaireForm'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      first_name,
      last_name,
      phone,
      email,
      validated
    `)
    .eq('id', user.id)
    .maybeSingle()

  const { data: questionnaire } = await supabase
    .from('questionnaires')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile?.validated) {
    return (
      <main className="dashboard-page">
        <details className="dashboard-mobile-menu">
          <summary>☰</summary>

          <div className="dashboard-mobile-dropdown">
            <LogoutButton />
          </div>
        </details>

        <div className="dashboard-nav">
          <LogoutButton />
        </div>

        <div className="dashboard-card">
          <div className="awaiting-approval">
            <h2>Account Under Review</h2>
            <p>
              Your account is currently awaiting approval from the Invite Me to
              the Wedding team. Once approved, you'll gain access to your
              profile and questionnaire.
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="dashboard-page">
      <details className="dashboard-mobile-menu">
        <summary>☰</summary>

        <div className="dashboard-mobile-dropdown">
          <Link href="/profile">My Profile</Link>
          <Link href="/dashboard">Questionnaire</Link>
          <LogoutButton />
        </div>
      </details>

      <div className="dashboard-nav">
        <Link href="/profile" className="nav-btn">
          My Profile
        </Link>

        <Link href="/dashboard" className="nav-btn">
          Questionnaire
        </Link>

        <LogoutButton />
      </div>

      <div className="dashboard-card">
        <h1>Hi {profile?.first_name || 'there'}!</h1>

        <p className="dashboard-intro">
          Your story starts here. Share who you are, what you value, and let us help you find your perfect match.
        </p>

        <QuestionnaireForm
          userId={user.id}
          initialQuestionnaire={questionnaire}
        />
      </div>
    </main>
  )
}