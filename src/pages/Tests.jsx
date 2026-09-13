import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Tests() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadTests() {
      const { data, error: testsError } = await supabase
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false })

      if (testsError) {
        console.error('Ошибка загрузки тестов:', testsError)
        setError('Не удалось загрузить тесты')
      } else {
        setTests(data)
      }

      setLoading(false)
    }

    loadTests()
  }, [])

  if (loading) {
    return <main className="page">Загрузка тестов...</main>
  }

  if (error) {
    return <main className="page">{error}</main>
  }

  return (
    <main className="page">
      <div className="test-container">
        <div className="page-header">
          <div>
            <p className="eyebrow">KEZLI</p>
            <h1>Все тесты</h1>
            <p>Выбирай тест и проверяй, насколько хорошо ты знаешь друзей.</p>
          </div>

          <Link className="primary-link" to="/create">
            Создать тест
          </Link>
        </div>

        {tests.length === 0 ? (
          <div className="empty-state">
            <h2>Пока нет тестов</h2>
            <p>Создай первый тест и поделись им с друзьями.</p>

            <Link className="primary-link" to="/create">
              Создать первый тест
            </Link>
          </div>
        ) : (
          <div className="tests-list">
            {tests.map((test) => (
              <article className="test-card" key={test.id}>
                <p>Тест от: {test.creator_name}</p>

                <h2>{test.title}</h2>

                <Link to={`/test/${test.id}`}>
                  Пройти тест
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default Tests