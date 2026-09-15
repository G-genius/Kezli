import { useEffect, useMemo, useState } from 'react'
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Review.css'

function getPercentage(correct, total) {
  if (!total) return 0

  return Math.round((correct / total) * 100)
}

function getResultLabel(percentage) {
  if (percentage === 100) return 'Идеальный результат'
  if (percentage >= 80) return 'Отличный результат'
  if (percentage >= 60) return 'Хороший результат'
  if (percentage >= 40) return 'Можно лучше'

  return 'Попробуй ещё раз'
}

function formatDate(date) {
  if (!date) return ''

  return new Date(date).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function normalizeAnswers(value) {
  if (!value) return {}

  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return {}
    }
  }

  return value
}

function getUserAnswer(userAnswers, question, questionIndex) {
  if (!userAnswers) {
    return null
  }

  if (Array.isArray(userAnswers)) {
    return userAnswers[questionIndex] ?? null
  }

  if (typeof userAnswers === 'object') {
    const possibleKeys = [
      // Новый формат: ответы по индексу вопроса
      String(questionIndex),
      questionIndex,

      // Старый формат: ответы по id вопроса
      String(question.id),
      question.id,

      // Возможный формат с нумерацией от 1
      String(questionIndex + 1),
      questionIndex + 1,
    ]

    for (const key of possibleKeys) {
      if (userAnswers[key] !== undefined) {
        return userAnswers[key]
      }
    }
  }

  return null
}

function getCorrectAnswer(question) {
  if (question.correct !== null && question.correct !== undefined) {
    return question.correct
  }

  if (
    question.correct_answer !== null &&
    question.correct_answer !== undefined
  ) {
    return question.correct_answer
  }

  return null
}

function normalizeAnswerValue(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim().toLowerCase())
      .sort()
      .join('|')
  }

  if (value === null || value === undefined) {
    return ''
  }

  return String(value).trim().toLowerCase()
}

function isAnswerCorrect(userAnswer, correctAnswer, question) {
  if (
    userAnswer === null ||
    userAnswer === undefined ||
    userAnswer === ''
  ) {
    return false
  }

  if (
    correctAnswer === null ||
    correctAnswer === undefined ||
    correctAnswer === ''
  ) {
    return false
  }

  const normalizedUserAnswer = normalizeAnswerValue(userAnswer)
  const normalizedCorrectAnswer = normalizeAnswerValue(correctAnswer)

  // Оба значения являются индексами или одинаковым текстом
  if (normalizedUserAnswer === normalizedCorrectAnswer) {
    return true
  }

  if (!Array.isArray(question.answers)) {
    return false
  }

  const userAnswerIndex = Number(userAnswer)
  const correctAnswerIndex = Number(correctAnswer)

  const userAnswerText = Number.isInteger(userAnswerIndex)
    ? question.answers[userAnswerIndex]
    : null

  const correctAnswerText = Number.isInteger(correctAnswerIndex)
    ? question.answers[correctAnswerIndex]
    : null

  // Сравнение текста выбранного и правильного вариантов
  if (
    userAnswerText !== undefined &&
    correctAnswerText !== undefined &&
    normalizeAnswerValue(userAnswerText) ===
      normalizeAnswerValue(correctAnswerText)
  ) {
    return true
  }

  // userAnswer хранится индексом, correct хранится текстом
  if (
    userAnswerText !== undefined &&
    normalizeAnswerValue(userAnswerText) === normalizedCorrectAnswer
  ) {
    return true
  }

  // userAnswer хранится текстом, correct хранится индексом
  if (
    correctAnswerText !== undefined &&
    normalizedUserAnswer === normalizeAnswerValue(correctAnswerText)
  ) {
    return true
  }

  return false
}

function getAnswerText(question, answer) {
  if (answer === null || answer === undefined || answer === '') {
    return 'Ответ не выбран'
  }

  if (!Array.isArray(question.answers)) {
    return String(answer)
  }

  const answerIndex = Number(answer)

  if (
    Number.isInteger(answerIndex) &&
    question.answers[answerIndex] !== undefined
  ) {
    return question.answers[answerIndex]
  }

  return String(answer)
}

function getCorrectAnswerText(question) {
  const correctAnswer = getCorrectAnswer(question)

  if (correctAnswer === null) {
    return 'Правильный ответ не указан'
  }

  return getAnswerText(question, correctAnswer)
}

