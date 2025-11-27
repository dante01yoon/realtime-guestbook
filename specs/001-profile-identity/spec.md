# Feature Specification: Profile Identity

**Feature Branch**: `001-profile-identity`  
**Created**: 2025-11-27  
**Status**: Draft  
**Input**: User description: "사용자가 자신의 정체성을 표현할 수 있도록 닉네임과 프로필 이미지를 설정하는 기능을 제공한다. 이를 통해 방명록에서 누가 글을 작성했는지 명확하게 인지하고, 커뮤니티의 유대감을 높인다."
**Constitution Alignment**: Grounded in `AGENTS.md` and `memory-bank` (architecture, progress) for
identity display; UX consistency and modular Supabase helpers to be captured in plan/tasks.

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Set Identity (Priority: P1)

An authenticated user sets a nickname and profile image to show their identity in the guestbook.

**Why this priority**: Core to user recognition and community trust; without it, entries remain
anonymous.

**Independent Test**: User sets nickname + uploads valid image; entries/comments reflect identity
without other features.

**Acceptance Scenarios**:

1. **Given** a signed-in user without a set identity, **When** they enter a valid nickname (2-20
   chars) and upload a supported image, **Then** the profile saves and shows success feedback.
2. **Given** a user with an existing identity, **When** they revisit, **Then** the previously saved
   nickname and image are prefilled/displayed.

---

### User Story 2 - Edit or Remove Identity (Priority: P2)

User updates or removes their nickname/image when tastes change or privacy is needed.

**Why this priority**: Keeps profiles accurate and prevents stale/undesired identity display.

**Independent Test**: User changes nickname and swaps/removes image; new identity persists and
renders everywhere without other dependencies.

**Acceptance Scenarios**:

1. **Given** a user with an identity, **When** they upload a new valid image, **Then** the new image
   replaces the old one and is visible on their entries/comments.
2. **Given** a user with an identity, **When** they remove the image, **Then** a default placeholder
   appears on entries/comments.

---

### User Story 3 - View Identities in Guestbook (Priority: P3)

Guestbook viewers see who authored entries/comments via nickname and profile image.

**Why this priority**: Improves trust, context, and engagement across the gallery and comments.

**Independent Test**: Viewing the guestbook shows nickname + image for each entry/comment without
requiring other feature work.

**Acceptance Scenarios**:

1. **Given** entries with saved identities, **When** the gallery loads, **Then** each card shows the
   author’s nickname and image (or placeholder) consistently.
2. **Given** comments tied to authors, **When** comments render, **Then** they display the same
   nickname/image as the author’s profile.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- Upload fails due to unsupported file type or size; user receives actionable error and no data is
  persisted.
- Nickname input is blank, too short/long, or contains only whitespace; user is prompted to correct
  without saving partial data.
- User removes image; placeholder appears and no broken images show in guestbook or comments.
- Identity updated while a guestbook view is open; subsequent refresh or realtime update reflects
  the latest nickname/image.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: Authenticated users MUST be able to set a nickname (2-20 characters, letters/numbers
  and basic separators like space, period, underscore, hyphen) and save it.
- **FR-002**: Authenticated users MUST be able to upload a profile image up to 5 MB in common formats
  (JPEG/PNG/WebP) and see a preview before saving; oversized/unsupported files are blocked with clear
  messaging.
- **FR-003**: Users MUST be able to update or remove their profile image; removal restores a default
  placeholder.
- **FR-004**: Users MUST be able to edit their nickname and save changes with confirmation; nickname
  cannot be empty or whitespace-only.
- **FR-005**: Guestbook entries and comments MUST display the author’s current nickname and image (or
  placeholder) in gallery/list/detail views.
- **FR-006**: Identity changes MUST propagate to past and future entries/comments within the same
  session reload; no stale mixed identities after refresh.
- **FR-007**: Only the profile owner may create/update/delete their nickname/image; unauthorized edits
  are rejected with an error.
- **FR-008**: Nicknames MUST be globally unique; attempts to use an existing nickname are blocked
  with a clear prompt to choose another.

### Key Entities *(include if feature involves data)*

- **Profile**: Represents a user’s identity settings; attributes include user identifier, nickname,
  image reference, and last-updated timestamp.
- **Guestbook Entry**: Represents a posted card with author metadata; references the author’s profile
  for nickname/image when rendered.
- **Comment**: Represents feedback on an entry; references the author’s profile for nickname/image
  display.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 90% of users complete setting nickname + image on first attempt within 2 minutes.
- **SC-002**: 100% of new guestbook entries/comments display the author’s nickname and image (or
  placeholder) on first render.
- **SC-003**: Profile updates reflect on entries/comments within 1 minute of save after a refresh.
- **SC-004**: Upload failures for valid files remain under 2% over a rolling 7-day window.

## Assumptions

- Existing authentication identifies users; this feature does not redefine auth.
- Default placeholder image is already available or will be defined alongside UI work.
- Network and storage capacity support images up to 5 MB without impacting page responsiveness.
