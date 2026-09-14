import { useEffect } from 'react'
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'

import Home from './pages/Home'
import CreateTest from './pages/CreateTest'
import TestIntro from './pages/TestIntro'
import TakeTest from './pages/TakeTest'
import Result from './pages/Result'
import Results from './pages/Results'
import Tests from './pages/Tests'
import Auth from './pages/Auth'
import MyTests from './pages/MyTests'
import Review from './pages/Review'

import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'

import './App.css'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    })
  }, [pathname])

  return null
}

function PageTransition() {
  const location = useLocation()

  return (
    <main className="app-main" key={location.pathname}>
      <div className="page-transition">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreateTest />
              </ProtectedRoute>
            }
          />

          <Route path="/tests" element={<Tests />} />

          <Route path="/test/:id" element={<TestIntro />} />

          <Route
            path="/test/:id/questions"
            element={<TakeTest />}
          />

          <Route path="/result/:id" element={<Result />} />

          <Route path="/results/:id" element={<Results />} />

          <Route path="/auth" element={<Auth />} />

          <Route path="/review/:id" element={<Review />} />

          <Route
            path="/my-tests"
            element={
              <ProtectedRoute>
                <MyTests />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <section className="not-found-page">
                <div className="not-found-icon">404</div>

                <h1>Страница не найдена</h1>

                <p>
                  Возможно, ссылка устарела или страница была перемещена.
                </p>

                <a href="/" className="primary-button">
                  Вернуться на главную
                </a>
              </section>
            }
          />
        </Routes>
      </div>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <div className="app-shell">
        <Header />

        <PageTransition />
      </div>
    </BrowserRouter>
  )
}

export default App