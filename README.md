# StringInterpolator

A small String interpolate utility. Use it to interpolate strings using a single Object or an Array of Objects.

Syntax: `interpolate( String, ...[Object])`

Import as module using (for example)

```javascript
<script type="module">
  import interpolate from "https://kooiinc.github.io/StringInterpolator/Interpolate.module.js";
  // do stuff with it
</script>  
```

Load as `window.interpolate` using (for example)

```javascript
<script src="https://kooiinc.github.io/StringInterpolator/Interpolate.browser.js" >
  // copy interpolate from the global (window) namespace
  const interpolate = window.interpolate;
  // if you don't want to pollute [window]
  delete window.interpolate;
  // do stuff with it
</script>  
```

## Example

```javascript
// retrieved as browser script
const { interpolate, } = window.interpolate;
delete window.interpolate;

const row = `<tr><td> {cell1} </td><td> {cell2} </td><td> {cell3} </td>`;
const table = `<table><tr><th>first</th><th>second</th><th>third</th><tbody> {rows} </tbody></table>`;
const rowReplacements = [
  {cell1: `row1 cell 1`, cell2: `row1 cell 2`, cell3: `row1 cell 2`},
  {cell1: `row2 cell 1`, cell2: `row2 cell 2`, cell3: `row2 cell 2`},
  {cell1: `row3 cell 1`, cell2: `row3 cell 2`, cell3: `row3 cell 2`},
  // ... etc
];
document.body.insertAdjacentHTML(`beforeend`, interpolate(table, { rows: interpolate(row, ...rowReplacements) }) );
```
Example @[Stackblitz](https://stackblitz.com/edit/web-platform-ehwrsp?file=script.js). Result

![image](https://github.com/KooiInc/StringInterpolator/assets/836043/ee4feef8-dc81-4b36-b089-9b1ec430c536)

