import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function normalizeAnswer(value) {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value).trim()
}

function isCorrectAnswer(userAnswer, correctAnswer) {
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer)
}

function TakeTest() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [test, setTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadTest() {
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

      setTest(testData)
      setQuestions(questionsData || [])
      setLoading(false)
    }

    loadTest()

    return () => {
      mounted = false
    }
  }, [id])

  function selectAnswer(answerIndex) {
    if (submitting) {
      return
    }

    setError('')

    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentQuestion]: answerIndex,
    }))
  }

  async function finishTest() {
    if (submitting || questions.length === 0) {
      return
    }

    const hasUnansweredQuestion = questions.some(
      (_, index) => answers[index] === undefined
    )

    if (hasUnansweredQuestion) {
      setError('Ответь на все вопросы перед завершением теста')
      return
    }

    setSubmitting(true)
    setError('')

    const score = questions.reduce((total, question, index) => {
      const selectedAnswer = answers[index]
      const correctAnswer = question.correct

      if (isCorrectAnswer(selectedAnswer, correctAnswer)) {
        return total + 1
      }

      return total
    }, 0)

    const normalizedAnswers = Object.fromEntries(
      Object.entries(answers).map(([questionIndex, answerIndex]) => [
        questionIndex,
        Number(answerIndex),
      ])
    )

    const { data: savedResult, error: resultError } = await supabase
      .from('results')
      .insert({
        test_id: id,
        score,
        total: questions.length,
        answers: normalizedAnswers,
      })
      .select('id')
      .single()

    if (resultError) {
      console.error('Ошибка сохранения результата:', resultError)

      setError(
        resultError.message || 'Не удалось сохранить результат'
      )

      setSubmitting(false)
      return
    }

    navigate(
      `/result/${id}?score=${score}&total=${questions.length}&resultId=${savedResult.id}`
    )
  }

  function goNext() {
    if (submitting) {
      return
    }

    if (answers[currentQuestion] === undefined) {
      setError('Выбери один вариант ответа')
      return
    }

    setError('')

    if (currentQuestion === questions.length - 1) {
      finishTest()
      return
    }

    setCurrentQuestion((current) => current + 1)
  }

  function goBack() {
    if (submitting) {
      return
    }

    setError('')
    setCurrentQuestion((current) => Math.max(current - 1, 0))
  }

  if (loading) {
    return (
      <main className="page">
        <div className="take-test-container">
          <p className="loading-text">Загрузка теста...</p>
        </div>
      </main>
    )
  }

  if (error && (!test || questions.length === 0)) {
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

  if (!test || questions.length === 0) {
    return (
      <main className="page">
        <div className="take-test-container">
          <div className="error-state">
            <p>В этом тесте пока нет вопросов</p>

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

  const question = questions[currentQuestion]
  const selectedAnswer = answers[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100
  const isLastQuestion = currentQuestion === questions.length - 1

  return (
    <main className="page">
      <div className="take-test-container">
        <div className="take-test-top">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate(`/test/${id}`)}
            disabled={submitting}
          >
            ← Назад
          </button>

          <span className="take-test-counter">
            Вопрос {currentQuestion + 1} из {questions.length}
          </span>
        </div>

        <div className="take-test-heading">
          <p className="eyebrow">KEZLI / TEST</p>

          <h1>{test.title}</h1>

          <p>
            Тест от <strong>{test.creator_name}</strong>
          </p>
        </div>

        <div className="test-progress-info">
          <span>Прогресс прохождения</span>
          <strong>{Math.round(progress)}%</strong>
        </div>

        <div
          className="test-progress"
          role="progressbar"
          aria-label="Прогресс прохождения теста"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={Math.round(progress)}
        >
          <div
            className="test-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        <section className="take-test-card">
          <div className="question-number">
            ВОПРОС {String(currentQuestion + 1).padStart(2, '0')}
          </div>

          <h2>{question.question}</h2>

          <div className="take-answers">
            {question.answers.map((answer, answerIndex) => {
              const isSelected = selectedAnswer === answerIndex

              return (
                <button
                  type="button"
                  className={`take-answer ${
                    isSelected ? 'selected' : ''
                  }`}
                  key={answerIndex}
                  onClick={() => selectAnswer(answerIndex)}
                  disabled={submitting}
                  aria-pressed={isSelected}
                >
                  <span className="take-answer-letter">
                    {String.fromCharCode(65 + answerIndex)}
                  </span>

                  <span className="take-answer-text">
                    {answer}
                  </span>

                  <span className="take-answer-check">
                    {isSelected ? '✓' : '↗'}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {error && <p className="form-error">{error}</p>}

        <div className="take-test-actions">
          <button
            type="button"
            className="secondary-link"
            onClick={goBack}
            disabled={currentQuestion === 0 || submitting}
          >
            ← Предыдущий
          </button>

          <button
            type="button"
            className="primary-link"
            onClick={goNext}
            disabled={submitting}
          >
            {submitting
              ? 'Сохраняем...'
              : isLastQuestion
                ? 'Завершить тест ↗'
                : 'Следующий вопрос ↗'}
          </button>
        </div>
      </div>
    </main>
  )
}

export default TakeTest