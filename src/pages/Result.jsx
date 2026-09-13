import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Result.css'

function Result() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()

  const score = Number(searchParams.get('score')) || 0
  const total = Number(searchParams.get('total')) || 0

  const [test, setTest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadTest() {
      const { data, error: testError } = await supabase
        .from('tests')
        .select('*')
        .eq('id', id)
        .single()

      if (testError) {
        console.error('Ошибка загрузки теста:', testError)
        setError('Не удалось загрузить результат')
      } else {
        setTest(data)
      }

      setLoading(false)
    }

    loadTest()
  }, [id])

  async function copyTestLink() {
    const link = `${window.location.origin}/test/${id}`

    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (copyError) {
      console.error('Не удалось скопировать ссылку:', copyError)
      setError('Не удалось скопировать ссылку')
    }
  }

  if (loading) {
    return (
      <main className="page result-page">
        <div className="result-loading">
          Загрузка результата...
        </div>
      </main>
    )
  }

  if (error || !test) {
    return (
      <main className="page result-page">
        <div className="result-error">
          {error || 'Тест не найден'}
        </div>

        <Link className="result-button secondary" to="/">
          Вернуться на главную
        </Link>
      </main>
    )
  }

  const percentage =
    total > 0 ? Math.round((score / total) * 100) : 0

  let message = 'Попробуй ещё раз'

  if (percentage === 100) {
    message = 'Идеальный результат!'
  } else if (percentage >= 70) {
    message = 'Ты очень хорошо знаешь этого человека!'
  } else if (percentage >= 40) {
    message = 'Неплохой результат, но есть куда расти'
  } else {
    message = 'Похоже, нужно узнать друг друга получше'
  }

  return (
    <main className="page result-page">
      <div className="result-container">
        <div className="result-topline">
          <span className="result-label">KEZLI / RESULT</span>
          <span className="result-status">Тест завершён</span>
        </div>

        <div className="result-heading">
          <p className="result-creator">
            Тест от <strong>{test.creator_name}</strong>
          </p>

          <h1>{test.title}</h1>

          <p className="result-subtitle">
            Вот насколько хорошо ты знаешь этого человека.
          </p>
        </div>

        <section className="result-card">
          <div className="result-card-header">
            <span>Твой результат</span>
            <span>{percentage}%</span>
          </div>

          <div className="result-score">
            <strong>{score}</strong>
            <span>из {total}</span>
          </div>

          <div className="result-progress">
            <div
              className="result-progress-fill"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="result-message">
            <h2>{message}</h2>

            <p>
              Ты ответил правильно на {score} из {total} вопросов.
            </p>
          </div>
        </section>

        <div className="result-actions">
          <button
            type="button"
            className="result-button primary"
            onClick={copyTestLink}
          >
            {copied ? 'Ссылка скопирована' : 'Поделиться тестом'}
            <span>↗</span>
          </button>

          <Link
            className="result-button secondary"
            to={`/test/${id}`}
          >
            Пройти ещё раз
          </Link>

          <Link
            className="result-button secondary"
            to="/create"
          >
            Создать свой тест
          </Link>
        </div>

        <Link className="result-back-link" to="/">
          ← Вернуться на главную
        </Link>
      </div>
    </main>
  )
}

export default Result