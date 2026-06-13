const grids = [
  {
    id: 1,
    name: '第一网格',
    shops: [
      { id: 1, name: '好味早餐店', address: '建设路12号', industry: '餐饮' },
      { id: 2, name: '便民小超市', address: '建设路18号', industry: '零售' },
      { id: 3, name: '利民理发店', address: '人民路5号', industry: '服务' },
      { id: 4, name: '兴旺五金店', address: '人民路9号', industry: '零售' },
    ],
  },
  {
    id: 2,
    name: '第二网格',
    shops: [
      { id: 5, name: '天天快餐店', address: '中山路3号', industry: '餐饮' },
      { id: 6, name: '祥和小卖部', address: '中山路7号', industry: '零售' },
      { id: 7, name: '安顺电动车维修', address: '解放路11号', industry: '维修' },
    ],
  },
  {
    id: 3,
    name: '第三网格',
    shops: [
      { id: 8, name: '美味烧烤店', address: '朝阳路2号', industry: '餐饮' },
      { id: 9, name: '大众便利店', address: '朝阳路8号', industry: '零售' },
      { id: 10, name: '舒心盲人按摩', address: '文化路6号', industry: '服务' },
      { id: 11, name: '新华打印店', address: '文化路10号', industry: '服务' },
    ],
  },
  {
    id: 4,
    name: '第四网格',
    shops: [
      { id: 12, name: '幸福杂货铺', address: '和平路1号', industry: '零售' },
      { id: 13, name: '明亮眼镜店', address: '和平路15号', industry: '零售' },
    ],
  },
]

export function getGrids() {
  return grids.map(({ id, name, shops }) => ({ id, name, shopCount: shops.length }))
}

export function getShopsByGrid(gridId) {
  const grid = grids.find((g) => g.id === gridId)
  return grid ? grid.shops : []
}

export function getGridName(gridId) {
  const grid = grids.find((g) => g.id === gridId)
  return grid ? grid.name : ''
}
