import loader from "./loader";
import ArchiveReader from "./reader";
import { filePerm, permString } from "./util";
import ArchiveWriter, { ArchiveType } from "./writer";

let mod;

export async function createReader(
  buffer: Uint8Array,
  password?: string | null
) {
  if (!mod) mod = await loader();
  return new ArchiveReader(mod, buffer, password);
}

export async function createWriter(type: ArchiveType = "zip") {
  if (!mod) mod = await loader();
  return new ArchiveWriter(mod, type);
}

export const util = {
  filePerm,
  permString,
};
