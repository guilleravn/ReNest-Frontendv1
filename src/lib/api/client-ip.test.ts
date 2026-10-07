import { describe, expect, it } from "vitest";

import { getClientIp } from "./client-ip";

describe("getClientIp", () => {
  it("takes the only address", () => {
    expect(getClientIp("203.0.113.7")).toBe("203.0.113.7");
  });

  it("takes the rightmost address, added by the closest trusted proxy", () => {
    expect(getClientIp("10.0.0.1, 198.51.100.4,203.0.113.7 ")).toBe("203.0.113.7");
  });

  it("accepts IPv6 addresses", () => {
    expect(getClientIp("2001:db8::1")).toBe("2001:db8::1");
    expect(getClientIp("::ffff:127.0.0.1")).toBe("::ffff:127.0.0.1");
  });

  it.each([null, "", " ", "unknown", "203.0.113.7:8080", "203.0.113.7, evil", "1.2.3.4\r\nX: y"])(
    "returns null when there is no valid address to forward (%j)",
    (header) => {
      expect(getClientIp(header)).toBeNull();
    },
  );
});