export default function Review() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const resultId = searchParams.get('resultId')

  const [test, setTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadReview() {
      setLoading(true)
      setError('')

      try {
        if (!resultId) {
          throw new Error(
            'Не найден resultId. Открой разбор через кнопку «Разбор» в списке прохождений.',
          )
        }

        const { data: resultData, error: resultError } = await supabase
          .from('results')
          .select('id, test_id, answers, score, total, created_at')
          .eq('id', resultId)
          .eq('test_id', id)
          .single()

        if (resultError) {
          throw resultError
        }

        const { data: testData, error: testError } = await supabase
          .from('tests')
          .select('id, title, creator_name')
          .eq('id', id)
          .single()

        if (testError) {
          throw testError
        }

        const { data: questionsData, error: questionsError } =
          await supabase
            .from('questions')
            .select('id, test_id, question, answers, correct')
            .eq('test_id', id)
            .order('id', { ascending: true })

        if (questionsError) {
          throw questionsError
        }

        if (ignore) return

        setResult(resultData)
        setTest(testData)
        setQuestions(questionsData || [])
      } catch (loadError) {
        console.error('Ошибка загрузки разбора:', loadError)

        if (!ignore) {
          setError(
            loadError.message || 'Не удалось загрузить данные прохождения',
          )
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadReview()

    return () => {
      ignore = true
    }
  }, [id, resultId])

  const userAnswers = useMemo(() => {
    return normalizeAnswers(result?.answers)
  }, [result])

  const reviewData = useMemo(() => {
    let correctCount = 0

    const answers = questions.map((question, index) => {
    const userAnswer = getUserAnswer(
        userAnswers,
        question,
        index,
    )

    const correctAnswer = getCorrectAnswer(question)

    console.log('REVIEW CHECK', {
        resultId,
        questionId: question.id,
        questionIndex: index,
        savedAnswers: userAnswers,
        userAnswer,
        correctAnswer,
    })

    const correct = isAnswerCorrect(
        userAnswer,
        correctAnswer,
        question,
    )

    if (correct) {
        correctCount += 1
    }

    return {
        question,
        userAnswer,
        correctAnswer,
        correct,
        index,
    }
    })

    const totalCount = questions.length

    // Процент рассчитывается по конкретному resultId
    const calculatedPercentage = getPercentage(
        correctCount,
        totalCount,
        )

        const savedPercentage = getPercentage(
        Number(result?.score ?? 0),
        Number(result?.total ?? totalCount),
        )

        const percentage =
        result?.score !== null && result?.score !== undefined
            ? savedPercentage
            : calculatedPercentage

    return {
      answers,
      correctCount,
      totalCount,
      percentage,
      label: getResultLabel(percentage),
    }
  }, [questions, userAnswers, resultId])

  if (loading) {
    return (
      <main className="page review-page">
        <div className="review-loading">
          <span className="loading-spinner" />
          <p>Загружаем разбор прохождения...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="page review-page">
        <div className="review-error">
          <span className="review-error-eyebrow">ERROR</span>

          <h1>Не удалось открыть разбор</h1>

          <p>{error}</p>

          <button
            type="button"
            className="review-primary-button"
            onClick={() => navigate(`/results/${id}`)}
          >
            ← К результатам
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="page review-page">
      <div className="review-container">
        <div className="review-top-actions">
          <Link
            to={`/results/${id}`}
            className="review-secondary-button"
          >
            ← Назад к результатам
          </Link>

          <Link
            to={`/test/${id}`}
            className="review-secondary-button"
          >
            Пройти ещё раз
          </Link>
        </div>

        <header className="review-heading">
          <span className="eyebrow">REVIEW</span>

          <h1>Разбор прохождения</h1>

          <p>{test?.title || 'Результаты теста'}</p>

          {result?.created_at && (
            <span className="review-date">
              {formatDate(result.created_at)}
            </span>
          )}
        </header>

        <section className="review-result-card">
          <div className="review-result-main">
            <span className="review-card-label">
              ТВОЙ РЕЗУЛЬТАТ
            </span>

            <strong className="review-result-percent">
              {reviewData.percentage}%
            </strong>

            <p>
              Правильных ответов:{' '}
              <strong>
                {reviewData.correctCount} из {reviewData.totalCount}
              </strong>
            </p>
          </div>

          <div className="review-result-side">
            <div className="review-result-progress">
              <div
                className="review-result-progress-value"
                style={{
                  width: `${reviewData.percentage}%`,
                }}
              />
            </div>

            <strong>{reviewData.label}</strong>
          </div>
        </section>

        <section className="review-answers-section">
          <div className="review-section-heading">
            <div>
              <span className="eyebrow">ANSWERS</span>

              <h2>Ответы на вопросы</h2>
            </div>

            <span className="review-questions-count">
              {reviewData.totalCount} вопросов
            </span>
          </div>

          <div className="review-questions-list">
            {reviewData.answers.map(
              ({
                question,
                userAnswer,
                correctAnswer,
                correct,
                index,
              }) => (
                <article
                  className={`review-question-card ${
                    correct
                      ? 'review-question-card-correct'
                      : 'review-question-card-wrong'
                  }`}
                  key={question.id}
                >
                  <div className="review-question-top">
                    <span className="review-question-number">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span
                      className={`review-question-status ${
                        correct
                          ? 'review-status-correct'
                          : 'review-status-wrong'
                      }`}
                    >
                      {correct
                        ? '✓ Правильно'
                        : '× Неправильно'}
                    </span>
                  </div>

                  <h3>{question.question}</h3>

                  <div className="review-answer-block">
                    <span className="review-answer-label">
                      ТВОЙ ОТВЕТ
                    </span>

                    <strong>
                      {getAnswerText(question, userAnswer)}
                    </strong>
                  </div>

                  <div className="review-answer-block review-correct-answer">
                    <span className="review-answer-label">
                      ПРАВИЛЬНЫЙ ОТВЕТ
                    </span>

                    <strong>
                      {getCorrectAnswerText(question)}
                    </strong>
                  </div>
                </article>
              ),
            )}
          </div>
        </section>

        <div className="review-bottom-actions">
          <Link
            to={`/results/${id}`}
            className="review-secondary-button"
          >
            ← К результатам
          </Link>

          <Link
            to={`/test/${id}`}
            className="review-primary-button"
          >
            Пройти ещё раз
          </Link>
        </div>
      </div>
    </main>
  )
}