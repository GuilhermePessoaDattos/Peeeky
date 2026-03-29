export const ADMIN_EMAILS = [
  "guilhermepessoa31@gmail.com",
  // Add more admin emails here
];

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
