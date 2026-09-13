import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Result() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()

  const score = Number(searchParams.get('score')) || 0
  const total = Number(searchParams.get('total')) || 0

  const [test, setTest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadTest() {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Ошибка загрузки теста:', error)
      } else {
        setTest(data)
      }

      setLoading(false)
    }

    loadTest()
  }, [id])

  async function copyTestLink() {
    const link = `${window.location.origin}/test/${id}`

    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Не удалось скопировать ссылку:', error)
    }
  }

  if (loading) {
    return <main className="page">Загрузка результата...</main>
  }

  if (!test) {
    return <main className="page">Тест не найден</main>
  }

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0

  let message = 'Попробуй ещё раз!'

  if (percentage === 100) {
    message = 'Идеальный результат!'
  } else if (percentage >= 70) {
    message = 'Очень хороший результат!'
  } else if (percentage >= 40) {
    message = 'Неплохо, но можно лучше!'
  }

  return (
    <main className="page">
      <div className="test-container">
        <p>Тест от: {test.creator_name}</p>

        <h1>{test.title}</h1>

        <div className="result-card">
          <p>Твой результат</p>

          <h2>
            {score} из {total}
          </h2>

          <p>{percentage}% правильных ответов</p>

          <p>{message}</p>
        </div>

        <div className="result-actions">
          <button type="button" onClick={copyTestLink}>
            {copied ? 'Ссылка скопирована' : 'Поделиться тестом'}
          </button>

          <Link to={`/test/${id}`}>
            Пройти тест ещё раз
          </Link>

          <Link to="/create">
            Создать свой тест
          </Link>

          <Link to="/">
            На главную
          </Link>
        </div>
      </div>
    </main>
  )
}

export default Result