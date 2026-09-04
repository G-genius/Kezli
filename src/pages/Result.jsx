import { Link, useSearchParams } from 'react-router-dom'

function Result() {
  const [searchParams] = useSearchParams()

  const score = Number(searchParams.get('score')) || 0

  const total = 3

  const percentage = Math.round(
    (score / total) * 100
  )

  let message = 'Можно было и лучше 😅'

  if (percentage >= 80) {
    message = '🔥 Ты действительно хорошо меня знаешь!'
  } else if (percentage >= 50) {
    message = '😎 Неплохо, но есть куда расти!'
  }

  return (
    <div className="create-page">
      <div className="create-container">

        <div className="small-logo">
          KEZLI
        </div>

        <div
          className="question-card"
          style={{
            textAlign: 'center',
            padding: '50px 25px',
          }}
        >

          <div
            style={{
              fontSize: '14px',
              color: '#a78bfa',
              fontWeight: '700',
              letterSpacing: '1px',
            }}
          >
            ТЕСТ ЗАВЕРШЁН
          </div>

          <h1
            style={{
              fontSize: '80px',
              margin: '20px 0 10px',
            }}
          >
            {percentage}%
          </h1>

          <p
            style={{
              color: '#9999a5',
              fontSize: '18px',
            }}
          >
            {score} из {total} правильных ответов
          </p>

          <div
            style={{
              marginTop: '30px',
              fontSize: '18px',
            }}
          >
            {message}
          </div>

          <Link
            to="/"
            className="create-button"
            style={{
              marginTop: '35px',
              justifyContent: 'center',
              textDecoration: 'none',
            }}
          >
            Создать свой тест
            <span>→</span>
          </Link>

        </div>

      </div>
    </div>
  )
}

export default Result