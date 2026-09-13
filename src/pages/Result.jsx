import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Result() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()

  const score = Number(searchParams.get('score') || 0)
  const total = Number(searchParams.get('total') || 0)

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
        console.error('Ошибка загрузки результата:', loadError)
        setError('Не удалось загрузить информацию о тесте')
      } finally {
        setLoading(false)
      }
    }

    loadTest()
  }, [id])

  if (loading) {
    return <main className="page">Загрузка результата...</main>
  }

  if (error) {
    return <main className="page">{error}</main>
  }

  const percent = total > 0 ? Math.round((score / total) * 100) : 0

  let message = 'Можно лучше 😅'

  if (percent === 100) {
    message = 'Ты знаешь меня идеально! 🔥'
  } else if (percent >= 70) {
    message = 'Очень хороший результат! 😎'
  } else if (percent >= 40) {
    message = 'Неплохо, но есть куда расти 🙂'
  }

  return (
    <main className="page">
      <div className="result-container">
        <p>Тест от: {test?.creator_name}</p>

        <h1>{test?.title}</h1>

        <h2>Твой результат</h2>

        <div className="result-score">
          {score} из {total}
        </div>

        <div className="result-percent">
          {percent}%
        </div>

        <p>{message}</p>

        <Link to="/create" className="result-button">
          Создать свой тест
        </Link>

        <Link to="/" className="result-link">
          На главную
        </Link>
      </div>
    </main>
  )
}

export default Result