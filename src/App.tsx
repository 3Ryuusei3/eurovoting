import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import { ThemeProvider } from "@/components/theme-provider"
import { Layout } from "@/components/layout/Layout"
import { HomePage } from '@/pages/HomePage'
import { CreateRoom } from '@/pages/CreateRoom'
import { JoinRoom } from '@/pages/JoinRoom'
import { Room } from '@/pages/Room'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreateRoom />} />
            <Route path="/join" element={<JoinRoom />} />
            <Route path="/room" element={<Room />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  )
}

export default App
