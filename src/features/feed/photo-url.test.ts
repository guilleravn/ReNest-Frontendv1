import { describe, expect, it } from "vitest";

import { isRenderablePhotoUrl } from "./photo-url";

describe("isRenderablePhotoUrl", () => {
  it("accepts an absolute https URL", () => {
    expect(isRenderablePhotoUrl("https://example.com/photo.jpg")).toBe(true);
  });

  it("rejects null", () => {
    expect(isRenderablePhotoUrl(null)).toBe(false);
  });

  it("rejects the bare storage key the backend currently returns", () => {
    expect(isRenderablePhotoUrl("listings/018f6e5c-0000-7000-8000-000000000101/photo-0.jpg")).toBe(
      false,
    );
  });

  it("rejects non-http(s) protocols even when they parse as a valid URL", () => {
    expect(isRenderablePhotoUrl("javascript:alert(1)")).toBe(false);
    expect(isRenderablePhotoUrl("data:image/png;base64,aaaa")).toBe(false);
  });
});
