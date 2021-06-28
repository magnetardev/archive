import type { Module as IModule } from "./archive";

export interface WasmInterface {
  mod: IModule;
  // Read
  read_memory(ptr: number, len: number, password?: string): number;
  read_next_entry(ptr: number): number;
  read_has_encrypted_entries(ptr: number): number;
  read_data(arg0: number, arg1: number, arg2: number): number;
  read_data_skip(ptr: number): number;
  read_free(ptr: number): number;
  // read_close(archive: number);
  // Entries
  entry_filetype(ptr: number): number;
  entry_pathname(ptr: number): string;
  entry_size(ptr: number): number;
  entry_is_encrypted(ptr: number): number;
  // Write
  write_memory(filepath: string, format: string): number;
  write_close(archive: number): void;
  write_entry(
    archive: number,
    filename: string,
    filetype: number,
    fileperm: number,
    buf: number,
    buf_size: number
  ): void;
}

export default async function load(
  options: Partial<IModule> = {}
): Promise<WasmInterface> {
  let mod = (await import("./archive").then(({ default: initModule }) =>
    initModule(options)
  )) as IModule;
  return {
    mod,
    // Read Methods
    read_memory: mod.cwrap("archive_read_memory", "number", [
      "number",
      "number",
      "string",
    ]),
    read_next_entry: mod.cwrap("archive_read_next_entry", "number", ["number"]),
    read_has_encrypted_entries: mod.cwrap(
      "archive_read_has_encrypted_entries",
      "number",
      ["number"]
    ),
    read_data: mod.cwrap("archive_read_data", "number", [
      "number",
      "number",
      "number",
    ]),
    read_data_skip: mod.cwrap("archive_read_data_skip", "number", ["number"]),
    read_free: mod.cwrap("archive_read_free", "number", ["number"]),
    // Entry methods
    entry_filetype: mod.cwrap("archive_entry_filetype", "number", ["number"]),
    entry_pathname: mod.cwrap("archive_entry_pathname_utf8", "string", [
      "number",
    ]),
    entry_size: mod.cwrap("archive_entry_size", "number", ["number"]),
    entry_is_encrypted: mod.cwrap("archive_entry_is_encrypted", "number", [
      "number",
    ]),
    // Write methods
    write_memory: mod.cwrap("archive_write_memory", "number", [
      "string",
      "string",
    ]),
    write_close: mod.cwrap("archive_write_memory_close", null, ["number"]),
    write_entry: mod.cwrap("archive_write_entry", null, [
      "number",
      "string",
      "number",
      "number",
      "number",
      "number",
    ]),
  };
}
