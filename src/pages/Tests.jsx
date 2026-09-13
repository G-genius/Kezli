import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Tests.css'

function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function Tests() {
  const [tests, setTests] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  async function loadTests(showRefreshState = false) {
    if (showRefreshState) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError('')

    const { data, error: testsError } = await supabase
      .from('tests')
      .select('*')
      .order('created_at', { ascending: false })

    if (testsError) {
      console.error('Ошибка загрузки тестов:', testsError)
      setError('Не удалось загрузить тесты')
    } else {
      setTests(data || [])
    }

    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    loadTests()
  }, [])

  async function deleteTest(testId) {
    const confirmed = window.confirm(
      'Удалить этот тест? Все вопросы и результаты тоже будут удалены.'
    )

    if (!confirmed) {
      return
    }

    setDeletingId(testId)
    setError('')

    const { error: deleteError } = await supabase
      .from('tests')
      .delete()
      .eq('id', testId)

    if (deleteError) {
      console.error('Ошибка удаления теста:', deleteError)
      setError('Не удалось удалить тест')
      setDeletingId(null)
      return
    }

    setTests((currentTests) =>
      currentTests.filter((test) => test.id !== testId)
    )

    setDeletingId(null)
  }

  const filteredTests = useMemo(() => {
    const searchValue = search.trim().toLowerCase()

    if (!searchValue) {
      return tests
    }

    return tests.filter((test) => {
      const title = test.title?.toLowerCase() || ''
      const creatorName = test.creator_name?.toLowerCase() || ''

      return (
        title.includes(searchValue) ||
        creatorName.includes(searchValue)
      )
    })
  }, [tests, search])

  if (loading) {
    return (
      <main className="page">
        <div className="tests-container">
          <div className="loading-state">Загрузка тестов...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <div className="tests-container">
        <section className="tests-page-heading">
          <div>
            <p className="eyebrow">KEZLI / DISCOVER</p>

            <h1>Все тесты</h1>

            <p>
              Проверь, насколько хорошо ты знаешь друзей, любимого человека
              или самого себя.
            </p>
          </div>

          <Link className="primary-link" to="/create">
            Создать тест <span>↗</span>
          </Link>
        </section>

        <section className="tests-toolbar">
          <div className="search-wrapper">
            <span className="search-icon">⌕</span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Поиск по названию или автору..."
              aria-label="Поиск тестов"
            />
          </div>

          <button
            type="button"
            className="refresh-button"
            onClick={() => loadTests(true)}
            disabled={refreshing}
          >
            {refreshing ? 'Обновление...' : 'Обновить ↻'}
          </button>
        </section>

        {error && <div className="error-message">{error}</div>}

        {tests.length === 0 ? (
          <section className="empty-state">
            <div className="empty-state-icon">♡</div>

            <h2>Пока нет тестов</h2>

            <p>
              Создай первый тест и отправь его друзьям, чтобы узнать,
              насколько хорошо они тебя знают.
            </p>

            <Link className="primary-link" to="/create">
              Создать первый тест <span>↗</span>
            </Link>
          </section>
        ) : filteredTests.length === 0 ? (
          <section className="empty-state">
            <div className="empty-state-icon">⌕</div>

            <h2>Ничего не найдено</h2>

            <p>
              Попробуй изменить запрос или очистить поле поиска.
            </p>

            <button
              type="button"
              className="primary-link empty-reset-button"
              onClick={() => setSearch('')}
            >
              Сбросить поиск
            </button>
          </section>
        ) : (
          <>
            <div className="tests-list-heading">
              <span>Найдено тестов: {filteredTests.length}</span>

              {search && <span>Поиск: «{search}»</span>}
            </div>

            <div className="tests-list">
              {filteredTests.map((test, index) => (
                <article className="test-card" key={test.id}>
                  <div className="test-card-top">
                    <span className="test-card-number">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span className="test-card-date">
                      {formatDate(test.created_at)}
                    </span>
                  </div>

                  <div className="test-card-content">
                    <p className="test-card-author">
                      Тест от <strong>{test.creator_name}</strong>
                    </p>

                    <h2>{test.title}</h2>
                  </div>

                  <div className="test-card-actions">
                    <Link
                      className="test-card-main-action"
                      to={`/test/${test.id}`}
                    >
                      Пройти тест <span>↗</span>
                    </Link>

                    <Link
                      className="test-card-secondary-action"
                      to={`/results/${test.id}`}
                    >
                      Результаты
                    </Link>

                    <button
                      type="button"
                      className="delete-button"
                      disabled={deletingId === test.id}
                      onClick={() => deleteTest(test.id)}
                    >
                      {deletingId === test.id ? 'Удаление...' : 'Удалить'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}

export default Tests