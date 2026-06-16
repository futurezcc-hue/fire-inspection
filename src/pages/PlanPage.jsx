import { useState } from 'react'
import { getGrids, getShopsByGrid } from '../data/shops'
import { getHistory } from '../utils/history'
import { getTodayPlan, saveTodayPlan } from '../utils/history'
import { getCurrentQuarter, getQuarterLabel, getQuarterMonths, getTodayStr } from '../utils/time'

function getQuarterProgress(quarter) {
  const months = getQuarterMonths(quarter)
  const history = getHistory()

  const doneShops = new Set()
  history.forEach((entry) => {
    const m = parseInt(entry.folderName?.split('-')[1]) || 0
    if (!months.includes(m)) return
    ;(entry.inspections || []).forEach((ins) => {
      if (ins.completed) doneShops.add(ins.shopName)
    })
  })

  return getGrids().map((g) => {
    const shops = getShopsByGrid(g.id)
    const done = shops.filter((s) => doneShops.has(s.name)).length
    return { ...g, shops, done, total: shops.length }
  })
}

export default function PlanPage({ onStartInspect }) {
  const [quarter, setQuarter] = useState(getCurrentQuarter())
  const [checked, setChecked] = useState({})
  const [viewGrid, setViewGrid] = useState(null)
  const [addGrid, setAddGrid] = useState(null)
  const [page, setPage] = useState('overview')

  const today = getTodayStr()
  const [plan, setPlan] = useState(() => getTodayPlan(today))
  const grids = getQuarterProgress(quarter)

  // 已完成店铺名集合
  const doneShops = new Set()
  const months = getQuarterMonths(quarter)
  getHistory().forEach((entry) => {
    const m = parseInt(entry.folderName?.split('-')[1]) || 0
    if (!months.includes(m)) return
    ;(entry.inspections || []).forEach((ins) => {
      if (ins.completed) doneShops.add(ins.shopName)
    })
  })

  function navigate(gridId) {
    setViewGrid(gridId)
    setPage('detail')
    window.scrollTo(0, 0)
  }

  function toggleShop(gridId, shop) {
    setChecked((prev) => {
      const key = `${gridId}-${shop.name}`
      const next = { ...prev }
      if (next[key]) {
        delete next[key]
      } else {
        next[key] = { gridId, gridName: grids.find((g) => g.id === gridId).name, shopName: shop.name, shopAddress: shop.address }
      }
      return next
    })
  }

  function handleStartPlan() {
    if (plan.length > 0) {
      onStartInspect(plan)
    }
  }

  const plannedShopNames = new Set(plan.map((p) => p.shopName))

  // 网格详情页
  if (page === 'detail' && viewGrid) {
    const g = grids.find((g) => g.id === viewGrid)
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-slate-800 text-white px-4 py-3 safe-top">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="logo" className="w-7 h-7 rounded-md object-cover" />
            <button onClick={() => { setPage('overview'); window.scrollTo(0, 0) }} className="flex items-center gap-1.5 text-sm active:scale-95 transition-transform">
              ←
            </button>
            <div>
              <h1 className="text-base font-bold leading-tight">{g?.name}</h1>
              <p className="text-xs text-slate-300">{g?.total} 家店铺</p>
            </div>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-5">
          <div className="space-y-2">
            {(g ? getShopsByGrid(g.id) : []).map((shop) => {
              const isDone = doneShops.has(shop.name)
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

  // 添加计划页面
  if (page === 'add') {
    if (!addGrid) {
      // 第一步：选择网格
      return (
        <div className="min-h-screen bg-gray-50">
          <header className="bg-slate-800 text-white px-4 py-3 safe-top">
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="logo" className="w-7 h-7 rounded-md object-cover" />
              <button onClick={() => { setPage('overview'); window.scrollTo(0, 0) }} className="text-sm active:scale-95 transition-transform">←</button>
              <div>
                <h1 className="text-base font-bold leading-tight">选择网格</h1>
                <p className="text-xs text-slate-300">添加今日计划</p>
              </div>
            </div>
          </header>
          <main className="max-w-md mx-auto px-4 py-5">
            <h2 className="text-base font-semibold text-gray-700 mb-3">请选择网格区域</h2>
            <div className="space-y-2">
              {grids.map((grid) => {
                const pct = grid.total > 0 ? Math.round((grid.done / grid.total) * 100) : 0
                return (
                  <button
                    key={grid.id}
                    onClick={() => { setAddGrid(grid.id); window.scrollTo(0, 0) }}
                    className="w-full text-left rounded-xl bg-white border border-gray-100 px-4 py-3.5 hover:border-slate-300 hover:shadow-sm active:scale-[0.98] transition-all duration-150"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{grid.name}</p>
                        <p className="text-xs text-gray-400">{grid.total} 家店铺</p>
                      </div>
                      <span className={`text-xs font-medium ${pct === 100 ? 'text-green-600' : 'text-gray-500'}`}>
                        {grid.done}/{grid.total}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${pct === 100 ? 'bg-green-500' : 'bg-slate-400'}`}
                        style={{ width: `${Math.max(4, pct)}%` }} />
                    </div>
                  </button>
                )
              })}
            </div>
          </main>
        </div>
      )
    }
    // 第二步：选择店铺
    const g = grids.find((g) => g.id === addGrid)
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-slate-800 text-white px-4 py-3 safe-top">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="logo" className="w-7 h-7 rounded-md object-cover" />
            <button onClick={() => { setAddGrid(null); window.scrollTo(0, 0) }} className="text-sm active:scale-95 transition-transform">←</button>
            <div>
              <h1 className="text-base font-bold leading-tight">{g?.name}</h1>
              <p className="text-xs text-slate-300">勾选店铺加入今日计划</p>
            </div>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-5">
          <div className="space-y-2 mb-5">
            {(g ? getShopsByGrid(g.id) : []).map((shop) => {
              const isDone = doneShops.has(shop.name)
              const key = `${addGrid}-${shop.name}`
              const isPlanned = plannedShopNames.has(shop.name)
              const isChecked = !!checked[key]
              return (
                <button
                  key={shop.id}
                  onClick={() => !isPlanned && toggleShop(addGrid, shop)}
                  className={`w-full text-left rounded-xl border-2 px-4 py-3.5 flex items-center gap-3 transition-all active:scale-[0.98] ${
                    isPlanned ? 'border-green-200 bg-green-50/30' :
                    isChecked ? 'border-slate-400 bg-slate-50' :
                    'border-gray-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 ${
                    isDone ? 'bg-green-500 text-white' : isChecked ? 'bg-slate-700 text-white' : 'bg-gray-100'
                  }`}>
                    {isDone ? '✓' : isChecked ? '✓' : '🏪'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800 text-sm truncate">{shop.name}</p>
                    <p className="text-xs text-gray-400 truncate">{shop.address}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                    isDone ? 'bg-green-100 text-green-600' :
                    isPlanned ? 'bg-green-100 text-green-600' :
                    isChecked ? 'bg-slate-100 text-slate-700' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isDone ? '已完成' : isPlanned ? '已计划' : isChecked ? '已选中' : '未巡查'}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setAddGrid(null); setChecked({}); setPage('overview') }}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-500 bg-gray-100 active:scale-95"
            >
              取消
            </button>
            <button
              onClick={() => {
                const newShops = Object.values(checked)
                const merged = [...plan]
                newShops.forEach((s) => {
                  if (!merged.find((m) => m.shopName === s.shopName)) merged.push(s)
                })
                setPlan(merged)
                saveTodayPlan(today, merged)
                setChecked({})
                setAddGrid(null)
                setPage('overview')
              }}
              disabled={Object.keys(checked).length === 0}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium text-white active:scale-95 transition-colors ${
                Object.keys(checked).length > 0 ? 'bg-slate-700' : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              确认添加 ({Object.keys(checked).length})
            </button>
          </div>
        </main>
      </div>
    )
  }

  // 概览页
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-800 text-white px-4 py-3 safe-top">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="logo" className="w-7 h-7 rounded-md object-cover" />
          <div>
            <h1 className="text-base font-bold leading-tight">计划</h1>
            <p className="text-xs text-slate-300">巡查计划管理</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-5">
        {/* 今日计划 */}
        <h2 className="text-base font-semibold text-gray-700 mb-3">今日计划</h2>
        { plan.length > 0 && (
          <div className="space-y-2 mb-5">
            {plan.map((p, i) => (
              <div key={i} className="rounded-xl bg-white border border-gray-100 px-4 py-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-lg shrink-0">🏪</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.shopName}</p>
                  <p className="text-xs text-gray-400 truncate">{p.gridName} · {p.shopAddress}</p>
                </div>
              </div>
            ))}
            <button
              onClick={handleStartPlan}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-base bg-slate-700 hover:bg-slate-600 active:scale-[0.96] transition-all duration-150 shadow-lg shadow-slate-200"
            >
              <span className="tracking-widest">开始今日巡查</span>
            </button>
          </div>
        )}
        { plan.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4 mb-5">暂无今日计划</p>
        )}

        {/* 添加今日计划按钮 */}
        <button
          onClick={() => { setPage('add'); setAddGrid(null); setChecked({}); window.scrollTo(0, 0) }}
          className="w-full py-3.5 rounded-xl text-slate-700 font-semibold text-base border-2 border-dashed border-gray-300 hover:border-slate-400 bg-white active:scale-[0.96] transition-all duration-150"
        >
          + 添加今日计划
        </button>
      </main>
    </div>
  )
}
