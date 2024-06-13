import IS from "https://cdn.jsdelivr.net/gh/KooiInc/typeofAnything@latest/typofany.module.min.js";
const interpolateDefault = interpolateFactory(null);
const interpolateClear = interpolateFactory(``);

Object.defineProperties(String.prototype, {
  [Symbol.for(`interpolate`)]: { value(...args) { return interpolateDefault(this, ...args); } },
  [Symbol.for(`interpolate$`)]: { value(...args) { return interpolateClear(this, ...args); } },
} );

export {
  interpolateDefault as default,
  interpolateClear,
  interpolateFactory,
};

function interpolateFactory(defaultReplacer = "") {
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