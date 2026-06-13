import { useState } from 'react'
import { getGrids } from './data/shops'
import ShopList from './pages/ShopList'
import ShootPage from './pages/ShootPage'

function HomePage({ grids, selectedGrid, onSelectGrid, onNext }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-slate-800 text-white px-5 py-4 safe-top">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="logo" className="w-9 h-9 rounded-lg object-cover" />
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
          {grids.map((grid) => (
            <button
              key={grid.id}
              onClick={() => onSelectGrid(grid.id)}
              className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 active:scale-[0.98] ${
                selectedGrid === grid.id
                  ? 'border-slate-500 bg-slate-50 shadow-sm'
                  : 'border-gray-100 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                    selectedGrid === grid.id ? 'bg-slate-700 text-white' : 'bg-gray-100'
                  }`}>
                    📍
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{grid.name}</p>
                    <p className="text-sm text-gray-400">{grid.shopCount} 家三小场所</p>
                  </div>
                </div>
                {selectedGrid === grid.id && (
                  <span className="text-slate-700 text-sm font-medium">已选择 ✓</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* 底部操作栏 */}
        <div className="mt-8">
          <button
            disabled={!selectedGrid}
            onClick={onNext}
            className={`w-full py-3.5 rounded-xl text-white font-semibold text-base transition-all duration-200 ${
              selectedGrid
                ? 'bg-slate-700 active:bg-slate-800 shadow-lg shadow-slate-200'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {selectedGrid ? '下一步：选择店铺' : '请先选择网格区域'}
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">
            选择网格后进入店铺列表
          </p>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState('home')
  const [selectedGrid, setSelectedGrid] = useState(null)
  const [document, setDocument] = useState(null)

  const grids = getGrids()

  function handleSelectShop(doc) {
    setDocument(doc)
    setPage('shoot')
  }

  let content
  if (page === 'shop') {
    content = (
      <ShopList
        gridId={selectedGrid}
        onBack={() => setPage('home')}
        onSelectShop={handleSelectShop}
      />
    )
  } else if (page === 'shoot') {
    content = (
      <ShootPage
        document={document}
        onBack={() => setPage('shop')}
      />
    )
  } else {
    content = (
      <HomePage
        grids={grids}
        selectedGrid={selectedGrid}
        onSelectGrid={setSelectedGrid}
        onNext={() => setPage('shop')}
      />
    )
  }

  return content
}
