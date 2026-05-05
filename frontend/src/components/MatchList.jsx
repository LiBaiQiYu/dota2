import React, { useState, useMemo } from 'react'
import { LANE_OUTCOME } from '../constants/laneOutcome'
import { createHeroesMap } from '../constants/heroes'
import './MatchList.css'

function getHeroName(heroId, heroesMap) {
  if (heroesMap && heroesMap[heroId]) {
    // Prefer Chinese name
    return heroesMap[heroId].chineseName || heroesMap[heroId].displayName || heroesMap[heroId].shortName || `英雄${heroId}`
  }
  return `英雄${heroId}`
}

function formatDate(timestamp) {
  if (!timestamp) return '-'
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins >= 60) {
    const hours = Math.floor(mins / 60)
    const remainingMins = mins % 60
    return `${hours}h ${remainingMins}m`
  }
  return `${mins}m ${secs}s`
}

function formatAbsoluteTime(timestamp) {
  const date = new Date(timestamp * 1000)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getLaneInfo(match, steamId) {
  const steamIdNum = parseInt(steamId)
  const player = match.players?.find(p => p.steamAccountId === steamIdNum)
  if (!player) return null

  // Determine which lane based on hero position
  // For now, we'll show all three lanes if available
  const lanes = []
  if (match.topLaneOutcome !== undefined && match.topLaneOutcome !== null) {
    lanes.push({ lane: '上路', outcome: match.topLaneOutcome })
  }
  if (match.midLaneOutcome !== undefined && match.midLaneOutcome !== null) {
    lanes.push({ lane: '中路', outcome: match.midLaneOutcome })
  }
  if (match.bottomLaneOutcome !== undefined && match.bottomLaneOutcome !== null) {
    lanes.push({ lane: '下路', outcome: match.bottomLaneOutcome })
  }

  return lanes.length > 0 ? lanes : null
}

function MatchDetail({ match, heroes, steamId }) {
  const steamIdNum = parseInt(steamId)

  // Build heroes map from API data with Chinese names
  const heroesMap = useMemo(() => {
    if (!heroes) return null
    return createHeroesMap(heroes)
  }, [heroes])
  const radiantPlayers = match.players?.filter(p => p.isRadiant) || []
  const direPlayers = match.players?.filter(p => !p.isRadiant) || []
  const didRadiantWin = match.didRadiantWin

  return (
    <div className="match-detail">
      <div className="teams-grid">
        <div className="team">
          <div className={`team-header ${didRadiantWin ? 'win' : 'loss'}`}>
            天辉 {didRadiantWin ? '✓ 胜利' : '✗ 失败'}
          </div>
          {radiantPlayers.map((p, i) => (
            <div
              key={i}
              className={`team-player ${p.steamAccountId === steamIdNum ? 'current' : ''}`}
            >
              <div className="player-hero">
                <div className="player-hero-icon">{getHeroName(p.heroId, heroesMap).charAt(0)}</div>
                <span className="player-hero-name">{getHeroName(p.heroId, heroesMap)}</span>
              </div>
              <div className="player-kda">
                <span className="kills">{p.kills}</span> / <span className="deaths">{p.deaths}</span> / <span className="assists">{p.assists}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="team">
          <div className={`team-header ${didRadiantWin ? 'loss' : 'win'}`}>
            夜魇 {didRadiantWin ? '✗ 失败' : '✓ 胜利'}
          </div>
          {direPlayers.map((p, i) => (
            <div
              key={i}
              className={`team-player ${p.steamAccountId === steamIdNum ? 'current' : ''}`}
            >
              <div className="player-hero">
                <div className="player-hero-icon">{getHeroName(p.heroId, heroesMap).charAt(0)}</div>
                <span className="player-hero-name">{getHeroName(p.heroId, heroesMap)}</span>
              </div>
              <div className="player-kda">
                <span className="kills">{p.kills}</span> / <span className="deaths">{p.deaths}</span> / <span className="assists">{p.assists}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function MatchList({ matches, heroes, steamId, hideHeader = false }) {
  const [expandedIndex, setExpandedIndex] = useState(null)

  // Build heroes map from API data with Chinese names
  const heroesMap = useMemo(() => {
    if (!heroes) return null
    return createHeroesMap(heroes)
  }, [heroes])

  if (!matches || matches.length === 0) {
    return <div className="matches-empty">暂无比赛记录</div>
  }

  const toggleDetail = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <div className="matches-list">
      {!hideHeader && (
        <div className="matches-header">
          <span>最近 {matches.length} 场比赛</span>
          <span className="matches-tip">点击展开详情</span>
        </div>
      )}

      {matches.map((match, index) => {
        const steamIdNum = parseInt(steamId)
        const player = match.players?.find(p => p.steamAccountId === steamIdNum)
        const heroId = player?.heroId || 0
        const heroName = getHeroName(heroId, heroesMap)
        const kills = player?.kills ?? 0
        const deaths = player?.deaths ?? 0
        const assists = player?.assists ?? 0
        const imp = player?.imp ?? 0

        const isRadiant = player?.isRadiant ?? true
        const didRadiantWin = match.didRadiantWin
        const isWin = isRadiant === didRadiantWin

        const laneInfo = getLaneInfo(match, steamId)

        return (
          <div key={match.id || index} className="match-item">
            <div
              className={`match-row ${isWin ? 'win' : 'loss'}`}
              onClick={() => toggleDetail(index)}
            >
              <div className="hero-section">
                <div className="hero-icon">{heroName.charAt(0)}</div>
                <div className="hero-info">
                  <span className="hero-name">{heroName}</span>
                  <span className="hero-gpm">GPM: {player?.goldPerMinute || 0}</span>
                  <span className="hero-xpm">XPM: {player?.experiencePerMinute || 0}</span>
                </div>
              </div>

              <div className="result-section">
                <span className={`result-badge ${isWin ? 'win' : 'loss'}`}>
                  {isWin ? '胜利' : '失败'}
                </span>
                <div className="match-meta">
                  <span className="match-time" title={formatAbsoluteTime(match.startDateTime)}>
                    {formatDate(match.startDateTime)}
                  </span>
                  <span className="match-duration">{formatDuration(match.durationSeconds)}</span>
                </div>
              </div>

              <div className="lane-section">
                {laneInfo ? (
                  laneInfo.map((l, i) => (
                    <div key={i} className="lane-item">
                      <span className="lane-name">{l.lane}</span>
                      <span
                        className="lane-outcome"
                        style={{ color: LANE_OUTCOME[l.outcome]?.color || '#999999' }}
                      >
                        {LANE_OUTCOME[l.outcome]?.label || '未知'}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="lane-unknown">-</span>
                )}
              </div>

              <div className="imp-section">
                <span className={`imp-value ${imp > 0 ? 'positive' : imp < 0 ? 'negative' : ''}`}>
                  {imp > 0 ? '+' : ''}{imp}
                </span>
                <span className="imp-label">IMP</span>
              </div>

              <div className="kda-section">
                <span className="kda">
                  <span className="kills">{kills}</span> / <span className="deaths">{deaths}</span> / <span className="assists">{assists}</span>
                </span>
                <span className="kda-label">KDA</span>
              </div>

              <div className="expand-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {expandedIndex === index ? (
                    <path d="m18 15-6-6-6 6"/>
                  ) : (
                    <path d="m6 9 6 6 6-6"/>
                  )}
                </svg>
              </div>
            </div>

            {expandedIndex === index && (
              <MatchDetail match={match} heroes={heroes} steamId={steamId} />
            )}
          </div>
        )
      })}
    </div>
  )
}
