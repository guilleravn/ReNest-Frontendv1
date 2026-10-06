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
});
