/**
 * Logger unifié pour l'application
 * Simplifie le passage à un logger professionnel (winston/pino) plus tard
 */

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Formate un message de log avec timestamp
 */
const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
};

export const logger = {
  info: (message, meta = {}) => {
    console.log(formatMessage('info', message, meta));
  },

  error: (message, error = null, meta = {}) => {
    const errorMeta = error ? { ...meta, error: error.message, stack: error.stack } : meta;
    console.error(formatMessage('error', message, errorMeta));
  },

  warn: (message, meta = {}) => {
    console.warn(formatMessage('warn', message, meta));
  },

  debug: (message, meta = {}) => {
    if (isDev) {
      console.debug(formatMessage('debug', message, meta));
    }
  },

  success: (message, meta = {}) => {
    console.log(`✅ ${formatMessage('success', message, meta)}`);
  }
};
