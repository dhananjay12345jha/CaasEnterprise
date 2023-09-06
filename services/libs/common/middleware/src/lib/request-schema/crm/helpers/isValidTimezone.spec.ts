import isValidTimeZone from "./isValidTimezone";

describe("isValidTimezone", () => {
  it.each(["foo", 1, false, 0, {}, "Not/A/Timezone", null])(
    "should return false if timezone is invalid",
    (v) => {
      expect(isValidTimeZone(v as string)).toBe(false);
    }
  );

  it.each(["Europe/London", "America/Chicago", "Asia/Kuwait", "Europe/Lisbon"])(
    "should return true if timezone is valid",
    (v) => {
      expect(isValidTimeZone(v)).toBe(true);
    }
  );
});
