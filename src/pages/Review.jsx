import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Review() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [test, setTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadReview() {
      setLoading(true)
      setError('')

      const { data: testData, error: testError } = await supabase
        .from('tests')
        .select('*')
        .eq('id', id)
        .single()

      if (!mounted) {
        return
      }

      if (testError) {
        console.error('Ошибка загрузки теста:', testError)
        setError('Не удалось загрузить тест')
        setLoading(false)
        return
      }

      const { data: questionsData, error: questionsError } =
        await supabase
          .from('questions')
          .select('*')
          .eq('test_id', id)
          .order('id', { ascending: true })

      if (!mounted) {
        return
      }

      if (questionsError) {
        console.error('Ошибка загрузки вопросов:', questionsError)
        setError('Не удалось загрузить вопросы')
        setLoading(false)
        return
      }

      const { data: resultData, error: resultError } = await supabase
        .from('results')
        .select('*')
        .eq('test_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!mounted) {
        return
      }

      if (resultError) {
        console.error('Ошибка загрузки результата:', resultError)
        setError('Не удалось загрузить результат')
        setLoading(false)
        return
      }

      if (!resultData) {
        setError('Результат прохождения не найден')
        setLoading(false)
        return
      }

      setTest(testData)
      setQuestions(questionsData || [])
      setResult(resultData)
      setLoading(false)
    }

    loadReview()

    return () => {
      mounted = false
    }
  }, [id])

  if (loading) {
    return (
      <main className="page">
        <div className="take-test-container">
          <p className="loading-text">Загрузка разбора ответов...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="page">
        <div className="take-test-container">
          <div className="error-state">
            <p>{error}</p>

            <button
              type="button"
              className="primary-link"
              onClick={() => navigate('/tests')}
            >
              Вернуться к тестам
            </button>
          </div>
        </div>
      </main>
    )
  }

  const savedAnswers = result?.answers || {}

  return (
    <main className="page">
      <div className="take-test-container review-container">
        <div className="take-test-top">
          <Link className="back-button" to={`/result/${id}`}>
            ← К результату
          </Link>

          <span className="take-test-counter">
            {result.score} из {result.total}
          </span>
        </div>

        <div className="take-test-heading">
          <p className="eyebrow">KEZLI / REVIEW</p>

          <h1>Разбор ответов</h1>

          <p>
            Тест: <strong>{test.title}</strong>
          </p>
        </div>

        <div className="review-summary">
          <strong>
            Правильных ответов: {result.score} из {result.total}
          </strong>

          <span>
            {Math.round((result.score / result.total) * 100)}%
          </span>
        </div>

        <div className="review-list">
          {questions.map((question, questionIndex) => {
            const userAnswer = savedAnswers[questionIndex]
            const isCorrect = userAnswer === question.correct

            return (
              <section
                className={`review-card ${
                  isCorrect ? 'review-correct' : 'review-wrong'
                }`}
                key={question.id}
              >
                <div className="review-card-top">
                  <span className="question-number">
                    ВОПРОС {String(questionIndex + 1).padStart(2, '0')}
                  </span>

                  <span className="review-status">
                    {isCorrect ? '✓ Правильно' : '✕ Неправильно'}
                  </span>
                </div>

                <h2>{question.question}</h2>

                <div className="review-answer-block">
                  <span className="review-answer-label">
                    Твой ответ
                  </span>

                  <p>
                    {question.answers[userAnswer] ||
                      'Ответ не найден'}
                  </p>
                </div>

                {!isCorrect && (
                  <div className="review-answer-block correct-answer-block">
                    <span className="review-answer-label">
                      Правильный ответ
                    </span>

                    <p>{question.answers[question.correct]}</p>
                  </div>
                )}
              </section>
            )
          })}
        </div>

        <div className="take-test-actions">
          <Link className="secondary-link" to={`/result/${id}`}>
            ← К результату
          </Link>

          <Link className="primary-link" to="/tests">
            Другие тесты ↗
          </Link>
        </div>
      </div>
    </main>
  )
}

export default Review