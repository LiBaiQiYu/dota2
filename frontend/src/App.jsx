import React, { useState, useEffect } from 'react'
import { useStratz } from './hooks/useStratz'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Footer from './components/Footer'
import OverviewPage from './components/OverviewPage'
import MatchesPage from './components/MatchesPage'
import HeroesPage from './components/HeroesPage'
import './App.css'

function App() {
  const { loading, error, data, fetchPlayer } = useStratz()
  const [activeMenu, setActiveMenu] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Handle URL query parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlSteamId = params.get('steamId')
    if (urlSteamId) {
      fetchPlayer(urlSteamId)
    } else {
      fetchPlayer('109902856')
    }
  }, [])

  const handleSearch = (steamId) => {
    fetchPlayer(steamId)
    setActiveMenu('overview')
  }

  const handlePlayerClick = (steamAccountId) => {
    fetchPlayer(steamAccountId)
    setActiveMenu('overview')
    // Update URL without refresh
    window.history.pushState({}, '', `?steamId=${steamAccountId}`)
  }

  const handleMenuClick = (menu) => {
    setActiveMenu(menu)
  }

  const renderContent = () => {
    if (loading) {
      return <div className="loading">加载中...</div>
    }

    if (error) {
      return <div className="error">{error}</div>
    }

    if (!data) {
      return <div className="empty-state">请在顶部搜索框输入 Steam ID 进行查询</div>
    }

    switch (activeMenu) {
      case 'overview':
        return (
          <OverviewPage
            player={data.player}
            matches={data.matches}
            heroes={data.heroes}
            steamId={data.steamId}
            loading={loading}
            onPlayerClick={handlePlayerClick}
          />
        )
      case 'matches':
        return (
          <MatchesPage
            allMatches={data.matches}
            heroes={data.heroes}
            steamId={data.steamId}
            loading={loading}
          />
        )
      case 'heroes':
        return <HeroesPage heroes={data.heroes} matches={data.matches} steamId={data.steamId} />
      case 'analytics':
        return <div className="empty-state">该功能开发中...</div>
      case 'settings':
        return <div className="empty-state">该功能开发中...</div>
      default:
        return null
    }
  }

  return (
    <div className="app">
      <Header onSearch={handleSearch} />

      <div className="main-layout">
        <Sidebar
          activeMenu={activeMenu}
          onMenuClick={handleMenuClick}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className={`content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          {!data && !loading && (
            <div className="empty-state-full">
              请在顶部搜索框输入 Steam ID 进行查询
            </div>
          )}
          {renderContent()}
        </main>
      </div>

      <Footer />
    </div>
  )
}

export default App
