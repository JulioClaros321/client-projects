'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Questionnaire = {
  id?: string
  user_id: string

  partner_min_age: number | null
  partner_max_age: number | null
  open_to: string[]
  relationship_goal: string
  partner_energy: string
  attraction_importance: number
  partner_height_preference: string
  partner_height_details: string
  partner_traits: string[]
  partner_financial_independence_importance: number
  partner_earns_more_feeling: string
  partner_faith_importance: string
  partner_faith_difference: string
  wants_kids: string
  kids_dealbreaker: string
  partner_has_kids_dealbreaker: string
  partner_smoking_issue: string
  partner_drinking_preference: string
  partner_distance_flexibility: string
  dream_first_date: string
  green_flag: string
  red_flag: string
  desired_home_life: string
  perfect_sunday: string[]
  surprise_date_preference: string
  most_attractive_quality: string
  affection_style: string[]
  conflict_style: string
  healthy_relationship_style: string
  friends_description: string
  connector_notes: string

  matchmaking_completed?: boolean
}

type Props = {
  userId: string
  initialQuestionnaire: Questionnaire | null
}

type QuestionType =
  | 'text'
  | 'textarea'
  | 'single'
  | 'multi'
  | 'slider'
  | 'age-range'
  | 'height-preference'
  | 'text-list'

type Question = {
  field: keyof Questionnaire
  type: QuestionType
  title: string
  subtitle?: string
  options?: string[]
  placeholder?: string
  min?: number
  max?: number
}

const ageOptions = Array.from({ length: 63 }, (_, i) => String(i + 18))
const OPEN_QUESTION_MAX_LENGTH = 300

