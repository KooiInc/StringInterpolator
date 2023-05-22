window.interpolateFactory = () => {
  const {isStringOrNumber, isObject, invalidate, replacement, replacer, replace} = { 
    isStringOrNumber: v => [String, Number].find(type => Object.getPrototypeOf( v ?? ``)?.constructor === type),
    isObject: v => Object.getPrototypeOf( v ?? ``)?.constructor === Object,
    invalidate: (defaultReplacer, key) => defaultReplacer ?? `{${key}}`,
    replacement: (key, t, defaultReplacer) => 
      !isStringOrNumber(t[key]) || (!defaultReplacer && `${t[key]}`.trim() === ``)
        ? invalidate(defaultReplacer, key) : t[key] ?? invalidate(defaultReplacer, key),
    replacer: (token, defaultReplacer) => (...args) => 
      replacement( args.find(a => a.key).key ?? `_`, token, defaultReplacer ),
    replace: (str, token, defaultReplacer) => 
      str.replace( /\{(?<key>[a-z_\d]+)}/gim, replacer(token, defaultReplacer) ),
  };
  const interpolate = (str, defaultReplacer = undefined, ...tokens) => tokens.flat()
    .reduce( (acc, token) => acc.concat(!isObject(token) ? `` : replace(str, token, defaultReplacer )), ``);

  return {
    default: (str, ...tokens) => interpolate(...[str,,...tokens]),
    clearInvalidUsing:  (str, defaultReplacementValue = ``, ...tokens) => interpolate(str, defaultReplacementValue, ...tokens),
  }
}
