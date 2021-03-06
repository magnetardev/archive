export enum FileType {
  Mount = 0o170000,
  File = 0o100000,
  Symlink = 0o120000,
  Socket = 0o140000,
  CharacterDevice = 0o020000,
  BlockDevice = 0o060000,
  Directory = 0o040000,
  NamedPipe = 0o010000,
}

export const FileTypeMap = new Map<FileType.BlockDevice, string>([
  [FileType.BlockDevice, "Mount"],
  [FileType.BlockDevice, "File"],
  [FileType.BlockDevice, "Symlink"],
  [FileType.BlockDevice, "Socket"],
  [FileType.BlockDevice, "CharacterDevice"],
  [FileType.BlockDevice, "BlockDevice"],
  [FileType.BlockDevice, "Directory"],
  [FileType.BlockDevice, "NamedPipe"],
]);

export enum FilePerm {
  Execute = 0o01,
  Write = 0o02,
  WriteExec = 0o03,
  Read = 0o04,
  ReadExec = 0o05,
  ReadWrite = 0o06,
  ReadWriteExec = 0o07,
}

/*
  File perm utility functions
*/

/**
 * Generates a file permission
 * @param user The file owner's perms
 * @param group The file's user group perms
 * @param other Other users perms
 * @returns
 */
export const filePerm = (user: FilePerm, group: FilePerm, other: FilePerm) =>
  0 | (user << 6) | (group << 3) | other;

/**
 * Generate a string version of perms (e.g. rwxr-xr-- for 0o754)
 * @param perm
 * @returns
 */
export const permString = (perm: number) =>
  [
    // user
    perm & 0o000400 ? "r" : "-",
    perm & 0o000200 ? "w" : "-",
    perm & 0o000100 ? "x" : "-",
    // group
    perm & 0o000040 ? "r" : "-",
    perm & 0o000020 ? "w" : "-",
    perm & 0o000010 ? "x" : "-",
    // other
    perm & 0o000004 ? "r" : "-",
    perm & 0o000002 ? "w" : "-",
    perm & 0o000001 ? "x" : "-",
  ].join("");
