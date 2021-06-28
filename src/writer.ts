import { FileType } from "./util";
import type { WasmInterface } from "./loader";

export type ArchiveType = "zip";

let archiveID = 0;
export default class ArchiveWriter {
  private archive?: number;
  private fileName: string;

  constructor(private api: WasmInterface, type: ArchiveType = "zip") {
    this.fileName = `archive_${archiveID++}.tmp`;
    this.archive = api.write_memory(this.fileName, type);
  }

  add(
    path: string,
    buffer: Uint8Array,
    type: FileType = FileType.File,
    perm: number = 0o777
  ) {
    if (!this.archive) throw new Error("ERR_NO_ARCHIVE");
    let ptr = this.api.mod._malloc(buffer.length);
    this.api.mod.HEAPU8.set(buffer, ptr);
    this.api.write_entry(this.archive, path, type, perm, ptr, buffer.length);
  }

  close(): Uint8Array | undefined {
    if (!this.archive) throw new Error("ERR_NO_ARCHIVE");
    this.api.write_close(this.archive);
    const file = this.api.mod.FS.readFile(this.fileName);
    this.api.mod.FS.unlink(this.fileName);
    return file;
  }
}
