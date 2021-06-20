const libarchive = require("..");

test("compress: zip", async () => {
  // Write zip
  const writer = await libarchive.createWriter();
  const contents = new TextEncoder().encode("hi");
  writer.add("hello.txt", contents);
  const zip = writer.close();

  // Read zip
  const reader = await libarchive.createReader(zip);
  let resp;
  let raw = reader.entries().next().value.extract();
  let str = new TextDecoder().decode(raw);
  reader.close();
  expect(str).toBe("hi");
});
