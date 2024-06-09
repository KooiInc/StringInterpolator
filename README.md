# String interpolate utility

A small string interpolator/tokenizer utility. Use it to replace tags (tokens) within template strings 
using one or more Objects for replacements.

The utility default export is, a function to replace one or more tokens (`"Some string {token1}, {token2}"`) 
within a string.

The tokens are replaced using one or more objects containing the tokens to replace as keys and the
values to replace it/them with (
`[imported interpolator]("Some string {token1}, {token2}", {token1: "one"}, token2: "two"})`)).

The module also exports the `interpolateClear` function and the factory function itself named `interpolateFactory`.  
`interpolateClear` Replaces missing replacement values (e.g. `{token1: null}`) 
with a an empty string.

Besides these two functions, on initialization `String.prototype` is extended with two `Symbol`s: 
`Symbol.for("interpolate")` and `Symbol.for("interpolate$")`, the latter being the method that 
clears missing replacement values (replaces them with `""`).

An (forkable) example can be found at **[StackBlitz](https://stackblitz.com/edit/web-platform-nmqf7o?file=script.js)**.

## Syntax
- `const myInterpolator = interpolateFactory( [defaultReplacer: string (default "")] )`
- `[imported default interpolate function]( String2Interpolate: string, Object[, Object, ...] )` 
- `[imported interpolateClear function]( String2Interpolate: string, Object[, Object, ...] )`
- `"String {t1} {t2}"[Symbol.for("interpolate")](Object[, Object, ...])`
- `"String {t1} {t2}"[Symbol.for("interpolate$"](Object[, Object, ...])`

Where `String2Interpolate` contains replacement keys between accolades, e.g. `"Hello {prename} {lastname}"`.
The parameter(s) can be either 
- a number of key-value pairs<br>(e.g. `{prename: "Pete", lastName: "Johnson"}, [{prename: "Mary", lastname: "Doe"], ...}`)
- or one key-value paire, where replacement values are arrays<br>(e.g. `{prename: ["Pete", ["Charlotte", ...], lastname: ["Johnson", "Doe", ...]}`).  

Multiple replacement values result in multiple strings.

### Import as module ("Interpolate.module.js")

```javascript
<script type="module">
  import { default as interpolate, interpolateClear, } 
    from "[location of Interpolate.module.js]";
  // do stuff with it
</script>  
```

### Import as commonjs module ("Interpolate.commonjs.js")
```javascript
const interpolate = require("../Interpolate.commonjs.js").default;
// example
const hi = "hello {wrld}";
console.log(`${ [
  interpolate(hi, {wrld: "world"}),
  hi[Symbol.for("interpolate")]({wrld: `milky way`}),
  interpolate("hello {wrld}"),
].join(`\n`)}`);
```

### Load from `window.interpolate` ("Interpolate.browser.js")

```javascript
<script src="[location of Interpolate.browser.js]"></script>
<!-- example -->
<script>
  const { default: interpolate, } = window.interpolate;
  console.log( interpolate(
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
  const tokenize = Symbol.for("interpolate");
  document.body
    .insertAdjacentHTML( `beforeend`, table[tokenize]({ rows: interpolate(row, ...rowReplacements) }) );
</script>
```

The resulting `<table>` from the above example would be:
![image](https://github.com/KooiInc/StringInterpolator/assets/836043/034d5b9c-8247-4f69-af76-503594ec6622)


