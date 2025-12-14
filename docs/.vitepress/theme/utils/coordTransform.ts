/**
 * 坐标系转换工具
 * @description 中国地图API使用加密坐标系，需要转换为标准GPS坐标
 *
 * 坐标系说明：
 * - WGS-84: GPS标准坐标系（国际标准，未加密）
 * - GCJ-02: 国测局火星坐标系（高德、腾讯使用，加密后）
 * - BD-09: 百度坐标系（在GCJ-02基础上再次加密）
 *
 * 不同坐标系之间误差可达几百米！
 */

const PI = Math.PI
const X_PI = (PI * 3000.0) / 180.0
const EARTH_RADIUS = 6378245.0 // 长半轴
const EE = 0.00669342162296594323 // 偏心率平方

/**
 * 判断坐标是否在中国境内
 * @param lon 经度
 * @param lat 纬度
 * @returns 是否在中国境内
 */
function isInChina(lon: number, lat: number): boolean {
  return lon >= 72.004 && lon <= 137.8347 && lat >= 0.8293 && lat <= 55.8271
}

/**
 * 转换纬度
 */
function transformLat(x: number, y: number): number {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x))
  ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0
  ret += ((20.0 * Math.sin(y * PI) + 40.0 * Math.sin((y / 3.0) * PI)) * 2.0) / 3.0
  ret += ((160.0 * Math.sin((y / 12.0) * PI) + 320 * Math.sin((y * PI) / 30.0)) * 2.0) / 3.0
  return ret
}

/**
 * 转换经度
 */
function transformLon(x: number, y: number): number {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x))
  ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0
  ret += ((20.0 * Math.sin(x * PI) + 40.0 * Math.sin((x / 3.0) * PI)) * 2.0) / 3.0
  ret += ((150.0 * Math.sin((x / 12.0) * PI) + 300.0 * Math.sin((x / 30.0) * PI)) * 2.0) / 3.0
  return ret
}

/**
 * GCJ-02（火星坐标）转 WGS-84（GPS坐标）
 * @param lon GCJ-02经度
 * @param lat GCJ-02纬度
 * @returns WGS-84坐标 {lon, lat}
 */
export function gcj02ToWgs84(lon: number, lat: number): { lon: number; lat: number } {
  // 如果不在中国境内，直接返回
  if (!isInChina(lon, lat)) {
    return { lon, lat }
  }

  let dLat = transformLat(lon - 105.0, lat - 35.0)
  let dLon = transformLon(lon - 105.0, lat - 35.0)
  const radLat = (lat / 180.0) * PI
  let magic = Math.sin(radLat)
  magic = 1 - EE * magic * magic
  const sqrtMagic = Math.sqrt(magic)
  dLat = (dLat * 180.0) / (((EARTH_RADIUS * (1 - EE)) / (magic * sqrtMagic)) * PI)
  dLon = (dLon * 180.0) / ((EARTH_RADIUS / sqrtMagic) * Math.cos(radLat) * PI)

  const mgLat = lat + dLat
  const mgLon = lon + dLon

  return {
    lon: lon * 2 - mgLon,
    lat: lat * 2 - mgLat
  }
}

/**
 * WGS-84（GPS坐标）转 GCJ-02（火星坐标）
 * @param lon WGS-84经度
 * @param lat WGS-84纬度
 * @returns GCJ-02坐标 {lon, lat}
 */
export function wgs84ToGcj02(lon: number, lat: number): { lon: number; lat: number } {
  // 如果不在中国境内，直接返回
  if (!isInChina(lon, lat)) {
    return { lon, lat }
  }

  let dLat = transformLat(lon - 105.0, lat - 35.0)
  let dLon = transformLon(lon - 105.0, lat - 35.0)
  const radLat = (lat / 180.0) * PI
  let magic = Math.sin(radLat)
  magic = 1 - EE * magic * magic
  const sqrtMagic = Math.sqrt(magic)
  dLat = (dLat * 180.0) / (((EARTH_RADIUS * (1 - EE)) / (magic * sqrtMagic)) * PI)
  dLon = (dLon * 180.0) / ((EARTH_RADIUS / sqrtMagic) * Math.cos(radLat) * PI)

  return {
    lon: lon + dLon,
    lat: lat + dLat
  }
}

/**
 * BD-09（百度坐标）转 GCJ-02（火星坐标）
 * @param lon BD-09经度
 * @param lat BD-09纬度
 * @returns GCJ-02坐标 {lon, lat}
 */
export function bd09ToGcj02(lon: number, lat: number): { lon: number; lat: number } {
  const x = lon - 0.0065
  const y = lat - 0.006
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI)
  const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI)
  const gcjLon = z * Math.cos(theta)
  const gcjLat = z * Math.sin(theta)
  return { lon: gcjLon, lat: gcjLat }
}

/**
 * BD-09（百度坐标）转 WGS-84（GPS坐标）
 * @param lon BD-09经度
 * @param lat BD-09纬度
 * @returns WGS-84坐标 {lon, lat}
 */
export function bd09ToWgs84(lon: number, lat: number): { lon: number; lat: number } {
  const gcj = bd09ToGcj02(lon, lat)
  return gcj02ToWgs84(gcj.lon, gcj.lat)
}

/**
 * 计算两个GPS坐标之间的距离（米）
 * 使用Haversine公式
 * @param lon1 经度1
 * @param lat1 纬度1
 * @param lon2 经度2
 * @param lat2 纬度2
 * @returns 距离（米）
 */
export function calculateDistance(
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number
): number {
  const radLat1 = (lat1 * PI) / 180
  const radLat2 = (lat2 * PI) / 180
  const a = radLat1 - radLat2
  const b = ((lon1 - lon2) * PI) / 180
  const s =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin(a / 2), 2) +
          Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
      )
    )
  return s * EARTH_RADIUS * 1000 // 转换为米
}

/**
 * 判断用户是否移动（距离超过阈值）
 * @param oldLon 旧经度
 * @param oldLat 旧纬度
 * @param newLon 新经度
 * @param newLat 新纬度
 * @param threshold 阈值（米），默认1000米
 * @returns 是否移动
 */
export function hasUserMoved(
  oldLon: number,
  oldLat: number,
  newLon: number,
  newLat: number,
  threshold = 1000
): boolean {
  const distance = calculateDistance(oldLon, oldLat, newLon, newLat)
  return distance > threshold
}
