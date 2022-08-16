import initModule from "./archive";
import { archiveWaitForClose, archiveWaitForRead } from "./imports";
import type { ReadableStreamLike } from "./util/stream_like";
import type { ArchiveWriteFormat } from "./writer";

// Helper types to make the code more readable
export type Pointer = number | null;
export type ArchivePointer = Pointer;
export type EntryPointer = Pointer;
export type StringPointer = Pointer;

export interface LoaderOptions {
	wasmPath: string;
	wasmBase: URL | string;
	loadWasm(): Promise<ArrayBuffer>;
}

export interface ReaderContext {
	reader: ReadableStreamLike<Uint8Array>;
	buf?: Uint8Array;
	offset: number;
	done: boolean;
}

export interface ModuleInstance {
	locateFile?(path: string, prefix: string): string;
	instantiateWasm(
		imports: WebAssembly.Imports,
		success: (module: WebAssembly.Module) => void,
		failure: (error: Error) => void
	): void;

	// Descriptor maps
	openReaders: Map<ArchivePointer, ReaderContext>;
	openWriters: Map<ArchivePointer, unknown>;

	// imports
	archive_wait_for_read(mod: ModuleInstance, id: number, destPtr: Pointer, destLen: number): Promise<number>;
	archive_wait_for_close(mod: ModuleInstance, id: number): Promise<void>;

	// Memory access/manipulation
	HEAPU8: Uint8Array;
	_malloc(size: number): Pointer;
	_free(ptr: Pointer): void;

	// Reading
	_archive_read_memory(id: number, bufferSize: number, password: StringPointer): ArchivePointer;
	_archive_read_next_entry(archive: ArchivePointer): EntryPointer;
	_archive_read_has_encrypted_entries(archive: ArchivePointer): number;
	_archive_read_data(archive: ArchivePointer, dest: Pointer, size: number): number;
	_archive_read_data_skip(archive: ArchivePointer): void;
	_archive_read_free(archive: ArchivePointer): void;

	// Writing
	_archive_write_memory(fileNamePtr: Pointer, format: ArchiveWriteFormat): ArchivePointer;
	_archive_write_memory_close(archive: ArchivePointer): void;
	_archive_write_entry(
		archive: ArchivePointer,
		fileName: StringPointer,
		fileType: number,
		filePerm: number,
		data: Pointer,
		dataSize: number
	): void;

	// Entry getters
	_archive_entry_filetype(entry: EntryPointer): number;
	_archive_entry_pathname_utf8(entry: EntryPointer): Pointer;
	_archive_entry_size(entry: EntryPointer): number;
	_archive_entry_is_encrypted(entry: EntryPointer): number;
}

async function loadWebAssembly(source: PromiseLike<Response>, imports: WebAssembly.Imports = {}) {
	if (!WebAssembly.instantiateStreaming) {
		const resp = await source.then((r) => r.arrayBuffer());
		return WebAssembly.instantiate(resp, imports);
	}
	return WebAssembly.instantiateStreaming(source, imports);
}

export async function loadModule(options?: Partial<LoaderOptions>): Promise<ModuleInstance> {
	let module = await initModule({
		instantiateWasm(imports, successCallback) {
			let promise: Promise<WebAssembly.WebAssemblyInstantiatedSource>;
			if (options?.loadWasm) {
				promise = options.loadWasm().then((bytes) => WebAssembly.instantiate(bytes, imports));
			} else {
				let base = options?.wasmBase ? options.wasmBase : import.meta.url;
				let path = options?.wasmPath ? options.wasmPath : "./archive.wasm";
				promise = loadWebAssembly(fetch(new URL(path, base).href), imports);
			}
			promise.then((mod) => mod.instance).then(successCallback);
		},
	});
	module.openReaders = new Map();
	module.openWriters = new Map();
	module.archive_wait_for_read = archiveWaitForRead;
	module.archive_wait_for_close = archiveWaitForClose;
	return module;
}
