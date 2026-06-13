import { getShopsByGrid, getGridName } from '../data/shops'

const CATEGORIES = ['门店照', '灭火器照', '烟雾感应器照', '应急灯安全出口灯照', '现场照片', '隐患照']

export default function ShopList({ gridId, onBack, onSelectShop }) {
  const shops = getShopsByGrid(gridId)
  const gridName = getGridName(gridId)

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
          <button
            onClick={onBack}
            className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm active:scale-90 transition-transform"
          >
            ←
          </button>
          <div>
            <h1 className="text-base font-bold leading-tight">{gridName}</h1>
            <p className="text-xs text-slate-300">共 {shops.length} 家三小场所</p>
          </div>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="max-w-md mx-auto px-4 py-5">
        {/* 步骤提示 */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center gap-1.5 opacity-40">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold">✓</span>
            <span className="text-sm text-gray-400">选择网格</span>
          </div>
          <div className="flex-1 h-px bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-white text-xs font-bold">2</span>
            <span className="text-sm font-medium text-gray-800">选择店铺</span>
          </div>
          <div className="flex-1 h-px bg-gray-200" />
          <div className="flex items-center gap-1.5 opacity-40">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-300 text-white text-xs font-bold">3</span>
            <span className="text-sm text-gray-400">拍摄</span>
          </div>
        </div>

        <h2 className="text-base font-semibold text-gray-700 mb-3">请选择三小场所</h2>

        <div className="space-y-2.5">
          {shops.map((shop) => (
            <button
              key={shop.id}
              onClick={() => handleSelect(shop)}
              className="w-full text-left px-4 py-3.5 rounded-xl border-2 border-gray-100 bg-white hover:border-slate-300 hover:shadow-sm active:scale-[0.98] transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-lg shrink-0">
                    🏪
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {shop.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{shop.address}</p>
                  </div>
                </div>
                <div className="shrink-0 ml-2">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-xs">
                    {shop.industry}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* 底部提示 */}
        <p className="text-center text-xs text-gray-400 mt-5">
          选择店铺后将创建巡查文档并进入拍摄
        </p>
      </main>
    </div>
  )
}
