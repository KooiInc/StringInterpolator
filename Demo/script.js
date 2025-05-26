// gist @https://gist.github.com/KooiInc/5ce3520c54f19e27351ec9081318dff4
// $ etc. @https://github.com/KooiInc/SBHelpers
// 20240612
// -----------------------------------------------------------------------
import {default as interpolate, interpolateFactory} from "../index.js";
const tokenize = Symbol.for("interpolate");
const tokenize$ = Symbol.for("interpolate$");
// try out in developer screen
window.tokenize = tokenize;
window.interpolate = interpolate;
const { $, logFactory,  } =
  await import("https://cdn.jsdelivr.net/gh/KooiInc/SBHelpers/index.browser.bundled.js");
const { log } = logFactory();
const insert = interpolateFactory("¡no value!");
const demoText = demoTexts();

demo();

function demo() {
  log(...demoText.links, `!!<hr>${demoText.preSyntax}${demoText.syntax}`);
  const code4Array = demoText.code4Array;
  const tableTemplatesCode = demoText.tableTemplatesCode;
  
  // let's create a table
  const tableTemplate = `<table><caption>{caption}</caption><thead><tr><th>#</th><th>prename</th><th>surname</th></tr></thead><tbody>{rows}</tbody></table>`;
  const tableRowTemplate =  `<tr><td>{index}</td><td>{pre}</td><td>{last}</td></tr>`;
  // the replacements (for tableRowTemplate);
  const theNames = getNamesObj();

  setStyling();
  const theNamesClear = theNames.map(row =>
    !/ignored/i.test(row.pre) && row.pre?.startsWith(`<b`)
       ? {...row, pre: `<b class="notifyHeader">Cleared values</b>`} : row);
  const theNamesTokensAsArrays = {
    pre: `Mary,Muhammed,Missy,Hillary,Foo,Bar,小平,Володимир,zero (0),Row,,missing value =>`
      .split(`,`).map(v => !v.length ? undefined : v),
    last: `Peterson,Ali,Johnson,Clinton,Bar,Foo,邓,Зеленський,0,10,<= missing value,`
      .split(`,`).map(v => !v.length ? null : v)
  }

  // show me the money!
  const table1 = tableTemplate[tokenize]({
    caption: `<code>tableRowTemplate[tokenize]</code> using <code>theNames</code>`,
    rows: tableRowTemplate[tokenize](...theNames) } );
  const table2 = tableTemplate[tokenize]({
    caption: `<code>tableRowTemplate[tokenize$]</code> (empty/invalid values => empty string)`,
    rows: tableRowTemplate[tokenize$](...theNamesClear) } );
  const table3 = tableTemplate[tokenize]({
    caption: `<code>tableRowTemplate[tokenize]</code> token values are arrays`,
    rows: tableRowTemplate[tokenize](theNamesTokensAsArrays) } );
  log(`!!${tableTemplatesCode}`, `!!${table1}`, `!!${table2}`, `!!${code4Array}`, `!!${table3}` );
  Prism.highlightAll();
  createContent();
}

function escHTML(htmlStr) {
  return htmlStr.replace(/</g, `&lt;`)
}

function setStyling() {
  const repeat = (str, n = 2) => `${str}${Array(n).join(str)}`;
  $.editCssRules(
    `body { font: 14px/18px normal verdana, arial; margin: 2rem; }`,
    `.container { position: absolute; inset: 0; overflow-y: auto; }`,
    `table {
      margin: 1rem 0;
      font-family: verdana;
      font-size: 0.9rem;
      border-collapse: collapse;
      vertical-align: top;
      min-width: 500px;
      
      td, th {
        padding: 2px 4px;
        font-size: 14px;
        height: 18px;
      }
      
      td:nth-child(2n), th:nth-child(2n) { width: 200px; }
      
      th {
        font-weight: bold;
        text-align: left;
        border-bottom: 1px solid #999;
        background-color: #999;
        color: #FFF;
      }
      
      td:first-child, th:first-child {
        text-align: right; padding-right: 5px;
        min-width: 12px;
        max-width: 36px;
      }
      caption {
        border: 1px solid #ccc;
        padding: 0.5rem;
        font-size: 14px;
        white-space: nowrap;
       }
       
       tbody tr:nth-child(even) { background-color: #ddd; }
     }`,
    `.largeArrowDown:before{
      content: '${repeat(`⬇`, 3)}';
      color:green; }`,
    `b.notifyHeader { color: green; }`,
    `li.head {margin-left: -2rem !important;}`,
    `li.head table {margin-top: 1.2rem;}`,
    `li.head hr {margin-bottom: 1.2rem;}`,
    `a { text-decoration:none; font-weight:bold; }`,
    `a:hover { text-decoration:underline; }`,
    `a[target]:before { color:rgba(0,0,238,0.7);font-size: 1.1rem;vertical-align:bottom }`,
    `a[target="_blank"]:before {content: '\\2197'' '; }`,
    `a[target].cbBacklink {
      &:before { content: url(./codebergicon.ico)' '; vertical-align: middle;}
     }`,
    `a[target="_top"]:before {content: '\\21BA'' '; }`,
    `ul#log2screen { margin: 0 auto; max-width: 40vw; }`,
    `#log2screen pre.syntax {
      margin-top: -0.7rem;
      margin-bottom: 1.5rem;
    }`,
    `#log2screen code.language-javascript {
      background-color: revert;
      color: revert;
    }`,
    `pre.syntax { width: 100%; }`,
    `.readme {
      margin-top: -0.4rem;
      margin-bottom: 1rem;
      color: #777;
      font-weight: normal;
    }`,
    `@media (min-width: 1600px) {
      ul#log2screen  { max-width: 50vw; }
    }`,
    `@media (max-width: 1600px) and (min-width: 1024px) {
      ul#log2screen { max-width: 70vw; }
    }`,
    `@media (max-width: 1024px) and (min-width: 300px) {
      ul#log2screen { max-width: 90vw; }
    }`,
  );
}

