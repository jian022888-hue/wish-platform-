/**
 * 输入清洗工具 - XSS 防护
 * 
 * 这个模块提供了输入验证和清洗功能，防止 XSS 攻击。
 * 它包括：
 * - HTML 标签转义
 * - 特殊字符过滤
 * - 输入长度限制
 * - 类型验证
 */

/**
 * 转义 HTML 特殊字符，防止 XSS
 */
export function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#96;',
  };

  return text.replace(/[&<>"'`/]/g, (char) => htmlEntities[char] || char);
}

/**
 * 反转义 HTML 实体（仅在显示已保存的安全内容时使用）
 */
export function unescapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#96;': '`',
  };

  return text.replace(/&(amp|lt|gt|quot|#x27|#x2F|#96);/g, (match) => htmlEntities[match] || match);
}

/**
 * 清洗用户输入
 * - 去除首尾空格
 * - 转义 HTML 特殊字符
 * - 限制最大长度
 */
export function sanitizeInput(
  input: string,
  options: { maxLength?: number; allowNewlines?: boolean } = {}
): string {
  const { maxLength = 5000, allowNewlines = true } = options;

  if (typeof input !== 'string') {
    return '';
  }

  // 去除首尾空格
  let cleaned = input.trim();

  // 转义 HTML
  cleaned = escapeHtml(cleaned);

  // 如果允许换行，保留 \n
  if (allowNewlines) {
    cleaned = cleaned.replace(/&#x27;/g, "'").replace(/&#x2F;/g, '/').replace(/&#96;/g, '`');
  }

  // 限制长度
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
  }

  return cleaned;
}

/**
 * 验证并清洗邮箱
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  
  const cleaned = email.trim().toLowerCase();
  
  // 基本邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleaned)) {
    throw new Error('Invalid email format');
  }

  return cleaned;
}

/**
 * 验证并清洗文本（标题等短文本）
 */
export function sanitizeTitle(title: string): string {
  return sanitizeInput(title, { maxLength: 100, allowNewlines: false });
}

/**
 * 验证并清洗长文本（描述、内容等）
 */
export function sanitizeLongText(text: string): string {
  return sanitizeInput(text, { maxLength: 5000, allowNewlines: true });
}

/**
 * 验证字符串数组
 */
export function sanitizeStringArray(arr: unknown, maxLength: number = 100): string[] {
  if (!Array.isArray(arr)) {
    throw new Error('Expected an array');
  }

  return arr
    .filter((item): item is string => typeof item === 'string')
    .map((item) => sanitizeInput(item, { maxLength, allowNewlines: false }));
}

/**
 * 验证输入长度
 */
export function validateLength(
  input: string,
  options: { min?: number; max: number; fieldName?: string }
): string {
  const { min = 1, max, fieldName = 'Input' } = options;

  if (input.length < min) {
    throw new Error(`${fieldName} must be at least ${min} characters`);
  }

  if (input.length > max) {
    throw new Error(`${fieldName} must be at most ${max} characters`);
  }

  return input;
}

/**
 * 验证并清洗愿望输入
 */
export interface WishInput {
  title: string;
  description: string;
  whyImportant: string;
  currentBlocker: string;
  desiredResponseTypes: string[];
}

export function sanitizeWishInput(input: Partial<WishInput>): WishInput {
  return {
    title: sanitizeTitle(input.title || ''),
    description: sanitizeLongText(input.description || ''),
    whyImportant: sanitizeLongText(input.whyImportant || ''),
    currentBlocker: sanitizeLongText(input.currentBlocker || ''),
    desiredResponseTypes: sanitizeStringArray(input.desiredResponseTypes || [], 50),
  };
}

/**
 * 验证并清洗回应输入
 */
export interface ResponseInput {
  content: string;
  authorName: string;
  type: string;
}

export function sanitizeResponseInput(input: Partial<ResponseInput>): ResponseInput {
  return {
    content: sanitizeLongText(input.content || ''),
    authorName: sanitizeInput(input.authorName || '匿名', { maxLength: 50, allowNewlines: false }),
    type: sanitizeInput(input.type || '', { maxLength: 50, allowNewlines: false }),
  };
}
