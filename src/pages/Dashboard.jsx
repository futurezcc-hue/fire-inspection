import { useState } from 'react'
import { getGrids, getShopsByGrid, getHazardStats, getHazardTypes } from '../data/shops'
import { getCurrentQuarter, getQuarterLabel } from '../utils/time'
import DonutChart from '../components/DonutChart'

function getQuarterStats(quarter) {
  const shopList = []
  getGrids().forEach((g) => {
    getShopsByGrid(g.id).forEach((s) => {
      if (s.quarter === quarter) shopList.push(s)
    })
  })
  const newCount = shopList.filter((s) => s.isNew).length
  const closedCount = shopList.filter((s) => s.closed).length
  const completedCount = shopList.filter((s) => s.completed).length

  const byHazard = {}
  getHazardTypes().forEach((h) => { byHazard[h] = 0 })
  shopList.forEach((s) => {
    ;(s.hazards || []).forEach((h) => {
      if (byHazard[h] !== undefined) byHazard[h]++
    })
  })
  const hazardTotal = Object.values(byHazard).reduce((s, n) => s + n, 0)

  return { newCount, closedCount, completedCount, shopCount: shopList.length, hazardTotal, byHazard }
}

function getTableStats() {
  const grids = getGrids()
  const shopList = []
  grids.forEach((g) => {
    const shops = getShopsByGrid(g.id)
    shops.forEach((s) => shopList.push(s))
  })

  const byIndustry = {}
  shopList.forEach((s) => {
    byIndustry[s.industry] = (byIndustry[s.industry] || 0) + 1
  })

  const newCount = shopList.filter((s) => s.isNew).length
  const closedCount = shopList.filter((s) => s.closed).length
  const completedCount = shopList.filter((s) => s.completed).length

  return {
    grids,
    shopCount: shopList.length,
    shopList,
    byIndustry,
    byHazard: getHazardStats(),
    newCount,
    closedCount,
    hazardTotal: Object.values(getHazardStats()).reduce((s, n) => s + n, 0),
    completedCount,
  }
}

