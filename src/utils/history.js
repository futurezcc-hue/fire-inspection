const KEY = 'fire_inspection_history'

export function getHistory() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveHistory(entry) {
  const list = getHistory()
  const index = list.findIndex((e) => e.folderName === entry.folderName)
  if (index >= 0) {
    // 合并 inspections，按 docName 去重
    const existing = list[index].inspections || []
    const incoming = entry.inspections || []
    const merged = [...existing]
    incoming.forEach((ins) => {
      const idx = merged.findIndex((m) => m.docName === ins.docName)
      if (idx >= 0) {
        merged[idx] = ins
      } else {
        merged.push(ins)
      }
    })
    list[index] = { ...entry, inspections: merged }
  } else {
    list.unshift(entry)
  }
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function getFolder(folderName) {
  return getHistory().find((e) => e.folderName === folderName)
}
