# Archive

A port of libarchive to WebAssembly, with a simple JS wrapper.

**It is _highly_ recommended that you offload reading and writing to a Worker.** For the browser or deno, that'd be through `Worker` and for node that would be through the `worker_threads` package. There isn't an official worker wrapper yet, but using a library like [Comlink](https://github.com/GoogleChromeLabs/comlink) can get you up and running with one in minutes.

### Why?

Aren't there a few of these ports? Well, yes. In fact, this uses the exact same Dockerfile from [libarchivejs](https://github.com/nika-begiashvili/libarchivejs). However, libarchivejs does not support Node and forces you to use a Worker. I also haven't found one that supports creating archives. Finally, the APIs most of the ports offer are not as simple as they can be, which is a shame. So, I made this.

## Examples

### Reading an archive

```js
import * as archive from 'archive';

const buffer = ...; // Obtain a Uint8Array version of your archive.
const reader = await archive.createReader(buffer);
for (const entry of reader) {
  console.log(entry.path, entry.extract());
}
reader.close();
```

### Creating an archive

```js
import * as archive from "archive";

// Create a writer.
const writer = await archive.createWriter();

// Add a file
const contents = new TextEncoder().encode("hello, world!");
writer.add("hello.txt", contents);

// Finalize the archive and get a Uint8Array version.+
const zip = writer.finish();
console.log(zip);
```

## Building

Building is kind of a mess, but is quite easy with Docker. If you choose to do so without Docker, you need to compile OpenSSL, LZMA, and libarchive with `emcc`. This short guide covers the Docker build process:

1. Run `yarn build:wasm`. This can take quite a while the first time, but consecutive builds will be much faster. This builds just the WebAssembly port and the Emscripten wrapper.
2. Run `yarn build`. This builds the JS wrapper.
3. Done.

## TO-DO

- [ ] Allow creating more than just zip files.
- [ ] Create a Worker wrapper.
- [ ] Migrate Dockerfile from using `trzeci/emscripten` to `emscripten/emsdk`
- [ ] Use jest or similar testing utils instead of just running and checking.
