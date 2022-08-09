import initModule, { Module as IModule } from "./archive";

export interface WasmInterface {
	mod: IModule;
	// Read
	readMemory(ptr: number, len: number, password?: string): number;
	readNextEntry(ptr: number): number;
	readHasEncryptedEntries(ptr: number): number;
	readData(arg0: number, arg1: number, arg2: number): number;
	readDataSkip(ptr: number): number;
	readFree(ptr: number): number;
	// Entries
	entryFileType(ptr: number): number;
	entryPathName(ptr: number): string;
	entrySize(ptr: number): number;
	entryIsEncrypted(ptr: number): number;
	// Write
	writeMemory(filepath: string, format: number): number;
	writeClose(archive: number): void;
	writeEntry(
		archive: number,
		filename: string,
		filetype: number,
		fileperm: number,
		buf: number,
		buf_size: number
	): void;
}

export default async function load(wasmUrl: string): Promise<WasmInterface> {
	const mod = (await initModule({
		locateFile(path, prefix) {
			if (path === "archive.wasm") return wasmUrl;
			return prefix + path;
		},
	})) as IModule;
	return {
		mod,
		// Read Methods
		readMemory: mod.cwrap("archive_read_memory", "number", ["number", "number", "string"]),
		readNextEntry: mod.cwrap("archive_read_next_entry", "number", ["number"]),
		readHasEncryptedEntries: mod.cwrap("archive_read_has_encrypted_entries", "number", ["number"]),
		readData: mod.cwrap("archive_read_data", "number", ["number", "number", "number"]),
		readDataSkip: mod.cwrap("archive_read_data_skip", "number", ["number"]),
		readFree: mod.cwrap("archive_read_free", "number", ["number"]),

		// Entry methods
		entryFileType: mod.cwrap("archive_entry_filetype", "number", ["number"]),
		entryPathName: mod.cwrap("archive_entry_pathname_utf8", "string", ["number"]),
		entrySize: mod.cwrap("archive_entry_size", "number", ["number"]),
		entryIsEncrypted: mod.cwrap("archive_entry_is_encrypted", "number", ["number"]),
		// Write methods
		writeMemory: mod.cwrap("archive_write_memory", "number", ["string", "number"]),
		writeClose: mod.cwrap("archive_write_memory_close", null, ["number"]),
		writeEntry: mod.cwrap("archive_write_entry", null, [
			"number",
			"string",
			"number",
			"number",
			"number",
			"number",
		]),
	};
}
