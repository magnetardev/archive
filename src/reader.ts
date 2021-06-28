import { FileTypeMap } from "./util";
import type { WasmInterface } from "./loader";

export default class ArchiveReader {
  private ptr?: number;
  private archive?: number;

  constructor(
    public api: WasmInterface,
    buf: Uint8Array,
    password: string | null = null
  ) {
    let ptr = api.mod._malloc(buf.length);
    api.mod.HEAPU8.set(buf, ptr);
    this.archive = api.read_memory(
      ptr,
      buf.length,
      password as string | undefined
    );
    this.ptr = ptr;
  }

  get hasEncryptedEntries() {
    if (!this.archive) throw new Error("ERR_NO_ARCHIVE");
    const resp = this.api.read_has_encrypted_entries(this.archive);
    if (resp === 0 || resp === -2) return false;
    if (resp > 0) return true;
    return undefined;
  }

  close() {
    if (!this.archive) throw new Error("ERR_NO_ARCHIVE");
    this.api.read_free(this.archive);
    if (!this.ptr) throw new Error("ERR_NO_PTR");
    this.api.mod._free(this.ptr);
    this.archive = undefined;
    this.ptr = undefined;
  }

  private next(): ArchiveEntry | null {
    if (!this.archive) throw new Error("ERR_NO_ARCHIVE");
    const entryPtr = this.api.read_next_entry(this.archive);
    if (entryPtr === 0) return null;
    return new ArchiveEntry(this, entryPtr, this.archive);
  }

  *entries() {
    for (;;) {
      const entry = this.next();
      if (!entry) break;
      yield entry;
      entry.free();
    }
  }

  [Symbol.iterator]() {
    return this.entries();
  }
}

class ArchiveEntry {
  private read: boolean = false;

  constructor(
    private reader?: ArchiveReader,
    private ptr?: number,
    private archive?: number
  ) {}

  get filetype(): string {
    if (!this.reader || !this.ptr) throw new Error("ERR_NO_READER");
    return (
      FileTypeMap.get(this.reader.api.entry_filetype(this.ptr)) ?? "Invalid"
    );
  }

  get path(): string {
    if (!this.reader || !this.ptr) throw new Error("ERR_NO_READER");
    return this.reader.api.entry_pathname(this.ptr);
  }

  get size(): number {
    if (!this.reader || !this.ptr) throw new Error("ERR_NO_READER");

    return this.reader.api.entry_size(this.ptr);
  }

  get encrypted(): boolean {
    if (!this.reader || !this.ptr) throw new Error("ERR_NO_READER");

    return !!this.reader.api.entry_is_encrypted(this.ptr);
  }

  free() {
    this.skip();
    this.reader = undefined;
    this.ptr = undefined;
  }

  extract(): Uint8Array | undefined {
    if (!this.reader || !this.ptr || !this.archive)
      throw new Error("ERR_NO_READER");
    if (this.read) throw new Error("ERR_ALREADY_EXTRACTED");
    const size = this.size;
    if (!size) {
      this.skip();
      return undefined;
    }
    this.read = true;
    const ptr = this.reader.api.mod._malloc(size);
    const entry_len = this.reader.api.read_data(this.archive, ptr, size);
    const data = this.reader.api.mod.HEAPU8.slice(ptr, ptr + entry_len);
    this.reader.api.mod._free(ptr);
    return data;
  }

  private skip(): void {
    if (!this.reader || !this.ptr || !this.archive)
      throw new Error("ERR_NO_READER");
    if (this.read) return;
    this.read = true;
    this.reader.api.read_data_skip(this.archive);
  }
}
