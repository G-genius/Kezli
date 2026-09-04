import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import CreateTest from './pages/CreateTest'

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

      </Routes>

    </BrowserRouter>
  )
}

export default App