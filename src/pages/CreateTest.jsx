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
          ? { ...question, question: value }
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
          ? { ...question, correct: answerIndex }
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
            друзья.
          </p>
        </div>

        <form className="create-form" onSubmit={handleSubmit}>
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

          <div className="questions-heading">
            <div>
              <h2>Вопросы</h2>
              <p>Добавь минимум один вопрос.</p>
            </div>

            <span>{questions.length} шт.</span>
          </div>

          <div className="questions-list">
            {questions.map((question, questionIndex) => (
              <section className="question-form-card" key={questionIndex}>
                <div className="question-form-header">
                  <h3>Вопрос {questionIndex + 1}</h3>

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

                <div className="answers-form">
                  {question.answers.map((answer, answerIndex) => (
                    <div className="answer-row" key={answerIndex}>
                      <label className="answer-input-label">
                        <span>Вариант {answerIndex + 1}</span>

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
                          question.correct === answerIndex ? 'selected' : ''
                        }`}
                        title="Сделать правильным ответом"
                      >
                        <input
                          type="radio"
                          name={`correct-answer-${questionIndex}`}
                          checked={question.correct === answerIndex}
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
                  ))}
                </div>
              </section>
            ))}
          </div>

          <button
            type="button"
            className="add-question-button"
            onClick={addQuestion}
          >
            + Добавить вопрос
          </button>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Создание...' : 'Создать тест'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default CreateTest