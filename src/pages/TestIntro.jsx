import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function TestIntro() {
  const { id } = useParams()

  const [test, setTest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadTest() {
      try {
        const { data, error: testError } = await supabase
          .from('tests')
          .select('*')
          .eq('id', id)
          .single()

        if (testError) {
          throw testError
        }

        setTest(data)
      } catch (loadError) {
        console.error('Ошибка загрузки теста:', loadError)
        setError('Тест не найден')
      } finally {
        setLoading(false)
      }
    }

    loadTest()
  }, [id])

  if (loading) {
    return <main className="page">Загрузка теста...</main>
  }

  if (error) {
    return <main className="page">{error}</main>
  }

  return (
    <main className="page">
      <div className="result-container">
        <p>Тест от: {test.creator_name}</p>

        <h1>{test.title}</h1>

        <p>
          Проверь, насколько хорошо ты знаешь этого человека.
        </p>

        <Link to={`/test/${id}/questions`} className="result-button">
          Пройти тест
        </Link>

        <Link to="/create" className="result-link">
          Создать свой тест
        </Link>
      </div>
    </main>
  )
}

export default TestIntro