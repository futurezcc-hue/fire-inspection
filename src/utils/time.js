function beijingNow() {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  return new Date(utc + 8 * 3600000)
}

export function getTodayStr() {
  const d = beijingNow()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function getCurrentQuarter() {
  const m = beijingNow().getMonth() + 1
  return Math.ceil(m / 3)
}

export function getQuarterMonths(q) {
  const start = (q - 1) * 3 + 1
  return [start, start + 1, start + 2]
}

export function getQuarterLabel(q) {
  const y = beijingNow().getFullYear()
  return `${y}年 第${q}季度`
}

export function getBeijingYear() {
  return beijingNow().getFullYear()
}
