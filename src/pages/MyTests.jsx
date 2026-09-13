import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './MyTests.css'

function MyTests() {
  const navigate = useNavigate()

  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
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

  if (loading) {
    return <main className="page">Загрузка твоих тестов...</main>
  }

  if (error) {
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
            <p className="eyebrow">KEZLI</p>

            <h1>Мои тесты</h1>

            <p>
              Здесь отображаются тесты, которые ты создал в своём аккаунте.
            </p>
          </div>

          <Link className="primary-link" to="/create">
            Создать тест
          </Link>
        </div>

        {tests.length === 0 ? (
          <div className="my-tests-empty">
            <h2>У тебя пока нет тестов</h2>

            <p>
              Создай первый тест о себе и отправь его друзьям.
            </p>

            <Link className="primary-link" to="/create">
              Создать первый тест
            </Link>
          </div>
        ) : (
          <div className="my-tests-list">
            {tests.map((test) => (
              <article className="my-test-card" key={test.id}>
                <div>
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
                    Открыть
                  </Link>

                  <Link
                    className="secondary-link"
                    to={`/results/${test.id}`}
                  >
                    Результаты
                  </Link>
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