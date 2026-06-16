import { useState } from 'react'
import { getHistory } from '../utils/history'
import { getGrids, getShopsByGrid, getHazardStats, getHazardTypes } from '../data/shops'
import { getCurrentQuarter, getQuarterMonths, getQuarterLabel, getTodayStr } from '../utils/time'
import DonutChart from '../components/DonutChart'

// ============================================================
//  数据源① 后台表格（管理员上传 Excel → OpenClaw 导入）
// ============================================================
function getTableStats() {
  const grids = getGrids()
  const shopList = []
  grids.forEach((g) => {
    const shops = getShopsByGrid(g.id)
    shops.forEach((s) => shopList.push(s))
  })

  // 行业分类统计
  const byIndustry = {}
  shopList.forEach((s) => {
    byIndustry[s.industry] = (byIndustry[s.industry] || 0) + 1
  })

  return {
    gridCount: grids.length,
    shopCount: shopList.length,
    shopList,
    byIndustry,
    byHazard: getHazardStats(),
  }
}

// ============================================================
//  数据源② 巡查记录（手机拍照 → OpenClaw 整理 → 看板读取）
// ============================================================
function getQuarterClosedCount(quarter) {
  const allShops = []
  const grids = getGrids()
  grids.forEach((g) => {
    getShopsByGrid(g.id).forEach((s) => allShops.push(s))
  })
  const history = getHistory()
  const months = getQuarterMonths(quarter)
  const inspectedShops = new Set()
  history.forEach((entry) => {
    const m = parseInt(entry.folderName?.split('-')[1]) || 0
    if (!months.includes(m)) return
    ;(entry.inspections || []).forEach((ins) => {
      if (ins.completed) inspectedShops.add(ins.shopName)
    })
  })
  return allShops.filter((s) => inspectedShops.has(s.name) && s.closed).length
}

function getQuarterHazardCount(quarter) {
  const allShops = []
  const grids = getGrids()
  grids.forEach((g) => {
    getShopsByGrid(g.id).forEach((s) => allShops.push(s))
  })

  const history = getHistory()
  const months = getQuarterMonths(quarter)
  const inspectedShops = new Set()
  history.forEach((entry) => {
    const m = parseInt(entry.folderName?.split('-')[1]) || 0
    if (!months.includes(m)) return
    ;(entry.inspections || []).forEach((ins) => {
      if (ins.completed) inspectedShops.add(ins.shopName)
    })
  })

  let hazardCount = 0
  allShops.forEach((s) => {
    if (inspectedShops.has(s.name)) {
      hazardCount += (s.hazards || []).length
    }
  })
  return hazardCount
}

function getInspectionStats(quarter) {
  const history = getHistory()
  const months = getQuarterMonths(quarter)
  const all = []
  history.forEach((entry) => {
    const m = parseInt(entry.folderName?.split('-')[1]) || 0
    if (!months.includes(m)) return
    ;(entry.inspections || []).forEach((ins) => {
      all.push({ ...ins, folderName: entry.folderName })
    })
  })

  const completed = all.filter((ins) => ins.completed).length
  const recent = [...all].reverse().slice(0, 5)
  const hazardTotal = getQuarterHazardCount(quarter)
  const prevQuarter = quarter === 1 ? 4 : quarter - 1
  const prevHazardTotal = getQuarterHazardCount(prevQuarter)
  const closedCount = getQuarterClosedCount(quarter)

  return { total: all.length, completed, hazardTotal, prevHazardTotal, closedCount, recent }
}

