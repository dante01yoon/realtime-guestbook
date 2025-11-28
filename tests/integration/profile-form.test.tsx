import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilePage from "@/app/(main)/profile/page";
import "@testing-library/jest-dom";

const saveProfile = vi.fn();
const removeAvatar = vi.fn();

vi.mock("@/hooks/use-profile", () => ({
  useProfile: () => ({
    profile: { id: "profile-1", nickname: "", avatar_url: null },
    saveProfile,
    removeAvatar,
    isSaving: false
  })
}));

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => ({
    user: { id: "user-1" },
    isLoading: false
  })
}));

describe("Profile form flow", () => {
  it("submits nickname change", async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);
    const input = screen.getByPlaceholderText("방명록에서 표시될 이름");
    await user.clear(input);
    await user.type(input, "newnick");
    await user.click(screen.getByRole("button", { name: "프로필 저장" }));
    expect(saveProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        nickname: "newnick"
      })
    );
  });
});
