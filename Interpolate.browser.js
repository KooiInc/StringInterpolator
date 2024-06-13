window.typeofAny = { IS, typeOf, maybe, createWrappedProxy, extendObject: createWrappedProxy };

const proxySymbol = Symbol.for('proxied');

function IS(anything, ...shouldBe) {
  const input =  typeof anything === `symbol` ? Symbol('any') : anything;
  return shouldBe.length > 1 ? ISOneOf(input, ...shouldBe) : determineType(input, ...shouldBe);
}

function typeOf(anything) {
  if (anything?.[proxySymbol]) {
    return 'Proxy';
  }
  
  return IS(anything);
}

function determineType(input, ...shouldBe) {
  let { compareWith, inputIsNothing, shouldBeIsNothing, inputCTOR, is_NAN } = getVariables(input, ...shouldBe);
  
  if (is_NAN) {
    return compareWith
      ? maybe({trial:  _ => String(compareWith), whenError: _ => `-`}) === String(input)
      : `NaN`
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
  
  return { compareWith, inputIsNothing, shouldBeIsNothing, inputCTOR, is_NAN };
}

function getResult(input, shouldBe, me) {
  if (input[proxySymbol] && shouldBe === Proxy) {
    return shouldBe === Proxy;
  }
  
  if (maybe({trial:  _ => String(shouldBe), whenError: _ => `-`}) === `NaN`) {
    return String(input) === `NaN`;
  }
  
  return shouldBe
    ? maybe({
      trial: _ => !!(input instanceof shouldBe),
      whenError: _ => false } ) ||
    shouldBe === me ||
    shouldBe === Object.getPrototypeOf(me) ||
    `${shouldBe?.name}` === me?.name
    : me?.name;
}

function ISOneOf(obj, ...params) {
  for (const param of params) {
    if (IS(obj, param))  { return true; }
  }
  return false;
}

function isNothing(maybeNothing) {
  return maybe({
    trial: _ => /^(undefined|null)$/.test(String(maybeNothing)),
    whenError: _ => false });
}

function maybe({trial, whenError = err => console.log(err) } = {}) {
  if (!trial || !(trial instanceof Function)) {
    console.info(`TypeofAnything {maybe}: trial parameter not a Function or Lambda`);
    return false;
  }
  
  try { return trial(); } catch(err) { return whenError(err); }
}

function createWrappedProxy(fromObj, traps) {
  const originalGetterTrap = traps.get ?? function(target, key) { return target[key]; };
  traps.get = function(target, key) {
    return !(key in target)
      ? `Proxy`
      : originalGetterTrap(target, key);
  };
  fromObj[proxySymbol] = true;
  return new Proxy(fromObj, traps);
}

function addSymbols2Object({is = `is`, type = `type`} = {}) {
  //                       ^ Note: can be different Symbol names
  
  const isSymbol = Symbol(`toa.${is}`);
  const typeSymbol = Symbol(`toa.${type}`);
  
  // static methods for Object
  // Object[is]/[type] can be used for null/undefined
  Object[typeSymbol] = typeOf;
  Object[isSymbol] = function(anything, ...args) {
    return maybe( {
      trial: _ => {
        if (args.length < 1) { throw new TypeError(`nothing to compare to!`); }
        
        return IS(anything, ...args);
      },
      whenError: err => {
        console.error(`[Object.isTypeOf] for input ${anything} (type: ${typeOf(anything)})\n  ${err.stack}`);
        return false;
      }
    });
  }
  
  function $X(someObj) {
    return  Object.freeze( {
      get [typeSymbol]() { return typeOf(someObj)},
      get type() { return typeOf(someObj)},
      [isSymbol](...args) { return IS(someObj, ...args); },
      is(...args) { return IS(someObj, ...args); }
    });
  }
  
  if (!Object.getOwnPropertyDescriptors(Object.prototype)[isSymbol]) {
    Object.defineProperties(Object.prototype, {
      [typeSymbol]: { get() { return typeOf(this); }, enumerable: true },
      [isSymbol]: { value: function(...args) { return IS(this, ...args); }, enumerable: true },
    });
  }
  
  return {
    // $X or Object[is]/[type] can be used for null/undefined
    $X,
    get is() { return isSymbol; },
    get type() { return typeSymbol; },
  };
}

// Interpolator here

const interpolateDefault = interpolateFactory(null);
const interpolateClear = interpolateFactory(``);

Object.defineProperties(String.prototype, {
  [Symbol.for(`interpolate`)]: { value(...args) { return interpolateDefault(this, ...args); } },
  [Symbol.for(`interpolate$`)]: { value(...args) { return interpolateClear(this, ...args); } },
} );

window.interpolate = {
  default: interpolateDefault,
  interpolateClear,
  interpolateFactory,
};function interpolateFactory(defaultReplacer = "") {
  defaultReplacer = IS(defaultReplacer, String, Number) ?
    String(defaultReplacer) : undefined;
  
  return function(str, ...tokens) {
    return interpolate(str, processTokens(tokens));
  }
  
  function invalidate(key, keyExists) {
    if (keyExists && IS(defaultReplacer, String, Number)) {
      return String(defaultReplacer);
    }
    
    return `{${key}}`;
  }
  
  function replacement(key, token) {
    const isValid = key in token;
    return isValid && IS(token[key], String, Number) ? String(token[key]) : invalidate(key, isValid);
  }
  
  function getReplacerLambda(token) {
    return (...args) => {
      const keyArg = args.find(a => a.key);
      return replacement((keyArg ? keyArg.key : `_`), token);
    };
  }
  
  function replace(str, token) {
    return str.replace(/\{(?<key>[a-z_\d]+)}/gim, getReplacerLambda(token));
  }
  
  function mergeTokensFromArrayValues(tokenObject) {
    const merged = [];
    
    Object.entries(tokenObject).forEach(([key, value]) => {
      value.forEach((v, i) => (merged[i] ??= {}, merged[i][key] = v));
    });
    
    return merged;
  }
  
  function isMultiLineWithArrays(tokens) {
    return tokens.length === 1 && Object.values(tokens[0]).every(Array.isArray);
  }
  
  function processTokens(tokens) {
    return isMultiLineWithArrays(tokens) ? mergeTokensFromArrayValues(tokens[0]) : tokens;
  }
  
  function interpolate(str, tokens) {
    return !tokens?.length ? str : tokens
      .filter(token => token)
      .map(token => IS(token, Object) ? replace(str, token) : ``)
      .join(``);
  }
}