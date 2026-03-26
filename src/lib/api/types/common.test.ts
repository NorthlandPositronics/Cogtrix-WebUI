import { ApiError } from "./common";

describe("ApiError", () => {
  it("extends Error with code and details", () => {
    const err = new ApiError({
      code: "VALIDATION_ERROR",
      message: "Invalid input",
      details: { fields: { username: [{ code: "too_short", message: "Too short" }] } },
    });

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.name).toBe("ApiError");
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.message).toBe("Invalid input");
    expect(err.details?.fields).toBeDefined();
  });

  it("works without details", () => {
    const err = new ApiError({ code: "NOT_FOUND", message: "Not found" });

    expect(err.code).toBe("NOT_FOUND");
    expect(err.details).toBeUndefined();
  });

  it("has a proper stack trace", () => {
    const err = new ApiError({ code: "TEST", message: "test" });

    expect(err.stack).toBeDefined();
  });
});
