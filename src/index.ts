import type { WasmInterface } from "./loader";
import loader from "./loader";
import { ArchiveReader } from "./reader";
import { FileType, FileTypeMap } from "./util/file_types";
import { FilePerm, filePerm, filePermString } from "./util/perms";
import { ArchiveWriteFormat, ArchiveWriter } from "./writer";

export interface LoaderOptions {
	wasmBaseUrl?: string | URL;
	wasmPath?: string;
}

async function getModule(options?: LoaderOptions): Promise<WasmInterface> {
	let url = import.meta.env.DEV
		? new URL("../public/archive.wasm", import.meta.url)
		: new URL(options?.wasmPath ?? "./archive.wasm", options?.wasmBaseUrl ?? import.meta.url);
	let wasmURL: string = url.href;
	if ("file:" === url.protocol && "process" in globalThis) {
		const { fileURLToPath } = await import("node:url");
		wasmURL = fileURLToPath(url);
	}
	return loader(wasmURL);
}

/** A cache of sorts for the create functions. */
let mod: WasmInterface;

/** Creates a reader, which lets you read all the files of an archive file. */
export async function createReader(archive: ArrayBuffer, options?: { password?: string } & LoaderOptions) {
	if (!mod) mod = await getModule(options);
	return new ArchiveReader(mod, new Uint8Array(archive), options?.password);
}

/** Creates a writer, which allows you to build and export an archive.  */
export async function createWriter(type: ArchiveWriteFormat = "zip", options?: LoaderOptions) {
	if (!mod) mod = await getModule(options);
	return new ArchiveWriter(mod, type);
}

export { FilePerm, filePerm, filePermString, FileType, FileTypeMap };
