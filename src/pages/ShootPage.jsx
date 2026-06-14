import { useState, useRef } from 'react'
import { savePhoto, deletePhoto } from '../utils/photos'

const CATEGORIES = [
  '门店照',
  '灭火器照',
  '烟雾感应器照',
  '应急灯安全出口灯照',
  '现场照片',
  '隐患照',
]

export default function ShootPage({ document, onBack, onBackToGrid, onGoHome, onUpdateDocument, onComplete, fromHistory, readonly }) {
  const [photos, setPhotos] = useState(document.photos || {})
  const [activeCategory, setActiveCategory] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)

  function handleCapture(category) {
    setActiveCategory(category)
    fileInputRef.current.click()
  }

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file || !activeCategory) return

    const id = Date.now().toString()
    await savePhoto(id, file)
    const url = URL.createObjectURL(file)
    const newPhoto = { id, url }

    const updated = {
      ...photos,
      [activeCategory]: [...(photos[activeCategory] || []), newPhoto],
    }
    setPhotos(updated)
    onUpdateDocument({ ...document, photos: updated })

    fileInputRef.current.value = ''
    setActiveCategory(null)
  }

  async function handleDelete(category, photoId) {
    await deletePhoto(photoId)
    const updated = {
      ...photos,
      [category]: photos[category].filter((p) => p.id !== photoId),
    }
    setPhotos(updated)
    onUpdateDocument({ ...document, photos: updated })
  }

  const allCategories = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = photos[cat] || []
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 隐藏的相机输入 */}
      <input
        ref={fileInputRef}
        type="file"
        capture="environment"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 照片预览弹窗 */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setPreviewUrl(null)}
        >
          <img
            src={previewUrl}
            alt="preview"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      {/* 顶部导航 */}
      <header className="bg-slate-800 text-white px-4 py-3 safe-top">
        <div className="flex items-center gap-3">
          <button onClick={onGoHome} className="shrink-0 active:scale-90 transition-transform">
            <img src="/logo.jpg" alt="logo" className="w-7 h-7 rounded-md object-cover" />
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
        {!fromHistory && (
          <div className="flex items-center gap-3 mb-5">
            <button onClick={onBackToGrid} className="flex items-center gap-1.5 active:scale-95 transition-transform">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold">✓</span>
              <span className="text-sm text-gray-400">选择网格</span>
            </button>
            <div className="flex-1 h-px bg-gray-200" />
            <button onClick={onBack} className="flex items-center gap-1.5 active:scale-95 transition-transform">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold">✓</span>
              <span className="text-sm text-gray-400">选择店铺</span>
            </button>
            <div className="flex-1 h-px bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-white text-xs font-bold">3</span>
              <span className="text-sm font-medium text-gray-800">拍摄</span>
            </div>
          </div>
        )}

        {/* 文档信息 */}
        <div className="rounded-xl bg-white border border-gray-100 px-4 py-3.5 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">📋</span>
            <span className="font-semibold text-gray-800 text-sm">{document.docName}</span>
          </div>
          <p className="text-xs text-gray-400">{document.shopAddress}</p>
        </div>

        {/* 拍摄项目 */}
        <h2 className="text-base font-semibold text-gray-700 mb-3">拍摄项目</h2>
        <div className="space-y-2.5">
          {CATEGORIES.map((cat) => {
            const catPhotos = allCategories[cat] || []
            const hasPhotos = catPhotos.length > 0

            return (
              <div key={cat}>
                <button
                  onClick={() => !readonly && handleCapture(cat)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-100 bg-white transition-all duration-150 ${
                    readonly ? 'cursor-default' : 'hover:border-slate-400 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.96] active:bg-slate-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 ${
                    hasPhotos ? 'bg-slate-700 text-white' : 'bg-gray-100'
                  }`}>
                    {hasPhotos ? '✓' : '📷'}
                  </div>
                  <span className={`font-medium text-sm ${hasPhotos ? 'text-gray-800' : 'text-gray-500'}`}>
                    {cat}
                  </span>
                  <div className="flex-1" />
                  <span className={`text-xs px-2 py-1 rounded-md ${
                    hasPhotos ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {hasPhotos ? '已拍摄' : readonly ? '未拍摄' : '点击拍摄'}
                  </span>
                </button>

                {/* 照片缩略图 */}
                {catPhotos.length > 0 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                    {catPhotos.map((photo) => (
                      <div key={photo.id} className="relative shrink-0">
                        <img
                          src={photo.url}
                          alt={cat}
                          className="w-16 h-16 rounded-lg object-cover cursor-pointer"
                          onClick={() => setPreviewUrl(photo.url)}
                        />
                        {!readonly && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(cat, photo.id)
                            }}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center active:scale-90"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* 底部按钮 */}
        <div className="mt-8">
          {fromHistory ? (
            <button
              onClick={onBack}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-base bg-slate-700 hover:bg-slate-600 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.96] active:bg-slate-800 shadow-lg shadow-slate-200 transition-all duration-150"
            >
              <span className="tracking-widest">返回</span>
            </button>
          ) : (
            <button
              onClick={() => {
                const total = Object.values(photos).reduce((s, arr) => s + (arr?.length || 0), 0)
                if (total === 0) {
                  alert('请至少拍摄一张照片')
                  return
                }
                onComplete()
              }}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-base bg-slate-700 hover:bg-slate-600 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.96] active:bg-slate-800 shadow-lg shadow-slate-200 transition-all duration-150"
            >
              <span className="tracking-widest">完成巡查</span>
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
