import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './CreateTest.css'

function CreateTest() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState([
    {
      question: '',
      answers: ['', '', '', ''],
      correct: 0,
    },
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function updateQuestion(questionIndex, value) {
    setQuestions((currentQuestions) =>
      currentQuestions.map((item, index) =>
        index === questionIndex
          ? { ...item, question: value }
          : item
      )
    )
  }

  function updateAnswer(questionIndex, answerIndex, value) {
    setQuestions((currentQuestions) =>
      currentQuestions.map((item, index) =>
        index === questionIndex
          ? {
              ...item,
              answers: item.answers.map((answer, currentAnswerIndex) =>
                currentAnswerIndex === answerIndex ? value : answer
              ),
            }
          : item
      )
    )
  }

  function updateCorrectAnswer(questionIndex, answerIndex) {
    setQuestions((currentQuestions) =>
      currentQuestions.map((item, index) =>
        index === questionIndex
          ? { ...item, correct: answerIndex }
          : item
      )
    )
  }

  function addQuestion() {
    setQuestions((currentQuestions) => [
      ...currentQuestions,
      {
        question: '',
        answers: ['', '', '', ''],
        correct: 0,
      },
    ])
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!name.trim() || !title.trim()) {
      setError('Заполни имя и название теста')
      return
    }

    const hasEmptyQuestion = questions.some(
      (item) =>
        !item.question.trim() ||
        item.answers.some((answer) => !answer.trim())
    )

    if (hasEmptyQuestion) {
      setError('Заполни все вопросы и варианты ответов')
      return
    }

    try {
      setLoading(true)

      const { data: test, error: testError } = await supabase
        .from('tests')
        .insert({
          creator_name: name.trim(),
          title: title.trim(),
        })
        .select()
        .single()

      if (testError) {
        throw testError
      }

      const questionsToInsert = questions.map((item) => ({
        test_id: test.id,
        question: item.question.trim(),
        answers: item.answers,
        correct: item.correct,
      }))

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert)

      if (questionsError) {
        throw questionsError
      }

      navigate(`/test/${test.id}`)
    } catch (submitError) {
      console.error('Ошибка Supabase:', submitError)

      setError(
        submitError?.message ||
          submitError?.details ||
          'Не удалось сохранить тест'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="create-page">
      <div className="create-container">
        <h1>Создать тест</h1>
        <p className="create-subtitle">
          Сделай тест о себе и отправь его друзьям
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            Твоё имя
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Например, Витя"
            />
          </label>

          <label>
            Название теста
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Насколько хорошо ты меня знаешь?"
            />
          </label>

          {questions.map((item, questionIndex) => (
            <section className="question-card" key={questionIndex}>
              <h2>Вопрос {questionIndex + 1}</h2>

              <label>
                Вопрос
                <input
                  type="text"
                  value={item.question}
                  onChange={(event) =>
                    updateQuestion(questionIndex, event.target.value)
                  }
                  placeholder="Какой мой любимый цвет?"
                />
              </label>

              {item.answers.map((answer, answerIndex) => (
                <div className="answer-row" key={answerIndex}>
                  <input
                    type="text"
                    value={answer}
                    onChange={(event) =>
                      updateAnswer(
                        questionIndex,
                        answerIndex,
                        event.target.value
                      )
                    }
                    placeholder={`Вариант ${answerIndex + 1}`}
                  />

                  <label className="correct-label">
                    <input
                      type="radio"
                      name={`correct-${questionIndex}`}
                      checked={item.correct === answerIndex}
                      onChange={() =>
                        updateCorrectAnswer(
                          questionIndex,
                          answerIndex
                        )
                      }
                    />
                    Верный
                  </label>
                </div>
              ))}
            </section>
          ))}

          {error && <p className="error-message">{error}</p>}

          <div className="create-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={addQuestion}
            >
              + Добавить вопрос
            </button>

            <button type="submit" disabled={loading}>
              {loading ? 'Сохраняем...' : 'Создать тест'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default CreateTest