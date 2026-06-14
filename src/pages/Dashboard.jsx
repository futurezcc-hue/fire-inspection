import { getHistory, getPendingDay } from '../utils/history'

const CATEGORIES = ['门店照', '灭火器照', '烟雾感应器照', '应急灯安全出口灯照', '现场照片', '隐患照']

function getAllInspections() {
  const history = getHistory()
  const all = []
  history.forEach((entry) => {
    ;(entry.inspections || []).forEach((ins) => {
      all.push({ ...ins, folderName: entry.folderName })
    })
  })
  return all
}

function getTodayInspections() {
  const today = new Date().toISOString().slice(0, 10)
  const pending = getPendingDay()
  const pendingList = pending?.inspections ? Object.values(pending.inspections) : []
  const history = getHistory()
  const todayHistory = history.find((e) => e.folderName === today)
  const historyList = todayHistory?.inspections || []
  // 合并去重
  const merged = [...historyList]
  pendingList.forEach((ins) => {
    if (!merged.find((m) => m.docName === ins.docName)) {
      merged.push(ins)
    }
  })
  return merged
}

function countPhotos(inspections) {
  let total = 0
  const byCat = {}
  CATEGORIES.forEach((c) => { byCat[c] = 0 })
  inspections.forEach((ins) => {
    if (ins.photos) {
      Object.entries(ins.photos).forEach(([cat, arr]) => {
        const n = arr?.length || 0
        total += n
        if (byCat[cat] !== undefined) byCat[cat] += n
      })
    }
  })
  return { total, byCat }
}

export default function Dashboard() {
  const todayList = getTodayInspections()
  const allList = getAllInspections()
  const todayStats = countPhotos(todayList)
  const allStats = countPhotos(allList)
  const todayDone = todayList.filter((ins) => ins.completed).length
  const allDone = allList.filter((ins) => ins.completed).length
  const maxCat = Math.max(1, ...Object.values(allStats.byCat))

  // 最近巡查（按历史顺序取最新 5 条）
  const recent = [...allList].reverse().slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-800 text-white px-4 py-3 safe-top">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="logo" className="w-7 h-7 rounded-md object-cover" />
          <div>
            <h1 className="text-base font-bold leading-tight">数据看板</h1>
            <p className="text-xs text-slate-300">巡查统计</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-5">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl bg-white border border-gray-100 px-4 py-3.5">
            <p className="text-xs text-gray-400 mb-1">今日巡查</p>
            <p className="text-2xl font-bold text-gray-800">{todayList.length}<span className="text-sm text-gray-400 font-normal"> 家</span></p>
          </div>
          <div className="rounded-xl bg-white border border-gray-100 px-4 py-3.5">
            <p className="text-xs text-gray-400 mb-1">累计巡查</p>
            <p className="text-2xl font-bold text-gray-800">{allList.length}<span className="text-sm text-gray-400 font-normal"> 家</span></p>
          </div>
          <div className="rounded-xl bg-white border border-gray-100 px-4 py-3.5">
            <p className="text-xs text-gray-400 mb-1">今日完成</p>
            <p className="text-2xl font-bold text-green-600">{todayDone}<span className="text-sm text-gray-400 font-normal"> / {todayList.length}</span></p>
          </div>
          <div className="rounded-xl bg-white border border-gray-100 px-4 py-3.5">
            <p className="text-xs text-gray-400 mb-1">照片总数</p>
            <p className="text-2xl font-bold text-gray-800">{allStats.total}<span className="text-sm text-gray-400 font-normal"> 张</span></p>
          </div>
        </div>

        {/* 分类统计 */}
        <h2 className="text-base font-semibold text-gray-700 mb-3">分类统计</h2>
        <div className="rounded-xl bg-white border border-gray-100 px-4 py-3.5 mb-5">
          <div className="space-y-3">
            {CATEGORIES.map((cat) => {
              const n = allStats.byCat[cat] || 0
              const w = Math.max(4, Math.round((n / maxCat) * 100))
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16 shrink-0">{cat}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-400 rounded-full transition-all"
                      style={{ width: `${w}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-6 text-right">{n}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 最近巡查 */}
        <h2 className="text-base font-semibold text-gray-700 mb-3">最近巡查</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">暂无巡查记录</p>
        ) : (
          <div className="space-y-3">
            {recent.map((ins, i) => (
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
