export type AccessRole = "STUDENT" | "CURATOR" | "ADMIN";
export type AccessStatus = "PENDING" | "ACTIVE" | "REJECTED";
export type WaitingReason = "confirm_email" | "awaiting_admin" | "rejected";

export type AccessSnapshot = {
  role: AccessRole;
  accessStatus: AccessStatus;
  emailVerified: boolean;
};

export function canAccessCourse(user: AccessSnapshot): boolean {
  if (user.role === "ADMIN" || user.role === "CURATOR") return true;
  return user.accessStatus === "ACTIVE";
}

export function isReadyForAdminReview(user: AccessSnapshot): boolean {
  return (
    user.role === "STUDENT" &&
    user.accessStatus === "PENDING" &&
    user.emailVerified
  );
}

export function waitingReason(user: AccessSnapshot): WaitingReason | null {
  if (canAccessCourse(user)) return null;
  if (user.accessStatus === "REJECTED") return "rejected";
  if (!user.emailVerified) return "confirm_email";
  return "awaiting_admin";
}

export function migrateLegacyAccess(user: { role: AccessRole }): Pick<
  AccessSnapshot,
  "accessStatus" | "emailVerified"
> {
  if (user.role === "ADMIN" || user.role === "CURATOR") {
    return { accessStatus: "ACTIVE", emailVerified: true };
  }
  return { accessStatus: "PENDING", emailVerified: true };
}
