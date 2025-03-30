const crypto = require('crypto');
const { URL } = require('url');

/**
 * Generate a secure, time-limited URL for accessing resources
 * @param {String} baseUrl - Base URL of the resource
 * @param {Object} options - Options for URL generation
 * @param {Number} options.expiresIn - Expiration time in seconds
 * @param {String} options.userId - User ID for access control
 * @param {String} options.resourceId - Resource ID (like image ID)
 * @returns {String} - Secure URL with authentication parameters
 */
exports.generateSecureUrl = (baseUrl, options = {}) => {
  const {
    expiresIn = 3600, // Default: 1 hour
    userId,
    resourceId
  } = options;

  // Create expiration timestamp
  const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
  
  // Create URL object
  const url = new URL(baseUrl);
  
  // Add parameters
  url.searchParams.append('expires', expiresAt);
  
  if (userId) {
    url.searchParams.append('uid', userId);
  }
  
  if (resourceId) {
    url.searchParams.append('rid', resourceId);
  }
  
  // Create signature base
  const signatureBase = `${url.pathname}?${url.searchParams.toString()}`;
  
  // Generate HMAC signature
  const hmac = crypto.createHmac('sha256', process.env.URL_SIGNING_SECRET || 'secret-key');
  hmac.update(signatureBase);
  const signature = hmac.digest('hex');
  
  // Add signature to URL
  url.searchParams.append('sig', signature);
  
  return url.toString();
};

/**
 * Verify if a secure URL is valid and not expired
 * @param {String} secureUrl - The secure URL to verify
 * @param {Object} options - Options for verification
 * @param {String} options.userId - User ID for access control
 * @returns {Boolean} - Whether the URL is valid
 */
exports.verifySecureUrl = (secureUrl, options = {}) => {
  const { userId } = options;
  
  try {
    // Parse URL
    const url = new URL(secureUrl);
    const params = url.searchParams;
    
    // Check expiration
    const expires = parseInt(params.get('expires'), 10);
    const now = Math.floor(Date.now() / 1000);
    
    if (isNaN(expires) || expires < now) {
      return false; // URL expired or invalid expiration
    }
    
    // Check user ID if provided
    if (userId && params.get('uid') !== userId) {
      return false; // User ID mismatch
    }
    
    // Get signature from URL
    const providedSignature = params.get('sig');
    params.delete('sig'); // Remove signature for verification
    
    // Recreate signature base
    const signatureBase = `${url.pathname}?${params.toString()}`;
    
    // Generate HMAC signature
    const hmac = crypto.createHmac('sha256', process.env.URL_SIGNING_SECRET || 'secret-key');
    hmac.update(signatureBase);
    const expectedSignature = hmac.digest('hex');
    
    // Compare signatures
    return providedSignature === expectedSignature;
  } catch (error) {
    console.error('URL verification error:', error);
    return false;
  }
};