import { describe, expect, it } from "vitest";
import { commentFormSchema, entryFormSchema } from "@/lib/zod-schemas";

describe("entryFormSchema", () => {
  it("should validate correct payload", () => {
    const result = entryFormSchema.safeParse({
      author: "홍길동",
      message: "안녕하세요",
      imageFile: new Blob(["test"], { type: "image/png" })
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty fields", () => {
    const result = entryFormSchema.safeParse({
      author: "",
      message: "",
      imageFile: new Blob([], { type: "image/png" })
    });
    expect(result.success).toBe(false);
  });
});

describe("commentFormSchema", () => {
  it("should reject long comment", () => {
    const longMessage = "a".repeat(400);
    const result = commentFormSchema.safeParse({
      author: "tester",
      body: longMessage
    });
    expect(result.success).toBe(false);
  });
});
