import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './MyTests.css'

function formatDate(dateValue) {
  if (!dateValue) {
    return 'Дата неизвестна'
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateValue))
}

function MyTests() {
  const navigate = useNavigate()

  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadMyTests() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          throw userError
        }

        if (!user) {
          navigate('/auth')
          return
        }

        const { data, error: testsError } = await supabase
          .from('tests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (testsError) {
          throw testsError
        }

        setTests(data || [])
      } catch (loadError) {
        console.error('Ошибка загрузки моих тестов:', loadError)
        setError('Не удалось загрузить твои тесты')
      } finally {
        setLoading(false)
      }
    }

    loadMyTests()
  }, [navigate])

  async function handleVisibilityChange(testId, nextIsPublic) {
    setUpdatingId(testId)
    setError('')

    const previousTests = tests

    setTests((currentTests) =>
      currentTests.map((test) =>
        test.id === testId
          ? {
              ...test,
              is_public: nextIsPublic,
            }
          : test
      )
    )

    const { error: updateError } = await supabase
      .from('tests')
      .update({
        is_public: nextIsPublic,
      })
      .eq('id', testId)

    if (updateError) {
      console.error('Ошибка изменения доступа:', updateError)

      setTests(previousTests)
      setError('Не удалось изменить доступ к тесту')
    }

    setUpdatingId(null)
  }

  async function handleDelete(testId) {
    const confirmed = window.confirm(
      'Ты точно хочешь удалить этот тест? Все результаты тоже будут удалены.'
    )

    if (!confirmed) {
      return
    }

    setDeletingId(testId)
    setError('')

    try {
      const { error: deleteError } = await supabase
        .from('tests')
        .delete()
        .eq('id', testId)

      if (deleteError) {
        throw deleteError
      }

      setTests((currentTests) =>
        currentTests.filter((test) => test.id !== testId)
      )
    } catch (deleteTestError) {
      console.error('Ошибка удаления теста:', deleteTestError)
      setError('Не удалось удалить тест')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <main className="page">
        <div className="my-tests-container">
          <div className="my-tests-loading-card">
            <span className="loading-dot" />
            <p>Загрузка твоих тестов...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error && tests.length === 0) {
    return (
      <main className="page">
        <div className="my-tests-container">
          <div className="my-tests-error" role="alert">
            {error}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <div className="my-tests-container">
        <section className="my-tests-heading">
          <div>
            <p className="eyebrow">KEZLI / ACCOUNT</p>

            <h1>Мои тесты</h1>

            <p>
              Здесь отображаются тесты, которые ты создал в своём аккаунте.
            </p>
          </div>

          <Link className="primary-link" to="/create">
            Создать тест <span>↗</span>
          </Link>
        </section>

        <div className="my-tests-stats">
          <div className="my-tests-stat-card">
            <span className="my-tests-stat-label">Всего тестов</span>
            <strong>{tests.length}</strong>
            <small>Создано тобой</small>
          </div>

          <div className="my-tests-stat-card">
            <span className="my-tests-stat-label">Общие</span>
            <strong>{tests.filter((test) => test.is_public).length}</strong>
            <small>Видны всем пользователям</small>
          </div>

          <div className="my-tests-stat-card">
            <span className="my-tests-stat-label">Приватные</span>
            <strong>{tests.filter((test) => !test.is_public).length}</strong>
            <small>Доступны по ссылке</small>
          </div>
        </div>

        {error && (
          <div className="my-tests-error" role="alert">
            {error}
          </div>
        )}

        {tests.length === 0 ? (
          <section className="my-tests-empty">
            <div className="my-tests-empty-icon">✦</div>

            <h2>У тебя пока нет тестов</h2>

            <p>Создай первый тест о себе и отправь его друзьям.</p>

            <Link className="primary-link" to="/create">
              Создать первый тест <span>↗</span>
            </Link>
          </section>
        ) : (
          <section className="my-tests-list">
            {tests.map((test, index) => (
              <article className="my-test-card" key={test.id}>
                <div className="my-test-card-content">
                  <div className="my-test-card-topline">
                    <span className="my-test-index">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <div className="my-test-meta">
                      <span className="my-test-date">
                        {formatDate(test.created_at)}
                      </span>
                    </div>
                  </div>

                  <p className="my-test-author">
                    Автор: {test.creator_name || 'Анонимный автор'}
                  </p>

                  <h2>{test.title || 'Без названия'}</h2>

                  <div className="visibility-switch-row">
                    <div>
                      <strong>
                        {test.is_public ? 'Общий тест' : 'Приватный тест'}
                      </strong>

                      <small>
                        {test.is_public
                          ? 'Виден в разделе «Все тесты»'
                          : 'Доступен только по ссылке'}
                      </small>
                    </div>

                    <label className="visibility-switch">
                      <input
                        type="checkbox"
                        checked={Boolean(test.is_public)}
                        onChange={(event) =>
                          handleVisibilityChange(
                            test.id,
                            event.target.checked
                          )
                        }
                        disabled={updatingId === test.id}
                        aria-label={
                          test.is_public
                            ? 'Сделать тест приватным'
                            : 'Сделать тест общим'
                        }
                      />

                      <span className="visibility-switch-track">
                        <span className="visibility-switch-thumb" />
                      </span>
                    </label>
                  </div>
                </div>

                <div className="my-test-actions">
                  <Link
                    className="secondary-link"
                    to={`/test/${test.id}`}
                  >
                    Открыть <span>↗</span>
                  </Link>

                  <Link
                    className="secondary-link"
                    to={`/results/${test.id}`}
                  >
                    Результаты
                  </Link>

                  <button
                    type="button"
                    className="delete-test-button"
                    onClick={() => handleDelete(test.id)}
                    disabled={deletingId === test.id}
                  >
                    {deletingId === test.id ? 'Удаление...' : 'Удалить'}
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}

export default MyTests