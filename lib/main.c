#include <stddef.h>
#define LIBARCHIVE_STATIC
#include <archive.h>
#include <archive_entry.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#ifdef EMSCRIPTEN
#include <emscripten.h>
#else
#define EMSCRIPTEN_KEEPALIVE extern
#define EM_ASYNC_JS(a, b, c, d) extern a b c;
#endif

struct ReadCtx {
  size_t id;
  size_t buf_size;
  size_t read;
  uint8_t *buf;
};

#pragma mark - Read

EM_ASYNC_JS(size_t, archive_wait_for_read, (size_t id, uint8_t *buf, size_t buf_size), {
  return Module.archive_wait_for_read(Module, id, buf, buf_size);
});

EM_ASYNC_JS(size_t, archive_wait_for_close, (size_t id), {
  return Module.archive_wait_for_read(Module, id);
});


ssize_t archive_custom_read(struct archive *a, void *client_data,
                            const void **block) {
  struct ReadCtx *ctx = client_data;
  *block = ctx->buf;
  size_t num_read = archive_wait_for_read(ctx->id, ctx->buf, ctx->buf_size);
  ctx->read += num_read;
  printf("read %zu bytes\n", num_read);
  return num_read;
}

int archive_custom_close(struct archive *a, void *client_data) {
  struct ReadCtx *ctx = client_data;
  puts("close");
  archive_wait_for_close(ctx->id);
  free(ctx);
  return ARCHIVE_OK;
}

EMSCRIPTEN_KEEPALIVE
struct archive *archive_read_memory(size_t id, size_t buf_size, const char *passphrase) {
  // create the read context
  struct ReadCtx *ctx = malloc(sizeof(struct ReadCtx));
  if (ctx == NULL)
    return NULL;
  ctx->id = id;
  ctx->buf_size = buf_size;
  ctx->read = 0;
  ctx->buf = malloc(buf_size);
  if (ctx->buf == NULL) {
    free(ctx);
    return NULL;
  }
  // initialize the archive
  struct archive *a = archive_read_new();
  archive_read_support_filter_all(a);
  archive_read_support_format_all(a);

  if (passphrase)
    archive_read_add_passphrase(a, passphrase);

  // set callbacks
  archive_read_set_read_callback(a, archive_custom_read);
  archive_read_set_close_callback(a, archive_custom_close);
  archive_read_set_callback_data(a, ctx);

  // open
  if (archive_read_open1(a) != ARCHIVE_OK)
    return NULL;
  return a;
}

EMSCRIPTEN_KEEPALIVE
struct archive_entry *archive_read_next_entry(struct archive *archive) {
  struct archive_entry *entry;
  puts("hello?");
  int resp = archive_read_next_header(archive, &entry);
  puts("got response");
  if (resp != ARCHIVE_OK) {
    return NULL;
  }
  return entry;
}

#pragma mark - Write

// EMSCRIPTEN_KEEPALIVE
// struct archive *archive_write_memory(const char *file_name, int format) {
//   struct archive *a = archive_write_new();
//   archive_write_set_format(a, format);
//   archive_write_open_filename(a, file_name);
//   return a;
// }

// EMSCRIPTEN_KEEPALIVE
// void archive_write_memory_close(struct archive *archive) {
//   archive_write_close(archive);
//   archive_write_free(archive);
// }

// EMSCRIPTEN_KEEPALIVE
// void archive_write_entry(struct archive *archive, const char *filename, mode_t filetype,
//                          mode_t fileperm, void *buf, size_t buf_size) {
//   struct archive_entry *entry = archive_entry_new();
//   archive_entry_set_pathname(entry, filename);
//   archive_entry_set_size(entry, buf_size);
//   archive_entry_set_filetype(entry, filetype);
//   archive_entry_set_perm(entry, fileperm);
//   archive_write_header(archive, entry);
//   archive_write_data(archive, buf, buf_size);
// }