const questions: Question[] = [
  {
    field: 'partner_min_age',
    type: 'age-range',
    title: "What's your ideal age range?",
    subtitle: 'Give your connector a comfortable range to work with.',
  },
  {
    field: 'open_to',
    type: 'multi',
    title: 'Who are you hoping to meet?',
    subtitle: 'Choose all that apply.',
    options: ['Men', 'Women', 'Non-binary people', 'Open to anyone'],
  },
  {
    field: 'relationship_goal',
    type: 'single',
    title: 'How serious are we talking?',
    options: [
      'Marriage-minded — I know what I want',
      'Serious relationship — I want something real.',
      `Open to possibilities — let's see`,
      'Just seeing where things go',
    ],
  },
  {
    field: 'partner_energy',
    type: 'single',
    title: 'What kind of energy are you drawn to?',
    options: [
      'Homebody with elite couch skills',
      'Social butterfly',
      'A little bit of both',
      "As long as we click, I don't care",
    ],
  },
  {
    field: 'attraction_importance',
    type: 'slider',
    title: 'How important is physical attraction?',
    subtitle: '1 = vibes matter more, 10 = instant spark matters a lot',
    min: 1,
    max: 10,
  },
  {
    field: 'partner_height_preference',
    type: 'height-preference',
    title: 'Does height matter to you?',
    subtitle: 'No judgment. We are simply taking notes.',
    options: [
      'Not at all',
      'A little',
      "Yes, but I'm not bringing a tape measure",
      'Yes, and I definitely notice',
    ],
  },
  {
    field: 'partner_traits',
    type: 'multi',
    title: 'Pick your top 5 traits in a partner.',
    subtitle: 'Choose up to five.',
    options: [
      'Kind',
      'Funny',
      'Emotionally mature',
      'Ambitious',
      'Loyal',
      'Adventurous',
      'Great communicator',
      'Family-oriented',
      'Affectionate',
      'Confident',
      'Curious',
      'Can laugh at themselves',
      "Doesn't start fights with customer service",
    ],
  },
  {
    field: 'partner_financial_independence_importance',
    type: 'slider',
    title: 'How important is financial independence?',
    subtitle: '1 = not important, 10 = very important',
    min: 1,
    max: 10,
  },
  {
    field: 'partner_earns_more_feeling',
    type: 'single',
    title: 'How would you feel if your partner earned more than you?',
    options: [
      'Love that for us',
      "Doesn't matter one bit",
      'Depends on the situation',
      'My ego might need a pep talk',
    ],
  },
  {
    field: 'partner_faith_importance',
    type: 'single',
    title: 'How important is faith or spirituality in a partner?',
    options: [
      'Very important',
      'Somewhat important',
      'Open either way',
      'Not important',
    ],
  },
  {
    field: 'partner_faith_difference',
    type: 'single',
    title: 'Would you marry someone with different beliefs?',
    options: ['Absolutely', 'Depends', 'Probably not'],
  },
  {
    field: 'wants_kids',
    type: 'single',
    title: 'Do you want children someday?',
    options: ['Yes', 'Maybe', 'No', 'I already have kids'],
  },
  {
    field: 'kids_dealbreaker',
    type: 'single',
    title: 'Would a mismatch on kids be a dealbreaker?',
    options: ['Yes', 'Maybe', 'No'],
  },
  {
    field: 'partner_has_kids_dealbreaker',
    type: 'single',
    title: 'Are you open to dating someone who already has children?',
    options: [
      'Absolutely',
      'Depends on the situation',
      'Probably not',
      'If they come with good snacks, maybe',
    ],
  },
  {
    field: 'partner_smoking_issue',
    type: 'single',
    title: 'How do you feel about smoking?',
    options: ['Hard no', 'Not my favorite', 'Depends how often', "Doesn't bother me"],
  },
  {
    field: 'partner_drinking_preference',
    type: 'single',
    title: 'How do you feel about drinking?',
    options: [
      'Prefer sober',
      'Social drinks are fine',
      'As long as nobody is doing karaoke every weekend',
      "Doesn't matter",
    ],
  },
  {
    field: 'partner_distance_flexibility',
    type: 'single',
    title: 'Could you date someone who lives 30+ minutes away?',
    options: ['Absolutely', 'Depends', 'Prefer nearby'],
  },
  {
    field: 'dream_first_date',
    type: 'single',
    title: 'Which date sounds most like your dream first date?',
    options: [
      'Coffee and effortless conversation',
      'Fancy dinner and good wine',
      'Museum or art walk',
      'Mini golf and chaos',
      'Outdoor adventure',
      'Live music and cocktails',
      'Surprise me',
    ],
  },
  {
    field: 'green_flag',
    type: 'textarea',
    title: "What makes you think, 'Okay... I need a second date'?",
    placeholder: 'Kindness, confidence, how they treat people...',
  },
  {
    field: 'red_flag',
    type: 'textarea',
    title: 'What makes you quietly start planning your escape route?',
    placeholder: 'Bad manners, emotional unavailability, weird energy...',
  },
  {
    field: 'desired_home_life',
    type: 'single',
    title: 'What kind of home life are you hoping for?',
    options: [
      'Calm and cozy',
      'Busy and social',
      'Adventure every weekend',
      'Somewhere in the middle',
      'Golden retriever energy household',
    ],
  },
  {
    field: 'perfect_sunday',
    type: 'multi',
    title: 'Pick your perfect Sunday.',
    subtitle: 'Choose all that sound like you.',
    options: [
      'Sleeping in',
      'Brunch',
      'Church or faith activities',
      'Gym',
      'Watching football',
      'Family time',
      'Road trip',
      'Farmers market',
      'Cooking together',
      'Rotting on the couch in peace',
    ],
  },
  {
    field: 'surprise_date_preference',
    type: 'single',
    title: 'Your future partner surprises you with plans. You hope it is...',
    options: [
      'Weekend getaway',
      'Fancy dinner',
      'Concert',
      'Sporting event',
      'Hiking adventure',
      'Stay-at-home date night',
      "I packed a bag, we're leaving in 20 minutes",
    ],
  },
  {
    field: 'most_attractive_quality',
    type: 'single',
    title: 'Which is most attractive?',
    options: [
      'Kindness',
      'Confidence',
      'Humor',
      'Intelligence',
      'Ambition',
      'Emotional maturity',
      'Someone who can assemble IKEA furniture without crying',
    ],
  },
  {
    field: 'affection_style',
    type: 'multi',
    title: 'How do you usually like affection to show up?',
    options: [
      'Constant texting',
      'Physical affection',
      'Acts of service',
      'Quality time',
      'Sending memes',
      'Buying snacks',
      'All of the above',
    ],
  },
  {
    field: 'conflict_style',
    type: 'single',
    title: "When there's conflict, you prefer someone who...",
    options: [
      'Wants to talk immediately',
      'Needs a little time first',
      'Can make a joke without avoiding the issue',
      'Googles “am I wrong?”',
      'Depends on the day',
    ],
  },
  {
    field: 'healthy_relationship_style',
    type: 'single',
    title: 'Which relationship sounds healthiest to you?',
    options: [
      'Best friends first',
      'Passionate and exciting',
      'Stable and dependable',
      'A mix of all three',
    ],
  },
  {
    field: 'friends_description',
    type: 'single',
    title: "What would your friends say you're looking for?",
    options: [
      'My future spouse',
      'My best friend',
      'Someone who balances me out',
      'Someone who can keep up with me',
      "They'd probably roast me instead",
    ],
  },
  {
    field: 'connector_notes',
    type: 'textarea',
    title: 'Anything else your connector should know?',
    subtitle: 'Dealbreakers, green flags, chaos, context — put it here.',
  },
]

