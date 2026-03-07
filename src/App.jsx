import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { ANIME_LIST } from './data/index.js'
import Dashboard from './Dashboard.jsx'

function Home() {
  const navigate = useNavigate()

  if (ANIME_LIST.length === 0) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center font-mono">
        <p className="text-cyan-400 text-lg tracking-widest">
          [ NO ENTRIES — ARCHIVE LOADING ]
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050508] font-mono p-8">
      <h1 className="text-cyan-400 text-2xl mb-8 text-center tracking-widest">
        ANIME ARCHITECTURE ARCHIVE
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {ANIME_LIST.map((anime) => (
          <div
            key={anime.name}
            className="border border-cyan-900 bg-[#0a0a12] rounded-lg p-6 hover:border-cyan-500 transition-colors"
          >
            <h2 className="text-cyan-300 text-lg font-bold mb-2">{anime.name}</h2>
            <p className="text-gray-500 text-sm mb-4">{anime.tagline}</p>
            <button
              onClick={() => navigate(`/anime/${encodeURIComponent(anime.name)}`)}
              className="w-full border border-cyan-700 text-cyan-400 py-2 px-4 rounded hover:bg-cyan-900/30 transition-colors text-sm tracking-wider"
            >
              ENTER ARCHIVE
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function DashboardRoute() {
  const { name } = useParams()
  const anime = ANIME_LIST.find(
    (a) => a.name === decodeURIComponent(name)
  )
  return <Dashboard data={anime || null} />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/anime/:name" element={<DashboardRoute />} />
    </Routes>
  )
}
