import { useState } from 'react'
import { getHistory } from '../utils/history'
import { getGrids, getShopsByGrid } from '../data/shops'
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
    byIndustry,
  }
}

// ============================================================
//  数据源② 巡查记录（手机拍照 → OpenClaw 整理 → 看板读取）
// ============================================================
function getInspectionStats(quarter) {
  const history = getHistory()
  const months = getQuarterMonths(quarter)
  const all = []
  history.forEach((entry) => {
    // 按季度筛选：文件夹名格式为 YYYY-MM-DD
    const m = parseInt(entry.folderName?.split('-')[1]) || 0
    if (!months.includes(m)) return
    ;(entry.inspections || []).forEach((ins) => {
      all.push({ ...ins, folderName: entry.folderName })
    })
  })

  // 照片总数 + 分类统计
  const categories = ['门店照', '灭火器照', '烟雾感应器照', '应急灯安全出口灯照', '现场照片', '隐患照']
  const byCat = {}
  categories.forEach((c) => { byCat[c] = 0 })
  let photoTotal = 0

  all.forEach((ins) => {
    if (ins.photos) {
      Object.entries(ins.photos).forEach(([cat, arr]) => {
        const n = arr?.length || 0
        photoTotal += n
        if (byCat[cat] !== undefined) byCat[cat] += n
      })
    }
  })

  const completed = all.filter((ins) => ins.completed).length
  const recent = [...all].reverse().slice(0, 5)

  return { total: all.length, completed, photoTotal, byCat, recent, maxCat: Math.max(1, ...Object.values(byCat)) }
}

// ============================================================
//  看板页面
// ============================================================
export default function Dashboard() {
  const [quarter, setQuarter] = useState(getCurrentQuarter())
  const table = getTableStats()
  const inspect = getInspectionStats(quarter)

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
          <div className="rounded-xl bg-white border border-gray-100 px-4 py-3.5">
            <p className="text-xs text-gray-400 mb-1">累计巡查</p>
            <p className="text-2xl font-bold text-gray-800">{inspect.total}<span className="text-sm text-gray-400 font-normal"> 家</span></p>
          </div>
          <div className="rounded-xl bg-white border border-gray-100 px-4 py-3.5">
            <p className="text-xs text-gray-400 mb-1">累计完成</p>
            <p className="text-2xl font-bold text-green-600">{inspect.completed}<span className="text-sm text-gray-400 font-normal"> / {inspect.total}</span></p>
          </div>
          <div className="rounded-xl bg-white border border-gray-100 px-4 py-3.5">
            <p className="text-xs text-gray-400 mb-1">照片总数</p>
            <p className="text-2xl font-bold text-gray-800">{inspect.photoTotal}<span className="text-sm text-gray-400 font-normal"> 张</span></p>
          </div>
          <div className="rounded-xl bg-white border border-gray-100 px-4 py-3.5">
            <p className="text-xs text-gray-400 mb-1">完成率</p>
            <p className="text-2xl font-bold text-gray-800">
              {table.shopCount > 0 ? Math.round((inspect.completed / table.shopCount) * 100) : 0}
              <span className="text-sm text-gray-400 font-normal">%</span>
            </p>
          </div>
        </div>

        <h2 className="text-base font-semibold text-gray-700 mb-3">照片分类</h2>
        <div className="rounded-xl bg-white border border-gray-100 px-4 py-3.5 mb-5">
          <div className="space-y-2.5">
            {Object.entries(inspect.byCat).map(([cat, n]) => {
              const w = Math.max(4, Math.round((n / inspect.maxCat) * 100))
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16 shrink-0">{cat}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: `${w}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-6 text-right">{n}</span>
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
