import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signIn, signUp } from '../lib/auth'
import './Auth.css'

function Auth() {
  const navigate = useNavigate()

  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    setLoading(true)
    setError('')
    setMessage('')

    const action = mode === 'login' ? signIn : signUp
    const { data, error: authError } = await action(email, password)

    if (authError) {
      console.error('Ошибка авторизации:', authError)
      setError(authError.message || 'Не удалось выполнить действие')
      setLoading(false)
      return
    }

    if (mode === 'signup') {
      if (!data.session) {
        setMessage(
          'Регистрация прошла успешно. Проверь почту и подтверди аккаунт.'
        )
      } else {
        navigate('/my-tests')
      }
    } else {
      navigate('/my-tests')
    }

    setLoading(false)
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setError('')
    setMessage('')
  }

  return (
    <main className="page">
      <div className="auth-container">
        <div className="auth-heading">
          <p className="eyebrow">KEZLI / ACCOUNT</p>

          <h1>{mode === 'login' ? 'С возвращением' : 'Создать аккаунт'}</h1>

          <p>
            {mode === 'login'
              ? 'Войди, чтобы управлять своими тестами.'
              : 'Зарегистрируйся, чтобы сохранять свои тесты.'}
          </p>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button
              type="button"
              className={mode === 'login' ? 'auth-tab active' : 'auth-tab'}
              onClick={() => switchMode('login')}
            >
              Войти
            </button>

            <button
              type="button"
              className={mode === 'signup' ? 'auth-tab active' : 'auth-tab'}
              onClick={() => switchMode('signup')}
            >
              Регистрация
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />

            <label htmlFor="password">Пароль</label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Минимум 6 символов"
              minLength={6}
              required
            />

            {error && <div className="auth-error">{error}</div>}

            {message && <div className="auth-message">{message}</div>}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Подождите...'
                : mode === 'login'
                  ? 'Войти'
                  : 'Создать аккаунт'}
            </button>
          </form>

          <p className="auth-footer">
            <Link to="/">Вернуться на главную</Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default Auth