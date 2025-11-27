import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET, PUT } from "@/app/api/profile/route";
import { DELETE as DELETE_AVATAR } from "@/app/api/profile/avatar/route";

const profileRow = {
  id: "user-1",
  user_id: "user-1",
  nickname: "tester",
  avatar_url: "https://example.com/avatar.png",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const authMock = {
  getUser: vi.fn()
};

const fromProfiles = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn(),
  upsert: vi.fn().mockReturnThis(),
  single: vi.fn(),
  update: vi.fn().mockReturnThis()
};

const storageRemove = vi.fn();
const supabaseMock = {
  auth: authMock,
  from: vi.fn(() => fromProfiles),
  storage: {
    from: vi.fn(() => ({
      remove: storageRemove
    }))
  }
};

vi.mock("@/lib/supabase-server", () => ({
  createServerClient: () => supabaseMock
}));

describe("profile API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    fromProfiles.maybeSingle.mockResolvedValue({ data: profileRow, error: null });
    fromProfiles.single.mockResolvedValue({ data: profileRow, error: null });
    storageRemove.mockResolvedValue({ data: null, error: null });
  });

  it("GET returns profile data", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body?.nickname).toBe("tester");
  });

  it("PUT updates profile with nickname", async () => {
    const res = await PUT(
      new Request("http://localhost/api/profile", {
        method: "PUT",
        body: JSON.stringify({ nickname: "newnick", avatarUrl: null })
      })
    );
    expect(res.status).toBe(200);
    expect(fromProfiles.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        nickname: "newnick",
        avatar_url: null
      }),
      { onConflict: "id" }
    );
  });

  it("PUT returns 409 on duplicate nickname", async () => {
    fromProfiles.single.mockResolvedValueOnce({
      data: null,
      error: { message: "duplicate", code: "23505" }
    });
    const res = await PUT(
      new Request("http://localhost/api/profile", {
        method: "PUT",
        body: JSON.stringify({ nickname: "dup", avatarUrl: null })
      })
    );
    expect(res.status).toBe(409);
  });

  it("DELETE clears avatar and removes storage object", async () => {
    fromProfiles.maybeSingle.mockResolvedValueOnce({
      data: { avatar_url: "https://example.com/storage/v1/object/public/avatars/user-1/old.png" },
      error: null
    });
    const res = await DELETE_AVATAR();
    expect(res.status).toBe(200);
    expect(storageRemove).toHaveBeenCalled();
  });
});
