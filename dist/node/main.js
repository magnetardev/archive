'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

async function load(options = {}) {
    let mod = (await Promise.resolve().then(function () { return require('./archive-c40290d0.js'); }).then(({ default: initModule }) => initModule(options)));
    return {
        mod,
        // Read Methods
        read_memory: mod.cwrap("archive_read_memory", "number", [
            "number",
            "number",
            "string",
        ]),
        read_next_entry: mod.cwrap("archive_read_next_entry", "number", ["number"]),
        read_has_encrypted_entries: mod.cwrap("archive_read_has_encrypted_entries", "number", ["number"]),
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

var FileType;
(function (FileType) {
    FileType[FileType["Mount"] = 61440] = "Mount";
    FileType[FileType["File"] = 32768] = "File";
    FileType[FileType["Symlink"] = 40960] = "Symlink";
    FileType[FileType["Socket"] = 49152] = "Socket";
    FileType[FileType["CharacterDevice"] = 8192] = "CharacterDevice";
    FileType[FileType["BlockDevice"] = 24576] = "BlockDevice";
    FileType[FileType["Directory"] = 16384] = "Directory";
    FileType[FileType["NamedPipe"] = 4096] = "NamedPipe";
})(FileType || (FileType = {}));
const FileTypeMap = new Map([
    [FileType.BlockDevice, "Mount"],
    [FileType.BlockDevice, "File"],
    [FileType.BlockDevice, "Symlink"],
    [FileType.BlockDevice, "Socket"],
    [FileType.BlockDevice, "CharacterDevice"],
    [FileType.BlockDevice, "BlockDevice"],
    [FileType.BlockDevice, "Directory"],
    [FileType.BlockDevice, "NamedPipe"],
]);
var FilePerm;
(function (FilePerm) {
    FilePerm[FilePerm["Execute"] = 1] = "Execute";
    FilePerm[FilePerm["Write"] = 2] = "Write";
    FilePerm[FilePerm["WriteExec"] = 3] = "WriteExec";
    FilePerm[FilePerm["Read"] = 4] = "Read";
    FilePerm[FilePerm["ReadExec"] = 5] = "ReadExec";
    FilePerm[FilePerm["ReadWrite"] = 6] = "ReadWrite";
    FilePerm[FilePerm["ReadWriteExec"] = 7] = "ReadWriteExec";
})(FilePerm || (FilePerm = {}));
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
const filePerm = (user, group, other) => 0 | (user << 6) | (group << 3) | other;
/**
 * Generate a string version of perms (e.g. rwxr-xr-- for 0o754)
 * @param perm
 * @returns
 */
const permString = (perm) => [
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

class ArchiveReader {
    constructor(api, buf, password = null) {
        Object.defineProperty(this, "api", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: api
        });
        Object.defineProperty(this, "ptr", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "archive", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        let ptr = api.mod._malloc(buf.length);
        api.mod.HEAPU8.set(buf, ptr);
        this.archive = api.read_memory(ptr, buf.length, password);
        this.ptr = ptr;
    }
    get hasEncryptedEntries() {
        if (!this.archive)
            throw new Error("ERR_NO_ARCHIVE");
        const resp = this.api.read_has_encrypted_entries(this.archive);
        if (resp === 0 || resp === -2)
            return false;
        if (resp > 0)
            return true;
        return undefined;
    }
    close() {
        if (!this.archive)
            throw new Error("ERR_NO_ARCHIVE");
        this.api.read_free(this.archive);
        if (!this.ptr)
            throw new Error("ERR_NO_PTR");
        this.api.mod._free(this.ptr);
        this.archive = undefined;
        this.ptr = undefined;
    }
    next() {
        if (!this.archive)
            throw new Error("ERR_NO_ARCHIVE");
        const entryPtr = this.api.read_next_entry(this.archive);
        if (entryPtr === 0)
            return null;
        return new ArchiveEntry(this, entryPtr, this.archive);
    }
    *entries() {
        for (;;) {
            const entry = this.next();
            if (!entry)
                break;
            yield entry;
            entry.free();
        }
    }
    [Symbol.iterator]() {
        return this.entries();
    }
}
class ArchiveEntry {
    constructor(reader, ptr, archive) {
        Object.defineProperty(this, "reader", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: reader
        });
        Object.defineProperty(this, "ptr", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ptr
        });
        Object.defineProperty(this, "archive", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: archive
        });
        Object.defineProperty(this, "read", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    get filetype() {
        var _a;
        if (!this.reader || !this.ptr)
            throw new Error("ERR_NO_READER");
        return ((_a = FileTypeMap.get(this.reader.api.entry_filetype(this.ptr))) !== null && _a !== void 0 ? _a : "Invalid");
    }
    get path() {
        if (!this.reader || !this.ptr)
            throw new Error("ERR_NO_READER");
        return this.reader.api.entry_pathname(this.ptr);
    }
    get size() {
        if (!this.reader || !this.ptr)
            throw new Error("ERR_NO_READER");
        return this.reader.api.entry_size(this.ptr);
    }
    get encrypted() {
        if (!this.reader || !this.ptr)
            throw new Error("ERR_NO_READER");
        return !!this.reader.api.entry_is_encrypted(this.ptr);
    }
    free() {
        this.skip();
        this.reader = undefined;
        this.ptr = undefined;
    }
    extract() {
        if (!this.reader || !this.ptr || !this.archive)
            throw new Error("ERR_NO_READER");
        if (this.read)
            throw new Error("ERR_ALREADY_EXTRACTED");
        const size = this.size;
        if (!size) {
            this.skip();
            return undefined;
        }
        this.read = true;
        const ptr = this.reader.api.mod._malloc(size);
        const entry_len = this.reader.api.read_data(this.archive, ptr, size);
        const data = this.reader.api.mod.HEAPU8.slice(ptr, ptr + entry_len);
        this.reader.api.mod._free(ptr);
        return data;
    }
    skip() {
        if (!this.reader || !this.ptr || !this.archive)
            throw new Error("ERR_NO_READER");
        if (this.read)
            return;
        this.read = true;
        this.reader.api.read_data_skip(this.archive);
    }
}

let archiveID = 0;
class ArchiveWriter {
    constructor(api, type = "zip") {
        Object.defineProperty(this, "api", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: api
        });
        Object.defineProperty(this, "archive", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "fileName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.fileName = `archive_${archiveID++}.tmp`;
        this.archive = api.write_memory(this.fileName, type);
    }
    add(path, buffer, type = FileType.File, perm = 0o777) {
        if (!this.archive)
            throw new Error("ERR_NO_ARCHIVE");
        let ptr = this.api.mod._malloc(buffer.length);
        this.api.mod.HEAPU8.set(buffer, ptr);
        this.api.write_entry(this.archive, path, type, perm, ptr, buffer.length);
    }
    close() {
        if (!this.archive)
            throw new Error("ERR_NO_ARCHIVE");
        this.api.write_close(this.archive);
        const file = this.api.mod.FS.readFile(this.fileName);
        this.api.mod.FS.unlink(this.fileName);
        return file;
    }
}

let mod;
async function createReader(buffer, password, options = {}) {
    if (!mod)
        mod = await load(options);
    return new ArchiveReader(mod, buffer, password);
}
async function createWriter(type = "zip", options = {}) {
    if (!mod)
        mod = await load(options);
    return new ArchiveWriter(mod, type);
}
const util = {
    filePerm,
    permString,
};

exports.createReader = createReader;
exports.createWriter = createWriter;
exports.util = util;
