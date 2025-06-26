/**
 * URL Validation Utilities for Security
 * Prevents SSRF attacks and validates external URLs
 */

export interface URLValidationOptions {
  allowedDomains?: string[];
  allowedProtocols?: string[];
  allowPrivateIPs?: boolean;
  maxRedirects?: number;
}

// Default safe configuration
const DEFAULT_OPTIONS: Required<URLValidationOptions> = {
  allowedDomains: [
    'curriculum.gov.bc.ca',
    'www.princeedwardisland.ca',
    'www.dcp.edu.gov.on.ca',
    'edu.gov.on.ca',
    'oercommons.org',
    'www.khanacademy.org',
    'www.readworks.org',
  ],
  allowedProtocols: ['https:', 'http:'],
  allowPrivateIPs: false,
  maxRedirects: 3,
};

/**
 * Validate if a URL is safe for external requests
 * Prevents SSRF attacks by checking domain whitelist and blocking private IPs
 */
export function isValidExternalURL(
  urlString: string,
  options: URLValidationOptions = {}
): { valid: boolean; error?: string; url?: URL } {
  const config = { ...DEFAULT_OPTIONS, ...options };

  try {
    const url = new URL(urlString);

    // Check protocol
    if (!config.allowedProtocols.includes(url.protocol)) {
      return {
        valid: false,
        error: `Protocol ${url.protocol} not allowed. Only ${config.allowedProtocols.join(', ')} are permitted.`,
      };
    }

    // Check if domain is in allowlist
    const isAllowedDomain = config.allowedDomains.some((domain) => {
      return url.hostname === domain || url.hostname.endsWith('.' + domain);
    });

    if (!isAllowedDomain) {
      return {
        valid: false,
        error: `Domain ${url.hostname} not in allowlist. Only trusted educational domains are permitted.`,
      };
    }

    // Check for private IP addresses if not allowed
    if (!config.allowPrivateIPs && isPrivateIP(url.hostname)) {
      return {
        valid: false,
        error: 'Private IP addresses are not allowed for security reasons.',
      };
    }

    // Check for localhost/loopback
    if (isLocalhost(url.hostname)) {
      return {
        valid: false,
        error: 'Localhost and loopback addresses are not allowed for security reasons.',
      };
    }

    return { valid: true, url };
  } catch (error) {
    return {
      valid: false,
      error: `Invalid URL format: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Check if hostname is a private IP address
 */
function isPrivateIP(hostname: string): boolean {
  // IPv4 private ranges
  const ipv4PrivateRanges = [
    /^10\./,                    // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./,              // 192.168.0.0/16
    /^169\.254\./,              // 169.254.0.0/16 (link-local)
  ];

  // IPv6 private ranges (simplified)
  const ipv6PrivateRanges = [
    /^fc00:/,                   // fc00::/7
    /^fe80:/,                   // fe80::/10 (link-local)
    /^::1$/,                    // ::1 (loopback)
  ];

  // Check IPv4
  for (const range of ipv4PrivateRanges) {
    if (range.test(hostname)) {
      return true;
    }
  }

  // Check IPv6
  for (const range of ipv6PrivateRanges) {
    if (range.test(hostname)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if hostname is localhost/loopback
 */
function isLocalhost(hostname: string): boolean {
  const localhostPatterns = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
    '0:0:0:0:0:0:0:1',
  ];

  return localhostPatterns.includes(hostname.toLowerCase());
}

/**
 * Sanitize URL input by removing dangerous characters
 */
export function sanitizeURL(url: string): string {
  return url
    .trim()
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
    .replace(/[<>"'{}|\\^`]/g, '')        // Remove dangerous characters
    .slice(0, 2048);                      // Limit length
}

/**
 * Safe fetch wrapper that validates URLs before making requests
 */
export async function safeFetch(
  urlString: string,
  init?: RequestInit,
  options?: URLValidationOptions
): Promise<Response> {
  const sanitizedUrl = sanitizeURL(urlString);
  const validation = isValidExternalURL(sanitizedUrl, options);

  if (!validation.valid) {
    throw new Error(`URL validation failed: ${validation.error}`);
  }

  // Add security headers
  const headers = new Headers(init?.headers);
  headers.set('User-Agent', 'Teaching Engine 2.0 Educational Bot (+https://teaching-engine.ca/bot)');
  
  // Set timeouts to prevent hanging requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(validation.url!, {
      ...init,
      headers,
      signal: controller.signal,
      // Prevent following redirects automatically for security
      redirect: 'manual',
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Validate file size from response headers before downloading
 */
export function validateFileSize(response: Response, maxSizeBytes: number = 50 * 1024 * 1024): boolean {
  const contentLength = response.headers.get('content-length');
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    return size <= maxSizeBytes;
  }
  // If no content-length header, we'll need to check during download
  return true;
}

/**
 * Get allowed domains for configuration display
 */
export function getAllowedDomains(): string[] {
  return [...DEFAULT_OPTIONS.allowedDomains];
}

/**
 * Add allowed domain (for admin configuration)
 */
export function addAllowedDomain(domain: string): void {
  if (!DEFAULT_OPTIONS.allowedDomains.includes(domain)) {
    DEFAULT_OPTIONS.allowedDomains.push(domain);
  }
}

/**
 * Remove allowed domain (for admin configuration)
 */
export function removeAllowedDomain(domain: string): void {
  const index = DEFAULT_OPTIONS.allowedDomains.indexOf(domain);
  if (index > -1) {
    DEFAULT_OPTIONS.allowedDomains.splice(index, 1);
  }
}