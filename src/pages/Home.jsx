import { Link } from 'react-router-dom'

function Home() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
          <div className="home-badge">
            <span className="home-badge-dot"></span>
            Тесты о тех, кто тебе дорог
          </div>

          <h1>
            Насколько хорошо
            <span>тебя знают?</span>
          </h1>

          <p className="home-description">
            Создай свой тест, отправь ссылку друзьям или любимому человеку
            и узнай, кто действительно тебя понимает.
          </p>

          <div className="home-actions">
            <Link className="home-primary-button" to="/create">
              Создать свой тест
              <span>↗</span>
            </Link>

            <Link className="home-secondary-button" to="/tests">
              Смотреть тесты
            </Link>
          </div>

          <div className="home-trust">
            <span>Без регистрации</span>
            <span>Бесплатно</span>
            <span>Для друзей и пар</span>
          </div>
        </div>

        <div className="home-visual" aria-hidden="true">
          <div className="floating-card floating-card-top">
            <span className="floating-icon">♡</span>
            <div>
              <strong>Любовь</strong>
              <small>Насколько мы близки?</small>
            </div>
          </div>

          <div className="main-quiz-card">
            <div className="quiz-card-top">
              <span>KEZLI</span>
              <span>01 / 05</span>
            </div>

            <div className="quiz-card-progress">
              <span></span>
            </div>

            <p className="quiz-card-label">Вопрос для двоих</p>

            <h2>Какой мой идеальный вечер?</h2>

            <div className="quiz-options">
              <div className="quiz-option">
                <span>A</span>
                Уютный вечер дома
              </div>

              <div className="quiz-option quiz-option-active">
                <span>B</span>
                Прогулка и разговоры
                <b>✓</b>
              </div>

              <div className="quiz-option">
                <span>C</span>
                Спонтанное приключение
              </div>
            </div>
          </div>

          <div className="floating-card floating-card-bottom">
            <div className="avatar-stack">
              <span>В</span>
              <span>А</span>
            </div>

            <div>
              <strong>Вы совпали</strong>
              <small>8 из 10 правильных ответов</small>
            </div>
          </div>
        </div>
      </section>

      <section className="home-how">
        <div className="section-heading">
          <p className="eyebrow">КАК ЭТО РАБОТАЕТ</p>

          <h2>Три шага до интересного результата</h2>

          <p>
            Никаких сложных настроек. Только вопросы, ссылка и честные ответы.
          </p>
        </div>

        <div className="home-steps">
          <article className="home-step">
            <span className="step-number">01</span>
            <div className="step-icon">✦</div>
            <h3>Создай тест</h3>
            <p>
              Добавь вопросы о себе, своих привычках, вкусах и отношениях.
            </p>
          </article>

          <article className="home-step">
            <span className="step-number">02</span>
            <div className="step-icon">↗</div>
            <h3>Поделись ссылкой</h3>
            <p>
              Отправь тест друзьям, партнёру или опубликуй его в соцсетях.
            </p>
          </article>

          <article className="home-step">
            <span className="step-number">03</span>
            <div className="step-icon">♡</div>
            <h3>Узнай результат</h3>
            <p>
              Посмотри, кто знает тебя лучше и сколько ответов совпало.
            </p>
          </article>
        </div>
      </section>

      <section className="home-love-section">
        <div className="love-content">
          <p className="eyebrow">ДЛЯ ДВОИХ</p>

          <h2>
            Иногда один вопрос
            <span>говорит больше тысячи слов.</span>
          </h2>

          <p>
            Создай тест для своей пары. Проверь, помнит ли любимый человек
            ваши маленькие истории, любимые места и важные детали.
          </p>

          <Link className="home-primary-button" to="/create">
            Создать тест для двоих
            <span>♡</span>
          </Link>
        </div>

        <div className="love-decoration" aria-hidden="true">
          <span className="big-heart">♡</span>
          <span className="small-heart heart-one">♡</span>
          <span className="small-heart heart-two">♡</span>
          <span className="small-heart heart-three">♡</span>
        </div>
      </section>

      <section className="home-bottom-cta">
        <p className="eyebrow">ТВОЯ ОЧЕРЕДЬ</p>

        <h2>Проверим, кто знает тебя лучше?</h2>

        <p>Создай первый тест и отправь его самым близким.</p>

        <Link className="home-primary-button" to="/create">
          Начать бесплатно
          <span>↗</span>
        </Link>
      </section>
    </main>
  )
}

export default Home