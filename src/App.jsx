import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import CreateTest from './pages/CreateTest'
import TakeTest from './pages/TakeTest'
import Result from './pages/Result'

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

        <Route
          path="/test/:id"
          element={<TakeTest />}
        />

        <Route
          path="/result/:id"
          element={<Result />}
        />

      </Routes>

    </BrowserRouter>
  )
}

export default App