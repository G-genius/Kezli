import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import CreateTest from './pages/CreateTest'
import TakeTest from './pages/TakeTest'
import Result from './pages/Result'
import TestIntro from './pages/TestIntro'

import './App.css'

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/create"
          element={<CreateTest />}
        />

        <Route path="/test/:id" element={<TestIntro />} />
        <Route path="/test/:id/questions" element={<TakeTest />} />

        <Route
          path="/result/:id"
          element={<Result />}
        />

      </Routes>

    </BrowserRouter>
  )
}

export default App