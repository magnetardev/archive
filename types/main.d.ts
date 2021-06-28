import type ArchiveReader from "../src/reader";
import ArchiveWriter, { ArchiveType } from "../src/writer";
import type { FilePerm, FileType } from "../src/util";
import type { Module } from "../src/archive";

export function createReader(
  buffer: Uint8Array,
  password?: string,
  options: Partial<Module> = {}
): Promise<ArchiveReader>;

export function createWriter(
  type: ArchiveType,
  options: Partial<Module> = {}
): Promise<ArchiveWriter>;

export const util: {
  filePerm(user: FilePerm, group: FilePerm, other: FilePerm): number;
  permToString(perm: number): string;
};

export { FilePerm, FileType };
