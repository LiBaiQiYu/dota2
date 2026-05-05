import React, { useState, useEffect, useRef } from 'react'
import MatchList from './MatchList'
import './MatchesPage.css'

export default function MatchesPage({ allMatches, heroes, steamId, loading }) {
  const [displayCount, setDisplayCount] = useState(10)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loaderRef = useRef(null)
  const isLoadingMoreRef = useRef(false)

  const displayedMatches = allMatches?.slice(0, displayCount) || []
  const hasMore = allMatches && displayCount < allMatches.length

  useEffect(() => {
    isLoadingMoreRef.current = isLoadingMore
  }, [isLoadingMore])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMoreRef.current) {
          setIsLoadingMore(true)
          setTimeout(() => {
            setDisplayCount((prev) => prev + 10)
            setIsLoadingMore(false)
          }, 500)
        }
      },
      { threshold: 0.1 }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore])

  if (!allMatches || allMatches.length === 0) {
    return <div className="matches-empty">暂无比赛记录</div>
  }

  return (
    <div className="matches-page">
      <div className="matches-header">
        <span className="matches-total">共 {allMatches.length} 场比赛</span>
        <span className="matches-displayed">已加载 {displayedMatches.length} 场</span>
      </div>

      <MatchList matches={displayedMatches} heroes={heroes} steamId={steamId} hideHeader />

      {hasMore && (
        <div ref={loaderRef} className="load-more">
          {isLoadingMore && (
            <>
              <div className="spinner"></div>
              <span>加载更多...</span>
            </>
          )}
        </div>
      )}

      {!hasMore && displayedMatches.length > 0 && (
        <div className="load-complete">已加载全部 {displayedMatches.length} 场比赛</div>
      )}
    </div>
  )
}