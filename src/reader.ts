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
    this.archive = api.read_memory(ptr, buf.length, password);
    this.ptr = ptr;
  }

  get hasEncryptedEntries() {
    const resp = this.api.read_has_encrypted_entries(this.archive);
    if (resp === 0 || resp === -2) return false;
    if (resp > 0) return true;
    return undefined;
  }

  close() {
    // this.api.read_close(this.archive);
    this.api.read_free(this.archive);
    this.api.mod._free(this.ptr);
    this.archive = undefined;
    this.ptr = undefined;
  }

  private next(): ArchiveEntry | null {
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
    return (
      FileTypeMap.get(this.reader.api.entry_filetype(this.ptr)) ?? "Invalid"
    );
  }

  get path(): string {
    return this.reader.api.entry_pathname(this.ptr);
  }

  get size(): number {
    return this.reader.api.entry_size(this.ptr);
  }

  get encrypted(): boolean {
    return !!this.reader.api.entry_is_encrypted(this.ptr);
  }

  free() {
    this.skip();
    this.reader = undefined;
    this.ptr = undefined;
  }

  extract(): Uint8Array | undefined {
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
    if (this.read) return;
    this.read = true;
    this.reader.api.read_data_skip(this.archive);
  }
}
