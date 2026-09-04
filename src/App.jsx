import { useState } from 'react'
import CreateTest from './pages/CreateTest'
import './App.css'

function App() {
  const [page, setPage] = useState('home')

  if (page === 'create') {
    return <CreateTest />
  }

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

        <button
          className="create-button"
          onClick={() => setPage('create')}
        >
          Создать свой тест
          <span>→</span>
        </button>

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

export default App