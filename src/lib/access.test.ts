import test from "node:test";
import assert from "node:assert/strict";
import {
  canAccessCourse,
  isReadyForAdminReview,
  migrateLegacyAccess,
  waitingReason,
} from "./access";

test("админ всегда имеет доступ к курсу", () => {
  assert.equal(
    canAccessCourse({
      role: "ADMIN",
      accessStatus: "PENDING",
      emailVerified: false,
    }),
    true
  );
});

test("куратор всегда имеет доступ к курсу", () => {
  assert.equal(
    canAccessCourse({
      role: "CURATOR",
      accessStatus: "PENDING",
      emailVerified: false,
    }),
    true
  );
});

test("ученик без одобрения админа не имеет доступа", () => {
  assert.equal(
    canAccessCourse({
      role: "STUDENT",
      accessStatus: "PENDING",
      emailVerified: true,
    }),
    false
  );
});

test("ученик после одобрения админа имеет доступ", () => {
  assert.equal(
    canAccessCourse({
      role: "STUDENT",
      accessStatus: "ACTIVE",
      emailVerified: true,
    }),
    true
  );
});

test("отклонённый ученик не имеет доступа", () => {
  assert.equal(
    canAccessCourse({
      role: "STUDENT",
      accessStatus: "REJECTED",
      emailVerified: true,
    }),
    false
  );
});

test("в очередь админа попадает только подтверждённая почта и pending", () => {
  assert.equal(
    isReadyForAdminReview({
      role: "STUDENT",
      accessStatus: "PENDING",
      emailVerified: true,
    }),
    true
  );
  assert.equal(
    isReadyForAdminReview({
      role: "STUDENT",
      accessStatus: "PENDING",
      emailVerified: false,
    }),
    false
  );
  assert.equal(
    isReadyForAdminReview({
      role: "STUDENT",
      accessStatus: "ACTIVE",
      emailVerified: true,
    }),
    false
  );
  assert.equal(
    isReadyForAdminReview({
      role: "ADMIN",
      accessStatus: "PENDING",
      emailVerified: true,
    }),
    false
  );
  assert.equal(
    isReadyForAdminReview({
      role: "CURATOR",
      accessStatus: "PENDING",
      emailVerified: true,
    }),
    false
  );
});

test("причина ожидания зависит от почты и статуса доступа", () => {
  assert.equal(
    waitingReason({
      role: "STUDENT",
      accessStatus: "PENDING",
      emailVerified: false,
    }),
    "confirm_email"
  );
  assert.equal(
    waitingReason({
      role: "STUDENT",
      accessStatus: "PENDING",
      emailVerified: true,
    }),
    "awaiting_admin"
  );
  assert.equal(
    waitingReason({
      role: "STUDENT",
      accessStatus: "REJECTED",
      emailVerified: true,
    }),
    "rejected"
  );
  assert.equal(
    waitingReason({
      role: "STUDENT",
      accessStatus: "ACTIVE",
      emailVerified: true,
    }),
    null
  );
});

test("старые учётки: админ и куратор активны, ученик ждёт одобрения", () => {
  assert.deepEqual(migrateLegacyAccess({ role: "ADMIN" }), {
    accessStatus: "ACTIVE",
    emailVerified: true,
  });
  assert.deepEqual(migrateLegacyAccess({ role: "CURATOR" }), {
    accessStatus: "ACTIVE",
    emailVerified: true,
  });
  assert.deepEqual(migrateLegacyAccess({ role: "STUDENT" }), {
    accessStatus: "PENDING",
    emailVerified: true,
  });
});