// ============================================================
//  看板页面
// ============================================================
export default function Dashboard() {
  const [quarter, setQuarter] = useState(getCurrentQuarter())
  const [page, setPage] = useState('overview')
  const [selectedGrid, setSelectedGrid] = useState(null)
  const table = getTableStats()
  const inspect = getInspectionStats(quarter)
  const hazardChange = inspect.prevHazardTotal > 0
    ? Math.round(((inspect.hazardTotal - inspect.prevHazardTotal) / inspect.prevHazardTotal) * 100)
    : inspect.hazardTotal > 0 ? 100 : 0

  // 子页面：巡查进度
  if (page === 'progress') {
    const months = getQuarterMonths(quarter)
    const doneShops = new Set()
    getHistory().forEach((entry) => {
      const m = parseInt(entry.folderName?.split('-')[1]) || 0
      if (!months.includes(m)) return
      ;(entry.inspections || []).forEach((ins) => {
        if (ins.completed) doneShops.add(ins.shopName)
      })
    })
    const grids = getGrids().map((g) => {
      const shops = getShopsByGrid(g.id)
      const done = shops.filter((s) => doneShops.has(s.name)).length
      return { ...g, shops: shops.map((s) => ({ ...s, isDone: doneShops.has(s.name) })), done, total: shops.length }
    })
    const totalDone = grids.reduce((s, g) => s + g.done, 0)
    const totalShops = grids.reduce((s, g) => s + g.total, 0)
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-slate-800 text-white px-4 py-3 safe-top">
          <div className="flex items-center gap-3">
            <button onClick={() => { setPage('overview'); window.scrollTo(0, 0) }} className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center text-sm active:scale-90 transition-transform">←</button>
            <div>
              <h1 className="text-base font-bold leading-tight">巡查进度</h1>
              <p className="text-xs text-slate-300">{getQuarterLabel(quarter)}</p>
            </div>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-700">本季度进度</h2>
            <select value={quarter} onChange={(e) => setQuarter(Number(e.target.value))}
              className="text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-2 py-1">
              {[1,2,3,4].map((q) => <option key={q} value={q}>{getQuarterLabel(q)}</option>)}
            </select>
          </div>
          <div className="rounded-xl bg-white border border-gray-100 px-4 py-3.5 mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-400">巡查进度</span>
              <span className="text-xs font-medium text-gray-700">{totalDone} / {totalShops}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${totalShops > 0 ? Math.round((totalDone/totalShops)*100) : 0}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            {grids.map((grid) => {
              const pct = grid.total > 0 ? Math.round((grid.done / grid.total) * 100) : 0
              return (
                <button
                  key={grid.id}
                  onClick={() => { setSelectedGrid(grid); setPage('grid-detail'); window.scrollTo(0, 0) }}
                  className="w-full text-left rounded-xl bg-white border border-gray-100 px-4 py-3.5 hover:border-slate-300 hover:shadow-sm active:scale-[0.98] transition-all duration-150"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{grid.name}</p>
                      <p className="text-xs text-gray-400">{grid.total} 家店铺</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-medium ${pct === 100 ? 'text-green-600' : 'text-gray-500'}`}>{grid.done}/{grid.total}</span>
                      <span className="text-slate-400 text-xs">›</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pct === 100 ? 'bg-green-500' : 'bg-slate-400'}`} style={{ width: `${Math.max(4, pct)}%` }} />
                  </div>
                </button>
              )
            })}
          </div>
        </main>
      </div>
    )
  }

  // 子页面：网格详情
  if (page === 'grid-detail' && selectedGrid) {
    const shops = selectedGrid.shops || []
    const sorted = [...shops].sort((a, b) => (a.isDone ? 1 : 0) - (b.isDone ? 1 : 0))
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-slate-800 text-white px-4 py-3 safe-top">
          <div className="flex items-center gap-3">
            <button onClick={() => { setPage('progress'); window.scrollTo(0, 0) }} className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center text-sm active:scale-90 transition-transform">←</button>
            <div>
              <h1 className="text-base font-bold leading-tight">{selectedGrid.name}</h1>
              <p className="text-xs text-slate-300">{selectedGrid.total} 家店铺</p>
            </div>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-5">
          <div className="space-y-2">
            {sorted.map((shop) => {
              const isDone = shop.isDone
              return (
                <div
                  key={shop.id}
                  className={`rounded-xl border-2 px-4 py-3.5 flex items-center gap-3 ${
                    isDone ? 'border-green-200 bg-green-50/30' : 'border-gray-100 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 ${
                    isDone ? 'bg-green-500 text-white' : 'bg-gray-100'
                  }`}>
                    {isDone ? '✓' : '🏪'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800 text-sm truncate">{shop.name}</p>
                    <p className="text-xs text-gray-400 truncate">{shop.address}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                    isDone ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isDone ? '已完成' : '未巡查'}
                  </span>
                </div>
              )
            })}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-800 text-white px-4 py-3 safe-top">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="logo" className="w-7 h-7 rounded-md object-cover" />
          <div>
            <h1 className="text-base font-bold leading-tight">数据看板</h1>
            <p className="text-xs text-slate-300">后台表格 + 巡查记录</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-5">

        {/* ── 基础数据（来自后台表格）── */}
        <h2 className="text-base font-semibold text-gray-700 mb-3">基础数据 · 后台表格</h2>
        <div className="rounded-xl bg-white border border-gray-100 px-4 py-3.5 mb-2">
          <p className="text-xs text-gray-400 mb-1">店铺总数</p>
          <p className="text-2xl font-bold text-gray-800">{table.shopCount}<span className="text-sm text-gray-400 font-normal"> 家</span></p>
        </div>

        <div className="rounded-xl bg-white border border-gray-100 px-4 py-3.5 mb-5">
          <p className="text-xs text-gray-400 mb-3">行业分类</p>
          <DonutChart data={table.byIndustry} />
        </div>

        {/* ── 巡查数据（来自巡查记录）── */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-700">巡查数据 · 巡查记录</h2>
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
          <button
            onClick={() => { setPage('progress'); window.scrollTo(0, 0) }}
            className="w-full text-left rounded-xl bg-white border border-gray-100 px-4 py-3.5 hover:border-slate-300 hover:shadow-sm active:scale-[0.98] transition-all duration-150"
          >
            <p className="text-xs text-gray-400 mb-1">巡查进度</p>
            <p className="text-2xl font-bold text-gray-800">{inspect.completed}<span className="text-sm text-gray-400 font-normal"> / {inspect.total}</span></p>
          </button>
          <div className="rounded-xl bg-white border border-gray-100 px-4 py-3.5">
            <p className="text-xs text-gray-400 mb-1">新增店铺</p>
            <p className="text-2xl font-bold text-blue-500">{table.shopList?.filter((s) => s.isNew).length || 0}<span className="text-sm text-gray-400 font-normal"> 家</span></p>
          </div>
          <div className="rounded-xl bg-white border border-gray-100 px-4 py-3.5">
            <p className="text-xs text-gray-400 mb-1">隐患率</p>
            <p className={`text-2xl font-bold ${hazardChange > 0 ? 'text-red-500' : hazardChange < 0 ? 'text-green-500' : 'text-gray-400'}`}>
              {hazardChange > 0 ? '+' : ''}{hazardChange}%
            </p>
            <p className="text-xs text-gray-400 mt-0.5">同比上季度</p>
          </div>
          <div className="rounded-xl bg-white border border-gray-100 px-4 py-3.5">
            <p className="text-xs text-gray-400 mb-1">未开门</p>
            <p className="text-2xl font-bold text-orange-500">{inspect.closedCount}<span className="text-sm text-gray-400 font-normal"> 家</span></p>
          </div>
        </div>

        {/* 本季隐患（来自后台表格） */}
        <h2 className="text-base font-semibold text-gray-700 mb-3">本季隐患</h2>
        <div className="rounded-xl bg-white border border-gray-100 px-4 py-3.5 mb-5">
          <p className="text-xs text-gray-400 mb-2">隐患分类统计（全量店铺）</p>
          <div className="space-y-2.5">
            {getHazardTypes().map((hazard) => {
              const n = table.byHazard[hazard] || 0
              const max = Math.max(1, ...Object.values(table.byHazard))
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
            })}
          </div>
        </div>

        <h2 className="text-base font-semibold text-gray-700 mb-3">最近巡查</h2>
        {inspect.recent.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">暂无巡查记录</p>
        ) : (
          <div className="space-y-3">
            {inspect.recent.map((ins, i) => (
              <div
                key={i}
                className={`rounded-xl border-2 px-4 py-3.5 flex items-center gap-3 ${
                  ins.completed ? 'border-green-200 bg-green-50/30' : 'border-gray-100 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 ${
                  ins.completed ? 'bg-green-500 text-white' : 'bg-slate-100'
                }`}>
                  {ins.completed ? '✓' : '◷'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-800 text-sm truncate">{ins.shopName}</p>
                  <p className="text-xs text-gray-400 truncate">{ins.folderName} · {ins.shopAddress}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
