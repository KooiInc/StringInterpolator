const { IS } = TOAFactory();
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
function interpolateFactory(defaultReplacer) {
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
    const injected = !tokens?.length ? str : tokens
      .filter(token => IS(token, Object))
      .map((token, i) => replace(str, {...token, index: i + 1}))
      .join(``);
    
    return IS(defaultReplacer, undefined)
      ? injected : injected.replace(/\{[a-z_\d].+\}/gim, String(defaultReplacer));
  }
}


function TOAFactory() {
  Symbol.proxy = Symbol.for(`toa.proxy`);
  Symbol.is = Symbol.for(`toa.is`);
  Symbol.type = Symbol.for(`toa.type`);
  Symbol.isSymbol = Symbol.for(`toa.isASymbol`);
  addSymbols2Anything();
  const maybe = maybeFactory();
  const [$Wrap, xProxy] = [WrapAnyFactory(), setProxyFactory()];
  xProxy.custom();
  return {IS, maybe, $Wrap, isNothing, xProxy};
  
  function IS(anything, ...shouldBe) {
    if (maybe({trial: _ => `isTypes` in (shouldBe?.[0] ?? {})})) {
      const isTypeObj = shouldBe[0];
      return `defaultValue` in (isTypeObj)
        ? isOrDefault(anything, isTypeObj) : `notTypes` in isTypeObj
          ? isExcept(anything, isTypeObj) : IS(anything, ...[isTypeObj.isTypes].flat());
    }
    
    const input = typeof anything === `symbol` ? Symbol.isSymbol : anything;
    return shouldBe.length > 1 ? ISOneOf(input, ...shouldBe) : determineType(anything, ...shouldBe);
  }
  
  function typeOf(anything) {
    return anything?.[Symbol.proxy] ?? IS(anything);
  }
  
  function determineType(input, ...shouldBe) {
    let {
      noInput,
      noShouldbe,
      compareTo,
      inputCTOR,
      isNaN,
      isInfinity,
      shouldBeFirstElementIsNothing
    } = processInput(input, ...shouldBe);
    shouldBe = shouldBe.length && shouldBe[0];
    
    switch (true) {
      case shouldBeFirstElementIsNothing:
        return String(input) === String(compareTo);
      case input?.[Symbol.proxy] && noShouldbe:
        return input[Symbol.proxy];
      case isNaN:
        return noShouldbe ? `NaN` : maybe({trial: _ => String(compareTo)}) === String(input);
      case isInfinity:
        return noShouldbe ? `Infinity` : maybe({trial: _ => String(compareTo)}) === String(input);
      case noInput:
        return noShouldbe ? String(input) : String(compareTo) === String(input);
      case inputCTOR === Boolean:
        return !shouldBe ? `Boolean` : inputCTOR === shouldBe;
      default:
        return getResult(input, shouldBe, noShouldbe, getMe(input, inputCTOR));
    }
  }
  
  function getMe(input, inputCTOR) {
    return input === 0 ? Number : input === `` ? String : !input ? {name: String(input)} : inputCTOR;
  }
  
  function processInput(input, ...shouldBe) {
    const noShouldbe = shouldBe.length < 1;
    const compareTo = !noShouldbe && shouldBe[0];
    const shouldBeFirstElementIsNothing = !noShouldbe && isNothing(shouldBe[0]);
    const noInput = input === undefined || input === null;
    const inputCTOR = !noInput && Object.getPrototypeOf(input)?.constructor;
    const isNaN = Number.isNaN(input) || maybe({trial: _ => String(input) === `NaN`});
    const isInfinity = maybe({trial: _ => String(input)}) === `Infinity`;
    return {noInput, noShouldbe, compareTo, inputCTOR, isNaN, isInfinity, shouldBeFirstElementIsNothing};
  }
  
  function getResult(input, compareWith, noShouldbe, me) {
    switch(true) {
      case (!noShouldbe && compareWith === input) ||
              (input?.[Symbol.proxy] && compareWith === Proxy):
        return true;
      case maybe({trial: _ => String(compareWith)}) === `NaN`:
        return String(input) === `NaN`;
      case input?.[Symbol.toStringTag] && IS(compareWith, String):
        return String(compareWith) === input[Symbol.toStringTag];
      default:
        return compareWith
          ? maybe({trial: _ => input instanceof compareWith,}) ||
            compareWith === me || compareWith === Object.getPrototypeOf(me) ||
            `${compareWith?.name}` === me?.name
          : input?.[Symbol.toStringTag] && `[object ${input?.[Symbol.toStringTag]}]` ||
              me?.name ||
              String(me);
    }
  }
  
  function ISOneOf(obj, ...params) {
    return params.some(param => IS(obj, param));
  }
  
  function isNothing(maybeNothing, all = false) {
    let nada = maybeNothing === null || maybeNothing === undefined;
    nada = all ? nada || IS(maybeNothing, Infinity) || IS(maybeNothing, NaN) : nada;
    return nada;
  }
  
  function maybeFactory() {
    const tryFn = (maybeFn, maybeError) => maybeFn?.constructor === Function ? maybeFn(maybeError) : undefined;
    return function ({trial, whenError = () => undefined} = {}) {
      try {
        return tryFn(trial)
      } catch (err) {
        return tryFn(whenError, err)
      }
    };
  }
  
  function WrapAnyFactory() {
    return function (someObj) {
      return Object.freeze({
        get value() { return someObj; },
        get [Symbol.type]() { return typeOf(someObj); },
        get type() { return typeOf(someObj); },
        [Symbol.is](...args) { return IS(someObj, ...args); },
        is(...args) { return IS(someObj, ...args); }
      });
    }
  }
  
  function isOrDefault(input, {defaultValue, isTypes = [undefined], notTypes} = {}) {
    isTypes = isTypes?.constructor !== Array ? [isTypes] : isTypes;
    notTypes = notTypes && notTypes?.constructor !== Array ? [notTypes] : [];
    return notTypes.length < 1
      ? IS(input, ...isTypes) ? input : defaultValue
      : isExcept(input, {isTypes, notTypes}) ? input : defaultValue;
  }
  
  function isExcept(input, {isTypes = [undefined], notTypes = [undefined]} = {}) {
    isTypes = isTypes?.constructor !== Array ? [isTypes] : isTypes;
    notTypes = notTypes?.constructor !== Array ? [notTypes] : notTypes;
    return IS(input, ...isTypes) && !IS(input, ...notTypes);
  }
  
  function addSymbols2Anything() {
    if (!Object.getOwnPropertyDescriptors(Object.prototype)[Symbol.is]) {
      Object.defineProperties(Object.prototype, {
        [Symbol.type]: { get() { return typeOf(this); }, enumerable: false, configurable: false },
        [Symbol.is]: { value: function (...args) { return IS(this, ...args); }, enumerable: false, configurable: false },
      });
      Object.defineProperties(Object, {
        [Symbol.type]: { value(obj) { return typeOf(obj); }, enumerable: false, configurable: false },
        [Symbol.is]: { value: function (obj, ...args) { return IS(obj, ...args); }, enumerable: false, configurable: false },
      });
    }
  }
  
  function ctor2String(obj) {
    const str = String(Object.getPrototypeOf(obj)?.constructor);
    return str.slice(str.indexOf(`ion`) + 3, str.indexOf(`(`)).trim();
  }
  
  function modifySetter(setterMethod2Modify) {
    const oldSetter = setterMethod2Modify.set;
    setterMethod2Modify.set = (target, key, value) => {
      if (key === Symbol.proxy) {
        return target[key] = value;
      }
      
      return oldSetter(target, key, value);
    }
    
    return setterMethod2Modify;
  }
  
  function setProxyFactory() {
    const nativeProxy = Proxy;
    return {
      native() {
        Proxy = nativeProxy;
      },
      custom() {
        // adaptation of https://stackoverflow.com/a/53463589
        Proxy = new nativeProxy(nativeProxy, {
          construct(target, args) {
            for (let item of args) {
              if (item.set) {
                item = modifySetter(item);
              }
            }
            
            const wrappedProxy = new target(...args);
            wrappedProxy[Symbol.proxy] = `Proxy (${ctor2String(args[0])})`;
            return wrappedProxy;
          }
        })
      }
    }
  }
}
