const libarchive = require("..");

(async () => {
  // Write zip
  const writer = await libarchive.createWriter();
  const contents = new TextEncoder().encode("hi");
  writer.add("hello.txt", contents);
  const zip = writer.close();

  // Read zip
  const reader = await libarchive.createReader(zip);
  for (const entry of reader) {
    console.log(new TextDecoder().decode(entry.extract()));
  }
  reader.close();
})();
