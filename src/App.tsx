import { ThemeProvider } from "@/components/theme-provider"
import { LandingPage } from './pages/LandingPage'
import { Layout } from "./components/layout/Layout"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Layout>
        <LandingPage />
      </Layout>
    </ThemeProvider>
  )
}

export default App
