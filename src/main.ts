import loader, { WasmInterface } from "./loader";
import { filePerm, permString } from "./util";
import ArchiveReader from "./reader";
import ArchiveWriter, { ArchiveType } from "./writer";
import type { Module } from "./archive";

let mod: WasmInterface;
export async function createReader(
  buffer: Uint8Array,
  password?: string | null,
  options: Partial<Module> = {}
) {
  if (!mod) mod = await loader(options);
  return new ArchiveReader(mod, buffer, password);
}

export async function createWriter(
  type: ArchiveType = "zip",
  options: Partial<Module> = {}
) {
  if (!mod) mod = await loader(options);
  return new ArchiveWriter(mod, type);
}

export const util = {
  filePerm,
  permString,
};
