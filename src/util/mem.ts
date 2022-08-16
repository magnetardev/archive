import type { Pointer } from "../loader";

export function readCString(textDecoder: TextDecoder, buffer: Uint8Array, ptr: number): string {
	let i = ptr;
	while (buffer[i] !== 0) {
		i++;
	}
	return textDecoder.decode(buffer.subarray(ptr, i));
}

export function writeCString(
	textEncoder: TextEncoder,
	allocator: (size: number) => Pointer,
	buffer: Uint8Array,
	str: string
): number {
	let bytes = textEncoder.encode(str + "\0");
	let ptr = allocator(bytes.length);
	if (!ptr) {
		throw new Error("Failed to allocate string");
	}
	buffer.set(bytes, ptr);
	return ptr;
}
