import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Results.css'

function Results() {
  const { id } = useParams()

  const [test, setTest] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadResults() {
      try {
        const { data: testData, error: testError } = await supabase
          .from('tests')
          .select('*')
          .eq('id', id)
          .single()

        if (testError) {
          throw testError
        }

        const { data: resultsData, error: resultsError } = await supabase
          .from('results')
          .select('*')
          .eq('test_id', id)
          .order('created_at', { ascending: false })

        if (resultsError) {
          throw resultsError
        }

        setTest(testData)
        setResults(resultsData || [])
      } catch (loadError) {
        console.error('Ошибка загрузки результатов:', loadError)
        setError('Не удалось загрузить результаты')
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [id])

  if (loading) {
    return <main className="page">Загрузка результатов...</main>
  }

  if (error) {
    return <main className="page">{error}</main>
  }

  if (!test) {
    return <main className="page">Тест не найден</main>
  }

  const averagePercentage =
    results.length > 0
      ? Math.round(
          results.reduce((sum, result) => {
            return sum + (result.total > 0 ? (result.score / result.total) * 100 : 0)
          }, 0) / results.length
        )
      : 0

  return (
    <main className="page">
      <div className="test-container">
        <p className="eyebrow">Статистика теста</p>

        <h1>{test.title}</h1>

        <p className="results-author">
          Тест от: {test.creator_name}
        </p>

        <div className="statistics-grid">
          <div className="stat-card">
            <span>Прохождений</span>
            <strong>{results.length}</strong>
          </div>

          <div className="stat-card">
            <span>Средний результат</span>
            <strong>{averagePercentage}%</strong>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="empty-state">
            <h2>Пока никто не прошёл тест</h2>
            <p>Поделись ссылкой с друзьями, чтобы появились результаты.</p>

            <Link className="primary-link" to={`/test/${id}`}>
              Открыть тест
            </Link>
          </div>
        ) : (
          <div className="results-list">
            <h2>Последние прохождения</h2>

            {results.map((result, index) => {
              const percentage =
                result.total > 0
                  ? Math.round((result.score / result.total) * 100)
                  : 0

              return (
                <article className="result-row" key={result.id}>
                  <div>
                    <span>Прохождение {results.length - index}</span>
                    <p>
                      {new Date(result.created_at).toLocaleString('ru-RU')}
                    </p>
                  </div>

                  <strong>
                    {result.score} из {result.total}
                  </strong>

                  <span>{percentage}%</span>
                </article>
              )
            })}
          </div>
        )}

        <div className="result-actions">
          <Link to={`/test/${id}`}>
            Открыть тест
          </Link>

          <Link to="/tests">
            Все тесты
          </Link>
        </div>
      </div>
    </main>
  )
}

export default Results