function buildInitialForm(
  userId: string,
  initialQuestionnaire: Questionnaire | null
): Questionnaire {
  return {
    id: initialQuestionnaire?.id,
    user_id: userId,

    partner_min_age: initialQuestionnaire?.partner_min_age ?? null,
    partner_max_age: initialQuestionnaire?.partner_max_age ?? null,
    open_to: initialQuestionnaire?.open_to || [],
    relationship_goal: initialQuestionnaire?.relationship_goal || '',
    partner_energy: initialQuestionnaire?.partner_energy || '',
    attraction_importance: initialQuestionnaire?.attraction_importance ?? 5,
    partner_height_preference:
      initialQuestionnaire?.partner_height_preference || '',
    partner_height_details: initialQuestionnaire?.partner_height_details || '',
    partner_traits: initialQuestionnaire?.partner_traits || [],
    partner_financial_independence_importance:
      initialQuestionnaire?.partner_financial_independence_importance ?? 5,
    partner_earns_more_feeling:
      initialQuestionnaire?.partner_earns_more_feeling || '',
    partner_faith_importance:
      initialQuestionnaire?.partner_faith_importance || '',
    partner_faith_difference:
      initialQuestionnaire?.partner_faith_difference || '',
    wants_kids: initialQuestionnaire?.wants_kids || '',
    kids_dealbreaker: initialQuestionnaire?.kids_dealbreaker || '',
    partner_has_kids_dealbreaker:
      initialQuestionnaire?.partner_has_kids_dealbreaker || '',
    partner_smoking_issue:
      initialQuestionnaire?.partner_smoking_issue || '',
    partner_drinking_preference:
      initialQuestionnaire?.partner_drinking_preference || '',
    partner_distance_flexibility:
      initialQuestionnaire?.partner_distance_flexibility || '',
    dream_first_date: initialQuestionnaire?.dream_first_date || '',
    green_flag: initialQuestionnaire?.green_flag || '',
    red_flag: initialQuestionnaire?.red_flag || '',
    desired_home_life: initialQuestionnaire?.desired_home_life || '',
    perfect_sunday: initialQuestionnaire?.perfect_sunday || [],
    surprise_date_preference:
      initialQuestionnaire?.surprise_date_preference || '',
    most_attractive_quality:
      initialQuestionnaire?.most_attractive_quality || '',
    affection_style: initialQuestionnaire?.affection_style || [],
    conflict_style: initialQuestionnaire?.conflict_style || '',
    healthy_relationship_style:
      initialQuestionnaire?.healthy_relationship_style || '',
    friends_description: initialQuestionnaire?.friends_description || '',
    connector_notes: initialQuestionnaire?.connector_notes || '',

    matchmaking_completed:
      initialQuestionnaire?.matchmaking_completed || false,
  }
}

