import React, { useState } from 'react'
import './Header.css'

export default function Header({ onSearch }) {
  const [steamId, setSteamId] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (steamId.trim()) {
      onSearch(steamId.trim())
      setShowSearch(false)
      setSteamId('')
    }
  }

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo" title="首页"></div>
      </div>

      <nav className="header-nav">
        <a href="#" className="nav-item active">首页</a>
        <a href="#" className="nav-item">比赛记录</a>
        <a href="#" className="nav-item">英雄</a>
        <a href="#" className="nav-item">数据分析</a>
        <a href="#" className="nav-item">帮助中心</a>
      </nav>

      <div className="header-right">
        <div className="header-search">
          {showSearch ? (
            <form onSubmit={handleSubmit} className="search-form">
              <input
                type="text"
                className="search-input"
                placeholder="输入 Steam ID"
                value={steamId}
                onChange={(e) => setSteamId(e.target.value)}
                autoFocus
              />
              <button type="submit" className="search-submit">搜索</button>
            </form>
          ) : (
            <button
              className="icon-btn"
              onClick={() => setShowSearch(true)}
              title="搜索"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          )}
        </div>

        <button className="icon-btn" title="个人中心">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </button>
      </div>
    </header>
  )
}
