import { lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'

const Home = lazy(() => import('@/pages/Home'))
const Location = lazy(() => import('@/pages/Location'))
const Clocks = lazy(() => import('@/pages/Clocks'))
const Planner = lazy(() => import('@/pages/Planner'))
const Timers = lazy(() => import('@/pages/Timers'))
const Settings = lazy(() => import('@/pages/Settings'))
const About = lazy(() => import('@/pages/About'))
const NotFound = lazy(() => import('@/pages/NotFound'))

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/location/:slug" element={<Location />} />
        <Route path="/clocks" element={<Clocks />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/timers" element={<Timers />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
