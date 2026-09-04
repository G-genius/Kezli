import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const demoTest = {
  title: 'Насколько хорошо меня знают?',
  creator: 'Витя',
  questions: [
    {
      question: 'Какой мой любимый жанр музыки?',
      answers: ['Рок', 'Рэп', 'Поп', 'Электроника'],
      correct: 1,
    },
    {
      question: 'Что я больше всего люблю?',
      answers: ['Машины', 'Рыбалку', 'Готовку', 'Рисование'],
      correct: 0,
    },
    {
      question: 'Куда я хочу поехать?',
      answers: ['Япония', 'Турция', 'Канада', 'Норвегия'],
      correct: 1,
    },
  ],
}

function TakeTest() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])

  const question = demoTest.questions[currentQuestion]

  const chooseAnswer = (answerIndex) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex

    setAnswers(newAnswers)

    setTimeout(() => {
      if (currentQuestion < demoTest.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        const score = newAnswers.reduce(
          (total, answer, index) => {
            if (
              answer === demoTest.questions[index].correct
            ) {
              return total + 1
            }

            return total
          },
          0
        )

        navigate(`/result/${id}?score=${score}`)
      }
    }, 250)
  }

  const progress =
    ((currentQuestion + 1) / demoTest.questions.length) * 100

  return (
    <div className="create-page">
      <div className="create-container">

        <div className="small-logo">
          KEZLI
        </div>

        <div className="question-card">

          <div className="question-number">
            ВОПРОС {currentQuestion + 1} / {demoTest.questions.length}
          </div>

          <div
            style={{
              width: '100%',
              height: '5px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '10px',
              marginBottom: '35px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: '#a78bfa',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          <h2
            style={{
              fontSize: '28px',
              lineHeight: '1.3',
              marginBottom: '30px',
            }}
          >
            {question.question}
          </h2>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {question.answers.map((answer, index) => (
              <button
                key={index}
                onClick={() => chooseAnswer(index)}
                style={{
                  padding: '18px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'white',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                {answer}
              </button>
            ))}
          </div>

        </div>

      </div>
    </div>
  )
}

export default TakeTest