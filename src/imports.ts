import type { ModuleInstance, Pointer } from "./loader";

export async function archiveWaitForRead(mod: ModuleInstance, id: number, ptr: Pointer, len: number): Promise<number> {
	let ctx = mod.openReaders.get(id);
	if (!ctx) return 0;
	let dest = new Uint8Array(mod.HEAPU8, ptr!, len);

	// handle remaining bytes from a previous read
	if (ctx.buf && ctx.offset != 0) {
		let remaining = ctx.buf.length - ctx.offset;
		let data: Uint8Array;
		if (remaining > len) {
			data = ctx.buf.subarray(ctx.offset, ctx.offset + len);
		} else {
			data = ctx.buf.subarray(ctx.offset, ctx.buf.length);
		}
		console.log("read prev data:", data.length, len);
		dest.set(data);
		ctx.offset += data.length;
		if (ctx.offset >= ctx.buf.length) {
			ctx.buf = undefined;
			ctx.offset = 0;
		}
		return data.length;
	}

	// read new data
	const resp = await ctx.reader.read();
	resp.value = resp.value;
	resp.done = resp.done;
	if (resp.done) {
		return 0;
	}
	ctx.buf = resp.value;
	ctx.offset = 0;
	let lengthToRead = Math.min(len, ctx.buf.length);
	let data = ctx.buf.subarray(0, lengthToRead);
	dest.set(data);
	ctx.offset += data.length;
	console.log("read new data:", data.length, len);
	return data.length;
}

export async function archiveWaitForClose(mod: ModuleInstance, id: number): Promise<void> {
	mod.openReaders.delete(id);
}
