export enum ArchiveWriteFormat {
	cpio = 0x10000,
	cpio_posix = 0x10001,
	cpio_bin_le = 0x10002,
	cpio_svr4_nocrc = 0x10004,
	cpio_pwb = 0x10007,
	shar = 0x20000,
	shar_base = 0x20001,
	shar_dump = 0x20002,
	tar = 0x30000,
	tar_ustar = 0x30001,
	tar_pax_interchange = 0x30002,
	tar_pax_restricted = 0x30003,
	tar_gnutar = 0x30004,
	iso9660 = 0x40000,
	zip = 0x50000,
	mtree = 0x80000,
	raw = 0x90000,
	xar = 0xa0000,
	"7zip" = 0xe0000,
	warc = 0xf0000,
}

// interface WriterOptions {
// 	module: ModuleInstance;
// 	wasmUrl: URL;
// }

export class Writer {}
