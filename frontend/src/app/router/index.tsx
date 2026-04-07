import { Navigate, Route, Routes } from 'react-router-dom'
import {
  AnalyticsPage,
  BillingPage,
  CalendarPage,
  DashboardPage,
  LoginPage,
  OnboardingPage,
  RegisterPage,
  SettingsPage,
  WorkspacePage,
} from '@/pages'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/billing" element={<BillingPage />} />
      <Route path="/workspace" element={<WorkspacePage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
