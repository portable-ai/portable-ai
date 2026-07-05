# Third-Party Notices

This project vendors third-party open-source code. Each entry lists the component, version, upstream location, license, and where the code lives in this repository.

The PortableAI project itself is MIT-licensed (see [`LICENSE`](LICENSE)). Vendored dependencies retain their own licenses.

---

## marked

- **Component**: [marked](https://github.com/markedjs/marked) — Markdown parser and compiler
- **Version**: 14.1.4
- **License**: MIT
- **Source**: <https://github.com/markedjs/marked>
- **Vendored copy**: [`website/js/vendor/marked.min.js`](website/js/vendor/marked.min.js) (UMD minified build, obtained from jsDelivr: <https://cdn.jsdelivr.net/npm/marked@14.1.4/lib/marked.umd.min.js>)
- **Used by**: `website/js/app.js` — renders the live Markdown preview in the reference editor.

### Upstream license (verbatim)

```
MIT License

Copyright (c) 2018+, MarkedJS (https://github.com/markedjs/)
Copyright (c) 2011-2018, Christopher Jeffrey (https://github.com/chjj/)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USAGE OR OTHER DEALINGS IN
THE SOFTWARE.
```
