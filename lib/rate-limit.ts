/**
 * 速率限制中间件
 * 
 * 实现简单的内存速率限制器，防止 API 被滥用。
 * 使用滑动窗口算法，每个 IP 地址独立计数。
 * 
 * 在生产环境中，应该使用 Redis 或其他分布式存储来替代内存存储。
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number;    // 窗口时间（毫秒）
  max: number;         // 窗口内最大请求数
}

// 内存存储（生产环境应使用 Redis）
const store = new Map<string, RateLimitEntry>();

/**
 * 创建速率限制器
 */
export function createRateLimiter(config: RateLimitConfig) {
  return {
    /**
     * 检查是否超过速率限制
     */
    isRateLimited(identifier: string): boolean {
      const now = Date.now();
      const entry = store.get(identifier);

      // 如果记录不存在或已过期，创建新记录
      if (!entry || now > entry.resetTime) {
        store.set(identifier, {
          count: 1,
          resetTime: now + config.windowMs,
        });
        return false;
      }

      // 增加计数
      entry.count += 1;

      // 检查是否超过限制
      if (entry.count > config.max) {
        return true;
      }

      return false;
    },

    /**
     * 获取剩余请求数
     */
    getRemaining(identifier: string): number {
      const now = Date.now();
      const entry = store.get(identifier);

      if (!entry || now > entry.resetTime) {
        return config.max;
      }

      return Math.max(0, config.max - entry.count);
    },

    /**
     * 重置指定标识符的限制
     */
    reset(identifier: string): void {
      store.delete(identifier);
    },

    /**
     * 清理过期记录
     */
    cleanup(): void {
      const now = Date.now();
      for (const [key, entry] of store.entries()) {
        if (now > entry.resetTime) {
          store.delete(key);
        }
      }
    },
  };
}

/**
 * 预定义的速率限制配置
 */
export const rateLimiters = {
  // 登录接口：每 15 分钟最多 5 次
  login: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
  }),

  // 创建愿望：每小时最多 10 次
  createWish: createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 10,
  }),

  // 提交回应：每小时最多 20 次
  createResponse: createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 20,
  }),

  // AI 整理：每小时最多 10 次
  aiRefine: createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 10,
  }),

  // AI 聊天：每分钟最多 10 次
  aiChat: createRateLimiter({
    windowMs: 60 * 1000,
    max: 10,
  }),

  // 通用 API：每分钟最多 100 次
  general: createRateLimiter({
    windowMs: 60 * 1000,
    max: 100,
  }),
};

/**
 * 定期清理过期记录（每 10 分钟）
 */
setInterval(() => {
  Object.values(rateLimiters).forEach((limiter) => limiter.cleanup());
}, 10 * 60 * 1000);
