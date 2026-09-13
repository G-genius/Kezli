import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import CreateTest from './pages/CreateTest'
import TestIntro from './pages/TestIntro'
import TakeTest from './pages/TakeTest'
import Result from './pages/Result'
import Tests from './pages/Tests'
import Header from './components/Header'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateTest />} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/test/:id" element={<TestIntro />} />
        <Route path="/test/:id/questions" element={<TakeTest />} />
        <Route path="/result/:id" element={<Result />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App