import { useState } from 'react'
import { getHistory } from '../utils/history'

function getTodayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function Landing({ onStart, onOpenHistory }) {
  const [folderName, setFolderName] = useState(getTodayStr())
  const history = getHistory()

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

      {/* 总文件夹名称 */}
      <div className="w-full max-w-xs mb-6">
        <label className="block text-slate-300 text-xs mb-2">
          巡查日期（电脑端总文件夹名）
        </label>
        <input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/10 text-white text-center text-base border border-white/10 focus:border-white/30 focus:outline-none transition-colors"
          placeholder="输入日期，如 2026-06-13"
        />
      </div>

      {/* 开始按钮 */}
      <button
        onClick={() => onStart(folderName.trim() || getTodayStr())}
        className="w-full max-w-xs py-3.5 rounded-xl bg-white text-slate-800 font-bold text-base hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.95] transition-all duration-150 shadow-lg"
      >
        开始巡查
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
                className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/15 rounded-xl px-4 py-3.5 text-left transition-all duration-150 active:scale-[0.97] active:bg-white/20"
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
