// ============================================================
//  ClawBot 数据源实现（预留）
//
//  转为微信小程序后，替换 local.js
//  所有数据通过 ClawBot → OpenClaw Gateway 读写
//
//  Gateway 地址：通过 Tailscale VPN 或 Headscale 获取
// ============================================================

const GATEWAY_URL = 'http://OPENCLAW_IP:18789' // Tailscale 分配的虚拟 IP

// ---- 表格数据 ----
export async function getShopList() {
  const res = await fetch(`${GATEWAY_URL}/api/shops`)
  return res.json()
}

export async function getGridList() {
  const res = await fetch(`${GATEWAY_URL}/api/grids`)
  return res.json()
}

export async function getShopsByGrid(gridId) {
  const res = await fetch(`${GATEWAY_URL}/api/grids/${gridId}/shops`)
  return res.json()
}

export async function getHazardStats() {
  const res = await fetch(`${GATEWAY_URL}/api/stats/hazards`)
  return res.json()
}

export async function getHazardTypes() {
  const res = await fetch(`${GATEWAY_URL}/api/hazard-types`)
  return res.json()
}

export async function getIndustryStats() {
  const res = await fetch(`${GATEWAY_URL}/api/stats/industries`)
  return res.json()
}

// ---- 巡查记录 ----
export async function getInspectionHistory() {
  const res = await fetch(`${GATEWAY_URL}/api/inspections`)
  return res.json()
}

export async function getTodayPlan() {
  const today = new Date().toISOString().slice(0, 10)
  const res = await fetch(`${GATEWAY_URL}/api/plans/${today}`)
  return res.json()
}

export async function saveTodayPlan(date, shops) {
  await fetch(`${GATEWAY_URL}/api/plans/${date}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shops }),
  })
}

// ---- 照片操作 ----
export async function savePhoto(id, file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('id', id)
  await fetch(`${GATEWAY_URL}/api/photos`, { method: 'POST', body: formData })
}

export async function getPhotoURL(id) {
  return `${GATEWAY_URL}/api/photos/${id}`
}

export async function deletePhoto(id) {
  await fetch(`${GATEWAY_URL}/api/photos/${id}`, { method: 'DELETE' })
}

// ---- 照片上传（ClawBot → OpenClaw → 电脑磁盘）----
export async function uploadPhotos(photos, params) {
  // photos: [{ id, file, category }]
  // params: { folderName, docName }
  const formData = new FormData()
  formData.append('folderName', params.folderName)
  formData.append('docName', params.docName)
  photos.forEach((p) => {
    formData.append('files', p.file)
    formData.append('categories', p.category)
  })
  const res = await fetch(`${GATEWAY_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  })
  return res.json()
}

// ---- 数据同步 ----
export async function syncData() {
  const res = await fetch(`${GATEWAY_URL}/api/sync`, { method: 'POST' })
  return res.json()
}

// ---- 实时更新（WebSocket 推送）----
export function subscribeUpdates(callback) {
  const ws = new WebSocket(`ws://${GATEWAY_URL.replace('http://', '')}/ws`)

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    callback(data)
  }

  ws.onclose = () => {
    // 5 秒后重连
    setTimeout(() => subscribeUpdates(callback), 5000)
  }

  return () => ws.close()
}
