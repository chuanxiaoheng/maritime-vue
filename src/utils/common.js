/**
 * 根据生日字符串计算年龄
 */
export const calculateAge = (birthday) => {
  if (!birthday) return 0

  // 获取日期对象
  const birthDate = new Date(birthday)

  // 检查日期是否有效
  if (isNaN(birthDate.getTime())) return 0

  // 当前日期
  const today = new Date()

  // 计算年龄
  let age = today.getFullYear() - birthDate.getFullYear()

  // 月份差
  const monthDiff = today.getMonth() - birthDate.getMonth()

  // 如果当前月份小于出生月份，或者当前月份等于出生月份但日期小于出生日期，则年龄减 1
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age > 0 ? age : 0
}

export const formatLocalDate = (date) => {
  // 判断是否有date传入
  if (!date) return
  // 转成中国时区时间
  return new Date(date).toLocaleString('zh-CN')
}
