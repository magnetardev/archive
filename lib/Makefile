CC = emcc
AR = emar
BASH = emmake bash
EMMAKE = emmake make
EMCMAKE = emcmake cmake
CONFIGURE = emconfigure
LD_FLAGS = -s USE_ZLIB=1 -s USE_BZIP2=1 -s ALLOW_MEMORY_GROWTH=1 -s EXPORTED_RUNTIME_METHODS="['cwrap', 'FS']" -s EXPORTED_FUNCTIONS="['_free', \
	'_archive_read_has_encrypted_entries', \
	'_archive_read_data', \
	'_archive_read_data_skip', \
	'_archive_read_free', \
	'_archive_entry_filetype', \
	'_archive_entry_pathname_utf8', \
	'_archive_entry_size', \
	'_archive_entry_is_encrypted']"
DEPENDS_DIR=./depends/

# Dependency URLs
OPENSSL_URL=https://www.openssl.org/source/openssl-1.1.1l.tar.gz
LIBLZMA_URL=https://netix.dl.sourceforge.net/project/lzmautils/xz-5.2.4.tar.gz
LIBARCHIVE_URL=https://github.com/libarchive/libarchive/releases/download/v3.5.2/libarchive-3.5.2.zip

# Define Dependency Sources
LIBLZMA_DEPENDS = $(DEPENDS_DIR)liblzma/src/liblzma/.libs/liblzma.a
LIBARCHIVE_DEPENDS = $(DEPENDS_DIR)libarchive/.libs/libarchive.a
OPENSSL_DEPENDS = $(DEPENDS_DIR)openssl/libssl.a $(DEPENDS_DIR)openssl/libcrypto.a
DEPENDS = $(LIBLZMA_DEPENDS) $(LIBARCHIVE_DEPENDS) $(OPENSSL_DEPENDS)
INCLUDE = -I$(DEPENDS_DIR)openssl/include -I$(DEPENDS_DIR)liblzma/src/liblzma/api -I$(DEPENDS_DIR)libarchive/libarchive

.PHONY: all clean
.PRECIOUS: %/.sentinel

all: ../src/archive.js

%/.sentinel:
	mkdir -p $(@D)
	touch $@

# -- Fetch Dependencies -- 
$(DEPENDS_DIR)openssl.tar.gz: $(DEPENDS_DIR).sentinel
	curl $(OPENSSL_URL) -o $@

$(DEPENDS_DIR)liblzma.tar.gz: $(DEPENDS_DIR).sentinel
	curl $(LIBLZMA_URL) -o $@

$(DEPENDS_DIR)libarchive.zip: $(DEPENDS_DIR).sentinel
	curl $(LIBARCHIVE_URL) -L -o $@

## -- Build Dependencies --
$(LIBLZMA_DEPENDS): $(DEPENDS_DIR)liblzma.tar.gz
	mkdir $(DEPENDS_DIR)liblzma 
	tar xf $(DEPENDS_DIR)liblzma.tar.gz -C $(DEPENDS_DIR)liblzma --strip-components=1
	cd $(DEPENDS_DIR)liblzma && \
	$(CONFIGURE) ./configure --disable-assembler --enable-threads=no --enable-static=yes 2>&1 | tee conf.out && \
	$(EMMAKE) 2>&1 | tee make.out

$(OPENSSL_DEPENDS): $(DEPENDS_DIR)openssl.tar.gz
	mkdir $(DEPENDS_DIR)openssl
	tar xf $(DEPENDS_DIR)openssl.tar.gz -C $(DEPENDS_DIR)openssl --strip-components=1
	cd $(DEPENDS_DIR)openssl && \
	$(BASH) -c "./Configure linux-generic32 no-threads no-asm no-tests" && \
	sed -i.bak -e 's/CROSS_COMPILE=.*/CROSS_COMPILE=/'g ./Makefile && \
	$(EMMAKE)

$(LIBARCHIVE_DEPENDS): $(DEPENDS_DIR)libarchive.zip
	unzip $(DEPENDS_DIR)libarchive.zip -d $(DEPENDS_DIR)
	mv $(DEPENDS_DIR)libarchive-3.5.2 $(DEPENDS_DIR)libarchive 
	cd $(DEPENDS_DIR)libarchive && \
	$(CONFIGURE) ./configure --enable-static --disable-shared --enable-bsdtar=static --enable-bsdcat=static \
    --enable-bsdcpio=static --enable-posix-regex-lib=libc \
    --disable-xattr --disable-acl --without-nettle --without-lzo2 \
    --without-cng  --without-lz4 \
    --without-xml2 --without-expat 2>&1 | tee conf.out && \
    $(EMMAKE) 2>&1 | tee make.out

# -- Build Wrapper -- 
../src/archive.js: $(DEPENDS)
	$(CC) -O3 $(LD_FLAGS) $(INCLUDE) main.c $(DEPENDS) -o $@
	mv $@ $@.tmp
	cat pre.js $@.tmp post.js > $@
	@rm $@.tmp 
	mkdir -p ../public
	@mv ../src/archive.wasm ../public/

clean:
	@rm -rf $(DEPENDS_DIR) ../src/archive.js ../public/archive.wasm
