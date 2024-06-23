const { IS } = initializeTOA();
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

window.interpolate = {
  default: interpolateDefault,
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
      const keyArg = args.find(a => a.key);
      return replacement((keyArg ? keyArg.key : `_`), token);
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
      .map(token => IS(token, Object) ? replace(str, token) : ``)
      .join(``);
  }
}

function TOAFactory() {
  const proxySymbol = Symbol.for('proxied');
  
  return { IS, maybe, typeOf, createWrappedProxy, extendObject: addSymbols2Object };
  
  function IS(anything, ...shouldBe) {
    const input = typeof anything === `symbol` ? Symbol('any') : anything;
    return shouldBe.length > 1 ? ISOneOf(input, ...shouldBe) : determineType(input, ...shouldBe);
  }
  
  function typeOf(anything) {
    if (anything?.[proxySymbol]) {
      return 'Proxy';
    }
    
    return IS(anything);
  }
  
  function determineType(input, ...shouldBe) {
    let {compareWith, inputIsNothing, shouldBeIsNothing, inputCTOR, is_NAN, is_Infinity} = getVariables(input, ...shouldBe);
    
    if (is_NAN) {
      return shouldBe.length
        ? maybe({trial: _ => String(compareWith), whenError: _ => `-`}) === String(input)
        : `NaN`
    }
    
    if (is_Infinity) {
      return shouldBe.length
        ? maybe({trial: _ => String(compareWith), whenError: _ => `-`}) === String(input)
        : `Infinity`
    }
    
    if (inputIsNothing || shouldBeIsNothing) {
      return shouldBeIsNothing
        ? String(input) === String(compareWith)
        : !compareWith
          ? String(input)
          : false;
    }
    
    if (inputCTOR === Boolean) {
      return !compareWith ? `Boolean` : !!(inputCTOR === compareWith);
    }
    
    return getResult(input, compareWith, getMe(input, inputCTOR));
  }
  
  function getMe(input, inputCTOR) {
    return input === 0
      ? Number : input === ``
        ? String : !input
          ? {name: String(input)} : inputCTOR;
  }
  
  function getVariables(input, ...shouldBe) {
    const sbLen = shouldBe.length > 0;
    const compareWith = sbLen && shouldBe.shift();
    const inputIsNothing = isNothing(input);
    const shouldBeIsNothing = sbLen && isNothing(compareWith);
    const inputCTOR = !inputIsNothing && Object.getPrototypeOf(input)?.constructor;
    const is_NAN = maybe({trial: _ => String(input), whenError: _ => `-`}) === `NaN`;
    const is_Infinity = maybe({trial: _ => String(input), whenError: _ => `-`}) === `Infinity`;
    
    return {compareWith, inputIsNothing, shouldBeIsNothing, inputCTOR, is_NAN, is_Infinity};
  }
  
  function getResult(input, shouldBeCTOR, me) {
    if (input[proxySymbol] && shouldBeCTOR === Proxy) {
      return shouldBeCTOR === Proxy;
    }
    
    if (maybe({trial: _ => String(shouldBeCTOR), whenError: _ => `-`}) === `NaN`) {
      return String(input) === `NaN`;
    }
    
    return shouldBeCTOR
      ? maybe({
        trial: _ => !!(input instanceof shouldBeCTOR),
        whenError: _ => false
      }) ||
      shouldBeCTOR === me ||
      shouldBeCTOR === Object.getPrototypeOf(me) ||
      `${shouldBeCTOR?.name}` === me?.name
      : me?.name;
  }
  
  function ISOneOf(obj, ...params) {
    for (const param of params) {
      if (IS(obj, param)) {
        return true;
      }
    }
    return false;
  }
  
  function isNothing(maybeNothing) {
    return maybe({
      trial: _ => /^(undefined|null)$/.test(String(maybeNothing)),
      whenError: _ => false
    });
  }
  
  function maybe({trial, whenError = err => console.log(err)} = {}) {
    if (!trial || !(trial instanceof Function)) {
      console.info(`TypeofAnything {maybe}: trial parameter not a Function or Lambda`);
      return false;
    }
    
    try {
      return trial();
    } catch (err) {
      return whenError(err);
    }
  }
  
  function createWrappedProxy(fromObj, traps) {
    const originalGetterTrap = traps.get ?? function (target, key) {
      return target[key];
    };
    traps.get = function (target, key) {
      return !(key in target)
        ? `Proxy`
        : originalGetterTrap(target, key);
    };
    fromObj[proxySymbol] = true;
    return new Proxy(fromObj, traps);
  }
  
  function $XFactory(isSymbol, typeSymbol) {
    return function (someObj) {
      return Object.freeze({
        get [typeSymbol]() { return typeOf(someObj); },
        get type() { return typeOf(someObj); },
        [isSymbol](...args) { return IS(someObj, ...args); },
        is(...args) { return IS(someObj, ...args); }
      });
    }
  }
  
  function addSymbols2Object({is = `is`, type = `type`} = {}) {
    const isSymbol = Symbol(`toa.${is}`);
    const typeSymbol = Symbol(`toa.${type}`);
    
    // prototypal
    if (!Object.getOwnPropertyDescriptors(Object.prototype)[isSymbol]) {
      Object.defineProperties(Object.prototype, {
        [typeSymbol]: {
          get() { return typeOf(this); },
          enumerable: true,
        },
        [isSymbol]: {
          value: function (...args) { return IS(this, ...args); },
          enumerable: true,
        },
      });
      
      // static
      Object.defineProperties(Object, {
        [typeSymbol]: {
          value(obj) { return typeOf(obj); },
          enumerable: true,
        },
        [isSymbol]: {
          value: function (obj, ...args) { return IS(obj, ...args); },
          enumerable: true,
        },
      });
    }
    
    return {
      $X: $XFactory(isSymbol, typeSymbol),
      get is() {  return isSymbol; },
      get type() { return typeSymbol; },
    };
  }
}