import { getFolder } from '../utils/history'

export default function HistoryDetail({ folderName, onBack, onOpenShop }) {
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

  function countPhotos(ins) {
    if (!ins.photos) return 0
    return Object.values(ins.photos).reduce((sum, arr) => sum + (arr?.length || 0), 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            {inspections.map((ins, i) => {
              const totalPhotos = countPhotos(ins)
              const isCompleted = totalPhotos > 0

              return (
                <button
                  key={i}
                  onClick={() => onOpenShop(ins)}
                  className={`w-full text-left rounded-xl border-2 transition-all duration-150 active:scale-[0.96] ${
                    isCompleted
                      ? 'border-green-200 bg-green-50/30 hover:border-green-400 hover:shadow-md'
                      : 'border-gray-100 bg-white hover:border-slate-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between px-4 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 ${
                        isCompleted ? 'bg-green-500 text-white' : 'bg-slate-50'
                      }`}>
                        {isCompleted ? '✓' : '🏪'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{ins.docName}</p>
                        <p className="text-xs text-gray-400 truncate">{ins.shopAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {isCompleted && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-600 font-medium">已完成</span>
                      )}
                      <span className="text-xs text-gray-400">{totalPhotos} 张</span>
                      <span className="text-slate-400 text-sm">›</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
