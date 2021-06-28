CC = emcc

EXPORTED_FUNCTIONS = \
	"_free", \
	"_archive_read_has_encrypted_entries", \
	"_archive_read_data", \
	"_archive_read_data_skip", \
	"_archive_read_free", \
	"_archive_entry_filetype", \
	"_archive_entry_pathname_utf8", \
	"_archive_entry_size", \
	"_archive_entry_is_encrypted"

EM_FLAGS = -s USE_ZLIB=1 -s USE_BZIP2=1 -s WASM=1 -O3 -s ALLOW_MEMORY_GROWTH=1 \
	-s EXPORTED_FUNCTIONS='[$(EXPORTED_FUNCTIONS)]' -s EXTRA_EXPORTED_RUNTIME_METHODS='["cwrap", "FS"]' \
	-s ERROR_ON_UNDEFINED_SYMBOLS=0

build: src/archive.js

src/archive.js:
	$(CC) ./lib/main.c -I/usr/local/include/ /usr/local/lib/libarchive.a /usr/local/lib/liblzma.a /usr/local/lib/libssl.a /usr/local/lib/libcrypto.a $(EM_FLAGS) -o $@ #-g4
	mv $@ src/tmp-build.js
	cat lib/pre.js src/tmp-build.js lib/post.js > $@
	@rm src/tmp-build.js

clean:
	@rm src/archive.js src/archive.wasm