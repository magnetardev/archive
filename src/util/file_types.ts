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
	[FileType.Mount, "Mount"],
	[FileType.File, "File"],
	[FileType.Symlink, "Symlink"],
	[FileType.Socket, "Socket"],
	[FileType.CharacterDevice, "CharacterDevice"],
	[FileType.BlockDevice, "BlockDevice"],
	[FileType.Directory, "Directory"],
	[FileType.NamedPipe, "NamedPipe"],
]);
