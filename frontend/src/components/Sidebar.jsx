import React from 'react'
import './Sidebar.css'

export default function Sidebar({ activeMenu, onMenuClick, collapsed, onToggle }) {
  const menuItems = [
    { key: 'overview', label: '数据概览', icon: '📊' },
    { key: 'matches', label: '比赛记录', icon: '🎮' },
    { key: 'heroes', label: '英雄', icon: '🦸' },
    { key: 'analytics', label: '数据分析', icon: '📈' },
    { key: 'settings', label: '设置', icon: '⚙️' },
  ]

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <span className="sidebar-title">导航菜单</span>}
        <button className="collapse-btn" onClick={onToggle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {collapsed ? (
              <path d="m9 18 6-6-6-6"/>
            ) : (
              <path d="m15 18-6-6 6-6"/>
            )}
          </svg>
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <a
            key={item.key}
            href="#"
            className={`sidebar-item ${activeMenu === item.key ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              onMenuClick(item.key)
            }}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-label">{item.label}</span>}
          </a>
        ))}
      </nav>
    </aside>
  )
}
