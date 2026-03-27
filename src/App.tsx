import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './theme/ThemeProvider'
import { AuthProvider, RequireAuth } from './auth/AuthContext'
import { DataProvider } from './data/DataProvider'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './features/login/LoginPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { ShoppersPage } from './features/shoppers/ShoppersPage'
import { BasketAnalysisPage } from './features/basket/BasketAnalysisPage'
import { VisitPatternsPage } from './features/visits/VisitPatternsPage'
import { SegmentsPage } from './features/segments/SegmentsPage'
import { NationalComparisonPage } from './features/national/NationalComparisonPage'
import { CampaignHistoryPage } from './features/campaigns/CampaignHistoryPage'
import { AskAgentPage } from './features/agent/AskAgentPage'
import { BrandingPage } from './features/admin/BrandingPage'
import { SupplierInsightsPage } from './features/suppliers/SupplierInsightsPage'
import { LoyaltyLeakagePage } from './features/loyalty/LoyaltyLeakagePage'
import { ShopperPersonasPage } from './features/personas/ShopperPersonasPage'

export default function App() {
  return (
    <BrowserRouter basename="/Shopper360">
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<RequireAuth />}>
              <Route element={<DataProvider><AppLayout /></DataProvider>}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/shoppers" element={<ShoppersPage />} />
                <Route path="/basket" element={<BasketAnalysisPage />} />
                <Route path="/visits" element={<VisitPatternsPage />} />
                <Route path="/segments" element={<SegmentsPage />} />
                <Route path="/national" element={<NationalComparisonPage />} />
                <Route path="/suppliers" element={<SupplierInsightsPage />} />
                <Route path="/personas" element={<ShopperPersonasPage />} />
                <Route path="/loyalty" element={<LoyaltyLeakagePage />} />
                <Route path="/campaigns" element={<CampaignHistoryPage />} />
                <Route path="/ask" element={<AskAgentPage />} />
                <Route path="/admin/branding" element={<BrandingPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
