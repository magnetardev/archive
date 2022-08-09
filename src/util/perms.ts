export enum FilePerm {
	Execute = 0o01,
	Write = 0o02,
	WriteExec = 0o03,
	Read = 0o04,
	ReadExec = 0o05,
	ReadWrite = 0o06,
	ReadWriteExec = 0o07,
}

/**
 * Generates an octal representation of a file permission from the user, group, and other perms.
 * @param user The file owner's perms
 * @param group The file's user group perms
 * @param other Other users perms
 * @returns
 */
export const filePerm = (user: FilePerm, group: FilePerm, other: FilePerm) => 0 | (user << 6) | (group << 3) | other;

/**
 * Generate a string version of perms (e.g. rwxr-xr-- for 0o754)
 * @param perm
 * @returns
 */
export const filePermString = (perm: number) => {
	// user
	return (
		(perm & 0o000400 ? "r" : "-") +
		(perm & 0o000200 ? "w" : "-") +
		(perm & 0o000100 ? "x" : "-") +
		// group
		(perm & 0o000040 ? "r" : "-") +
		(perm & 0o000020 ? "w" : "-") +
		(perm & 0o000010 ? "x" : "-") +
		// other
		(perm & 0o000004 ? "r" : "-") +
		(perm & 0o000002 ? "w" : "-") +
		(perm & 0o000001 ? "x" : "-")
	);
};
