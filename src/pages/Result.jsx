import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Result.css'

function getValidNumber(value, fallback = 0) {
  const number = Number(value)

  if (!Number.isFinite(number) || number < 0) {
    return fallback
  }

  return number
}

function Result() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()

  const rawScore = getValidNumber(searchParams.get('score'))
  const rawTotal = getValidNumber(searchParams.get('total'))

  const score = rawTotal > 0 ? Math.min(rawScore, rawTotal) : 0
  const total = rawTotal

  const [test, setTest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadTest() {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('id', id)
        .single()

      if (!mounted) {
        return
      }

      if (error) {
        console.error('Ошибка загрузки теста:', error)
      } else {
        setTest(data)
      }

      setLoading(false)
    }

    loadTest()

    return () => {
      mounted = false
    }
  }, [id])

  async function copyTestLink() {
    const link = `${window.location.origin}/test/${id}`

    setCopied(false)
    setCopyError('')

    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
    } catch (error) {
      console.error('Не удалось скопировать ссылку:', error)

      const textArea = document.createElement('textarea')
      textArea.value = link
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'

      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        const copiedSuccessfully = document.execCommand('copy')

        if (copiedSuccessfully) {
          setCopied(true)
        } else {
          setCopyError('Не удалось скопировать ссылку')
        }
      } catch (fallbackError) {
        console.error(
          'Не удалось скопировать ссылку запасным способом:',
          fallbackError
        )

        setCopyError('Не удалось скопировать ссылку')
      } finally {
        document.body.removeChild(textArea)
      }
    }
  }

  if (loading) {
    return (
      <main className="page">
        <div className="result-page">
          <p className="result-loading">Загрузка результата...</p>
        </div>
      </main>
    )
  }

  if (!test) {
    return (
      <main className="page">
        <div className="result-page">
          <div className="result-error">
            <h1>Результат не найден</h1>

            <p>Не удалось загрузить информацию о тесте.</p>

            <Link to="/tests" className="result-main-button">
              Вернуться к тестам
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const percentage =
    total > 0
      ? Math.min(100, Math.max(0, Math.round((score / total) * 100)))
      : 0

  const circleDegrees = percentage * 3.6

  let message = 'Попробуй ещё раз'
  let subtitle = 'Ты уже близко. Попробуй пройти тест ещё раз.'

  if (percentage === 100) {
    message = 'Идеальный результат!'
    subtitle = 'Ты знаешь этого человека лучше всех.'
  } else if (percentage >= 70) {
    message = 'Очень хороший результат!'
    subtitle = 'Ты действительно хорошо знаешь этого человека.'
  } else if (percentage >= 40) {
    message = 'Неплохой результат!'
    subtitle = 'Ещё немного — и будет отличный результат.'
  }

  return (
    <main className="page">
      <div className="result-page">
        <Link to="/" className="result-back-link">
          ← На главную
        </Link>

        <div className="result-header">
          <p className="result-eyebrow">KEZLI / РЕЗУЛЬТАТ</p>

          <h1>{test.title}</h1>

          <p className="result-author">
            Тест от <strong>{test.creator_name}</strong>
          </p>
        </div>

        <section className="result-main-card">
          <div className="result-card-top">
            <span className="result-label">ТВОЙ РЕЗУЛЬТАТ</span>

            <span className="result-status">
              {percentage === 100 ? 'MAX SCORE' : 'COMPLETED'}
            </span>
          </div>

          <div className="result-score-layout">
            <div
              className="result-circle"
              style={{
                background: `conic-gradient(
                  #a78bfa 0deg,
                  #8b5cf6 ${circleDegrees}deg,
                  #27272a ${circleDegrees}deg
                )`,
              }}
            >
              <div className="result-circle-inner">
                <strong>{percentage}%</strong>
                <span>правильных</span>
              </div>
            </div>

            <div className="result-score-info">
              <p className="result-score">
                {score} <span>из {total}</span>
              </p>

              <h2>{message}</h2>

              <p>{subtitle}</p>
            </div>
          </div>

          <div className="result-progress">
            <div
              className="result-progress-fill"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="result-progress-caption">
            <span>0 правильных</span>
            <span>{total} вопросов</span>
          </div>
        </section>

        <section className="result-share-card">
          <div>
            <p className="result-share-title">Проверь друзей</p>

            <p className="result-share-description">
              Поделись тестом и узнай, насколько хорошо друзья знают тебя.
            </p>
          </div>

          <button
            type="button"
            className="result-share-button"
            onClick={copyTestLink}
          >
            {copied ? '✓ Ссылка скопирована' : 'Поделиться тестом ↗'}
          </button>

          {copyError && <p className="form-error">{copyError}</p>}
        </section>

        <div className="result-actions">
          <Link
            to={`/test/${id}`}
            className="result-action result-action-primary"
          >
            Пройти ещё раз
          </Link>

          <Link
            to="/tests"
            className="result-action result-action-secondary"
          >
            Все тесты
          </Link>

          <Link
            to="/create"
            className="result-action result-action-secondary"
          >
            Создать свой тест
          </Link>
        </div>
      </div>
    </main>
  )
}

export default Result