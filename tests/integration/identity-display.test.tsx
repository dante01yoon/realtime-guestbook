import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PostItBoard from "@/components/postit-board";
import CommentThread from "@/components/comment-thread";
import "@testing-library/jest-dom";

vi.mock("@/hooks/use-entries", () => ({
  useEntries: () => ({
    entries: [
      {
        id: "e1",
        message: "hello",
        image_url: "https://example.com/1.png",
        created_at: new Date().toISOString(),
        user_id: "user-1",
        author_profile_id: "profile-1",
        profiles: { id: "profile-1", nickname: "닉네임", avatar_url: null }
      },
      {
        id: "e2",
        message: "no profile",
        image_url: "https://example.com/2.png",
        created_at: new Date().toISOString(),
        user_id: "user-2",
        author_profile_id: null,
        profiles: null
      }
    ],
    isLoading: false,
    isError: false,
    refetch: vi.fn()
  })
}));

vi.mock("@/hooks/use-comments", () => ({
  useComments: () => ({
    comments: [
      {
        id: "c1",
        body: "nice",
        entry_id: "e1",
        created_at: new Date().toISOString(),
        user_id: "user-1",
        author_profile_id: "profile-1",
        profiles: { id: "profile-1", nickname: "닉네임", avatar_url: null }
      },
      {
        id: "c2",
        body: "anon",
        entry_id: "e1",
        created_at: new Date().toISOString(),
        user_id: "user-2",
        author_profile_id: null,
        profiles: null
      }
    ],
    isLoading: false,
    addComment: vi.fn(),
    isAdding: false
  })
}));

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => ({
    user: { id: "user-1" },
    profile: { id: "profile-1", nickname: "닉네임", avatar_url: null },
    isLoading: false
  })
}));

describe("identity display", () => {
  it("shows nickname and placeholder in gallery", () => {
    render(<PostItBoard />);
    expect(screen.getByText("닉네임")).toBeInTheDocument();
    expect(screen.getByText("방명록 사용자")).toBeInTheDocument();
  });

  it("shows nickname and placeholder in comments", () => {
    render(<CommentThread entryId="e1" />);
    expect(screen.getAllByText("닉네임").length).toBeGreaterThan(0);
    expect(screen.getByText("익명")).toBeInTheDocument();
  });
});
