import type ArchiveReader from "../src/reader";
import ArchiveWriter, { ArchiveType } from "../src/writer";
import type { FilePerm, FileType } from "../src/util";

export function createReader(
  buffer: Uint8Array,
  password?: string
): Promise<ArchiveReader>;

export function createWriter(type: ArchiveType): Promise<ArchiveWriter>;

export const util: {
  filePerm(user: FilePerm, group: FilePerm, other: FilePerm): number;
  permToString(perm: number): string;
};

export { FilePerm, FileType };