export default function QuestionnaireForm({
  userId,
  initialQuestionnaire,
}: Props) {
  const supabase = createClient()

  const [editing, setEditing] =
    useState(!initialQuestionnaire?.matchmaking_completed)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [justCompleted, setJustCompleted] = useState(false)

  const [form, setForm] = useState<Questionnaire>(() =>
    buildInitialForm(userId, initialQuestionnaire)
  )

  const currentQuestion = questions[step]
  const isLastStep = step === questions.length - 1
  const progress = ((step + 1) / questions.length) * 100

  function updateField<K extends keyof Questionnaire>(
    field: K,
    value: Questionnaire[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  function toggleArrayValue(field: keyof Questionnaire, value: string) {
    const current = form[field]

    if (!Array.isArray(current)) return

    const isOpenToAnyoneField = field === 'open_to'
    const isOpenToAnyoneOption = value === 'Open to anyone'

    const isSelected = current.includes(value)

    if (isSelected) {
      updateField(
        field,
        current.filter((item) => item !== value) as never
      )
      setMessage('')
      return
    }

    if (isOpenToAnyoneField && isOpenToAnyoneOption) {
      updateField(field, ['Open to anyone'] as never)
      setMessage('')
      return
    }

    const cleanedCurrent =
      isOpenToAnyoneField
        ? current.filter((item) => item !== 'Open to anyone')
        : current

    const maxSelectionsByField: Partial<Record<keyof Questionnaire, number>> = {
      partner_traits: 5,
    }

    const maxSelections = maxSelectionsByField[field]

    if (maxSelections && cleanedCurrent.length >= maxSelections) {
      setMessage(`Please choose only up to ${maxSelections}.`)
      return
    }

    updateField(field, [...cleanedCurrent, value] as never)
    setMessage('')
  }

  function isAnswered(question: Question) {
    if (question.type === 'age-range') {
      return form.partner_min_age !== null && form.partner_max_age !== null
    }

    if (question.type === 'height-preference') {
      if (!form.partner_height_preference) return false

      const needsDetails =
        form.partner_height_preference !== 'Not at all' &&
        form.partner_height_preference !== 'A little'

      if (!needsDetails) return true

      return form.partner_height_details.trim().length > 0
    }

    const value = form[question.field]

    if (Array.isArray(value)) {
      return value.filter(Boolean).length > 0
    }

    if (typeof value === 'number') {
      return value !== null
    }

    return String(value || '').trim().length > 0
  }

  async function saveProgress(nextForm = form) {
    const { error } = await supabase.from('questionnaires').upsert(
      {
        ...nextForm,
        user_id: userId,
        matchmaking_completed: false,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    )

    if (error) {
      setMessage(error.message)
      return false
    }

    return true
  }

  async function goNext() {
    setMessage('')

    if (!isAnswered(currentQuestion)) {
      setMessage('Please answer this question before continuing.')
      return
    }

    setLoading(true)

    const saved = await saveProgress()

    setLoading(false)

    if (!saved) return

    setStep((prev) => Math.min(prev + 1, questions.length - 1))
  }

  function goBack() {
    setMessage('')
    setStep((prev) => Math.max(prev - 1, 0))
  }

  async function handleSubmit() {
    setLoading(true)
    setMessage('')

    if (!isAnswered(currentQuestion)) {
      setMessage('Please answer this question before submitting.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('questionnaires').upsert(
      {
        ...form,
        user_id: userId,
        matchmaking_completed: true,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    )

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setJustCompleted(true)
    setEditing(false)
    setLoading(false)
  }

  function renderQuestion(question: Question) {
    const value = form[question.field]

    if (question.type === 'age-range') {
      return (
        <div className="age-range-grid">
          <select
            value={form.partner_min_age ?? ''}
            onChange={(e) =>
              updateField(
                'partner_min_age',
                e.target.value ? Number(e.target.value) : null
              )
            }
          >
            <option value="">Minimum age</option>
            {ageOptions.map((age) => (
              <option key={`min-${age}`} value={age}>
                {age}
              </option>
            ))}
          </select>

          <select
            value={form.partner_max_age ?? ''}
            onChange={(e) =>
              updateField(
                'partner_max_age',
                e.target.value ? Number(e.target.value) : null
              )
            }
          >
            <option value="">Maximum age</option>
            {ageOptions.map((age) => (
              <option key={`max-${age}`} value={age}>
                {age}
              </option>
            ))}
          </select>
        </div>
      )
    }

    if (question.type === 'height-preference') {
      const needsDetails =
        form.partner_height_preference !== '' &&
        form.partner_height_preference !== 'Not at all' &&
        form.partner_height_preference !== 'A little'

      return (
        <>
          <div className="pill-group">
            {question.options?.map((option) => (
              <button
                type="button"
                key={option}
                className={`pill ${
                  form.partner_height_preference === option ? 'selected' : ''
                }`}
                onClick={(e) => {
                  e.preventDefault()
                  updateField('partner_height_preference', option)
                  if (option === 'Not at all' || option === 'A little') {
                    updateField('partner_height_details', '')
                  }
                }}
              >
                {option}
              </button>
            ))}
          </div>

          {needsDetails && (
            <select
              value={form.partner_height_details}
              onChange={(e) =>
                updateField('partner_height_details', e.target.value)
              }
            >
              <option value="">Choose a height preference</option>
              <option value="Under 5'5&quot;">Under 5&apos;5&quot;</option>
              <option value="5'5&quot;–5'8&quot;">5&apos;5&quot;–5&apos;8&quot;</option>
              <option value="5'8&quot;–6'0&quot;">5&apos;8&quot;–6&apos;0&quot;</option>
              <option value="6'0&quot;+">6&apos;0&quot;+</option>
              <option value="Flexible, but I notice height">
                Flexible, but I notice height
              </option>
            </select>
          )}
        </>
      )
    }

    if (question.type === 'textarea') {
      const textValue = String(value || '')

      return (
        <>
          <textarea
            value={textValue}
            maxLength={OPEN_QUESTION_MAX_LENGTH}
            onChange={(e) =>
              updateField(question.field, e.target.value as never)
            }
            placeholder={question.placeholder || 'Write your answer here...'}
          />

          <p className="character-count">
            {textValue.length}/{OPEN_QUESTION_MAX_LENGTH}
          </p>
        </>
      )
    }

    if (question.type === 'text') {
      return (
        <input
          type="text"
          value={String(value || '')}
          maxLength={OPEN_QUESTION_MAX_LENGTH}
          onChange={(e) =>
            updateField(question.field, e.target.value as never)
          }
          placeholder={question.placeholder || ''}
        />
      )
    }

    if (question.type === 'single') {
      return (
        <div className="pill-group">
          {question.options?.map((option) => (
            <button
              type="button"
              key={option}
              className={`pill ${value === option ? 'selected' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                updateField(question.field, option as never)
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )
    }

    if (question.type === 'multi') {
      const selectedValues = Array.isArray(value) ? value : []

      return (
        <div className="pill-group">
          {question.options?.map((option) => (
            <button
              type="button"
              key={option}
              className={`pill ${
                selectedValues.includes(option) ? 'selected-multi' : ''
              }`}
              onClick={(e) => {
                e.preventDefault()
                toggleArrayValue(question.field, option)
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )
    }

    if (question.type === 'slider') {
      const numberValue = typeof value === 'number' ? value : 5

      return (
        <>
          <input
            type="range"
            min={question.min || 1}
            max={question.max || 10}
            value={numberValue}
            onChange={(e) =>
              updateField(question.field, Number(e.target.value) as never)
            }
          />

          <p className="message">
            {numberValue} / {question.max || 10}
          </p>
        </>
      )
    }

    return null
  }

  if (!editing) {
    return (
      <section className="questionnaire-review-screen">
        <p className="questionnaire-eyebrow">
          {justCompleted
            ? "Questionnaire Complete"
            : "Preferences Saved"}
        </p>

        <h2>
          {justCompleted
            ? "Your connector has what they need."
            : "Your questionnaire is already complete."}
        </h2>

        <p>
          {justCompleted
            ? "Thank you! Your answers have been submitted and are now available to your connector."
            : "You can update your answers at any time."}
        </p>

        <button
          type="button"
          className="submit-btn review-edit-btn"
          onClick={() => {
            setEditing(true)
            setStep(0)
          }}
        >
          Edit Questionnaire
        </button>
      </section>
    )
  }

  return (
    <section className="questionnaire-flow">
      <div className="questionnaire-progress-wrap">
        <p className="questionnaire-progress-text">
          Question {step + 1} of {questions.length}
        </p>

        <div className="questionnaire-progress-bar">
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div key={step} className="questionnaire-step-card">
        <p className="questionnaire-eyebrow">Who You&apos;re Seeking</p>

        <h2>{currentQuestion.title}</h2>

        {currentQuestion.subtitle && (
          <p className="questionnaire-subtitle">
            {currentQuestion.subtitle}
          </p>
        )}

        {renderQuestion(currentQuestion)}

        {step > 0 && (
          <button
            type="button"
            className="questionnaire-back-btn"
            onClick={goBack}
            disabled={loading}
            aria-label="Previous Question"
          >
            ↩
          </button>
        )}

        <div className="questionnaire-actions">
          {isLastStep ? (
            <button
              type="button"
              className="submit-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Submit Questionnaire'}
            </button>
          ) : (
            <button
              type="button"
              className="submit-btn"
              onClick={goNext}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Next'}
            </button>
          )}
        </div>

        {message && <p className="message">{message}</p>}
      </div>
    </section>
  )
}