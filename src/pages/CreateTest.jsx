import { useState } from 'react'
import './CreateTest.css'

function CreateTest() {
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState([
    {
      question: '',
      answers: ['', '', '', ''],
      correct: 0,
    },
  ])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        answers: ['', '', '', ''],
        correct: 0,
      },
    ])
  }

  const updateQuestion = (questionIndex, value) => {
    const updated = [...questions]
    updated[questionIndex].question = value
    setQuestions(updated)
  }

  const updateAnswer = (questionIndex, answerIndex, value) => {
    const updated = [...questions]
    updated[questionIndex].answers[answerIndex] = value
    setQuestions(updated)
  }

  const setCorrectAnswer = (questionIndex, answerIndex) => {
    const updated = [...questions]
    updated[questionIndex].correct = answerIndex
    setQuestions(updated)
  }

  const createTest = () => {
    console.log({
      name,
      title,
      questions,
    })

    alert('Тест создан! Пока сохраняем его только локально.')
  }

  return (
    <div className="create-page">
      <div className="create-container">

        <div className="create-header">
          <div className="small-logo">KEZLI</div>

          <h1>Создай свой тест</h1>

          <p>
            Придумай вопросы, отправь ссылку
            и узнай, насколько хорошо тебя знают.
          </p>
        </div>

        <div className="form-card">

          <label>
            Как тебя зовут?
          </label>

          <input
            type="text"
            placeholder="Например, Витя"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>
            Название теста
          </label>

          <input
            type="text"
            placeholder="Насколько хорошо меня знают?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

        </div>

        {questions.map((item, questionIndex) => (
          <div className="question-card" key={questionIndex}>

            <div className="question-number">
              ВОПРОС {questionIndex + 1}
            </div>

            <input
              className="question-input"
              type="text"
              placeholder="Например: Какой мой любимый фильм?"
              value={item.question}
              onChange={(e) =>
                updateQuestion(questionIndex, e.target.value)
              }
            />

            <div className="answers">

              {item.answers.map((answer, answerIndex) => (
                <div className="answer-row" key={answerIndex}>

                  <button
                    type="button"
                    className={
                      item.correct === answerIndex
                        ? 'correct active'
                        : 'correct'
                    }
                    onClick={() =>
                      setCorrectAnswer(
                        questionIndex,
                        answerIndex
                      )
                    }
                  >
                    ✓
                  </button>

                  <input
                    type="text"
                    placeholder={`Вариант ${answerIndex + 1}`}
                    value={answer}
                    onChange={(e) =>
                      updateAnswer(
                        questionIndex,
                        answerIndex,
                        e.target.value
                      )
                    }
                  />

                </div>
              ))}

            </div>

            <div className="correct-hint">
              Нажми ✓ рядом с правильным ответом
            </div>

          </div>
        ))}

        <button
          className="add-question"
          onClick={addQuestion}
        >
          + Добавить вопрос
        </button>

        <button
          className="create-test-button"
          onClick={createTest}
        >
          Создать тест
          <span>→</span>
        </button>

      </div>
    </div>
  )
}

export default CreateTest