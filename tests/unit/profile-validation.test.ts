import { describe, expect, it } from "vitest";
import { nicknameSchema, profileFormSchema } from "@/lib/validation/profile";

const makeFile = (size: number, type = "image/png") =>
  new File([new Uint8Array(size)], "avatar.png", { type });

describe("profile validation", () => {
  it("accepts a valid nickname", () => {
    expect(nicknameSchema.parse("사용자-01")).toBe("사용자-01");
  });

  it("rejects short nickname", () => {
    expect(() => nicknameSchema.parse("a")).toThrow();
  });

  it("rejects invalid characters", () => {
    expect(() => nicknameSchema.parse("name!")).toThrow();
  });

  it("rejects oversized avatar", () => {
    const bigFile = makeFile(5 * 1024 * 1024 + 1);
    expect(() =>
      profileFormSchema.parse({ nickname: "tester", avatarFile: bigFile })
    ).toThrow();
  });

  it("rejects unsupported avatar type", () => {
    const gifFile = makeFile(1024, "image/gif");
    expect(() =>
      profileFormSchema.parse({ nickname: "tester", avatarFile: gifFile })
    ).toThrow();
  });
});
