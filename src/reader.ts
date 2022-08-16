import type { ArchivePointer, LoaderOptions, ModuleInstance, StringPointer } from "./loader";
import { loadModule } from "./loader";
import { readCString, writeCString } from "./util/mem";
import type { ReadableStreamLike } from "./util/stream_like";
import { BufferReadableStreamLike } from "./util/stream_like";

interface ReaderOptions {
	/** An instance to reuse for the  */
	module: ModuleInstance;
	/** The URL to the wasm file */
	wasmUrl: URL;
	/** The password to use if the archive is encrypted */
	password?: string;
	/** The size to try and get per I/O read. Min: 64 bytes, max: 64kb */
	bufferSize?: number;
}

const MAX_BUFFER_SIZE = 65_536;
const MIN_BUFFER_SIZE = 64;
const DEFAULT_BUFFER_SIZE = 10_240;

let readerID = 0;
export class Reader {
	#mod: ModuleInstance;
	#dataReader: ReadableStreamLike<Uint8Array>;
	#prevEntry?: ReaderEntry;
	#archive: ArchivePointer;
	#passwordPtr: StringPointer;

	static encoder = new TextEncoder();
	static decoder = new TextDecoder();

	private constructor(
		mod: ModuleInstance,
		_: number,
		archive: ArchivePointer,
		dataReader: ReadableStreamLike<Uint8Array>,
		passwordPtr: StringPointer
	) {
		this.#mod = mod;
		this.#archive = archive;
		this.#dataReader = dataReader;
		this.#passwordPtr = passwordPtr;
	}

	/** Setup a reader from an archive's data */
	static async init(
		data: Uint8Array | ReadableStream,
		options?: Partial<ReaderOptions & LoaderOptions>
	): Promise<Reader> {
		let mod = options?.module || (await loadModule(options));

		// setup the data reader
		let dataReader: ReadableStreamLike<Uint8Array>;
		if (data instanceof ReadableStream) {
			dataReader = data.getReader();
		} else {
			dataReader = new BufferReadableStreamLike(data, data.length);
		}

		// get the password, if exists
		let passwordPtr = null;
		if (options?.password) {
			passwordPtr = writeCString(Reader.encoder, mod._malloc, mod.HEAPU8, options.password);
		}

		// get the buffer size, if exists, and ensure it isn't too small or too large.
		// max size is 64k, which is rougly the size of one memory page (which is pretty massive).
		let bufferSize = options?.bufferSize
			? Math.min(MAX_BUFFER_SIZE, Math.max(MIN_BUFFER_SIZE, options.bufferSize))
			: DEFAULT_BUFFER_SIZE;

		// get the archive pointer & initialize the reader
		let id = readerID++;
		mod.openReaders.set(id, {
			reader: dataReader,
			done: false,
			buf: undefined,
			offset: 0,
		});
		let archive = mod._archive_read_memory(id, bufferSize, passwordPtr);
		return new Reader(mod, id, archive, dataReader, passwordPtr);
	}

	hasEncryptedEntries(): boolean | undefined {
		if (!this.#archive) return undefined;
		const resp = this.#mod._archive_read_has_encrypted_entries(this.#archive);
		if (resp === 0 || resp === -2) return false;
		if (resp > 0) return true;
		return undefined;
	}

	async next(): Promise<ReaderEntry | undefined> {
		let entryPtr = this.#mod._archive_read_next_entry(this.#archive);
		if (!entryPtr) {
			return undefined;
		}
		let entry = new ReaderEntry(this.#mod, entryPtr, this.#archive);
		if (this.#prevEntry) this.#prevEntry.free();
		this.#prevEntry = entry;
		return entry;
	}

	async close(): Promise<void> {
		if (this.#archive) {
			this.#mod.openReaders.delete(this.#archive);
			this.#mod._archive_read_free(this.#archive);
			this.#archive = null;
		}
		if (this.#passwordPtr) {
			this.#mod._free(this.#passwordPtr);
			this.#passwordPtr = null;
		}
	}
}

export class ReaderEntry {
	#mod?: ModuleInstance;
	#archive?: ArchivePointer;
	#ptr?: number;
	read: boolean = false;

	// TODO: determine if these actually need to be getters

	get fileType(): number | undefined {
		if (!this.#mod || !this.#ptr) return undefined;
		return this.#mod._archive_entry_filetype(this.#ptr);
	}

	get path(): string | undefined {
		if (!this.#mod || !this.#ptr) return undefined;
		let strPointer = this.#mod._archive_entry_pathname_utf8(this.#ptr);
		if (!strPointer) {
			return undefined;
		}
		return readCString(Reader.decoder, this.#mod.HEAPU8, strPointer);
	}

	get size(): number | undefined {
		if (!this.#mod || !this.#ptr) return undefined;
		return this.#mod._archive_entry_size(this.#ptr);
	}

	get isEncrypted(): boolean | undefined {
		if (!this.#mod || !this.#ptr) return undefined;
		return !!this.#mod._archive_entry_is_encrypted(this.#ptr);
	}

	constructor(mod: ModuleInstance, descriptor: number, archive: ArchivePointer) {
		this.#mod = mod;
		this.#ptr = descriptor;
		this.#archive = archive;
	}

	free() {
		this.#skip();
		this.#mod = undefined;
		this.#ptr = undefined;
		this.#archive = undefined;
	}

	extract() {
		if (!this.#mod || !this.#ptr || !this.#archive) {
			throw new Error("No reader or descriptor found for this archive");
		}
		if (this.read) throw new Error("The entry has already been read");
		const size = this.size;
		if (!size) {
			this.#skip();
			return undefined;
		}
		this.read = true;

		// TODO: Buffered read, instead of reading all at once.

		const ptr = this.#mod._malloc(size);
		if (!ptr) {
			throw new Error("Failed to allocate memory for entry");
		}
		const entry_len = this.#mod._archive_read_data(this.#archive, ptr, size);
		const data = this.#mod.HEAPU8.slice(ptr, ptr + entry_len);
		this.#mod._free(ptr);
		return data;
	}

	#skip() {
		if (!this.#mod || !this.#ptr || !this.#archive) {
			throw new Error("No reader or descriptor found for this archive");
		}
		if (this.read) return;
		this.read = true;
		this.#mod._archive_read_data_skip(this.#archive);
	}
}