export default function Dashboard() {
  const [quarter, setQuarter] = useState(getCurrentQuarter())
  const [page, setPage] = useState('overview')
  const [selectedGrid, setSelectedGrid] = useState(null)
  const [selectedShop, setSelectedShop] = useState(null)
  const table = getTableStats()
  const qStats = getQuarterStats(quarter)

  // 子页面：总台账（网格列表）
  if (page === 'ledger') {
    const allGrids = table.grids.map((g) => ({
      ...g,
      shops: getShopsByGrid(g.id),
    }))
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-slate-800 text-white px-4 py-3 safe-top">
          <div className="flex items-center gap-3">
            <button onClick={() => { setPage('overview'); window.scrollTo(0, 0) }} className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center text-sm active:scale-90 transition-transform">←</button>
            <div>
              <h1 className="text-base font-bold leading-tight">总台账</h1>
              <p className="text-xs text-slate-300">全部 {table.shopCount} 家店铺</p>
            </div>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-5">
          <div className="space-y-2">
            {allGrids.map((grid) => (
              <button
                key={grid.id}
                onClick={() => { setSelectedGrid(grid); setPage('ledger-detail'); window.scrollTo(0, 0) }}
                className="w-full text-left rounded-xl bg-white border border-gray-100 px-4 py-3.5 hover:border-slate-300 hover:shadow-sm active:scale-[0.98] transition-all duration-150"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{grid.name}</p>
                    <p className="text-xs text-gray-400">{grid.shops.length} 家店铺</p>
                  </div>
                  <span className="text-slate-400 text-sm">›</span>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (page === 'ledger-detail' && selectedGrid) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-slate-800 text-white px-4 py-3 safe-top">
          <div className="flex items-center gap-3">
            <button onClick={() => { setPage('ledger'); window.scrollTo(0, 0) }} className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center text-sm active:scale-90 transition-transform">←</button>
            <div>
              <h1 className="text-base font-bold leading-tight">{selectedGrid.name}</h1>
              <p className="text-xs text-slate-300">{selectedGrid.shops.length} 家店铺</p>
            </div>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-5">
          <div className="space-y-2">
            {(selectedGrid.shops || []).map((shop) => (
              <button
                key={shop.id}
                onClick={() => setSelectedShop(shop)}
                className="w-full text-left rounded-xl bg-white border border-gray-100 px-4 py-3.5 flex items-center justify-between hover:border-slate-300 active:scale-[0.98] transition-all duration-150"
              >
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{shop.name}</p>
                  <p className="text-xs text-gray-400 truncate">{shop.address}</p>
                </div>
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 shrink-0 ml-2">{shop.industry}</span>
              </button>
            ))}
          </div>

          {/* 店铺信息弹窗 */}
          {selectedShop && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4" onClick={() => setSelectedShop(null)}>
              <div className="bg-white rounded-2xl w-full max-w-md px-5 py-5" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">{selectedShop.name}</h3>
                  <button onClick={() => setSelectedShop(null)} className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-sm">✕</button>
                </div>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">地址</span>
                    <span className="text-gray-700">{selectedShop.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">行业</span>
                    <span className="text-gray-700">{selectedShop.industry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">老板</span>
                    <span className="text-gray-700">{selectedShop.ownerName || '暂无'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">老板电话</span>
                    {selectedShop.ownerPhone ? (
                      <a href={`tel:${selectedShop.ownerPhone}`} className="text-blue-500 underline">{selectedShop.ownerPhone}</a>
                    ) : <span className="text-gray-400">暂无</span>}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">房东</span>
                    <span className="text-gray-700">{selectedShop.landlordName || '暂无'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">房东电话</span>
                    {selectedShop.landlordPhone ? (
                      <a href={`tel:${selectedShop.landlordPhone}`} className="text-blue-500 underline">{selectedShop.landlordPhone}</a>
                    ) : <span className="text-gray-400">暂无</span>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    )
  }

  // ====== 看板概览 ======
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-800 text-white px-4 py-3 safe-top">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="logo" className="w-7 h-7 rounded-md object-cover" />
          <div>
            <h1 className="text-base font-bold leading-tight">数据看板</h1>
            <p className="text-xs text-slate-300">后台表格 + OpenClaw 实时数据</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-5">

        {/* ── 基础数据（来自后台表格）── */}
        <h2 className="text-base font-semibold text-gray-700 mb-3">基础数据 · 后台表格</h2>
        <button
          onClick={() => { setPage('ledger'); window.scrollTo(0, 0) }}
          className="w-full text-left rounded-xl bg-white border border-gray-100 px-4 py-3.5 mb-2 hover:border-slate-300 hover:shadow-sm active:scale-[0.98] transition-all duration-150"
        >
          <p className="text-xs text-gray-400 mb-1">店铺总数</p>
          <p className="text-2xl font-bold text-gray-800">{table.shopCount}<span className="text-sm text-gray-400 font-normal"> 家</span></p>
        </button>

        <div className="rounded-xl bg-white border border-gray-100 px-4 py-3.5 mb-5">
          <p className="text-xs text-gray-400 mb-3">行业分类</p>
          <DonutChart data={table.byIndustry} />
        </div>

        {/* ── 巡查数据（本季度汇总）── */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-700">巡查数据</h2>
          <select
            value={quarter}
            onChange={(e) => setQuarter(Number(e.target.value))}
            className="text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-2 py-1"
          >
            {[1, 2, 3, 4].map((q) => (
              <option key={q} value={q}>{getQuarterLabel(q)}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl bg-white border border-gray-100 px-4 py-3.5">
            <p className="text-xs text-gray-400 mb-1">巡查进度</p>
            <p className="text-2xl font-bold text-gray-800">{qStats.completedCount}<span className="text-sm text-gray-400 font-normal"> / {qStats.shopCount}</span></p>
            <p className="text-xs text-gray-400 mt-0.5">
              完成 {qStats.shopCount > 0 ? Math.round((qStats.completedCount / qStats.shopCount) * 100) : 0}%
            </p>
          </div>
          <div className="rounded-xl bg-white border border-gray-100 px-4 py-3.5">
            <p className="text-xs text-gray-400 mb-1">新增店铺</p>
            <p className="text-2xl font-bold text-blue-500">{qStats.newCount}<span className="text-sm text-gray-400 font-normal"> 家</span></p>
          </div>
          <div className="rounded-xl bg-white border border-gray-100 px-4 py-3.5">
            <p className="text-xs text-gray-400 mb-1">未开门</p>
            <p className="text-2xl font-bold text-orange-500">{qStats.closedCount}<span className="text-sm text-gray-400 font-normal"> 家</span></p>
          </div>
          <div className="rounded-xl bg-white border border-gray-100 px-4 py-3.5">
            <p className="text-xs text-gray-400 mb-1">隐患总数</p>
            <p className="text-2xl font-bold text-red-500">{qStats.hazardTotal}<span className="text-sm text-gray-400 font-normal"> 处</span></p>
          </div>
        </div>

        {/* 本季隐患（按季度筛选） */}
        <h2 className="text-base font-semibold text-gray-700 mb-3">本季隐患</h2>
        <div className="rounded-xl bg-white border border-gray-100 px-4 py-3.5 mb-5">
          <p className="text-xs text-gray-400 mb-2">隐患分类统计 · {getQuarterLabel(quarter)}</p>
          <div className="space-y-2.5">
            {(() => {
              const max = Math.max(1, ...Object.values(qStats.byHazard))
              return getHazardTypes().map((hazard) => {
                const n = qStats.byHazard[hazard] || 0
                const w = Math.max(4, Math.round((n / max) * 100))
                return (
                  <div key={hazard} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-16 shrink-0">{hazard}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: `${w}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{n} 处</span>
                  </div>
                )
              })
            })()}
          </div>
        </div>
      </main>
    </div>
  )
}
