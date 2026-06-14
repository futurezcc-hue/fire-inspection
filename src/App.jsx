import { useState } from 'react'
import { getGrids } from './data/shops'
import { saveHistory, getFolder, getPendingDay, savePendingDay, clearPendingDay } from './utils/history'
import Landing from './pages/Landing'
import ShopList from './pages/ShopList'
import ShootPage from './pages/ShootPage'
import HistoryDetail from './pages/HistoryDetail'

function HomePage({ grids, onSelectGrid, onGoHome, completedCount, onFinishDay }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-800 text-white px-4 py-3 safe-top">
        <div className="flex items-center gap-3">
          <button onClick={onGoHome} className="shrink-0 active:scale-90 transition-transform">
            <img src="/logo.jpg" alt="logo" className="w-7 h-7 rounded-md object-cover" />
          </button>
          <div>
            <h1 className="text-base font-bold leading-tight">消防巡查</h1>
            <p className="text-xs text-slate-300">三小场所照片采集</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-5">
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

        <h2 className="text-base font-semibold text-gray-700 mb-3">请选择网格区域</h2>

        <div className="space-y-3">
          {grids.map((grid) => (
            <button
              key={grid.id}
              onClick={() => onSelectGrid(grid.id)}
              className="w-full text-left px-4 py-3.5 rounded-xl border-2 border-gray-100 bg-white hover:border-slate-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 active:scale-[0.96] active:bg-slate-50 active:shadow-none"
            >
              <div className="flex items-center justify-between">
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
            </button>
          ))}
        </div>

        {/* 完成今日巡查 */}
        {completedCount > 0 && (
          <div className="mt-8">
            <button
              onClick={onFinishDay}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-base bg-green-600 hover:bg-green-500 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.96] active:bg-green-700 shadow-lg shadow-green-200 transition-all duration-150"
            >
              <span className="tracking-widest">完成今日巡查</span>
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">
              已完成 {completedCount} 家店铺
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState('landing')
  const [rootFolder, setRootFolder] = useState('')
  const [selectedGrid, setSelectedGrid] = useState(null)
  const [document, setDocument] = useState(null)
  const [lastShopName, setLastShopName] = useState('')
  const [dayInspections, setDayInspections] = useState({})

  function handleStart(folderName, resumePending) {
    setRootFolder(folderName)
    if (resumePending) {
      const pending = getPendingDay()
      setDayInspections(pending?.inspections || {})
    } else {
      setDayInspections({})
      savePendingDay({ folderName, inspections: {} })
    }
    setPage('home')
    window.scrollTo(0, 0)
  }

  function handleAbandonDay() {
    clearPendingDay()
    setDayInspections({})
    setPage('landing')
  }

  function handleSelectShop(doc) {
    // 优先从今日巡查中恢复，其次从历史记录
    const existing = dayInspections[doc.docName] || (() => {
      const folder = getFolder(rootFolder)
      return folder?.inspections?.find((ins) => ins.docName === doc.docName)
    })()
    const mergedDoc = existing ? { ...doc, photos: existing.photos || {} } : doc
    setDocument(mergedDoc)
    setLastShopName(doc.shopName)
    setPage('shoot')
    window.scrollTo(0, 0)
  }

  function handleUpdateDocument(updatedDoc) {
    setDocument(updatedDoc)
  }

  function handleComplete() {
    const completedDoc = { ...document, completed: true }
    setDocument(completedDoc)
    const updated = { ...dayInspections, [completedDoc.docName]: completedDoc }
    setDayInspections(updated)
    savePendingDay({ folderName: rootFolder, inspections: updated })
    setPage('shop')
  }

  function handleFinishDay() {
    const inspections = Object.values(dayInspections)
    if (inspections.length > 0) {
      saveHistory({ folderName: rootFolder, inspections, dayCompleted: true })
    }
    clearPendingDay()
    setDayInspections({})
    setPage('landing')
  }

  function handleOpenHistory(folderName) {
    setRootFolder(folderName)
    setPage('history')
    window.scrollTo(0, 0)
  }

  function handleOpenShopFromHistory(ins) {
    setDocument(ins)
    setPage('history-shoot')
    window.scrollTo(0, 0)
  }

  // 从今日巡查中计算完成状态
  const completedMap = {}
  const pendingMap = {}
  Object.values(dayInspections).forEach((ins) => {
    const hasPhotos = Object.values(ins.photos || {}).some((arr) => arr.length > 0)
    if (ins.completed && hasPhotos) {
      completedMap[ins.shopName] = true
    } else if (hasPhotos) {
      pendingMap[ins.shopName] = true
    }
  })
  const completedCount = Object.keys(completedMap).length

  const grids = getGrids()

  let content
  if (page === 'landing') {
    content = (
      <Landing
        onStart={handleStart}
        onOpenHistory={handleOpenHistory}
        onResumePending={(folderName) => handleStart(folderName, true)}
        onAbandonDay={handleAbandonDay}
        pendingDay={getPendingDay()}
      />
    )
  } else if (page === 'history') {
    content = (
      <HistoryDetail
        folderName={rootFolder}
        onBack={() => setPage('landing')}
        onOpenShop={handleOpenShopFromHistory}
      />
    )
  } else if (page === 'history-shoot') {
    content = (
      <ShootPage
        document={document}
        onBack={() => setPage('history')}
        onBackToGrid={() => setPage('history')}
        onGoHome={() => setPage('landing')}
        onUpdateDocument={handleUpdateDocument}
        fromHistory
        readonly
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
        pendingMap={pendingMap}
        scrollToShop={lastShopName}
      />
    )
  } else if (page === 'shoot') {
    content = (
      <ShootPage
        document={document}
        onBack={() => setPage('shop')}
        onBackToGrid={() => setPage('home')}
        onGoHome={() => setPage('landing')}
        onUpdateDocument={handleUpdateDocument}
        onComplete={handleComplete}
      />
    )
  } else {
    content = (
      <HomePage
        grids={grids}
        onSelectGrid={(gridId) => { setSelectedGrid(gridId); setPage('shop'); window.scrollTo(0, 0) }}
        onGoHome={() => setPage('landing')}
        completedCount={completedCount}
        onFinishDay={handleFinishDay}
      />
    )
  }

  return content
}
