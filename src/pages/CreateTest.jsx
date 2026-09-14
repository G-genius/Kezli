import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './CreateTest.css'

function createEmptyQuestion() {
  return {
    question: '',
    answers: ['', '', '', ''],
    correct: null,
  }
}

function CreateTest() {
  const navigate = useNavigate()

  const [creatorName, setCreatorName] = useState('')
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState([createEmptyQuestion()])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function updateQuestion(questionIndex, value) {
    setError('')

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
    setError('')

    setQuestions((currentQuestions) =>
      currentQuestions.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              answers: question.answers.map((answer, currentAnswerIndex) =>
                currentAnswerIndex === answerIndex ? value : answer
              ),
            }
          : question
      )
    )
  }

  function updateCorrectAnswer(questionIndex, answerIndex) {
    setError('')

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
    setError('')

    setQuestions((currentQuestions) => [
      ...currentQuestions,
      createEmptyQuestion(),
    ])
  }

  function removeQuestion(questionIndex) {
    if (questions.length === 1 || loading) {
      return
    }

    setError('')

    setQuestions((currentQuestions) =>
      currentQuestions.filter((_, index) => index !== questionIndex)
    )
  }

  function validateForm() {
    if (!creatorName.trim()) {
      return 'Заполни имя создателя'
    }

    if (!title.trim()) {
      return 'Заполни название теста'
    }

    if (questions.length === 0) {
      return 'Добавь хотя бы один вопрос'
    }

    const hasEmptyQuestion = questions.some(
      (question) =>
        !question.question.trim() ||
        question.answers.some((answer) => !answer.trim())
    )

    if (hasEmptyQuestion) {
      return 'Заполни все вопросы и варианты ответов'
    }

    const hasIncorrectAnswer = questions.some(
      (question) =>
        question.correct === null ||
        question.correct < 0 ||
        question.correct >= question.answers.length
    )

    if (hasIncorrectAnswer) {
      return 'Выбери правильный вариант ответа для каждого вопроса'
    }

    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (loading) {
      return
    }

    setError('')

    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        throw userError
      }

      if (!user) {
        setError('Сначала войди в аккаунт')
        navigate('/auth')
        return
      }

      const { data: test, error: testError } = await supabase
        .from('tests')
        .insert({
          creator_name: creatorName.trim(),
          title: title.trim(),
          user_id: user.id,
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
      setError('Не удалось создать тест. Попробуй ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <div className="create-container">
        <div className="page-heading">
          <p className="eyebrow">KEZLI</p>

          <h1>Создать тест</h1>

          <p>
            Добавь вопросы о себе и проверь, насколько хорошо тебя знают
            друзья.
          </p>
        </div>

        <form className="create-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Твоё имя</span>

            <input
              type="text"
              value={creatorName}
              onChange={(event) => {
                setCreatorName(event.target.value)
                setError('')
              }}
              placeholder="Например, Виталий"
              disabled={loading}
            />
          </label>

          <label className="form-field">
            <span>Название теста</span>

            <input
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
                setError('')
              }}
              placeholder="Насколько хорошо вы меня знаете?"
              disabled={loading}
            />
          </label>

          <div className="questions-heading">
            <div>
              <h2>Вопросы</h2>

              <p>У каждого вопроса должно быть четыре варианта ответа.</p>
            </div>

            <span>{questions.length}</span>
          </div>

          <div className="questions-list">
            {questions.map((question, questionIndex) => (
              <div className="question-form-card" key={questionIndex}>
                <div className="question-card-heading">
                  <h3>Вопрос {questionIndex + 1}</h3>

                  {questions.length > 1 && (
                    <button
                      type="button"
                      className="remove-question-button"
                      onClick={() => removeQuestion(questionIndex)}
                      disabled={loading}
                    >
                      Удалить
                    </button>
                  )}
                </div>

                <label className="form-field">
                  <span>Текст вопроса</span>

                  <input
                    type="text"
                    value={question.question}
                    onChange={(event) =>
                      updateQuestion(questionIndex, event.target.value)
                    }
                    placeholder="Например, какая моя любимая машина?"
                    disabled={loading}
                  />
                </label>

                <div className="answers-form">
                  <p>Варианты ответа</p>

                  {question.answers.map((answer, answerIndex) => (
                    <div className="answer-row" key={answerIndex}>
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
                        disabled={loading}
                      />

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
                        disabled={loading}
                      />
                    </div>
                  ))}

                  <small>
                    Отметь кружком правильный вариант ответа.
                  </small>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="add-question-button"
            onClick={addQuestion}
            disabled={loading}
          >
            + Добавить ещё вопрос
          </button>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? 'Создание...' : 'Создать тест'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default CreateTest