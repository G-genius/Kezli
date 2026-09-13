import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Tests() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

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

  function formatDate(date) {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  async function shareTest(testId) {
    const shareUrl = `${window.location.origin}/test/${testId}`

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopiedId(testId)

      setTimeout(() => {
        setCopiedId(null)
      }, 2000)
    } catch (shareError) {
      console.error('Ошибка копирования ссылки:', shareError)
      setError('Не удалось скопировать ссылку')
    }
  }

  async function deleteTest(testId) {
    const confirmed = window.confirm(
      'Удалить этот тест? Все результаты и вопросы этого теста тоже будут удалены.'
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

  if (loading) {
    return <main className="page">Загрузка тестов...</main>
  }

  return (
    <main className="page">
      <div className="test-container">
        <div className="page-header">
          <div>
            <p className="eyebrow">KEZLI</p>

            <h1>Все тесты</h1>

            <p>
              Выбирай тест и проверяй, насколько хорошо ты знаешь друзей.
            </p>
          </div>

          <Link className="primary-link" to="/create">
            Создать тест
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}

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
                <div className="test-card-top">
                  <span className="test-card-label">Тест от</span>

                  <span className="test-card-date">
                    {formatDate(test.created_at)}
                  </span>
                </div>

                <h2>{test.title}</h2>

                <p className="test-card-author">{test.creator_name}</p>

                <div className="test-card-actions">
                  <Link to={`/test/${test.id}`}>Пройти тест</Link>

                  <Link to={`/results/${test.id}`}>Результаты</Link>

                  <button
                    type="button"
                    className="share-button"
                    onClick={() => shareTest(test.id)}
                  >
                    {copiedId === test.id ? 'Скопировано' : 'Поделиться'}
                  </button>

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
        )}
      </div>
    </main>
  )
}

export default Tests