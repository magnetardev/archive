# @magnetardev/archive

A port of libarchive to WebAssembly, with a simple JS wrapper.

**It is highly recommended that you offload reading and writing to a Worker.** For the browser or deno, that'd be through Worker and for node that would be through the worker_threads module. There isn't an official worker wrapper yet, but using a library like Comlink can get you up and running with one in minutes.

## Install

```shell
# if you use npm
npm install @magnetardev/archive

# if you use yarn
yarn add @magnetardev/archive

# if you use pnpm
pnpm install @magnetardev/archive
```

## Why?

Because other archive libs for the web are fairly lackluster. They either are written fully in JS/TS, which (in my opinion) is not suitable for something like compression/decompression. Or they are written in WebAssembly (yay!) with a limited set of features or a confusing API (oof).

I wanted something that was simple, fast, and easy to use. So, I wrote my own.

## Usage

### Reading an archive

```js
import { createReader } from "@magnetardev/archive";

const buffer = ...; // some archive file (as an ArrayBuffer)
const reader = await createReader(buffer);
for (const file of reader) {
  console.log(file.path, file.extract());
}
reader.close();
```

### Creating an archive

```js
import { createWriter } from "@magnetardev/archive";

// create a writer and add a README file to it
const writer = await createWriter("7z");
const contents = new TextEncoder().encode("hello, world!"); // get string as Uint8Array
writer.add("README.md", contents);

// finish and get the archive file
const file = await writer.close();
console.log(file);
```

# Building
