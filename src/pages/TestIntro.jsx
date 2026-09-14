import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './TestIntro.css'

function TestIntro() {
  const { id } = useParams()

  const [test, setTest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let mounted = true

    async function loadTest() {
      try {
        const { data, error: testError } = await supabase
          .from('tests')
          .select('*')
          .eq('id', id)
          .single()

        if (testError) {
          throw testError
        }

        if (mounted) {
          setTest(data)
        }
      } catch (loadError) {
        console.error('Ошибка загрузки теста:', loadError)

        if (mounted) {
          setError('Тест не найден')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadTest()

    return () => {
      mounted = false
    }
  }, [id])

  async function handleShare() {
    const testUrl = window.location.href

    try {
      await navigator.clipboard.writeText(testUrl)
      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2500)
    } catch (shareError) {
      console.error('Ошибка копирования ссылки:', shareError)

      const textArea = document.createElement('textarea')

      textArea.value = testUrl
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      textArea.style.opacity = '0'

      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        const copiedSuccessfully = document.execCommand('copy')

        if (copiedSuccessfully) {
          setCopied(true)

          setTimeout(() => {
            setCopied(false)
          }, 2500)
        } else {
          throw new Error('Копирование не удалось')
        }
      } catch (fallbackError) {
        console.error('Не удалось скопировать ссылку:', fallbackError)
      } finally {
        document.body.removeChild(textArea)
      }
    }
  }

  if (loading) {
    return (
      <main className="page intro-page">
        <div className="intro-loading">Загрузка теста...</div>
      </main>
    )
  }

  if (error || !test) {
    return (
      <main className="page intro-page">
        <div className="intro-error">
          <span>404</span>

          <h1>{error || 'Тест не найден'}</h1>

          <Link to="/tests" className="intro-secondary-button">
            Вернуться к тестам
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="page intro-page">
      <div className="intro-container">
        <div className="intro-topline">
          <span className="intro-badge">KEZLI TEST</span>

          <span className="intro-number">01</span>
        </div>

        <div className="intro-content">
          <p className="intro-label">
            Тест от {test.creator_name}
          </p>

          <h1>{test.title}</h1>

          <p className="intro-description">
            Проверь, насколько хорошо ты знаешь этого человека.
            Отвечай честно и узнай свой результат в конце.
          </p>

          <div className="intro-info">
            <div className="intro-info-item">
              <span className="intro-info-icon">✦</span>

              <div>
                <strong>Личные вопросы</strong>

                <span>
                  Только о человеке, который создал тест
                </span>
              </div>
            </div>

            <div className="intro-info-item">
              <span className="intro-info-icon">↗</span>

              <div>
                <strong>Результат в конце</strong>

                <span>
                  Узнай, сколько ответов ты угадал
                </span>
              </div>
            </div>
          </div>

          <div className="intro-actions">
            <Link
              to={`/test/${id}/questions`}
              className="intro-primary-button"
              reloadDocument
            >
              <span className="intro-button-text">
                Пройти тест
              </span>

              <span className="intro-button-arrow">↗</span>
            </Link>

            <button
              type="button"
              className="intro-share-button"
              onClick={handleShare}
            >
              {copied ? 'Ссылка скопирована ✓' : 'Поделиться тестом ↗'}
            </button>

            <Link
              to="/create"
              className="intro-secondary-button"
            >
              Создать свой тест
            </Link>
          </div>
        </div>

        <div className="intro-footer">
          <span>Готов проверить свои знания?</span>

          <span>KEZLI / 2026</span>
        </div>
      </div>
    </main>
  )
}

export default TestIntro