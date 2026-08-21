/**
 * 天气组件类型定义
 * @description 定义天气相关的接口和类型
 */

// 天气数据结构
export interface WeatherData {
  temperature: number
  skycon: string
  description: string
}

// 地理位置数据
export interface LocationData {
  latitude: number
  longitude: number
  city?: string
}

// WMO代码映射
export interface WMOMapping {
  [key: number]: string
}
