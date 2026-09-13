import { Link } from 'react-router-dom'

function Home() {
  return (
    <main className="page">
      <div className="hero">
        <p className="eyebrow">KEZLI</p>

        <h1>Насколько хорошо тебя знают друзья?</h1>

        <p className="hero-description">
          Создай тест о себе, отправь ссылку друзьям и узнай, кто знает тебя
          лучше всех.
        </p>

        <div className="hero-actions">
          <Link className="primary-link" to="/create">
            Создать тест
          </Link>

          <Link className="secondary-link" to="/tests">
            Все тесты
          </Link>
        </div>
      </div>
    </main>
  )
}

export default Home