import React from 'react'
import PlayerHeader from './PlayerHeader'
import MatchList from './MatchList'
import './OverviewPage.css'

export default function OverviewPage({ player, matches, heroes, steamId, loading, onPlayerClick }) {
  return (
    <div className="overview-page">
      {player && <PlayerHeader player={player} />}

      <div className="card">
        <div className="card-header">
          <span className="card-title">数据概览</span>
          <span className="card-count">最近 {matches?.length || 0} 场比赛</span>
        </div>
        <div className="card-content">
          <MatchList matches={matches} heroes={heroes} steamId={steamId} onPlayerClick={onPlayerClick} />
        </div>
      </div>
    </div>
  )
}
