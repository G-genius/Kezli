import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Review.css'

function Review() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()

  const resultId = searchParams.get('resultId')

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

      const [
        { data: testData, error: testError },
        { data: questionsData, error: questionsError },
        { data: resultData, error: resultError },
      ] = await Promise.all([
        supabase
          .from('tests')
          .select('*')
          .eq('id', id)
          .single(),

        supabase
          .from('questions')
          .select('*')
          .eq('test_id', id)
          .order('id', { ascending: true }),

        resultId
          ? supabase
              .from('results')
              .select('*')
              .eq('id', resultId)
              .eq('test_id', id)
              .maybeSingle()
          : supabase
              .from('results')
              .select('*')
              .eq('test_id', id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle(),
      ])

      if (!mounted) {
        return
      }

      if (testError || questionsError || resultError) {
        console.error('Ошибка загрузки разбора:', {
          testError,
          questionsError,
          resultError,
        })
      }

      if (testError || !testData) {
        setError('Тест не найден')
        setLoading(false)
        return
      }

      if (questionsError) {
        setError('Не удалось загрузить вопросы')
        setLoading(false)
        return
      }

      setTest(testData)
      setQuestions(questionsData || [])
      setResult(resultData || null)
      setLoading(false)
    }

    loadReview()

    return () => {
      mounted = false
    }
  }, [id, resultId])

  if (loading) {
    return (
      <main className="page">
        <div className="review-container">
          <p>Загрузка разбора...</p>
        </div>
      </main>
    )
  }

  if (error || !test) {
    return (
      <main className="page">
        <div className="review-container">
          <h1>Разбор не найден</h1>

          <p>{error || 'Не удалось загрузить тест.'}</p>

          <div className="review-actions">
            <Link to="/tests">Вернуться к тестам</Link>
          </div>
        </div>
      </main>
    )
  }

  const savedAnswers = result?.answers || {}

  const score = Number(result?.score || 0)
  const total = Number(result?.total || questions.length || 0)

  const percentage =
    total > 0 ? Math.round((score / total) * 100) : 0

  const resultLink = `/result/${id}?score=${score}&total=${total}`

  return (
    <main className="page">
      <div className="review-container">
        <Link to={resultLink} className="review-back-link">
          ← К результату
        </Link>

        <div className="review-header">
          <p className="review-eyebrow">KEZLI / REVIEW</p>

          <h1>Разбор ответов</h1>

          <p>
            Тест: <strong>{test.title}</strong>
          </p>
        </div>

        <section className="review-summary">
          <strong>
            Правильных ответов: {score} из {total}
          </strong>

          <span>{percentage}%</span>
        </section>

        {!result?.answers && (
          <div className="review-notice">
            Этот результат был создан в старой версии теста.
            Ответы пользователя не были сохранены, поэтому сейчас
            можно посмотреть только правильные варианты.
          </div>
        )}

        <div className="review-list">
          {questions.map((question, index) => {
            const userAnswer = savedAnswers[index]
            const correctAnswer = Number(question.correct)

            const hasAnswer =
              userAnswer !== undefined &&
              userAnswer !== null &&
              userAnswer !== ''

            const isCorrect =
              hasAnswer && Number(userAnswer) === correctAnswer

            const answers = Array.isArray(question.answers)
              ? question.answers
              : []

            const userAnswerText = hasAnswer
              ? answers[Number(userAnswer)] || 'Ответ не найден'
              : 'Ответ не сохранён'

            const correctAnswerText =
              answers[correctAnswer] || 'Ответ не найден'

            return (
              <article
                key={question.id}
                className={`review-card ${
                  isCorrect ? 'review-correct' : 'review-wrong'
                }`}
              >
                <div className="review-card-top">
                  <span>
                    Вопрос {String(index + 1).padStart(2, '0')}
                  </span>

                  <span className="review-status">
                    {isCorrect ? '✓ Правильно' : '× Неправильно'}
                  </span>
                </div>

                <h2>{question.question}</h2>

                <div className="review-answer-block">
                  <span className="review-answer-label">
                    Твой ответ
                  </span>

                  <p>{userAnswerText}</p>
                </div>

                {!isCorrect && (
                  <div className="review-answer-block correct-answer-block">
                    <span className="review-answer-label">
                      Правильный ответ
                    </span>

                    <p>{correctAnswerText}</p>
                  </div>
                )}
              </article>
            )
          })}
        </div>

        <div className="review-actions">
          <Link to={resultLink}>Вернуться к результату</Link>

          <Link to={`/test/${id}`}>Пройти ещё раз</Link>

          <Link to="/tests">Все тесты</Link>
        </div>
      </div>
    </main>
  )
}

export default Review