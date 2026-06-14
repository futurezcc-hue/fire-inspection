import { useState } from 'react'
import { getHistory, getFolder } from '../utils/history'

function getTodayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function Landing({ onStart, onOpenHistory, onResumePending, onAbandonDay, pendingDay }) {
  const [folderName, setFolderName] = useState(getTodayStr())
  const history = getHistory()

  const pendingCount = pendingDay?.inspections
    ? Object.values(pendingDay.inspections).filter((ins) => ins.completed).length
    : 0

  return (
    <div className="min-h-screen bg-slate-800 flex flex-col items-center px-6 py-10">
      {/* Logo & 标题 */}
      <div className="text-center mb-8 mt-4">
        <img
          src="/logo.jpg"
          alt="logo"
          className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 shadow-lg"
        />
        <h1 className="text-xl font-bold text-white mb-1">消防巡查</h1>
        <p className="text-slate-300 text-sm">三小场所照片采集系统</p>
      </div>

      {/* 待完成巡查 提示 */}
      {pendingDay && (
        <div className="w-full max-w-xs mb-5">
          <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-xl px-4 py-3.5">
            <button
              onClick={() => onResumePending(pendingDay.folderName)}
              className="flex-1 flex items-center gap-3 text-left active:scale-[0.97] transition-all duration-150"
            >
              <span className="text-lg">⏳</span>
              <div>
                <p className="text-amber-300 text-sm font-medium">{pendingDay.folderName}</p>
                <p className="text-amber-400/70 text-xs mt-0.5">
                  待完成 · {pendingCount} 家已完成
                </p>
              </div>
              <span className="ml-auto text-amber-400 text-xs">继续 ›</span>
            </button>
            <button
              onClick={onAbandonDay}
              className="shrink-0 w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 text-sm flex items-center justify-center active:scale-90 transition-transform"
              title="取消"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 新建巡查文件夹 */}
      <div className="w-full max-w-xs mb-6">
        <label className="block text-slate-300 text-xs mb-2">
          文件名
        </label>
        <input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/10 text-white text-center text-base border border-white/10 focus:border-white/30 focus:outline-none transition-colors"
          placeholder="输入文件夹名，如 2026-06-14"
        />
      </div>

      {/* 开始按钮 */}
      <button
        onClick={() => {
          const name = folderName.trim() || getTodayStr()
          const existing = getFolder(name) || getHistory().find((e) => e.folderName === name)
          if (existing) {
            alert('该文件夹名已存在，请更换名称')
            return
          }
          onStart(name)
        }}
        className="w-full max-w-xs py-3.5 rounded-xl bg-white text-slate-800 font-bold text-base hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.95] transition-all duration-150 shadow-lg"
      >
        新建巡查
      </button>

      {/* 历史记录 */}
      {history.length > 0 && (
        <div className="w-full max-w-xs mt-10">
          <div className="border-t border-white/10 mb-5" />
          <h2 className="text-slate-300 text-xs font-semibold mb-4">历史记录</h2>
          <div className="space-y-3">
            {history.map((entry) => (
              <button
                key={entry.folderName}
                onClick={() => onOpenHistory(entry.folderName)}
                className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-xl px-4 py-3.5 text-left transition-all duration-150 active:scale-[0.97]"
              >
                <span className="text-base">📁</span>
                <div>
                  <p className="text-white text-sm font-medium">{entry.folderName}</p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {entry.inspections ? entry.inspections.length : 0} 家店铺
                  </p>
                </div>
                <span className="ml-auto text-slate-500 text-xs">查看 →</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