function getNamesObj() {
  return [
    {pre: `Mary`, last: `Peterson`},
    {pre: `Muhammed`, last: `Ali`},
    {pre: `Missy`, last: `Johnson`},
    {pre: `Hillary`, last: `Clinton`},
    {pre: `Foo`, last: `Bar`},
    {pre: `Bar`, last: `Foo`},
    {pre: `小平`, last: `邓`},
    {pre: `Володимир`, last: `Зеленський`},
    {pre: `zero (0)`, last: 0},
    {pre: `Row`, last: 10},
    {pre: `replacement-is-empty-string`, last: ''},     // ᐊ Empty string value IS replaced
    {pre: `<b class="notifyHeader">Not replaced</b>`, last: `<span class="largeArrowDown"></span>`},
    // if !defaultReplacer ...
    {pre: `replacement-Is-array`, last: [1,2,3]},       // ᐊ Array value IS NOT replaced/
    {pre: `replacement-Is-null`, last: null},           // ᐊ null value IS NOT replaced
    {pre: `replacement-Is-object`, last: {} },          // ᐊ Object value IS NOT replaced
    {pre: `replacement-Is-undefined`, last: undefined}, // ᐊ undefined value IS NOT replaced
    {pre: `<b class="notifyHeader">Ignored</b>`, last: `<span class="largeArrowDown"></span>`},
    {last: `key-pre-does-not-exist`},                   // ᐊ undefined value IS NOT replaced
    {pre: `key-last-does-not-exist`},                   // ᐊ incomplete object, what exists is replaced
    {some: `nothing-to-replace`, name: `nothing`},      // ᐊ non relevant keys, tokens ignored
    {},                                                 // ᐊ empty object, tokens ignored
    [`nothing`, `nada`, `zip`, `没有什么`,               // ᐊ replacement not an Object, tokens ignored
     `niente`, `rien`, `ничего`]
  ];
}

