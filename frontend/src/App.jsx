import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Search from './pages/Search'
import ArtistProfile from './pages/ArtistProfile'
import AlbumPage from './pages/AlbumPage'
import PlaylistPage from './pages/PlaylistPage'
import Login from './pages/Login'
import Register from './pages/Register'
import UserProfile from './pages/UserProfile'
import ArtistDashboard from './pages/ArtistDashboard'
import Categories from './pages/Categories'
import Settings from './pages/Settings'
import BecomeArtist from './pages/BecomeArtist'
import UploadSong from './pages/UploadSong'
import GoLive from './pages/GoLive'
import LiveStream from './pages/LiveStream'
import LiveStreams from './pages/LiveStreams'

function ProfileRouter() {
  const { user } = useAuth()
  if (user?.role === 'artist' || user?.role === 'admin') {
    return <ArtistDashboard />
  }
  return <UserProfile />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route path="artist/:id" element={<ArtistProfile />} />
        <Route path="album/:id" element={<AlbumPage />} />
        <Route path="playlist/:id" element={<PlaylistPage />} />
        <Route path="profile" element={<ProfileRouter />} />
        <Route path="categories" element={<Categories />} />
        <Route path="settings" element={<Settings />} />
        <Route path="upload-song" element={<UploadSong />} />
        <Route path="become-artist" element={<BecomeArtist />} />
        <Route path="go-live" element={<GoLive />} />
        <Route path="live" element={<LiveStreams />} />
        <Route path="live/:id" element={<LiveStream />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}

export default App