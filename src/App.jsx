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
import Header from './components/Header'
import Auth from './pages/Auth'

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

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateTest />} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/test/:id" element={<TestIntro />} />
        <Route path="/test/:id/questions" element={<TakeTest />} />
        <Route path="/result/:id" element={<Result />} />
        <Route path="/results/:id" element={<Results />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App