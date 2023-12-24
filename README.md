# String interpolate utility

A small String interpolate utility. Use it to replace tags within template strings using one or more Objects for replacements.

The interpolator is an Object containing two methods: `interpolate` and `interpolateClear`.

`interpolateClear` fills missing replacement values with a given string (may be empty), `interpolate` leaves such missing replacement values untouched.

**Note** the `interpolate` function is embedded in [es-string-fiddler](https://github.com/KooiInc/es-string-fiddler) (exposed as `[string].format`).

## Syntax 
- `interpolate( String2Interpolate, Object[, Object, ...] )` 
- `interpolateClear( String2Interpolate, Object[, Object, ...] )`
- `const myInterpolator = interpolateFactory( [default replacement string value] )`

Where `String2Interpolate` contains replacement keys between accolades, e.g. `"Hello {name}"`.
The parameter(s) can be either a number of key-value pairs (e.g. `{name: "Pete", [name: "Mary"], ...}`)
or one key-value paire, where replacement values are arrays (e.g. `{name: ["Pete", ["Charlotte", ...]}`).  
Multiple replacement values result in multiple strings.

### Import as module using (for example)

```javascript
<script type="module">
  import { interpolate, interpolateClear, } 
    from "https://kooiinc.github.io/StringInterpolator/Interpolate.module.js";
  // do stuff with it
</script>  
```

### Load as `window.interpolate` using (for example)

```javascript
<script src="https://kooiinc.github.io/StringInterpolator/Interpolate.browser.js" >
  // copy interpolate from the global (window) namespace
  const { interpolate, interpolateClean } = window.interpolator;
  // do stuff with it
</script>  
```

## Example

```javascript
// retrieved as browser script
const { interpolate, } = window.interpolator;

const row = `<tr><td> {cell1} </td><td> {cell2} </td><td> {cell3} </td>`;
const table = `<table><tr><th>first</th><th>second</th><th>third</th><tbody> {rows} </tbody></table>`;
const rowReplacements = [
  {cell1: `row1 cell 1`, cell2: `row1 cell 2`, cell3: `row1 cell 2`},
  {cell1: `row2 cell 1`, cell2: `row2 cell 2`, cell3: `row2 cell 2`},
  {cell1: `row3 cell 1`, cell2: `row3 cell 2`, cell3: `row3 cell 2`},
  // ... etc
];
document.body
  .insertAdjacentHTML(`beforeend`, interpolate(table, { rows: interpolate(row, ...rowReplacements) }) );
```
Example @[Stackblitz](https://stackblitz.com/edit/web-platform-ehwrsp?file=script.js). Result

![image](https://github.com/KooiInc/StringInterpolator/assets/836043/034d5b9c-8247-4f69-af76-503594ec6622)


