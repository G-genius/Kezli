import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Results.css'

function formatDate(dateString) {
  if (!dateString) {
    return 'Дата неизвестна'
  }

  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatDateTime(dateString) {
  if (!dateString) {
    return 'Дата неизвестна'
  }

  return new Date(dateString).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getPercentage(correct, total) {
  if (!total) {
    return 0
  }

  return Math.round((correct / total) * 100)
}

function getResultLabel(percentage) {
  if (percentage === 100) {
    return 'Отличный результат'
  }

  if (percentage >= 80) {
    return 'Очень хороший результат'
  }

  if (percentage >= 60) {
    return 'Хороший результат'
  }

  if (percentage >= 40) {
    return 'Есть куда расти'
  }

  return 'Попробуй ещё раз'
}

export default function Results() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [test, setTest] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadResults() {
      setLoading(true)
      setError('')

      const [
        { data: testData, error: testError },
        { data: resultsData, error: resultsError },
      ] = await Promise.all([
        supabase
          .from('tests')
          .select('*')
          .eq('id', id)
          .single(),

        supabase
          .from('results')
          .select('*')
          .eq('test_id', id)
          .order('created_at', { ascending: false }),
      ])

      if (testError || resultsError) {
        console.error('Ошибка загрузки результатов:', {
          testError,
          resultsError,
        })

        setError('Не удалось загрузить результаты теста.')
        setLoading(false)
        return
      }

      setTest(testData)
      setResults(resultsData || [])
      setLoading(false)
    }

    loadResults()
  }, [id])

  const statistics = useMemo(() => {
    if (!results.length) {
      return {
        totalAttempts: 0,
        averagePercentage: 0,
        bestResult: 0,
        totalCorrectAnswers: 0,
        totalQuestions: 0,
      }
    }

    const percentages = results.map((result) => {
      const correct = Number(result.correct ?? result.score ?? 0)
      const total = Number(
        result.total_questions ??
          result.total ??
          test?.questions_count ??
          0,
      )

      return getPercentage(correct, total)
    })

    const totalCorrectAnswers = results.reduce((sum, result) => {
      return sum + Number(result.correct ?? result.score ?? 0)
    }, 0)

    const totalQuestions = results.reduce((sum, result) => {
      return (
        sum +
        Number(
          result.total_questions ??
            result.total ??
            test?.questions_count ??
            0,
        )
      )
    }, 0)

    return {
      totalAttempts: results.length,
      averagePercentage: Math.round(
        percentages.reduce((sum, percentage) => sum + percentage, 0) /
          percentages.length,
      ),
      bestResult: Math.max(...percentages),
      totalCorrectAnswers,
      totalQuestions,
    }
  }, [results, test])

  if (loading) {
    return (
      <main className="page">
        <div className="test-container">
          <div className="loading-state">
            <span className="loading-spinner" />
            <p>Загружаем результаты...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="page">
        <div className="test-container">
          <div className="error-message">
            <strong>Что-то пошло не так</strong>
            <p>{error}</p>

            <button
              type="button"
              className="primary-button"
              onClick={() => navigate(-1)}
            >
              ← Назад
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (!test) {
    return (
      <main className="page">
        <div className="test-container">
          <div className="empty-state">
            <div className="empty-state-icon">?</div>
            <h2>Тест не найден</h2>
            <p>Возможно, тест был удалён или ссылка устарела.</p>

            <Link to="/tests" className="primary-button">
              Все тесты
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <div className="test-container">
        <div className="results-heading">
          <div>
            <span className="eyebrow">RESULTS</span>

            <h1>Результаты теста</h1>

            <p>
              {test.title || 'Без названия'}
            </p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate(-1)}
          >
            ← Назад
          </button>
        </div>

        <section className="results-overview">
          <div className="results-overview-main">
            <span className="results-overview-label">
              Средний результат
            </span>

            <strong className="results-overview-value">
              {statistics.averagePercentage}%
            </strong>

            <p>
              На основе всех прохождений этого теста
            </p>
          </div>

          <div className="results-overview-progress">
            <div className="progress-track">
              <div
                className="progress-value"
                style={{
                  width: `${statistics.averagePercentage}%`,
                }}
              />
            </div>

            <div className="progress-caption">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </section>

        <section className="statistics-grid">
          <div className="stat-card">
            <span className="stat-card-label">
              Всего попыток
            </span>

            <strong>{statistics.totalAttempts}</strong>

            <small>
              Все прохождения теста
            </small>
          </div>

          <div className="stat-card">
            <span className="stat-card-label">
              Лучший результат
            </span>

            <strong>{statistics.bestResult}%</strong>

            <small>
              Максимальный процент
            </small>
          </div>

          <div className="stat-card">
            <span className="stat-card-label">
              Правильных ответов
            </span>

            <strong>{statistics.totalCorrectAnswers}</strong>

            <small>
              За все прохождения
            </small>
          </div>

          <div className="stat-card">
            <span className="stat-card-label">
              Всего вопросов
            </span>

            <strong>{statistics.totalQuestions}</strong>

            <small>
              Во всех попытках
            </small>
          </div>
        </section>

        <section className="results-history">
          <div className="results-list-heading">
            <div>
              <span className="eyebrow">HISTORY</span>

              <h2>Последние прохождения</h2>
            </div>

            <span className="results-count">
              {results.length}{' '}
              {results.length === 1
                ? 'попытка'
                : results.length >= 2 && results.length <= 4
                  ? 'попытки'
                  : 'попыток'}
            </span>
          </div>

          {!results.length ? (
            <div className="empty-state">
              <div className="empty-state-icon">∅</div>

              <h2>Пока нет прохождений</h2>

              <p>
                Этот тест ещё никто не прошёл.
              </p>

              <Link
                to={`/test/${id}`}
                className="primary-button"
              >
                Пройти тест
              </Link>
            </div>
          ) : (
            <div className="results-list">
              {results.map((result, index) => {
                const correct = Number(
                  result.correct ?? result.score ?? 0,
                )

                const total = Number(
                  result.total_questions ??
                    result.total ??
                    test.questions_count ??
                    0,
                )

                const percentage = getPercentage(correct, total)

                return (
                  <article
                    className="result-row"
                    key={result.id}
                  >
                    <div className="result-row-number">
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    <div className="result-row-info">
                      <h3>
                        Прохождение {results.length - index}
                      </h3>

                      <p>
                        {formatDateTime(result.created_at)}
                      </p>

                      <div className="result-mini-progress">
                        <div
                          className="result-mini-progress-value"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="result-row-score">
                      <strong>
                        {correct} из {total}
                      </strong>

                      <span>
                        {percentage}%
                      </span>
                    </div>

                    <div className="result-row-label">
                      {getResultLabel(percentage)}
                    </div>

                    <div className="result-row-action">
                      <Link to={`/review/${id}?resultId=${result.id}`}>
                        Разбор ↗
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <div className="result-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate(-1)}
          >
            ← Назад
          </button>

          <Link
            to={`/test/${id}`}
            className="secondary-button"
          >
            Пройти ещё раз
          </Link>

          <Link
            to={`/test/${id}`}
            className="secondary-button"
          >
            Открыть тест
          </Link>

          <Link
            to="/tests"
            className="primary-button"
          >
            Все тесты
          </Link>

          <Link
            to="/my-tests"
            className="secondary-button"
          >
            Мои тесты
          </Link>
        </div>
      </div>
    </main>
  )
}