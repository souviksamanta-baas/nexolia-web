import { describe, expect, it } from "vitest";

import { friendlyRole, isStaffRole } from "./admin-role";
import { isMockupsEnabled } from "./mockups-access";
import { nestApiBase } from "./nest-api-base";

describe("friendlyRole", () => {
  it("maps only the two staff roles", () => {
    expect(friendlyRole("super_admin")).toBe("Super Admin");
    expect(friendlyRole("admin")).toBe("Admin");
    expect(friendlyRole("operations")).toBe("Staff");
    expect(isStaffRole("super_admin")).toBe(true);
    expect(isStaffRole("finance")).toBe(false);
  });
});

describe("isMockupsEnabled", () => {
  it("is off in production unless explicitly enabled", () => {
    expect(isMockupsEnabled({ NODE_ENV: "production" })).toBe(false);
    expect(
      isMockupsEnabled({ NODE_ENV: "production", NEXOLIA_ENABLE_MOCKUPS: "true" }),
    ).toBe(true);
    expect(isMockupsEnabled({ NODE_ENV: "development" })).toBe(true);
  });
});

describe("nestApiBase", () => {
  it("prefers the server BAAS_API_URL and strips a trailing slash", () => {
    expect(
      nestApiBase({
        BAAS_API_URL: "https://api.example.test/",
        NEXT_PUBLIC_BAAS_API_URL: "https://browser.example.test",
      }),
    ).toBe("https://api.example.test");
  });
});
