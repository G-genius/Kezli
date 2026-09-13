import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function TakeTest() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [test, setTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadTest() {
      try {
        const { data: testData, error: testError } = await supabase
          .from('tests')
          .select('*')
          .eq('id', id)
          .single()

        if (testError) {
          throw testError
        }

        const { data: questionsData, error: questionsError } =
          await supabase
            .from('questions')
            .select('*')
            .eq('test_id', id)
            .order('id')

        if (questionsError) {
          throw questionsError
        }

        setTest(testData)
        setQuestions(questionsData)
      } catch (loadError) {
        console.error('Ошибка загрузки теста:', loadError)
        setError('Не удалось загрузить тест')
      } finally {
        setLoading(false)
      }
    }

    loadTest()
  }, [id])

  function selectAnswer(answerIndex) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentQuestion]: answerIndex,
    }))
  }

  async function finishTest() {
    const score = questions.reduce((total, question, index) => {
      return total + (answers[index] === question.correct ? 1 : 0)
    }, 0)

    const { error: resultError } = await supabase
      .from('results')
      .insert({
        test_id: id,
        score,
        total: questions.length,
      })

    if (resultError) {
      console.error('Ошибка сохранения результата:', resultError)
    }

    navigate(`/result/${id}?score=${score}&total=${questions.length}`)
  }

  if (loading) {
    return <main className="page">Загрузка теста...</main>
  }

  if (error) {
    return <main className="page">{error}</main>
  }

  if (!test || questions.length === 0) {
    return <main className="page">В этом тесте пока нет вопросов</main>
  }

  const question = questions[currentQuestion]
  const selectedAnswer = answers[currentQuestion]
  const isLastQuestion = currentQuestion === questions.length - 1

  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <main className="page">
      <div className="test-container">
        <p>Тест от: {test.creator_name}</p>

        <h1>{test.title}</h1>

        <div className="progress-info">
          <p>
            Вопрос {currentQuestion + 1} из {questions.length}
          </p>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <h2>{question.question}</h2>

        <div className="answers">
          {question.answers.map((answer, index) => (
            <button
              key={index}
              type="button"
              className={selectedAnswer === index ? 'selected' : ''}
              onClick={() => selectAnswer(index)}
            >
              {answer}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={selectedAnswer === undefined}
          onClick={() => {
            if (isLastQuestion) {
              finishTest()
            } else {
              setCurrentQuestion((current) => current + 1)
            }
          }}
        >
          {isLastQuestion ? 'Завершить тест' : 'Следующий вопрос'}
        </button>
      </div>
    </main>
  )
}

export default TakeTest