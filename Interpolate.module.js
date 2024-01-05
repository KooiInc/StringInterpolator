const interpolate = interpolateFactory(null);
const interpolateClear = interpolateFactory(``);
export default { interpolate, interpolateClear, interpolateFactory };

function interpolateFactory(defaultReplacer) {
  // check type of input
  const isStringOrNumber = v => [String, Number].find(vv => vv === Object.getPrototypeOf( v ?? {} )?.constructor);
  const isObject = v => Object.getPrototypeOf( v ?? `` )?.constructor === Object;
  // when nothing to replace use default or replace with the original template token
  const invalidate = key => String(defaultReplacer ?? `{${key}}`);
  // replace when the input (t[key]) is a String or Number, otherwise see ^
  const replacement = (key, t) => !isStringOrNumber(t[key]) ? invalidate(key) : String(t[key]);
  // the String.replacer lamda
  const replacer = token => (...args) => replacement( args.find(a => a.key).key ?? `_`, token );
  // for the replacer/reduce lamda
  const replace = (str, token) => str.replace( /\{(?<key>[a-z_\d]+)}/gim, replacer(token) );
  // when tokens are in the form {key: [...values], key2: [...valkues]} merge to array 
  // of single tokens
  const mergeToken = obj => {
    const entries = Object.entries(obj);
    const [key, values] = entries.shift();
    const merged = values.reduce( (acc, v) => [...acc, {[key]: v}], []);
    entries.forEach( ([key, value]) => value.forEach( (v, i) =>  merged[i][key] = `${v}`));
    return merged;  };
  // check if input is one token in the array form  
  // ({key: [...values], key2: [...valkues]})
  const isMultiLineWithArrays = (...tokens) =>
    tokens.length === 1 && Object.values(tokens[0]).filter(v => !Array.isArray(v)).length < 1;
  // when tokens are in the form {key: [...values], key2: [...valkues]} merge them
  // otherwise just use the given tokens  
  const processTokens = (...tokens) => isMultiLineWithArrays(...tokens) ? mergeToken(tokens.shift()) : tokens;
  // the actual interpolator
  const interpolate = (str, ...tokens) => tokens.flat()
    .reduce( (acc, token) => acc.concat(!isObject(token) ? `` : replace(str, token )), ``);

  // the factory 'product'
  return (str, ...tokens) => interpolate(str, ...processTokens(...tokens));
}