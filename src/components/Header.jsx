import { Link, NavLink } from 'react-router-dom'

function Header() {
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
        </nav>
      </div>
    </header>
  )
}

export default Header