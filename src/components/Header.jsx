import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Header() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    let mounted = true

    async function loadUser() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (mounted) {
        setUser(currentUser)
      }
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="logo" to="/">
          KEZLI
        </Link>

        <nav className="site-nav">
          <NavLink
            to="/tests"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Все тесты
          </NavLink>

          <NavLink
            to="/create"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Создать тест
          </NavLink>

          {user ? (
            <button
              type="button"
              className="header-auth-button"
              onClick={handleSignOut}
            >
              Выйти
            </button>
          ) : (
            <NavLink
              to="/auth"
              className={({ isActive }) =>
                isActive ? 'active header-login-link' : 'header-login-link'
              }
            >
              Войти
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header