function demoTexts() {
  const isStackblitz = /stackblitz/i.test(location.href);
  const links = [
      isStackblitz ? `!!<a target="_top" href="https://stackblitz.com/@KooiInc">All Stackblitz projects</a>` : `!!`,
      `!!<a class="cbBacklink" target="${isStackblitz ? `_blank` : `_top`}" href="https://codeberg.org/KooiInc/JS-Interpolate"
          >Back to repository</a>`
    ];
  const replacement = {blah: `FOOBLAH`, bar: `BARRED`};
  const someStr = `Blah [{blah}] and blah and {foo}, but then again [\\{bar\\} | {bar}]`;
  const namesUsed = getNamesObj.toString()
    .replace(/`/g, `"`)
    .replace(/\n {2,}/g, `\n  `)
    .replace(/\n\s+]/, `\n]`)
    .replace(/</g, `&lt;`);
  return {
    links,
    preSyntax: `<div class="readme">The module exports the factory itself (<code>interpolateFactory</code>),
       the <code>interpolate</code> function (default) and the <code>interpolateClear</code> function (which
       clears empty placeholders).</div>
    
       <div class="readme">Importing the module also provides two <code>Symbol</code>s that are used to extend
       <code>String.prototype</code> (<code>Symbol.for("interpolate")</code> and
       <code>Symbol.for("interpolate$")</code>).</div>
    
       <h3 class="readme"><b>Syntax by example</b></h3>`,
    
    syntax:
      `<pre class="syntax language-javascript line-numbers"><code class="language-javascript">// import
import {interpolateFactory}  from "[module location]";
//      ^ the interpolateFactory to create an interpolate function

// create an interpolator function with a default replacement value
// (replaces tokens with empty values with the default replacement value)
const insert = interpolateFactory("¡no value!");
const templateStringEx = " hello {wrld} {univrs}\\n";

// use insert
insert(templateStringEx,
  {wrld: "WORLD", univrs: null},
  {wrld: null, univrs: "UNIVERSE"},
  {wrld: "WORLD", univrs: "AND UNIVERSE"} );  /* result =>\n${
  insert(" hello {wrld} {univrs}\n",
    {wrld: "WORLD", univrs: null},
    {wrld: null, univrs: "UNIVERSE"},
    {wrld: "WORLD", univrs: "AND UNIVERSE"})}*/

// On importing interpolateFactory String.prototype
// was extended using 2 Symbols. Here we
// assign them to variables.
const tokenize = Symbol.for("interpolate");
const tokenize$ = Symbol.for("interpolate$");

// now we can use the 'symbolic extensions' (named tokenize/tokenize$)
// [tokenize]: keep tokens with empty values intact
templateStringEx[tokenize](
  {wrld: "WORLD", univrs: null},
  {wrld: null, univrs: "UNIVERSE"},
  {wrld: "WORLD", univrs: "AND UNIVERSE"} ); /* result => \n${
  " hello {wrld} {univrs}\n"[tokenize](
    {wrld: "WORLD", univrs: null},
    {wrld: null, univrs: "UNIVERSE"},
    {wrld: "WORLD", univrs: "AND UNIVERSE"})}*/

// [tokenize$]: cleanup empty values
templateStringEx[tokenize$](
  {wrld: "WORLD", univrs: null},
  {wrld: null, univrs: "UNIVERSE"},
  {wrld: "WORLD", univrs: "AND UNIVERSE"} );  /* result =>\n${
  " hello {wrld} {univrs}\n"[tokenize$](
    {wrld: "WORLD", univrs: null},
    {wrld: null, univrs: "UNIVERSE"},
    {wrld: "WORLD", univrs: "AND UNIVERSE"})}*/
    
// escaped "{" and/or "}" and non existing token values are ignored
const replacement = { blah: "FOOBLAH", bar: "BARRED" };
const someStr = "Blah [{blah}] and blah and {foo}, but then again [\\{bar\\} | {bar}]";
//                                           ^                     ^ escaped/ignored
//                                           ^ not in [replacement]/ignored
someStr[tokenize](replacement); => "${someStr[tokenize](replacement)}"
someStr[tokenize$](replacement); => "${someStr[tokenize$](replacement)}"</code></pre>`,
    
    code4Array: `<br><pre class="syntax language-javascript line-numbers"><code class="language-javascript">
// to fill the next table, a single object with array values is used
const theNamesTokensAsArrays = {
  pre: [ "Mary", "Muhammed", "Missy", "Hillary", "Foo", "Bar",
        "小平", "Володимир", "zero (0)", "Row", null, "missing value =>" ],
  last: [ "Peterson", "Ali", "Johnson", "Clinton", "Bar", "Foo",
          "邓", "Зеленський", "0", "10", "<= missing value", null ]
};</code>`,
    
    tableTemplatesCode: `<br><pre class="syntax language-javascript line-numbers"><code class="language-javascript">
// the templates for the following tables
const tableTemplate = ${escHTML(`
"<table>\\
  <caption>{caption}</caption>\\
  <thead>\\
    <tr>\\
      <th>#</th>\\
      <th>prename</th>\\
      <th>surname</th>\\
    </tr>\\
  </thead>\\
  <tbody>{rows}</tbody>\\
</table>"`)};
const tableRowTemplate = ${escHTML(`
"<tr>\\
  <td>{index}</td>\\
  <td>{pre}</td>\\
  <td>{last}</td>\\
</tr>"`)};
/* ∟ Note:
   adding {index} in the template string is optional.
   It will be automatically replaced with the index
   (starting with 1) of the insertion */

/* the tokens used for tableRowTemplate */
const theNames = ${namesUsed.slice(namesUsed.indexOf(`[`), -1).trim()}</code></pre>`,
  };
}

/* region indexCreatr */
function createContent() {
  $(`<div class="container">`).append($(`#log2screen`));
  $.editCssRule(`.bottomSpace { height: ${$.node(`.container`).clientHeight}px; }`);
  $(`#log2screen`).afterMe(`<div class="bottomSpace">`);
}
/* endregion indexCreatr */
