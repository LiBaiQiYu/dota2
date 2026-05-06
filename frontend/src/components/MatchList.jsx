import React, { useState, useMemo } from 'react'
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

// Get award badge info
function getAwardBadge(award) {
  const awardMap = {
    "MVP": { label: 'MVP', color: '#f5222d', bgColor: 'rgba(245, 34, 45, 0.2)' },
    "TOP_CORE": { label: '最佳核心', color: '#faad14', bgColor: 'rgba(250, 173, 20, 0.2)' },
    "TOP_SUPPORT": { label: '最佳辅助', color: '#1890ff', bgColor: 'rgba(24, 144, 255, 0.2)' },
    "NONE": null
  }
  return awardMap[award] || null
}

// Get player's lane and lane outcome info
function getPlayerLaneInfo(match, steamId) {
  const steamIdNum = parseInt(steamId)
  const player = match.players?.find(p => p.steamAccountId === steamIdNum)
  if (!player) return null

  const isRadiant = player.isRadiant
  const apiLane = player.lane // SAFE_LANE, MID_LANE, OFF_LANE, JUNGLE

  // Map API lane to display name
  const laneMap = {
    "SAFE_LANE": "劣势路",
    "MID_LANE": "中路",
    "OFF_LANE": "优势路",
    "JUNGLE": "打野"
  }

  // Map outcome to player's perspective
  const mapOutcome = (outcome) => {
    if (outcome === "RADIANT_VICTORY") {
      return isRadiant ? { label: '胜', color: '#52c41a' } : { label: '负', color: '#f5222d' }
    }
    if (outcome === "DIRE_VICTORY") {
      return isRadiant ? { label: '负', color: '#f5222d' } : { label: '胜', color: '#52c41a' }
    }
    if (outcome === "RADIANT_STOMP") {
      return isRadiant ? { label: '碾压', color: '#722ed1' } : { label: '被碾压', color: '#f5222d' }
    }
    if (outcome === "DIRE_STOMP") {
      return isRadiant ? { label: '被碾压', color: '#f5222d' } : { label: '碾压', color: '#722ed1' }
    }
    if (outcome === "TIE") {
      return { label: '平', color: '#faad14' }
    }
    return { label: '-', color: '#999999' }
  }

  // Map player's lane to API outcome field
  const getOutcomeField = () => {
    if (apiLane === "MID_LANE") return "midLaneOutcome"
    if (apiLane === "SAFE_LANE") return isRadiant ? "bottomLaneOutcome" : "topLaneOutcome"
    if (apiLane === "OFF_LANE") return isRadiant ? "topLaneOutcome" : "bottomLaneOutcome"
    return null
  }

  const laneName = laneMap[apiLane] || "其他"
  const outcomeField = getOutcomeField()
  const outcome = outcomeField ? match[outcomeField] : null

  return {
    lane: laneName,
    laneOutcome: outcome ? mapOutcome(outcome).label : '-',
    laneColor: outcome ? mapOutcome(outcome).color : '#999999'
  }
}

// Calculate performance assessment based on KDA and IMP
function getPerformanceAssessment(player) {
  const kda = player.deaths > 0 ? ((player.kills + player.assists) / player.deaths).toFixed(1) : (player.kills + player.assists).toFixed(1)
  const kdaNum = parseFloat(kda)
  const imp = player.imp || 0

  // 综合评分 = KDA * (1 + IMP/100)
  // 这样 IMP 会正向修正 KDA
  const adjustedScore = kdaNum * (1 + imp / 100)
  const impFactor = imp / 100 // -1 到 1

  let label, color, description

  // 根据 IMP 和 KDA 综合判断
  // IMP >= 50: 极好
  // IMP >= 30: 很好
  // IMP >= 10: 较好
  // IMP >= -10: 一般
  // IMP >= -30: 较差
  // IMP < -30: 很差

  if (imp >= 50) {
    label = '封神'
    color = '#722ed1'
    description = '完美表现，超出预期'
  } else if (imp >= 30) {
    label = 'carry'
    color = '#52c41a'
    description = '团队核心，带动全场'
  } else if (imp >= 10) {
    if (kdaNum >= 3) {
      label = '大优'
      color = '#73d13d'
      description = '对线优势明显'
    } else {
      label = '小优'
      color = '#8bc34a'
      description = '表现优于平均'
    }
  } else if (imp >= -10) {
    if (kdaNum >= 2) {
      label = '正常'
      color = '#faad14'
      description = '中规中矩'
    } else {
      label = '一般'
      color = '#ff9800'
      description = '略有不足'
    }
  } else if (imp >= -30) {
    if (kdaNum >= 1) {
      label = '劣势'
      color = '#ff7a45'
      description = '表现低于预期'
    } else {
      label = '逛街'
      color = '#ff4d4f'
      description = '基本没发挥作用'
    }
  } else {
    label = '演员'
    color = '#cf1322'
    description = '严重坑队友'
  }

  return {
    label,
    color,
    kda: kda,
    imp: imp,
    description
  }
}

