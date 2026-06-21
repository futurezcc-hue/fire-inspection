// ============================================================
//  WorkBuddy 数据源实现（Web App 版）
//
//  通过 WorkBuddy REST API 读写所有数据
//  WorkBuddy 运行在本地电脑，Web App 通过 Tailscale/Headscale IP 调用
//
//  切换到 WorkBuddy：改 api/index.js 中 MODE = 'workbuddy'
//  并配置下方的 BASE URL
// ============================================================

const BASE = 'http://WORKBUDDY_IP:8765/api/v1'

async function request(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${BASE}${path}`, opts)
  return res.json()
}

// 表格数据
export async function getShopList() { return request('GET', '/shops') }
export async function getGridList() { return request('GET', '/grids') }
export async function getShopsByGrid(gridId) { return request('GET', `/grids/${gridId}/shops`) }
export async function getHazardStats() { return request('GET', '/stats/hazards') }
export async function getHazardTypes() { return request('GET', '/hazard-types') }
export async function getIndustryStats() { return request('GET', '/stats/industries') }

// 巡查记录
export async function getInspectionHistory() { return request('GET', '/inspections') }
export async function getTodayPlan() { return request('GET', `/plans/${new Date().toISOString().slice(0, 10)}`) }
export async function saveTodayPlan(date, shops) { return request('PUT', `/plans/${date}`, { shops }) }

// 照片（本地模式用 IndexedDB，workbuddy 模式走上传）
export async function savePhoto(id, file) {
  const fd = new FormData(); fd.append('file', file); fd.append('id', id)
  await fetch(`${BASE}/photos`, { method: 'POST', body: fd })
}
export async function getPhotoURL(id) { return `${BASE}/photos/${id}` }
export function getPhotoPath(id) { return `${BASE}/photos/${id}` }
export async function deletePhoto(id) { await fetch(`${BASE}/photos/${id}`, { method: 'DELETE' }) }

// 照片上传到电脑
export async function uploadPhotos(photos, params) {
  const fd = new FormData()
  fd.append('folderName', params.folderName)
  fd.append('docName', params.docName)
  photos.forEach((p) => { fd.append('files', p.file); fd.append('categories', p.category) })
  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: fd })
  return res.json()
}

// 数据同步（提交任务 → 轮询结果）
export async function syncData() {
  const { task_id } = await request('POST', '/execute', { script_id: 'sync_inspection_data', params: {} })
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000))
    const status = await request('GET', `/task/${task_id}`)
    if (status.state === 'completed') return status.result
    if (status.state === 'failed') throw new Error(status.error)
  }
  throw new Error('同步超时')
}

// 实时更新（预留）
export function subscribeUpdates(callback) {
  return () => {}
}
