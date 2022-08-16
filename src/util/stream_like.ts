export interface ReadableStreamLike<T> {
	read(): Promise<ReadableStreamDefaultReadResult<T>>;
}

export class BufferReadableStreamLike implements ReadableStreamLike<Uint8Array> {
	#buf: Uint8Array;
	#pos: number = 0;
	#size: number;
	#readAmount: number;

	constructor(buf: Uint8Array, readAmount: number) {
		this.#buf = buf;
		this.#readAmount = readAmount;
		this.#size = buf.length;
	}

	async read(): Promise<ReadableStreamDefaultReadResult<Uint8Array>> {
		if (this.#pos >= this.#size) {
			return {
				done: true,
				value: undefined,
			};
		}
		let bump = Math.min(this.#pos + this.#readAmount, this.#size);
		let value = this.#buf.subarray(this.#pos, bump);
		this.#pos += value.length;
		return {
			done: false,
			value,
		};
	}
}
