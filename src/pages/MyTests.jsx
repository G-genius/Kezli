import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './MyTests.css'

function MyTests() {
  const navigate = useNavigate()

  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
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

  if (loading) {
    return (
      <main className="page">
        <div className="my-tests-container">
          <p className="my-tests-loading">Загрузка твоих тестов...</p>
        </div>
      </main>
    )
  }

  if (error && tests.length === 0) {
    return (
      <main className="page">
        <div className="my-tests-container">
          <p className="my-tests-error">{error}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <div className="my-tests-container">
        <div className="my-tests-heading">
          <div>
            <p className="eyebrow">KEZLI / ACCOUNT</p>

            <h1>Мои тесты</h1>

            <p>
              Здесь отображаются тесты, которые ты создал в своём аккаунте.
            </p>
          </div>

          <Link className="primary-link" to="/create">
            Создать тест ↗
          </Link>
        </div>

        <div className="my-tests-summary">
          <span>Всего тестов</span>
          <strong>{tests.length}</strong>
        </div>

        {error && <p className="my-tests-error">{error}</p>}

        {tests.length === 0 ? (
          <div className="my-tests-empty">
            <div className="my-tests-empty-icon">✦</div>

            <h2>У тебя пока нет тестов</h2>

            <p>Создай первый тест о себе и отправь его друзьям.</p>

            <Link className="primary-link" to="/create">
              Создать первый тест ↗
            </Link>
          </div>
        ) : (
          <div className="my-tests-list">
            {tests.map((test, index) => (
              <article className="my-test-card" key={test.id}>
                <div className="my-test-card-content">
                  <div className="my-test-card-topline">
                    <span className="my-test-index">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span className="my-test-date">
                      {formatDate(test.created_at)}
                    </span>
                  </div>

                  <p className="my-test-author">
                    Автор: {test.creator_name}
                  </p>

                  <h2>{test.title}</h2>
                </div>

                <div className="my-test-actions">
                  <Link
                    className="secondary-link"
                    to={`/test/${test.id}`}
                  >
                    Открыть ↗
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
          </div>
        )}
      </div>
    </main>
  )
}

export default MyTests