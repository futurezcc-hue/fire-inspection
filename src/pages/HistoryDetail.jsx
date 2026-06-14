import { getFolder } from '../utils/history'

export default function HistoryDetail({ folderName, onBack }) {
  const entry = getFolder(folderName)

  if (!entry) {
    return (
      <div className="min-h-screen bg-slate-800 flex flex-col items-center justify-center px-6">
        <p className="text-slate-300 mb-4">未找到该记录</p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl bg-white text-slate-800 font-medium text-sm"
        >
          返回
        </button>
      </div>
    )
  }

  const inspections = entry.inspections || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-slate-800 text-white px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm active:scale-90 transition-transform"
          >
            ←
          </button>
          <div>
            <h1 className="text-base font-bold leading-tight">{entry.folderName}</h1>
            <p className="text-xs text-slate-300">{inspections.length} 家店铺</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-5">
        {inspections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-400 text-sm">暂无巡查记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {inspections.map((ins, i) => (
              <div
                key={i}
                className="rounded-xl bg-white border border-gray-100 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📋</span>
                  <span className="font-semibold text-gray-800 text-sm">
                    {ins.docName}
                  </span>
                </div>
                <p className="text-xs text-gray-400">店铺：{ins.shopName}</p>
                <p className="text-xs text-gray-400">地址：{ins.shopAddress}</p>
                <p className="text-xs text-gray-400">网格：{ins.gridName}</p>
                {ins.photos && (
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {Object.entries(ins.photos).map(([cat, arr]) => (
                      <span
                        key={cat}
                        className={`text-xs px-2 py-0.5 rounded-md ${
                          arr.length > 0
                            ? 'bg-green-50 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {cat} {arr.length > 0 ? arr.length : '0'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
