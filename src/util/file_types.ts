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

export const FileTypeMap = new Map<FileType, string>([
	[FileType.Mount, "mount"],
	[FileType.File, "file"],
	[FileType.Symlink, "symlink"],
	[FileType.Socket, "socket"],
	[FileType.CharacterDevice, "character_device"],
	[FileType.BlockDevice, "block_device"],
	[FileType.Directory, "directory"],
	[FileType.NamedPipe, "named_pipe"],
]);
