const interpolate = interpolateFactory(null);
const interpolateClear = interpolateFactory(``);
export default { interpolate, interpolateClear, interpolateFactory };

function interpolateFactory(defaultReplacer) {
  const isStringOrNumber = v => [String, Number].find(vv => vv === Object.getPrototypeOf( v ?? {} )?.constructor);
  const isObject = v => Object.getPrototypeOf( v ?? `` )?.constructor === Object;
  const invalidate = key => String(defaultReplacer ?? `{${key}}`);
  const replacement = (key, t) => !isStringOrNumber(t[key]) ? invalidate(key) : String(t[key]);
  const replacer = token => (...args) => replacement( args.find(a => a.key).key ?? `_`, token );
  const replace = (str, token) => str.replace( /\{(?<key>[a-z_\d]+)}/gim, replacer(token) );
  const mergeToken = obj => {
    const entries = Object.entries(obj);
    const [key, values] = entries.shift();
    const merged = values.reduce( (acc, v) => [...acc, {[key]: v}], []);
    entries.forEach( ([key, value]) => value.forEach( (v, i) =>  merged[i][key] = `${v}`));
    return merged;  };
  const isMultiLineWithArrays = (...tokens) =>
    tokens.length === 1 && Object.values(tokens[0]).filter(v => !Array.isArray(v)).length < 1;
  const processTokens = (...tokens) => isMultiLineWithArrays(...tokens) ? mergeToken(tokens.shift()) : tokens;
  const interpolate = (str, ...tokens) => tokens.flat()
    .reduce( (acc, token) => acc.concat(!isObject(token) ? `` : replace(str, token )), ``);
  
  return (str, ...tokens) => interpolate(str, ...processTokens(...tokens));
}