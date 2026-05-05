import React, { useState } from 'react'

export default function SearchBar({ onSearch, loading }) {
  const [steamId, setSteamId] = useState('109902856')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (steamId.trim()) {
      onSearch(steamId.trim())
    }
  }

  return (
    <form className="search-section" onSubmit={handleSubmit}>
      <input
        type="text"
        className="search-input"
        placeholder="输入 Steam ID"
        value={steamId}
        onChange={(e) => setSteamId(e.target.value)}
      />
      <button type="submit" className="search-btn" disabled={loading}>
        {loading ? '查询中...' : '查询'}
      </button>
    </form>
  )
}
