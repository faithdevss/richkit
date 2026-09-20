# @richkitjs/extension-track-changes

Track changes extension for [@richkitjs/core](https://www.npmjs.com/package/@richkitjs/core), a headless ProseMirror-based rich text editor.

## Install

```sh
npm install @richkitjs/extension-track-changes @richkitjs/core
```

Most users should install [@richkitjs/starter-kit](https://www.npmjs.com/package/@richkitjs/starter-kit) instead, which bundles all extensions.

## Docs

See the [repository](https://github.com/faithdevss/richkit#readme) for usage and API documentation.

## License

Part of **RichKit Pro**, licensed under the [RichKit Pro License Agreement](./LICENSE).
It runs without a key on localhost and other development hosts. Production use
needs a licence key — plans start at $99 a year, see
[the pricing page](https://faithdevss.github.io/richkit/pricing).

```ts
import { setLicenseKey } from '@richkitjs/license'

setLicenseKey('YOUR-LICENCE-KEY')
```

The key is checked locally; nothing is sent anywhere. Without one, a small
"unlicensed" badge shows on production sites — the editor never stops working.
