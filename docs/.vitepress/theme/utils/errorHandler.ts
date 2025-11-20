/**
 * 全局错误处理器
 * 用于捕获和处理应用中的各种错误
 */

export interface ErrorLog {
  timestamp: number;
  type: 'resource' | 'api' | 'runtime' | 'network' | 'vue';
  message: string;
  stack?: string;
  url?: string;
  context: Record<string, any>;
}

class ErrorHandler {
  private errors: ErrorLog[] = [];
  private maxErrors = 50; // 最多保存 50 条错误日志

  /**
   * 初始化错误处理器
   */
  init(): void {
    if (typeof window === 'undefined') return;

    // 捕获全局 JavaScript 错误
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), 'runtime', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
      // 不阻止默认错误处理，但记录日志
      console.error('[Global Error Captured]', event.error);
    });

    // 捕获未处理的 Promise 错误
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        'runtime',
        { type: 'unhandledPromise' }
      );
      console.error('[Unhandled Promise Rejection]', event.reason);
      // 防止默认行为（在控制台显示错误）
      event.preventDefault();
    });

    // 捕获资源加载错误
    window.addEventListener('error', (event) => {
      if (event.target && (event.target as any).tagName) {
        const target = event.target as HTMLElement;
        this.captureError(
          new Error(`Resource failed to load: ${(target as any).src || (target as any).href}`),
          'resource',
          {
            tagName: target.tagName,
            src: (target as any).src,
            href: (target as any).href,
          }
        );
      }
    }, true); // 使用捕获阶段

    console.log('[ErrorHandler] Initialized');
  }

  /**
   * 捕获错误
   */
  captureError(error: Error, type: ErrorLog['type'], context: Record<string, any> = {}): void {
    const errorLog: ErrorLog = {
      timestamp: Date.now(),
      type,
      message: error.message,
      stack: error.stack,
      url: typeof window !== 'undefined' ? window.location.href : '',
      context,
    };

    this.errors.push(errorLog);

    // 限制错误日志数量
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // 在开发环境输出详细日志
    if (import.meta.env.DEV) {
      console.error('[ErrorHandler]', errorLog);
    }
  }

  /**
   * 重试函数
   */
  async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`[ErrorHandler] Retry ${i + 1}/${maxRetries} failed:`, lastError.message);

        if (i < maxRetries - 1) {
          // 等待后重试，每次延迟递增
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }

    throw lastError || new Error('Retry failed');
  }

  /**
   * 获取错误日志
   */
  getErrors(): ErrorLog[] {
    return [...this.errors];
  }

  /**
   * 清空错误日志
   */
  clearErrors(): void {
    this.errors = [];
  }
}

// 导出单例
export const errorHandler = new ErrorHandler();

/**
 * 资源加载重试
 */
export async function loadResourceWithRetry(
  url: string,
  retries: number = 3
): Promise<void> {
  return errorHandler.retry(async () => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }, retries);
}

/**
 * API 请求安全包装
 */
export async function safeAPICall<T>(
  url: string,
  fallback: T,
  timeout: number = 5000
): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn(`[safeAPICall] API call failed: ${url}`, error);
    errorHandler.captureError(
      error instanceof Error ? error : new Error(String(error)),
      'api',
      { url }
    );
    return fallback;
  }
}
