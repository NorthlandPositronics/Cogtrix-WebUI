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

describe("ApiError.getFieldErrors", () => {
  it("flattens top-level field errors to message arrays", () => {
    const err = new ApiError({
      code: "VALIDATION_ERROR",
      message: "Invalid",
      details: {
        fields: {
          username: [{ code: "TOO_SHORT", message: "Too short" }],
          email: [{ code: "INVALID_FORMAT", message: "Bad email" }],
        },
      },
    });
    expect(err.getFieldErrors()).toEqual({
      username: ["Too short"],
      email: ["Bad email"],
    });
  });

  it("recurses into nested fields and joins them with a dot", () => {
    // The backend nests errors for nested models; a non-recursive read dropped these.
    const err = new ApiError({
      code: "VALIDATION_ERROR",
      message: "Invalid",
      details: {
        fields: {
          config: {
            max_steps: [{ code: "OUT_OF_RANGE", message: "1–200" }],
          },
        },
      },
    });
    expect(err.getFieldErrors()).toEqual({ "config.max_steps": ["1–200"] });
  });

  it("collects multiple messages for one field", () => {
    const err = new ApiError({
      code: "VALIDATION_ERROR",
      message: "Invalid",
      details: {
        fields: {
          password: [
            { code: "TOO_SHORT", message: "Too short" },
            { code: "INVALID", message: "Needs a digit" },
          ],
        },
      },
    });
    expect(err.getFieldErrors()).toEqual({ password: ["Too short", "Needs a digit"] });
  });

  it("returns {} when there are no details or no fields", () => {
    expect(new ApiError({ code: "X", message: "m" }).getFieldErrors()).toEqual({});
    expect(
      new ApiError({ code: "X", message: "m", details: { other: 1 } }).getFieldErrors(),
    ).toEqual({});
  });
});
