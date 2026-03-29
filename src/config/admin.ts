export const ADMIN_EMAILS = [
  "guilhermecpessoa@gmail.com",
  // Add more admin emails here
];

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
