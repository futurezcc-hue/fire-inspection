// ============================================================
//  API 抽象层
//
//  MODE: 'local' | 'workbuddy' | 'clawbot'
//  local: shops.js + localStorage + IndexedDB（当前）
//  workbuddy: WorkBuddy REST API（腾讯出品，微信原生对接）
//  clawbot: OpenClaw Gateway（备用）
//
//  切换只需改 MODE 一行
// ============================================================

const MODE = 'local'

import * as local from './local'
import * as workbuddy from './workbuddy'
import * as clawbot from './clawbot'

const api = MODE === 'workbuddy' ? workbuddy : MODE === 'clawbot' ? clawbot : local

export const getShopList = api.getShopList
export const getGridList = api.getGridList
export const getShopsByGrid = api.getShopsByGrid
export const getHazardStats = api.getHazardStats
export const getHazardTypes = api.getHazardTypes
export const getIndustryStats = api.getIndustryStats

export const getInspectionHistory = api.getInspectionHistory
export const getTodayPlan = api.getTodayPlan
export const saveTodayPlan = api.saveTodayPlan

export const savePhoto = api.savePhoto
export const getPhotoURL = api.getPhotoURL
export const getPhotoPath = api.getPhotoPath
export const deletePhoto = api.deletePhoto

export const uploadPhotos = api.uploadPhotos
export const syncData = api.syncData
export const subscribeUpdates = api.subscribeUpdates
