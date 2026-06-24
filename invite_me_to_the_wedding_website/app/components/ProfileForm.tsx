// app/components/ProfileForm.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type ProfileFormProps = {
  userId: string
  initialProfile: {
    first_name: string | null
    last_name: string | null
    phone: string | null
  } | null
}

export default function ProfileForm({
  userId,
  initialProfile,
}: ProfileFormProps) {
  const supabase = createClient()

  const [firstName, setFirstName] = useState(initialProfile?.first_name ?? '')
  const [lastName, setLastName] = useState(initialProfile?.last_name ?? '')
  const [phone, setPhone] = useState(initialProfile?.phone ?? '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      first_name: firstName,
      last_name: lastName,
      phone: phone,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setMessage('Profile updated successfully.')
    setLoading(false)
  }

  return (
    <form onSubmit={handleSave}>
      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? 'Saving...' : 'Save Profile'}
      </button>

      {message && <p className="message">{message}</p>}
    </form>
  )
}