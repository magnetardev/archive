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
#endif

#pragma mark - Read


EMSCRIPTEN_KEEPALIVE
const void *archive_read_memory(const void *buf, size_t size, const char *passphrase) {
  struct archive *a = archive_read_new();
  archive_read_support_filter_all(a);
  archive_read_support_format_all(a);
  if (passphrase) archive_read_add_passphrase(a, passphrase);
  if (archive_read_open_memory(a, buf, size) != ARCHIVE_OK) return NULL;
  return a;
}

EMSCRIPTEN_KEEPALIVE
const void *archive_read_next_entry(void *archive) {
  struct archive_entry *entry;
  return (archive_read_next_header(archive, &entry) != ARCHIVE_OK) ? NULL : entry;
}

#pragma mark - Write

EMSCRIPTEN_KEEPALIVE
struct archive *archive_write_memory(const char *file_name, int format) {
  struct archive *a = archive_write_new();
  archive_write_set_format(a, format);
  archive_write_open_filename(a, file_name);
  return a;
}

EMSCRIPTEN_KEEPALIVE
void archive_write_memory_close(void *archive) {
  archive_write_close(archive);
  archive_write_free(archive);
}

EMSCRIPTEN_KEEPALIVE
void archive_write_entry(
  void *archive, 
  const char *filename, 
  mode_t filetype, 
  mode_t fileperm, 
  void *buf, 
  size_t buf_size
) {
  struct archive_entry *entry = archive_entry_new();
  archive_entry_set_pathname(entry, filename);
  archive_entry_set_size(entry, buf_size);
  archive_entry_set_filetype(entry, filetype);
  archive_entry_set_perm(entry, fileperm);
  archive_write_header(archive, entry);
  archive_write_data(archive, buf, buf_size);
}
