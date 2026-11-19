import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { I18nProvider } from './lib/i18n'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Fabrics } from './pages/Fabrics'
import { Product } from './pages/Product'
import { Grades } from './pages/Grades'
import { Gallery } from './pages/Gallery'
import { ApiDocs } from './pages/ApiDocs'
import { TradeDesk } from './pages/TradeDesk'
import { Match } from './pages/Match'
import { TwinStudio } from './pages/TwinStudio'
import { Bench } from './pages/Bench'
import { NotFound } from './pages/NotFound'
import { Provenance, Swap, Handoff, Embed, JournalList, JournalPage } from './pages/StaticPages'
import { AdminLogin, AdminShell, AdminDashboard, AdminFabrics, AdminFabricEdit, AdminCategories, AdminPublish, AdminSettings, AdminGeneric } from './pages/Admin'
import { ToastContainer } from './components/Toast'

const BASE = import.meta.env.BASE_URL || '/'

function AppRoutes() {
  return (
    <Routes>
      <Route path={`${BASE}`.replace(/\/$/, '') || '/'} element={<Navigate to={`${BASE}ar/`} replace />} />
      <Route path={`${BASE}:locale`} element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="fabrics" element={<Fabrics />} />
        <Route path="fabrics/:slug" element={<Product />} />
        <Route path="grades" element={<Grades />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="api" element={<ApiDocs />} />
        <Route path="trade-desk" element={<TradeDesk />} />
        <Route path="match" element={<Match />} />
        <Route path="bench" element={<Bench />} />
        <Route path="twin/:slug" element={<TwinStudio />} />
        <Route path="provenance/:slug" element={<Provenance />} />
        <Route path="swap" element={<Swap />} />
        <Route path="handoff" element={<Handoff />} />
        <Route path="embed" element={<Embed />} />
        <Route path="journal" element={<JournalList />} />
        <Route path="journal/:slug" element={<JournalPage />} />
        {/* Admin routes — all noindex, nofollow, excluded from sitemap via meta */}
        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="admin" element={<AdminShell />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="fabrics" element={<AdminFabrics />} />
          <Route path="fabrics/:slug" element={<AdminFabricEdit />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="grades" element={<AdminGeneric title="Grades" />} />
          <Route path="journal" element={<AdminGeneric title="Journal" />} />
          <Route path="journal/:slug" element={<AdminGeneric title="Journal entry" />} />
          <Route path="gallery" element={<AdminGeneric title="Gallery" />} />
          <Route path="company" element={<AdminGeneric title="Company" />} />
          <Route path="translations" element={<AdminGeneric title="Translations" />} />
          <Route path="media" element={<AdminGeneric title="Media — grid, upload, rename, alt EN/AR, copy path, delete with usage check, orphan filter" />} />
          <Route path="generate" element={<AdminGeneric title="Generate — ProviderSelect, PromptComposer, BulkQueue etc." />} />
          <Route path="publish" element={<AdminPublish />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer />
      </BrowserRouter>
    </I18nProvider>
  )
}
