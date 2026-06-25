import request from '@/utils/request'

// 获取统计数据
export const fetchStatsData = () => {
  return request.get('/api/dashboard/statsData')
}
// 获取最新公告
export const fetchLastAnnouncement = () => {
  return request.get('/api/announcement/last10')
}
// 获取最新留言
export const fetchLastReaderMessage = () => {
  return request.get('/api/message/last10')
}
// 获取热门图书排行
export const fetchHotRank = () => {
  return request.get('/api/dashboard/hotRank')
}
