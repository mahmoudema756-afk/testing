import assert from "node:assert/strict";
import test from "node:test";
import { maxMaterialBytes, resolveMaterialMime, validateMaterialUpload } from "../lib/upload-validation";

test("accepts a valid PDF", () => {
  const file = { name: "notes.pdf", size: 200, type: "application/pdf" };
  assert.equal(validateMaterialUpload(file), null);
  assert.equal(resolveMaterialMime(file), "application/pdf");
});
test("maps an empty browser MIME type by allowed extension", () => {
  assert.equal(resolveMaterialMime({ name: "slides.pptx", size: 200, type: "" }), "application/vnd.openxmlformats-officedocument.presentationml.presentation");
});
test("rejects oversized, empty, mismatched and unsupported uploads", () => {
  assert.match(validateMaterialUpload({ name: "big.pdf", size: maxMaterialBytes + 1, type: "application/pdf" })!, /smaller/);
  assert.match(validateMaterialUpload({ name: "empty.pdf", size: 0, type: "application/pdf" })!, /empty/);
  assert.match(validateMaterialUpload({ name: "not-a-pdf.pdf", size: 1, type: "text/plain" })!, /Only/);
  assert.match(validateMaterialUpload({ name: "malware.exe", size: 1, type: "application/octet-stream" })!, /Only/);
});
