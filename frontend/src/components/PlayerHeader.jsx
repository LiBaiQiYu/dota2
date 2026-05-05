import React from 'react'
import './PlayerHeader.css'

export default function PlayerHeader({ player }) {
  if (!player) return null

  const name = player.steamAccount?.name || '未知玩家'
  const avatar = player.steamAccount?.avatar || ''
  const names = Array.isArray(player.names)
    ? player.names.map(n => n.name || n).filter(Boolean).slice(0, 5)
    : []

  const totalGames = player.matchCount || 0
  const wins = player.winCount || 0
  const losses = totalGames - wins
  const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0
  const imp = player.imp || 0

  const formatDate = (timestamp) => {
    if (!timestamp) return '-'
    const date = new Date(timestamp * 1000)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  }

  return (
    <div className="player-header-card">
      <div className="player-main">
        <img className="player-avatar" src={avatar} alt={name} />
        <div className="player-info">
          <h1 className="player-name">{name}</h1>
          {names.length > 0 && (
            <p className="player-names">曾用名: {names.join(' / ')}</p>
          )}
          <p className="player-id">Steam ID: {player.steamAccountId}</p>
        </div>
      </div>

      <div className="player-stats">
        <div className="stat-item">
          <span className="stat-value">{totalGames}</span>
          <span className="stat-label">总场次</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value win">{wins}</span>
          <span className="stat-label">胜场</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value loss">{losses}</span>
          <span className="stat-label">负场</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value rate">{winRate}%</span>
          <span className="stat-label">胜率</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value">{imp > 0 ? '+' + imp : imp}</span>
          <span className="stat-label">IMP</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value">{formatDate(player.lastMatchDate)}</span>
          <span className="stat-label">最后比赛</span>
        </div>
      </div>
    </div>
  )
}
