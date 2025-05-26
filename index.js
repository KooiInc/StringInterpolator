import IS
  from "https://cdn.jsdelivr.net/gh/KooiInc/typeofAnything@latest/typeofany.module.min.js";

const interpolateDefault = interpolateFactory(null);
const interpolateClear = interpolateFactory(``);

/**
 * Extend String.prototype using the above two
 * interpolate methods.
 * Note: Symbols are unique, so there is no risk the
 * methods overwrite things in other ES libraries.
 */
Object.defineProperties(String.prototype, {
  [Symbol.for(`interpolate`)]: { value(...args) { return interpolateDefault(this, ...args); } },
  [Symbol.for(`interpolate$`)]: { value(...args) { return interpolateClear(this, ...args); } },
} );

export {
  interpolateDefault as default,
  interpolateClear,
  interpolateFactory,
};

/**
 * Factory function to create an interpolate function with a default replacer.
 * @param {string|number} defaultReplacer - Default value to use for missing tokens.
 * @returns {Function} - The interpolation function.
 */
function interpolateFactory(defaultReplacer = "") {
  defaultReplacer = IS(defaultReplacer, String, Number) ?
    String(defaultReplacer) : undefined;
  
  /**
   * Main interpolation function.
   * @param {string} str - The string with placeholders.
   * @param {...object} tokens - Objects containing replacement values.
   * @returns {string} - The interpolated string.
   */
  return function(str, ...tokens) {
    return interpolate(str, processTokens(tokens));
  }
  
  /**
   * Handle invalid keys by returning the default replacer or the key in braces.
   * @param {string} key - The placeholder key.
   * @param {boolean} keyExists - Flag indicating if the key exists in the token.
   * @returns {string} - The replacement value.
   */
  function invalidate(key, keyExists) {
    if (keyExists && IS(defaultReplacer, String, Number)) {
      return String(defaultReplacer);
    }
    
    return `{${key}}`;
  }
  
  /**
   * Get the replacement value for a key from the token.
   * @param {string} key - The placeholder key.
   * @param {object} token - The token object containing replacement values.
   * @returns {string} - The replacement value.
   */
  function replacement(key, token) {
    const isValid = key in token;
    return isValid && IS(token[key], String, Number) ? String(token[key]) : invalidate(key, isValid);
  }
  
  /**
   * Create a lambda function for replacing placeholders in the string.
   * @param {object} token - The token object containing replacement values.
   * @returns {Function} - The replacer lambda function.
   */
  function getReplacerLambda(token) {
    return (...args) => {
      const replacementObject = args.find(a => a.key);
      return replacement((replacementObject ? replacementObject.key : `_`), token);
    };
  }
  
  /**
   * Replace placeholders in the string with values from the token.
   * @param {string} str - The string with placeholders.
   * @param {object} token - The token object containing replacement values.
   * @returns {string} - The interpolated string.
   */
  function replace(str, token) {
    return str.replace(/\{(?<key>[a-z_\d]+)}/gim, getReplacerLambda(token));
  }
  
  /**
   * Convert token object to array of token Objects
   * when it's values are arrays of values.
   * @param {object} tokenObject - The token object containing arrays of values.
   * @returns {object[]} - Array of token objects.
   */
  function convertTokensFromArrayValues(tokenObject) {
    const converted = [];
    
    Object.entries(tokenObject).forEach(([key, value]) => {
      value.forEach((v, i) => (converted[i] ??= {}, converted[i][key] = v));
    });
    
    return converted;
  }
  
  /**
   * Check if single token and its values are arrays.
   * @param {object[]} tokens - The tokens to check.
   * @returns {boolean} - True if tokens contains one Object
   *  and all it's values are of type Array.
   */
  function isMultiLineWithArrays(tokens) {
    return tokens.length === 1 && Object.values(tokens[0]).every(Array.isArray);
  }
  
  /**
   * Process tokens to handle multi-line formats.
   * @param {object[]} tokens - The tokens to process.
   * @returns {object[]} - Processed tokens.
   */
  function processTokens(tokens) {
    return isMultiLineWithArrays(tokens) ? convertTokensFromArrayValues(tokens[0]) : tokens;
  }
  
  /**
   * Interpolate the string with the given tokens.
   * @param {string} str - The string with placeholders.
   * @param {object[]} tokens - The tokens containing replacement values.
   * @returns {string} - The interpolated string.
   */
  function interpolate(str, tokens) {
    return !tokens?.length ? str : tokens
      .filter(token => token)
      .map((token, i) => IS(token, Object) ? replace(str, {...token, index: `${i+1}`}) : ``)
      .join(``);
  }
}
