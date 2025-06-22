<div align="center">
  <a href="https://bundlephobia.com/package/splat-es@latest" rel="nofollow">
    <img src="https://badgen.net/bundlephobia/min/splat-es"></a>
  <a target="_blank" href="https://www.npmjs.com/package/splat-es">
    <img src="https://img.shields.io/npm/v/splat-es.svg?labelColor=cb3837&logo=npm&color=dcfdd9"></a>
</div>

## SplatES: a string templating utility

A small string templating utility. Use it to replace tags (tokens, e.g. `Hello {myToken}`) within strings
using one or more Objects for replacements (e.g. `{myToken: "world!"}`).

The utiltity exports by default a function to replace one or more tokens (`"Some string {token1}, {token2}"`)
within a string.

The tokens are replaced using one or more objects containing the tokens to replace as keys and the
values to replace it/them with (
`[imported interpolator]("Some string {token1}, {token2}", {token1: "one"}, token2: "two"})`)).

The utiltity also exports the `interpolateClear` function and
the factory function itself (named `interpolateFactory`).
`interpolateClear` clears missing replacement values (e.g. `{token1: null}`)
by replacing the tokens with a an empty string.

Besides the three exported functions, on initialization `String.prototype` is extended with two Symbols:
- `Symbol.for("interpolate")`: default interpolator
- `Symbol.for("interpolate$")`: clears missing replacement values (replaces them with `""`).

### Repository location
The repository is available at two locations: **Github** (US) and **Codeberg** (Europe).

US politics may result in precarious future US/Github policies,
which may result in the Github repository ceasing to exist in the future.

The Codeberg repository is therefore *authorative*.  

Check the **[DEMO @Codeberg](https://kooiinc.codeberg.page/splatES/Demo/)**, 
or the **[DEMO @Github](https://kooiinc.github.io/SplatES/Demo)**.

## Syntax
- `const splat = interpolateFactory( [defaultReplacer: string (default "")] )`
- `[imported default interpolate function]( String2Interpolate: string, Object[, Object, ...] )`
- `[imported interpolateClear function]( String2Interpolate: string, Object[, Object, ...] )`
- `"String {t1} {t2}"[Symbol.for("interpolate")]({t1: "value1", t2: "value2"}, [, {t1: "value1", t2: "value2"}, ...])`
- `"String {t1} {t2}"[Symbol.for("interpolate$"]({t1: "value1", t2: "value2"}, [, {t1: "value1", t2: "value2"}, ...])`

Where `String2Interpolate` contains replacement keys between accolades, e.g. `"Hello {prename} {lastname}"`.
The parameter(s) can be either
- a number of key-value pairs<br>
  (e.g. `{prename: "Pete", lastName: "Johnson"}, {prename: "Mary", lastname: "Doe"}, ...`)
- or a single `Object`, where replacement values are *Arrays*<br>
  (e.g. `{ prename: ["Pete", ["Charlotte", ...], lastname: ["Johnson", "Doe", ...]}`).

Multiple replacement values result in multiple strings.

To sum up: `SplatES` replaces tokens (`{mytoken}`) in a string with one or more values
from one or more replacement Object(s) (`{myToken: "replacement value"}, [...]`).

## Importing/loading
**_Note_**: The module is also available as [npm package](https://www.npmjs.com/package/splat-es) (***splat-es***).

### Import as module ("Interpolate.module.js")

```html
<script type="module">
  import { default as splat, interpolateClear, } 
    from "[path/to]/Interpolate.module.js]";
  // do stuff with it
</script>  
```

### Import in nodejs ("Interpolate.node.js")
_**First**_: install the package (`npm install` from the location of `Interpolate.node.js`,
or use the npm package: `npm i es-string-interpolator`)

```javascript
import {default as splat/*[, interpolateClear, interpolateFactory] */}
  from "[path/to]/Interpolate.node.js]";
// example
const hi = "hello {wrld}";
console.log(`${[
  splat(hi, {wrld: "world"}),
  hi[Symbol.for("interpolate")]({wrld: `milky way`}),
  splat("hello {wrld}"),
].join(`\n`)}`);
```

### Load from `window.interpolate` ("Interpolate.browser.js")

```html
<script src="[path/to]/Interpolate.browser.js]"></script>
<!-- example -->
<script>
  const { default: splat, } = window.interpolate;
  console.log( splat(
    "Hello {wrld}\n",
    {wrld: "world"},
    {wrld: "milky way"},
    {wrld: "universe"} ) );
  
  // create a table
  const row = `<tr><td> {cell1} </td><td> {cell2} </td><td> {cell3} </td>`;
  const table = `<table><tr><th>first</th><th>second</th><th>third</th><tbody> {rows} </tbody></table>`;
  const rowReplacements = [
  {cell1: `row1 cell 1`, cell2: `row1 cell 2`, cell3: `row1 cell 2`},
  {cell1: `row2 cell 1`, cell2: `row2 cell 2`, cell3: `row2 cell 2`},
  {cell1: `row3 cell 1`, cell2: `row3 cell 2`, cell3: `row3 cell 2`},
  // ... etc
  ];
  // use symbolic String extension (Symbol.for("interpolate") assigned as 'tokenize')
  const splatMe = Symbol.for("interpolate");
  document.body
    .insertAdjacentHTML( `beforeend`, table[splatMe]({ rows: row[splatMe](...rowReplacements) }) );
</script>
```

A resulting `<table>` from the above example could be:<br>
![image](https://github.com/KooiInc/StringInterpolator/assets/836043/034d5b9c-8247-4f69-af76-503594ec6622)
