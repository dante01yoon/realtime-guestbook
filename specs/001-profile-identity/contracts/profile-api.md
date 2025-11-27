# Contracts: Profile Identity

## REST Endpoints (conceptual)

### GET /api/profile
- Purpose: Fetch current user profile (nickname, avatar_url).
- Auth: Required (current session user).
- Response 200: `{ "nickname": string, "avatar_url": string | null }`
- Response 404: Profile not set.

### PUT /api/profile
- Purpose: Create/update profile with nickname + avatar reference.
- Auth: Required.
- Request: `{ "nickname": string (2-20, unique), "avatar_url": string | null }`
- Responses:
  - 200: `{ "nickname": string, "avatar_url": string | null }`
  - 409: Nickname already taken.
  - 422: Validation errors (length/charset, file too large/unsupported type).

### DELETE /api/profile/avatar
- Purpose: Remove avatar and revert to placeholder.
- Auth: Required.
- Responses: 204 on success.

## Storage
- Bucket: `avatars` (public-read), write restricted to owner; max 5 MB; JPEG/PNG/WebP only.
- Object path: `avatars/{user_id}/{timestamp}.{ext}`.
