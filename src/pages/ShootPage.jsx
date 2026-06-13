const CATEGORIES = ['门店照', '灭火器照', '烟雾感应器照', '应急灯安全出口灯照', '现场照片', '隐患照']

export default function ShootPage({ document, onBack }) {
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
          <div className="min-w-0">
            <h1 className="text-base font-bold leading-tight truncate">{document.docName}</h1>
            <p className="text-xs text-slate-300 truncate">{document.gridName}</p>
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
          <div className="flex items-center gap-1.5 opacity-40">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold">✓</span>
            <span className="text-sm text-gray-400">选择店铺</span>
          </div>
          <div className="flex-1 h-px bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-white text-xs font-bold">3</span>
            <span className="text-sm font-medium text-gray-800">拍摄</span>
          </div>
        </div>

        <h2 className="text-base font-semibold text-gray-700 mb-3">巡查文档已创建</h2>

        <div className="rounded-xl bg-white border border-gray-100 p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📋</span>
            <span className="font-semibold text-gray-800 text-sm">{document.docName}</span>
          </div>
          <p className="text-xs text-gray-400">店铺：{document.shopName}</p>
          <p className="text-xs text-gray-400">地址：{document.shopAddress}</p>
          <p className="text-xs text-gray-400">网格：{document.gridName}</p>
        </div>

        <h2 className="text-base font-semibold text-gray-700 mb-3">拍摄项目</h2>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <div
              key={cat}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-white"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg shrink-0">
                📷
              </div>
              <span className="font-medium text-gray-700 text-sm">{cat}</span>
              <div className="flex-1" />
              <span className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-400">
                待拍摄
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            disabled
            className="w-full py-3.5 rounded-xl text-white font-semibold text-base bg-gray-300 cursor-not-allowed"
          >
            请完成所有拍摄项目
          </button>
        </div>
      </main>
    </div>
  )
}
