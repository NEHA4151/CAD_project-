/**
 * AWS API Gateway & CloudWatch Integration Service
 * Strong binding client for API Gateway endpoints and CloudWatch request correlation
 */

const rawEnvUrl = (
  process.env.REACT_APP_API_GATEWAY_URL ||
  process.env.REACT_APP_API_URL ||
  'https://vqnuqztcn7.execute-api.ap-south-1.amazonaws.com'
).trim().replace(/\/+$/, '');

// Extract base origin if env var contains specific route suffix like /api/signup
const API_GATEWAY_BASE_URL = rawEnvUrl.replace(/\/api\/(signup|login|data|user).*$/i, '');

/**
 * Generate a unique correlation ID for CloudWatch log tracing
 */
function generateCorrelationId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `pft-fe-${timestamp}-${randomStr}`;
}

/**
 * CloudWatch Telemetry and Error Reporter
 * Formats client logs for CloudWatch / API Gateway ingestion
 */
export function logToCloudWatch(level, message, meta = {}) {
  const logEvent = {
    timestamp: new Date().toISOString(),
    source: 'pft-react-frontend',
    level: level.toUpperCase(),
    message,
    apiGatewayUrl: API_GATEWAY_BASE_URL,
    userAgent: navigator.userAgent,
    ...meta,
  };

  console.log(`[CloudWatch Tracing - ${logEvent.level}]`, logEvent);

  // Send client metric/error report asynchronously to API Gateway log endpoint if available
  if (level === 'error' || level === 'warn') {
    try {
      fetch(`${API_GATEWAY_BASE_URL}/api/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEvent),
      }).catch(() => {
        // Silently handle if /api/logs endpoint isn't listening yet
      });
    } catch (e) {
      // Ignore transport errors during logging
    }
  }

  return logEvent;
}

/**
 * Format payload body into CORS-safelisted application/x-www-form-urlencoded string
 * Bypasses missing OPTIONS preflight CORS headers on AWS API Gateway
 */
function formatFormBody(body) {
  if (!body) return null;
  let parsed = body;
  if (typeof body === 'string') {
    try {
      parsed = JSON.parse(body);
    } catch (e) {
      return body;
    }
  }
  if (typeof parsed === 'object' && parsed !== null) {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(parsed)) {
      if (val !== undefined && val !== null) {
        params.append(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
      }
    }
    return params.toString();
  }
  return String(body);
}

/**
 * Core Request handler for AWS API Gateway
 */
async function request(endpoint, options = {}) {
  const correlationId = generateCorrelationId();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Format target API Gateway URL cleanly handling potential '/api' duplication
  let fullUrl;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    fullUrl = endpoint;
  } else {
    let base = API_GATEWAY_BASE_URL;
    let path = cleanEndpoint;
    if (base.endsWith('/api') && path.startsWith('/api/')) {
      path = path.replace(/^\/api/, '');
    }
    fullUrl = `${base}${path}`;
  }

  const method = (options.method || 'GET').toUpperCase();
  const isFormMethod = ['POST', 'PUT', 'PATCH'].includes(method);

  const defaultHeaders = {
    'Accept': 'application/json',
  };

  if (isFormMethod) {
    defaultHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  let formattedBody = options.body;
  if (isFormMethod && options.body) {
    formattedBody = formatFormBody(options.body);
  }

  const config = {
    ...options,
    body: formattedBody,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  logToCloudWatch('info', `API Gateway Request: ${method} ${cleanEndpoint}`, {
    correlationId,
    endpoint: cleanEndpoint,
    url: fullUrl,
  });

  try {
    const response = await fetch(fullUrl, config);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      let errorMessage = errorBody.error || errorBody.message;
      if (!errorMessage && errorBody.details) {
        errorMessage = Array.isArray(errorBody.details) ? errorBody.details.join(', ') : errorBody.details;
      }
      if (!errorMessage) {
        errorMessage = `HTTP ${response.status} ${response.statusText}`;
      }

      logToCloudWatch('error', `API Gateway Request Failed: ${method} ${cleanEndpoint}`, {
        correlationId,
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
      });

      const err = new Error(errorMessage);
      err.status = response.status;
      err.correlationId = correlationId;
      throw err;
    }

    logToCloudWatch('info', `API Gateway Response OK: ${method} ${cleanEndpoint}`, {
      correlationId,
      status: response.status,
    });

    return response;
  } catch (err) {
    if (err.name === 'TypeError' || err.message === 'Failed to fetch') {
      logToCloudWatch('error', `API Gateway Unreachable (${fullUrl}): ${err.message}`, { correlationId });
      throw new Error(`Unable to connect to AWS API Gateway (${API_GATEWAY_BASE_URL}). Please check your internet connection.`);
    }
    throw err;
  }
}

export const apiGateway = {
  baseUrl: API_GATEWAY_BASE_URL,
  get: (endpoint, headers = {}) => request(endpoint, { method: 'GET', headers }),
  post: (endpoint, body, headers = {}) => request(endpoint, { method: 'POST', body, headers }),
  put: (endpoint, body, headers = {}) => request(endpoint, { method: 'PUT', body, headers }),
  delete: (endpoint, headers = {}) => request(endpoint, { method: 'DELETE', headers }),
  logToCloudWatch,
};

export default apiGateway;
