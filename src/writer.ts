import type { WasmInterface } from "./loader";
import { ERR_BUFFER_RETRIEVAL_FAILED, ERR_NO_ARCHIVE } from "./util/error_strings";
import { FileType } from "./util/file_types";

export const ARCHIVE_WRITE_FORMATS = {
	cpio: 0x10000,
	cpio_posix: 0x10001,
	cpio_bin_le: 0x10002,
	cpio_svr4_nocrc: 0x10004,
	cpio_pwb: 0x10007,
	shar: 0x20000,
	shar_base: 0x20001,
	shar_dump: 0x20002,
	tar: 0x30000,
	tar_ustar: 0x30001,
	tar_pax_interchange: 0x30002,
	tar_pax_restricted: 0x30003,
	tar_gnutar: 0x30004,
	iso9660: 0x40000,
	zip: 0x50000,
	mtree: 0x80000,
	raw: 0x90000,
	xar: 0xa0000,
	"7zip": 0xe0000,
	warc: 0xf0000,
};

export type ArchiveWriteFormat = keyof typeof ARCHIVE_WRITE_FORMATS;

let archiveID = 0;
export class ArchiveWriter {
	private archive?: number;
	private fileName: string;

	constructor(private api: WasmInterface, type: ArchiveWriteFormat) {
		const format = ARCHIVE_WRITE_FORMATS[type];
		this.fileName = `archive_${archiveID++}.tmp`;
		this.archive = api.writeMemory(this.fileName, format);
	}

	add(path: string, buffer: Uint8Array, type: FileType = FileType.File, perm = 0o777) {
		if (!this.archive) throw new Error(ERR_NO_ARCHIVE);
		const ptr = this.api.mod._malloc(buffer.length);
		this.api.mod.HEAPU8.set(buffer, ptr);
		this.api.writeEntry(this.archive, path, type, perm, ptr, buffer.length);
	}

	close(): Uint8Array | undefined {
		if (!this.archive) throw new Error(ERR_NO_ARCHIVE);
		this.api.writeClose(this.archive);
		const file = this.api.mod.FS.readFile(this.fileName);
		this.api.mod.FS.unlink(this.fileName);
		if (!file) throw new Error(ERR_BUFFER_RETRIEVAL_FAILED);
		return file;
	}
}
