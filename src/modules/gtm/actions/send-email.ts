import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface OutboundEmail {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

export async function sendOutboundEmail(email: OutboundEmail) {
  const result = await resend.emails.send({
    from: email.from || "Alex Moreira <alex@peeeky.com>",
    to: email.to,
    subject: email.subject,
    text: email.body,
  });

  return {
    id: result.data?.id,
    success: !result.error,
    error: result.error?.message,
  };
}

export async function sendBatchEmails(emails: OutboundEmail[]) {
  const results = [];
  for (const email of emails) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    results.push(await sendOutboundEmail(email));
  }
  return results;
}
