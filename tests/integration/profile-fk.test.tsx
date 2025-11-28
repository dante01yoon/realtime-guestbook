import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, act } from "@testing-library/react";
import { useEffect } from "react";
import { useEntries } from "@/hooks/use-entries";
import { useComments } from "@/hooks/use-comments";
import "@testing-library/jest-dom";

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: () => ({ data: [], isLoading: false, isError: false, refetch: vi.fn() }),
    useQueryClient: () => ({
      setQueryData: vi.fn(),
      invalidateQueries: vi.fn()
    })
  };
});

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => ({
    user: { id: "user-1" },
    profile: { id: "profile-1", nickname: "nick", avatar_url: null },
    isLoading: false
  })
}));

const insertMock = vi.fn();
const selectMock = vi.fn();
const singleMock = vi.fn();
const eqMock = vi.fn();
const orderMock = vi.fn();
const maybeSingleMock = vi.fn();
const fromMock = vi.fn(() => ({
  insert: insertMock.mockReturnThis(),
  select: selectMock.mockReturnThis(),
  single: singleMock,
  eq: eqMock.mockReturnThis(),
  order: orderMock.mockReturnThis(),
  maybeSingle: maybeSingleMock
}));
const channelMock = vi.fn(() => ({
  on: () => ({ subscribe: () => ({ unsubscribe: vi.fn() }) }),
  subscribe: () => ({ unsubscribe: vi.fn() }),
  unsubscribe: vi.fn()
}));

vi.mock("@/lib/upload", () => ({
  uploadImage: vi.fn(async () => "https://example.com/avatar.png")
}));

vi.mock("@/lib/supabase-client", () => ({
  getSupabaseClient: () => ({
    from: fromMock,
    channel: channelMock
  })
}));

function EntriesHarness({ onReady }: { onReady: (fn: ReturnType<typeof useEntries>["createEntry"]) => void }) {
  const { createEntry } = useEntries();
  useEffect(() => {
    onReady(createEntry);
  }, [createEntry, onReady]);
  return null;
}

function CommentsHarness({
  entryId,
  onReady
}: {
  entryId: string;
  onReady: (fn: ReturnType<typeof useComments>["addComment"]) => void;
}) {
  const { addComment } = useComments(entryId);
  useEffect(() => {
    onReady(addComment);
  }, [addComment, onReady]);
  return null;
}

describe("profile FK propagation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets author_profile_id on entry creation", async () => {
    const qc = new QueryClient();
    const entryData = {
      id: "e1",
      message: "hello",
      image_url: "https://example.com/img.png",
      created_at: new Date().toISOString(),
      user_id: "user-1",
      author_profile_id: "profile-1",
      profiles: { id: "profile-1", nickname: "nick", avatar_url: null }
    };
    singleMock.mockResolvedValueOnce({ data: entryData, error: null });

    let createEntry!: ReturnType<typeof useEntries>["createEntry"];
    render(
      <QueryClientProvider client={qc}>
        <EntriesHarness
          onReady={(fn) => {
            createEntry = fn;
          }}
        />
      </QueryClientProvider>
    );

    await act(async () => {
      await createEntry({ message: "hello", imageFile: new File([new Uint8Array([1])], "a.png", { type: "image/png" }) });
    });

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        author_profile_id: "profile-1",
        user_id: "user-1"
      })
    );
  });

  it("sets author_profile_id on comment creation", async () => {
    const qc = new QueryClient();
    const commentData = {
      id: "c1",
      body: "nice",
      entry_id: "e1",
      created_at: new Date().toISOString(),
      user_id: "user-1",
      author_profile_id: "profile-1",
      profiles: { id: "profile-1", nickname: "nick", avatar_url: null }
    };
    singleMock.mockResolvedValueOnce({ data: commentData, error: null });

    let addComment!: ReturnType<typeof useComments>["addComment"];
    render(
      <QueryClientProvider client={qc}>
        <CommentsHarness
          entryId="e1"
          onReady={(fn) => {
            addComment = fn;
          }}
        />
      </QueryClientProvider>
    );

    await act(async () => {
      await addComment({ body: "nice" });
    });

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        author_profile_id: "profile-1",
        user_id: "user-1"
      })
    );
  });
});
