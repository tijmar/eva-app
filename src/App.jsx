import { useState, useEffect } from 'react'
import EvaTinder from './components/EvaTinder.jsx'
import Admin from './components/Admin.jsx'

export default function App() {
  const [page, setPage] = useState(window.location.hash)

  useEffect(() => {
    const handler = () => setPage(window.location.hash)
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  if (page === '#admin') return <Admin />
  return <EvaTinder />
}
