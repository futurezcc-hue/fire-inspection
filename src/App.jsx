import { useState } from 'react'
import { getGrids, getShopsByGrid } from './data/shops'
import { saveHistory, getFolder } from './utils/history'
import Landing from './pages/Landing'
import ShopList from './pages/ShopList'
import ShootPage from './pages/ShootPage'
import HistoryDetail from './pages/HistoryDetail'

function shopHasPhotos(shopName, completedMap) {
  return completedMap[shopName] || false
}

function getGridProgress(grid, completedMap) {
  const shops = grid.shops || []
  const done = shops.filter((s) => completedMap[s.name]).length
  return { done, total: shops.length }
}

function HomePage({ grids, onSelectGrid, onGoHome, completedMap }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-slate-800 text-white px-5 py-4 safe-top">
        <div className="flex items-center gap-3">
          <button onClick={onGoHome} className="shrink-0 active:scale-90 transition-transform">
            <img src="/logo.jpg" alt="logo" className="w-9 h-9 rounded-lg object-cover" />
          </button>
          <div>
            <h1 className="text-lg font-bold leading-tight">消防巡查</h1>
            <p className="text-xs text-slate-300">三小场所照片采集</p>
          </div>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="max-w-md mx-auto px-4 py-6">
        {/* 步骤提示 */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-white text-xs font-bold">1</span>
            <span className="text-sm font-medium text-gray-800">选择网格</span>
          </div>
          <div className="flex-1 h-px bg-gray-200" />
          <div className="flex items-center gap-1.5 opacity-40">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-300 text-white text-xs font-bold">2</span>
            <span className="text-sm text-gray-400">选择店铺</span>
          </div>
          <div className="flex-1 h-px bg-gray-200" />
          <div className="flex items-center gap-1.5 opacity-40">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-300 text-white text-xs font-bold">3</span>
            <span className="text-sm text-gray-400">拍摄</span>
          </div>
        </div>

        {/* 网格列表 */}
        <h2 className="text-base font-semibold text-gray-700 mb-3">请选择网格区域</h2>

        <div className="space-y-3">
          {grids.map((grid) => {
            const { done, total } = getGridProgress(grid, completedMap)
            const pct = total > 0 ? Math.round((done / total) * 100) : 0

            return (
              <button
                key={grid.id}
                onClick={() => onSelectGrid(grid.id)}
                className="w-full text-left px-5 py-4 rounded-xl border-2 border-gray-100 bg-white hover:border-slate-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 active:scale-[0.96] active:bg-slate-50 active:shadow-none"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-gray-100">
                      📍
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{grid.name}</p>
                      <p className="text-sm text-gray-400">{grid.shopCount} 家三小场所</p>
                    </div>
                  </div>
                  <span className="text-slate-400 text-sm">→</span>
                </div>
                {/* 进度条 */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        pct === 100 ? 'bg-green-500' : 'bg-slate-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    pct === 100 ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {done}/{total}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState('landing')
  const [rootFolder, setRootFolder] = useState('')
  const [selectedGrid, setSelectedGrid] = useState(null)
  const [document, setDocument] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  function handleStart(folderName) {
    setRootFolder(folderName)
    saveHistory({ folderName, inspections: [] })
    setPage('home')
  }

  function handleSelectShop(doc) {
    const folder = getFolder(rootFolder)
    const existing = folder?.inspections?.find((ins) => ins.docName === doc.docName)
    const mergedDoc = existing ? { ...doc, photos: existing.photos } : doc
    setDocument(mergedDoc)
    saveHistory({ folderName: rootFolder, inspections: [mergedDoc] })
    setPage('shoot')
  }

  function handleUpdateDocument(updatedDoc) {
    setDocument(updatedDoc)
    saveHistory({ folderName: rootFolder, inspections: [updatedDoc] })
  }

  function handleOpenHistory(folderName) {
    setRootFolder(folderName)
    setPage('history')
  }

  // 计算完成状态（refreshKey 强制刷新）
  const _rk = refreshKey
  const folder = getFolder(rootFolder)
  const completedMap = {}
  if (folder?.inspections) {
    folder.inspections.forEach((ins) => {
      const hasPhotos = Object.values(ins.photos || {}).some((arr) => arr.length > 0)
      if (hasPhotos) {
        completedMap[ins.shopName] = true
      }
    })
  }

  // 带进度数据的 grids
  const grids = getGrids()
  const gridsWithShops = grids.map((g) => ({
    ...g,
    shops: getShopsByGrid(g.id),
  }))

  let content
  if (page === 'landing') {
    content = <Landing onStart={handleStart} onOpenHistory={handleOpenHistory} />
  } else if (page === 'history') {
    content = (
      <HistoryDetail
        folderName={rootFolder}
        onBack={() => setPage('landing')}
      />
    )
  } else if (page === 'shop') {
    content = (
      <ShopList
        gridId={selectedGrid}
        onBack={() => setPage('home')}
        onSelectShop={handleSelectShop}
        onGoHome={() => setPage('landing')}
        completedMap={completedMap}
      />
    )
  } else if (page === 'shoot') {
    content = (
      <ShootPage
        document={document}
        onBack={() => { setPage('shop'); setRefreshKey((k) => k + 1) }}
        onBackToGrid={() => { setPage('home'); setRefreshKey((k) => k + 1) }}
        onGoHome={() => setPage('landing')}
        onUpdateDocument={handleUpdateDocument}
      />
    )
  } else {
    content = (
      <HomePage
        grids={gridsWithShops}
        onSelectGrid={(gridId) => { setSelectedGrid(gridId); setPage('shop') }}
        onGoHome={() => setPage('landing')}
        completedMap={completedMap}
      />
    )
  }

  return content
}