function MatchDetail({ match, heroes, steamId, onPlayerClick }) {
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
                <div className="player-info">
                  <span className="player-hero-name">{getHeroName(p.heroId, heroesMap)}</span>
                  <span
                    className="player-name clickable"
                    onClick={() => onPlayerClick && onPlayerClick(p.steamAccountId)}
                  >
                    {p.steamAccount?.name || '匿名'}
                  </span>
                </div>
                {getAwardBadge(p.award) && (
                  <span
                    className="player-award"
                    style={{
                      color: getAwardBadge(p.award).color,
                      backgroundColor: getAwardBadge(p.award).bgColor
                    }}
                  >
                    {getAwardBadge(p.award).label}
                  </span>
                )}
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
                <div className="player-info">
                  <span className="player-hero-name">{getHeroName(p.heroId, heroesMap)}</span>
                  <span
                    className="player-name clickable"
                    onClick={() => onPlayerClick && onPlayerClick(p.steamAccountId)}
                  >
                    {p.steamAccount?.name || '匿名'}
                  </span>
                </div>
                {getAwardBadge(p.award) && (
                  <span
                    className="player-award"
                    style={{
                      color: getAwardBadge(p.award).color,
                      backgroundColor: getAwardBadge(p.award).bgColor
                    }}
                  >
                    {getAwardBadge(p.award).label}
                  </span>
                )}
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

export default function MatchList({ matches, heroes, steamId, hideHeader = false, onPlayerClick }) {
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

        const laneInfo = getPlayerLaneInfo(match, steamId)
        const performance = getPerformanceAssessment(player)

        return (
          <div key={match.id || index} className="match-item">
            <div
              className={`match-row ${isWin ? 'win' : 'loss'}`}
              onClick={() => toggleDetail(index)}
            >
              <div className="hero-section">
                <div className="hero-icon">{heroName.charAt(0)}</div>
                <div className="hero-info">
                  <div className="hero-name-row">
                    <span className="hero-name">{heroName}</span>
                    {getAwardBadge(player?.award) && (
                      <span
                        className="award-badge"
                        style={{
                          color: getAwardBadge(player.award).color,
                          backgroundColor: getAwardBadge(player.award).bgColor
                        }}
                      >
                        {getAwardBadge(player.award).label}
                      </span>
                    )}
                  </div>
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
                  <div className="lane-item">
                    <span className="lane-name">{laneInfo.lane}</span>
                    <span
                      className="lane-outcome"
                      style={{ color: laneInfo.laneColor || '#999999' }}
                    >
                      {laneInfo.laneOutcome}
                    </span>
                  </div>
                ) : (
                  <span className="lane-unknown">-</span>
                )}
              </div>

              <div className="imp-section">
                <span
                  className="imp-label"
                  style={{ color: performance.color }}
                >
                  {performance.label}
                </span>
                <div className="imp-bar-container">
                  <div className="imp-bar">
                    <div className="imp-bar-negative" style={{ width: `${Math.max(0, -imp) / 2}%` }}></div>
                    <div className="imp-bar-positive" style={{ width: `${Math.max(0, imp) / 2}%` }}></div>
                    <div className="imp-bar-center"></div>
                    <div className="imp-bar-indicator" style={{ left: `${50 + imp / 2}%` }}></div>
                  </div>
                  <span className={`imp-value ${imp > 0 ? 'positive' : imp < 0 ? 'negative' : ''}`}>
                    {imp > 0 ? '+' : ''}{imp}
                  </span>
                </div>
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
              <MatchDetail match={match} heroes={heroes} steamId={steamId} onPlayerClick={onPlayerClick} />
            )}
          </div>
        )
      })}
    </div>
  )
}
