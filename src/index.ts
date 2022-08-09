import loader, { WasmInterface } from "./loader";
import { ArchiveReader } from "./reader";
import * as fileTypes from "./util/file_types";
import * as perms from "./util/perms";
import { ArchiveWriteFormat, ArchiveWriter } from "./writer";

export interface LoaderOptions {
	/** TODO: Document this */
	locateFile(path: string, prefix: string): string;
}

/** A cache of sorts for the create fucntions. */
let mod: WasmInterface;

/** Creates a reader, which lets you read all the files of an archive file. */
export async function createReader(archive: ArrayBuffer, options?: { password?: string } & LoaderOptions) {
	if (!mod) mod = await loader({ locateFile: options?.locateFile });
	return new ArchiveReader(mod, new Uint8Array(archive), options?.password);
}

/** Creates a writer, which allows you to build and export an archive.  */
export async function createWriter(type: ArchiveWriteFormat = "zip", options?: LoaderOptions) {
	if (!mod) mod = await loader(options);
	return new ArchiveWriter(mod, type);
}

export { fileTypes, perms };
