import { Module as  } from "./archive";
interface WasmInterface {
    mod: Module;
    read_memory(ptr: number, len: number, password?: string): number;
    read_next_entry(ptr: number): number;
    read_has_encrypted_entries(ptr: number): number;
    read_data(arg0: number, arg1: number, arg2: number): number;
    read_data_skip(ptr: number): number;
    read_free(ptr: number): number;
    entry_filetype(ptr: number): number;
    entry_pathname(ptr: number): string;
    entry_size(ptr: number): number;
    entry_is_encrypted(ptr: number): number;
    write_memory(filepath: string, format: number): number;
    write_close(archive: number): void;
    write_entry(archive: number, filename: string, filetype: number, fileperm: number, buf: number, buf_size: number): void;
}
enum FileType {
    Mount = 61440,
    File = 32768,
    Symlink = 40960,
    Socket = 49152,
    CharacterDevice = 8192,
    BlockDevice = 24576,
    Directory = 16384,
    NamedPipe = 4096
}
declare class ArchiveReader {
    api: WasmInterface;
    constructor(api: WasmInterface, buf: Uint8Array, password?: string | null);
    get hasEncryptedEntries(): boolean;
    close(): void;
    entries(): Generator<ArchiveEntry, void, unknown>;
    [Symbol.iterator](): Generator<ArchiveEntry, void, unknown>;
}
declare class ArchiveEntry {
    constructor(reader?: ArchiveReader, ptr?: number, archive?: number);
    get filetype(): string;
    get path(): string;
    get size(): number;
    get encrypted(): boolean;
    free(): void;
    extract(): Uint8Array | undefined;
}
declare const ARCHIVE_WRITE_FORMATS: {
    cpio: number;
    cpio_posix: number;
    cpio_bin_le: number;
    cpio_svr4_nocrc: number;
    cpio_pwb: number;
    shar: number;
    shar_base: number;
    shar_dump: number;
    tar: number;
    tar_ustar: number;
    tar_pax_interchange: number;
    tar_pax_restricted: number;
    tar_gnutar: number;
    iso9660: number;
    zip: number;
    mtree: number;
    raw: number;
    xar: number;
    "7zip": number;
    warc: number;
};
type ArchiveWriteFormat = keyof typeof ARCHIVE_WRITE_FORMATS;
declare class ArchiveWriter {
    constructor(api: WasmInterface, type: ArchiveWriteFormat);
    add(path: string, buffer: Uint8Array, type?: FileType, perm?: number): void;
    close(): Uint8Array | undefined;
}
export interface LoaderOptions {
    /** TODO: Document this */
    locateFile(path: string, prefix: string): string;
}
/** Creates a reader, which lets you read all the files of an archive file. */
export function createReader(archive: ArrayBuffer, options?: {
    password?: string;
} & LoaderOptions): Promise<ArchiveReader>;
/** Creates a writer, which allows you to build and export an archive.  */
export function createWriter(type?: ArchiveWriteFormat, options?: LoaderOptions): Promise<ArchiveWriter>;

//# sourceMappingURL=types.d.ts.map
