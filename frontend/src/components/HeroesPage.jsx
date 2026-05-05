import React, { useState, useMemo } from 'react'
import { createHeroesMap, ATTRIBUTE_COLORS, ATTRIBUTE_NAMES } from '../constants/heroes'
import './HeroesPage.css'

export default function HeroesPage({ heroes, matches, steamId }) {
  const [activeAttribute, setActiveAttribute] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  const attributes = ['ALL', 'Strength', 'Agility', 'Intelligence', 'Universal']

  // Create heroes map with Chinese names
  const heroesMap = useMemo(() => {
    if (!heroes) return {}
    return createHeroesMap(heroes)
  }, [heroes])

  // Calculate hero stats from matches for the current player
  const heroStatsMap = useMemo(() => {
    if (!matches || !steamId) return {}

    const stats = {}
    const steamIdNum = parseInt(steamId)

    matches.forEach(match => {
      match.players?.forEach(player => {
        if (player.steamAccountId === steamIdNum) {
          if (!stats[player.heroId]) {
            stats[player.heroId] = { wins: 0, games: 0 }
          }
          stats[player.heroId].games++
          if (player.isVictory) {
            stats[player.heroId].wins++
          }
        }
      })
    })

    return stats
  }, [matches, steamId])

  // Filter heroes based on search and attribute
  const filteredHeroes = useMemo(() => {
    if (!heroes) return []

    return heroes.filter(hero => {
      const heroData = heroesMap[hero.id] || hero
      const cnName = heroData.chineseName || hero.displayName || hero.shortName || ''
      const enName = hero.displayName || hero.shortName || ''
      const matchesSearch = cnName.includes(searchTerm) || enName.toLowerCase().includes(searchTerm.toLowerCase())
      const heroAttr = hero.stats?.primaryAttributeEnum || 'Universal'
      const matchesAttr = activeAttribute === 'ALL' || heroAttr === activeAttribute
      return matchesSearch && matchesAttr
    })
  }, [heroes, heroesMap, searchTerm, activeAttribute])

  const getHeroStats = (heroId) => {
    const stats = heroStatsMap[heroId]
    if (!stats) return { games: 0, wins: 0, winRate: null }
    const winRate = stats.games > 0 ? ((stats.wins / stats.games) * 100).toFixed(1) : null
    return { ...stats, winRate }
  }

  return (
    <div className="heroes-page">
      <div className="heroes-header">
        <div className="heroes-title">
          <h2>英雄列表</h2>
          <span className="heroes-count">共 {heroes?.length || 0} 个英雄</span>
        </div>

        <div className="heroes-filters">
          <input
            type="text"
            className="hero-search-input"
            placeholder="搜索英雄..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="attribute-tabs">
        {attributes.map(attr => (
          <button
            key={attr}
            className={`attribute-tab ${activeAttribute === attr ? 'active' : ''}`}
            onClick={() => setActiveAttribute(attr)}
            style={{
              '--attr-color': attr === 'ALL' ? '#e94560' : ATTRIBUTE_COLORS[attr]
            }}
          >
            {attr === 'ALL' ? '全部' : ATTRIBUTE_NAMES[attr]}
            {attr !== 'ALL' && heroes && (
              <span className="attr-count">
                {heroes.filter(h => h.stats?.primaryAttributeEnum === attr).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="heroes-grid">
        {filteredHeroes.length === 0 ? (
          <div className="heroes-empty">
            {heroes ? '未找到英雄' : '加载中...'}
          </div>
        ) : (
          filteredHeroes.map(hero => {
            const heroData = heroesMap[hero.id] || hero
            const heroName = heroData.chineseName || heroData.displayName || heroData.shortName || `英雄${hero.id}`
            const heroAttr = hero.stats?.primaryAttributeEnum || 'Universal'
            const attrColor = ATTRIBUTE_COLORS[heroAttr] || '#666'
            const stats = getHeroStats(hero.id)

            return (
              <div key={hero.id} className="hero-card">
                <div className="hero-card-icon" style={{ '--attr-color': attrColor }}>
                  {heroName.charAt(0)}
                </div>
                <div className="hero-card-info">
                  <span className="hero-card-name">{heroName}</span>
                  <span className="hero-card-attr" style={{ color: attrColor }}>
                    {ATTRIBUTE_NAMES[heroAttr] || heroAttr}
                  </span>
                </div>
                {stats.games > 0 && (
                  <div className="hero-card-stats">
                    <span
                      className="hero-winrate"
                      style={{ color: parseFloat(stats.winRate) >= 50 ? '#4caf50' : '#f44336' }}
                    >
                      {stats.winRate}%
                    </span>
                    <span className="hero-games">{stats.games}场</span>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}