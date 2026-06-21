// ============================================================
//  Local 数据源实现
//
//  当前使用的数据源，直接读取 shops.js / localStorage / IndexedDB
//  后续接 OpenClaw 时，替换为 clawbot.js
// ============================================================

// ---- 表格数据（来自 shops.js）----
import { getGrids, getShopsByGrid as _getShopsByGrid, getHazardStats as _getHazardStats, getHazardTypes as _getHazardTypes } from '../data/shops'

export function getShopList() {
  const grids = getGrids()
  const list = []
  grids.forEach((g) => {
    _getShopsByGrid(g.id).forEach((s) => list.push({ ...s, gridName: g.name, gridId: g.id }))
  })
  return list
}

export function getGridList() {
  return getGrids().map((g) => ({
    ...g,
    shops: _getShopsByGrid(g.id),
  }))
}

export function getShopsByGrid(gridId) {
  return _getShopsByGrid(gridId)
}

export function getHazardStats() {
  return _getHazardStats()
}

export function getHazardTypes() {
  return _getHazardTypes()
}

export function getIndustryStats() {
  const byInd = {}
  getShopList().forEach((s) => {
    byInd[s.industry] = (byInd[s.industry] || 0) + 1
  })
  return byInd
}

// ---- 巡查记录（来自 localStorage）----
import { getHistory, getTodayPlan as _getTodayPlan, saveTodayPlan as _saveTodayPlan } from '../utils/history'

export function getInspectionHistory() {
  return getHistory()
}

export function getTodayPlan() {
  return _getTodayPlan(new Date().toISOString().slice(0, 10))
}

export function saveTodayPlan(date, shops) {
  _saveTodayPlan(date, shops)
}

// ---- 照片操作（来自 IndexedDB）----
import { savePhoto as _savePhoto, getPhotoURL as _getPhotoURL, deletePhoto as _deletePhoto } from '../utils/photos'

export async function savePhoto(id, file) {
  return _savePhoto(id, file)
}

export async function getPhotoURL(id) {
  return _getPhotoURL(id)
}

export async function deletePhoto(id) {
  return _deletePhoto(id)
}

// ---- 照片上传（预留）----
export async function uploadPhotos(photos, params) {
  // TODO: 接入 ClawBot 后实现
  // ClawBot 实现：遍历 photos → POST 到 Gateway → 存磁盘
  console.warn('uploadPhotos: 尚未接入 ClawBot/OpenClaw')
  return { success: false, message: '未接入传输服务' }
}

// ---- 数据同步（预留）----
export async function syncData() {
  // TODO: 接入 ClawBot 后实现
  // ClawBot 实现：拉取后端最新表格数据 → 更新 localStorage
  console.warn('syncData: 尚未接入 ClawBot/OpenClaw')
  return { success: false, message: '未接入同步服务' }
}

// ---- 实时更新（预留）----
export function subscribeUpdates(callback) {
  // TODO: 接入 ClawBot 后实现
  // ClawBot 实现：WebSocket 连接 Gateway → 收到推送 → callback(data)
  console.warn('subscribeUpdates: 尚未接入 ClawBot/OpenClaw')
  return () => {} // 返回取消订阅函数
}
