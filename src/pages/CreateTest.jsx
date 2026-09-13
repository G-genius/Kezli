import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './CreateTest.css'

function createEmptyQuestion() {
  return {
    question: '',
    answers: ['', '', '', ''],
    correct: 0,
  }
}

function CreateTest() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState([createEmptyQuestion()])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function updateQuestion(questionIndex, value) {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              question: value,
            }
          : question
      )
    )
  }

  function updateAnswer(questionIndex, answerIndex, value) {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question, index) => {
        if (index !== questionIndex) {
          return question
        }

        return {
          ...question,
          answers: question.answers.map((answer, currentAnswerIndex) =>
            currentAnswerIndex === answerIndex ? value : answer
          ),
        }
      })
    )
  }

  function updateCorrectAnswer(questionIndex, answerIndex) {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              correct: answerIndex,
            }
          : question
      )
    )
  }

  function addQuestion() {
    setQuestions((currentQuestions) => [
      ...currentQuestions,
      createEmptyQuestion(),
    ])
  }

  function removeQuestion(questionIndex) {
    if (questions.length === 1) {
      return
    }

    setQuestions((currentQuestions) =>
      currentQuestions.filter((_, index) => index !== questionIndex)
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!name.trim() || !title.trim()) {
      setError('Заполни имя и название теста')
      return
    }

    const hasEmptyQuestion = questions.some(
      (question) =>
        !question.question.trim() ||
        question.answers.some((answer) => !answer.trim())
    )

    if (hasEmptyQuestion) {
      setError('Заполни все вопросы и варианты ответов')
      return
    }

    setLoading(true)

    try {
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

      const questionsToInsert = questions.map((question) => ({
        test_id: test.id,
        question: question.question.trim(),
        answers: question.answers.map((answer) => answer.trim()),
        correct: question.correct,
      }))

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert)

      if (questionsError) {
        throw questionsError
      }

      navigate(`/test/${test.id}`)
    } catch (submitError) {
      console.error('Ошибка создания теста:', submitError)
      setError('Не удалось создать тест')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <div className="create-container">
        <div className="page-heading">
          <p className="eyebrow">KEZLI</p>

          <h1>Создай свой тест</h1>

          <p>
            Придумай вопросы о себе и проверь, насколько хорошо тебя знают
            друзья или любимый человек.
          </p>
        </div>

        <form className="create-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-section-heading">
              <span className="form-section-number">01</span>

              <div>
                <h2>Основная информация</h2>
                <p>Расскажи, чей это будет тест.</p>
              </div>
            </div>

            <div className="form-fields">
              <label>
                Твоё имя
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Например, Виталий"
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
            </div>
          </div>

          <div className="questions-heading">
            <div className="form-section-heading">
              <span className="form-section-number">02</span>

              <div>
                <h2>Вопросы</h2>
                <p>У каждого вопроса должно быть четыре варианта ответа.</p>
              </div>
            </div>

            <span className="questions-count">
              {questions.length} шт.
            </span>
          </div>

          <div className="questions-list">
            {questions.map((question, questionIndex) => (
              <section className="question-form-card" key={questionIndex}>
                <div className="question-form-header">
                  <div>
                    <span className="question-label">
                      Вопрос {String(questionIndex + 1).padStart(2, '0')}
                    </span>

                    <h3>Проверь своих друзей</h3>
                  </div>

                  <button
                    type="button"
                    className="remove-question-button"
                    disabled={questions.length === 1}
                    onClick={() => removeQuestion(questionIndex)}
                  >
                    Удалить
                  </button>
                </div>

                <label>
                  Текст вопроса
                  <input
                    type="text"
                    value={question.question}
                    onChange={(event) =>
                      updateQuestion(questionIndex, event.target.value)
                    }
                    placeholder="Какой мой любимый цвет?"
                  />
                </label>

                <div className="answers-heading">
                  <div>
                    <h4>Варианты ответа</h4>
                    <p>Нажми на галочку рядом с правильным ответом.</p>
                  </div>

                  <span>✓ Верный</span>
                </div>

                <div className="answers-form">
                  {question.answers.map((answer, answerIndex) => {
                    const isCorrect = question.correct === answerIndex

                    return (
                      <div className="answer-row" key={answerIndex}>
                        <label className="answer-input-label">
                          <span>
                            Вариант {String(answerIndex + 1).padStart(2, '0')}
                          </span>

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
                        </label>

                        <label
                          className={`correct-answer-checkbox ${
                            isCorrect ? 'selected' : ''
                          }`}
                          title={
                            isCorrect
                              ? 'Правильный ответ выбран'
                              : 'Выбрать правильным'
                          }
                        >
                          <input
                            type="radio"
                            name={`correct-answer-${questionIndex}`}
                            checked={isCorrect}
                            onChange={() =>
                              updateCorrectAnswer(
                                questionIndex,
                                answerIndex
                              )
                            }
                          />

                          <span>✓</span>
                        </label>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>

          <button
            type="button"
            className="add-question-button"
            onClick={addQuestion}
          >
            <span>+</span>
            Добавить ещё вопрос
          </button>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="create-submit-button" disabled={loading}>
            {loading ? 'Создание...' : 'Создать тест'}
            {!loading && <span>↗</span>}
          </button>
        </form>
      </div>
    </main>
  )
}

export default CreateTest