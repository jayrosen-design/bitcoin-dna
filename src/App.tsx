
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import { ThemeProvider } from './components/theme-provider'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="bitcoin-dna-theme">
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
