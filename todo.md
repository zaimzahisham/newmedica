# NewMedica MVP To-Do List - PRIORITY BASED

This document outlines tasks to complete the MVP for NewMedica, **prioritized by blocking dependencies**. Follow GEMINI.md/WARP.md TDD approach: write tests first, implement minimal code, refactor.

**CRITICAL**: Address 🔴 BLOCKERS before any other work. These prevent MVP progress.

---

## ✅ PHASE 0: CRITICAL BLOCKERS (Fix Immediately) - COMPLETED

*Goal: Resolve blockers preventing MVP development*

---

## ✅ PHASE 1: HIGH PRIORITY MVP FEATURES - COMPLETED

*Goal: Implement core e-commerce functionality*

---

## ✅ PHASE 2: INFRASTRUCTURE & TOOLING - COMPLETED

*Goal: Production readiness and development efficiency*

---

## 🔵 PHASE 3: REMAINING MVP FEATURES

*Goal: Complete MVP feature set*

### ✅ Task 3.5: Implement Backend `extra_fields` Validation (TDD)
**Priority**: 🟢 Completed
**Dependencies**: None
**Estimated Time**: 3-4 hours
**Action Required**:
1. **Write Tests First**: Create unit/integration tests to verify `extra_fields` validation for different `UserType`s (Agent, Healthcare).
2. **Implement Validation Logic**: Add Pydantic validation to the `UserCreate` schema or a dedicated service layer to ensure `extra_fields` conform to the expected structure and required fields for each `UserType`.
3. **Integrate with Registration/Profile Update**: Ensure this validation is applied during user registration and profile updates.
4. **Make Tests Pass**: Ensure all validation tests pass.

**Acceptance Criteria**:
- [x] `extra_fields` are correctly validated based on `UserType` during registration and profile updates.
- [x] Invalid `extra_fields` data results in appropriate error responses.
- [x] All existing tests pass.

### Task 3.10: Admin User Management (Backend & Frontend)
**Priority**: ⚪ Lowest - Post-MVP Consideration
**Dependencies**: None
**Estimated Time**: 6-8 hours

**Backend Action Required**:
1. Implement `GET /api/v1/admin/users` to list pending Agent/Healthcare users.
2. Implement `POST /api/v1/admin/users/{id}/approve` to approve a user.

**Frontend Action Required**:
1. Create `/admin` page with a UI to list and approve/reject Agent/Healthcare users.

**Acceptance Criteria**:
- [ ] Admin users can view a list of pending Agent/Healthcare registrations.
- [ ] Admin users can approve or reject pending registrations.
- [ ] Backend endpoints are secured for admin access only.

---

## GEMINI CLI WORKING INSTRUCTIONS

**WHEN STARTING WORK**:
1. Always run tests first: `cd newmedica-backend && uv run pytest tests/ -v`
2. Check current working directory - should match the component you're working on
3. Follow TDD: Write failing tests → Implement → Make tests pass → Refactor

**TASK COMPLETION CRITERIA**:
- All tests pass
- Code follows GEMINI.md/WARP.md conventions
- Update this todo.md marking tasks complete
- Update project-state.md with progress

**PRIORITY SEQUENCE**:
1. **Never skip 🔴 BLOCKERS** - They prevent all other work
2. Complete Phase 0 entirely before starting Phase 1
3. Within each phase, complete tasks in numerical order
4. Always verify with tests before moving to next task
