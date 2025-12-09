import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import { ContentContainer, HsafaProvider } from '@hsafa/ui-sdk';
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import InfoGraph from './pages/InfoGraph'
import DashboardPage from './pages/DashboardPage'
import DeckGLMap from './pages/DeckGLMap'
import AnalysePage from './pages/AnalysePage'
import FloatingNav from './components/FloatingNav'
import PresentaionBuilder from './pages/PresentaionBuilder'

function App() {
  return (
      <HsafaProvider baseUrl="http://localhost:3900">
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
          <ContentContainer>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/infograph" element={<InfoGraph />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/presentation-builder" element={<PresentaionBuilder />} />
              <Route path="/deckgl-map" element={<DeckGLMap />} />
              <Route path="/analyse" element={<AnalysePage />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </ContentContainer>
          <FloatingNav />
        </div>
      </HsafaProvider>
  )
}

export default App
