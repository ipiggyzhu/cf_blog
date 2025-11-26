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

// 位置缓存结构
export interface LocationCache {
  time: number
  value: LocationData
}

// 天气缓存结构
export interface WeatherCache {
  time: number
  value: WeatherData
}

// 天气服务提供商配置
export interface WeatherProviderConfig {
  name: string
  baseURL: string
  timeout: number
  requiresToken: boolean
}

// 位置服务提供商配置
export interface GeolocationProviderConfig {
  name: string
  baseURL: string
  timeout: number
  maxRetries: number
}

// WMO代码映射
export interface WMOMapping {
  [key: number]: string
}

// 天气图标映射
export type WeatherIconMap = Record<string, string>

// 天气描述映射
export type WeatherDescMap = Record<string, string>

// 定位选项
export interface GeolocationOptions {
  enableHighAccuracy: boolean
  timeout: number
  maximumAge: number
}

// API响应通用结构
export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: number
}