import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="app">
      <main className="hero">

        <div className="logo">
          KEZLI
        </div>

        <div className="badge">
          ✦ Узнай, кто знает тебя лучше
        </div>

        <h1>
          Насколько хорошо
          <br />
          тебя знают?
        </h1>

        <p className="subtitle">
          Создай свой тест, отправь друзьям
          <br />
          и узнай, кто действительно тебя знает.
        </p>

        <Link
          to="/create"
          className="create-button"
        >
          Создать свой тест
          <span>→</span>
        </Link>

        <div className="features">

          <div>
            <span>01</span>
            Создай вопросы
          </div>

          <div>
            <span>02</span>
            Отправь ссылку
          </div>

          <div>
            <span>03</span>
            Получи результат
          </div>

        </div>

      </main>
    </div>
  )
}

export default Home