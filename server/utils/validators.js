/**
 * Validate email format
 * @param {String} email - Email to validate
 * @returns {Boolean} - Whether email is valid
 */
exports.isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validate password strength
   * @param {String} password - Password to validate
   * @returns {Object} - Validation result with isValid and message
   */
  exports.validatePasswordStrength = (password) => {
    if (!password || password.length < 8) {
      return {
        isValid: false,
        message: 'Password must be at least 8 characters long'
      };
    }
  
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one uppercase letter'
      };
    }
  
    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one lowercase letter'
      };
    }
  
    // Check for at least one number
    if (!/\d/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one number'
      };
    }
  
    return {
      isValid: true,
      message: 'Password is strong'
    };
  };
  
  /**
   * Validate image dimensions
   * @param {Object} dimensions - Image dimensions { width, height }
   * @param {Object} options - Validation options
   * @param {Number} options.minWidth - Minimum width
   * @param {Number} options.minHeight - Minimum height
   * @param {Number} options.maxWidth - Maximum width
   * @param {Number} options.maxHeight - Maximum height
   * @returns {Object} - Validation result with isValid and message
   */
  exports.validateImageDimensions = (dimensions, options = {}) => {
    const {
      minWidth = 300,
      minHeight = 300,
      maxWidth = 5000,
      maxHeight = 5000
    } = options;
  
    const { width, height } = dimensions;
  
    if (width < minWidth || height < minHeight) {
      return {
        isValid: false,
        message: `Image is too small. Minimum dimensions are ${minWidth}x${minHeight} pixels.`
      };
    }
  
    if (width > maxWidth || height > maxHeight) {
      return {
        isValid: false,
        message: `Image is too large. Maximum dimensions are ${maxWidth}x${maxHeight} pixels.`
      };
    }
  
    return {
      isValid: true,
      message: 'Image dimensions are valid'
    };
  };
  
  /**
   * Validate image file size
   * @param {Number} fileSize - File size in bytes
   * @param {Number} maxSizeInMB - Maximum size in MB
   * @returns {Object} - Validation result with isValid and message
   */
  exports.validateImageFileSize = (fileSize, maxSizeInMB = 5) => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    
    if (fileSize > maxSizeInBytes) {
      return {
        isValid: false,
        message: `File size exceeds the maximum limit of ${maxSizeInMB}MB.`
      };
    }
  
    return {
      isValid: true,
      message: 'File size is valid'
    };
  };
  
  /**
   * Sanitize and validate prompt text
   * @param {String} prompt - User prompt
   * @param {Number} maxLength - Maximum length allowed
   * @returns {Object} - Sanitized prompt and validation result
   */
  exports.sanitizePrompt = (prompt, maxLength = 500) => {
    if (!prompt) {
      return {
        sanitized: '',
        isValid: true,
        message: 'Empty prompt will use default settings'
      };
    }
  
    // Trim whitespace
    let sanitized = prompt.trim();
    
    // Remove any potentially harmful characters
    sanitized = sanitized.replace(/[<>{}[\]\\\/]/g, '');
    
    // Check if the prompt is too long
    if (sanitized.length > maxLength) {
      return {
        sanitized: sanitized.substring(0, maxLength),
        isValid: false,
        message: `Prompt was truncated to ${maxLength} characters`
      };
    }
  
    return {
      sanitized,
      isValid: true,
      message: 'Prompt is valid'
    };
  };
  
  /**
   * Validate subscription plan ID
   * @param {String} planId - Plan ID to validate
   * @param {Array} validPlans - List of valid plan IDs
   * @returns {Boolean} - Whether plan ID is valid
   */
  exports.isValidPlanId = (planId, validPlans = ['basic', 'premium']) => {
    return validPlans.includes(planId);
  };