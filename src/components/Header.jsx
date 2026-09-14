import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Header() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

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
    setMenuOpen(false)
    navigate('/')
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="logo" to="/" onClick={closeMenu}>
          KEZLI<span>.</span>
        </Link>

        <button
          type="button"
          className="mobile-menu-button"
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((previous) => !previous)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`site-nav ${menuOpen ? 'is-open' : ''}`}>
          <NavLink
            to="/tests"
            className={({ isActive }) =>
              isActive ? 'active' : ''
            }
            onClick={closeMenu}
          >
            Все тесты
          </NavLink>

          <NavLink
            to="/create"
            className={({ isActive }) =>
              isActive ? 'active' : ''
            }
            onClick={closeMenu}
          >
            Создать тест
          </NavLink>

          {user && (
            <NavLink
              to="/my-tests"
              className={({ isActive }) =>
                isActive ? 'active' : ''
              }
              onClick={closeMenu}
            >
              Мои тесты
            </NavLink>
          )}

          {user ? (
            <div className="header-user">
              <span className="header-user-email">
                {user.email}
              </span>

              <button
                type="button"
                className="header-auth-button"
                onClick={handleSignOut}
              >
                Выйти
              </button>
            </div>
          ) : (
            <NavLink
              to="/auth"
              className={({ isActive }) =>
                isActive
                  ? 'active header-login-link'
                  : 'header-login-link'
              }
              onClick={closeMenu}
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