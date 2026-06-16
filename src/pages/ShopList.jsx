import { useEffect, useState } from 'react'
import { getShopsByGrid, getGridName } from '../data/shops'

const CATEGORIES = ['门店照', '灭火器照', '烟雾感应器照', '应急灯安全出口灯照', '现场照片', '隐患照']

export default function ShopList({ gridId, onBack, onSelectShop, onGoHome, completedMap, pendingMap, scrollToShop }) {
  const allShops = getShopsByGrid(gridId)
  const gridName = getGridName(gridId)
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const shops = search.trim()
    ? allShops.filter((s) => s.name.includes(search.trim()) || s.address.includes(search.trim()))
    : allShops

  useEffect(() => {
    if (scrollToShop) {
      const el = document.getElementById(`shop-${scrollToShop}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [scrollToShop])

  function handleSelect(shop) {
    const docName = `${shop.name}_${shop.address}`
    const photos = {}
    CATEGORIES.forEach((cat) => {
      photos[cat] = []
    })

    onSelectShop({
      gridName,
      shopName: shop.name,
      shopAddress: shop.address,
      docName,
      photos,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-slate-800 text-white px-4 py-3 safe-top">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center text-sm active:scale-90 transition-transform shrink-0">←</button>
          <div className="min-w-0 flex-1">
            {showSearch ? (
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onBlur={() => { if (!search) setShowSearch(false) }}
                placeholder="搜索店名或地址..."
                className="w-full bg-white/10 text-white text-sm rounded-lg px-2 py-1 border border-white/20 focus:border-white/40 focus:outline-none placeholder:text-slate-400"
              />
            ) : (
              <>
                <h1 className="text-base font-bold leading-tight">{gridName}</h1>
                <p className="text-xs text-slate-300">共 {allShops.length} 家三小场所</p>
              </>
            )}
          </div>
          {!showSearch && (
            <button onClick={() => setShowSearch(true)} className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center text-sm active:scale-90 transition-transform shrink-0">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
            </button>
          )}
        </div>
      </header>

      {/* 主体内容 */}
      <main className="max-w-md mx-auto px-4 py-5">
        <h2 className="text-base font-semibold text-gray-700 mb-3">请选择三小场所</h2>

        {shops.length === 0 && search && (
          <p className="text-sm text-gray-400 text-center py-8">未找到"{search}"相关店铺</p>
        )}
        <div className="space-y-2.5">
          {shops.map((shop) => {
            const isCompleted = completedMap[shop.name] || false
            const isPending = pendingMap[shop.name] || false

            let borderClass = 'border-gray-100 bg-white hover:border-slate-400 hover:shadow-md hover:-translate-y-0.5 active:bg-slate-50 active:shadow-none'
            let iconClass = 'bg-slate-50'
            let icon = '🏪'
            let badge = null

            if (isCompleted) {
              borderClass = 'border-green-200 bg-green-50/50 hover:border-green-400 hover:shadow-md hover:-translate-y-0.5 active:bg-green-100/50 active:shadow-none'
              iconClass = 'bg-green-500 text-white'
              icon = '✓'
              badge = <span className="inline-block px-2 py-0.5 rounded-md bg-green-100 text-green-600 text-xs font-medium">已完成</span>
            } else if (isPending) {
              borderClass = 'border-amber-200 bg-amber-50/50 hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 active:bg-amber-100/50 active:shadow-none'
              iconClass = 'bg-amber-500 text-white'
              icon = '◷'
              badge = <span className="inline-block px-2 py-0.5 rounded-md bg-amber-100 text-amber-600 text-xs font-medium">待完成</span>
            }

            return (
              <button
                key={shop.id}
                id={`shop-${shop.name}`}
                onClick={() => handleSelect(shop)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-150 active:scale-[0.96] ${borderClass}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 ${iconClass}`}>
                      {icon}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        {shop.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{shop.address}</p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-2 flex items-center gap-1.5">
                    {badge}
                    <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-xs">
                      {shop.industry}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* 底部提示 */}
        <p className="text-center text-xs text-gray-400 mt-5">
          选择店铺后将创建巡查文档并进入拍摄
        </p>
      </main>
    </div>
  )
}
