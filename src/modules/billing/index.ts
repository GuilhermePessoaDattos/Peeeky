import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { activateReferral } from "@/modules/referrals";

const PRICES = {
  PRO_MONTHLY: "price_pro_monthly",
  PRO_ANNUAL: "price_pro_annual",
  BUSINESS_MONTHLY: "price_biz_monthly",
  BUSINESS_ANNUAL: "price_biz_annual",
};

// Create Stripe products and prices on first use
export async function ensureStripePrices() {
  const products = await stripe.products.list({ limit: 10 });

  let proProduct = products.data.find((p) => p.metadata.plan === "PRO");
  let bizProduct = products.data.find((p) => p.metadata.plan === "BUSINESS");

  if (!proProduct) {
    proProduct = await stripe.products.create({
      name: "Peeeky Pro",
      metadata: { plan: "PRO" },
    });

    const proMonthly = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 3900,
      currency: "usd",
      recurring: { interval: "month" },
      metadata: { plan: "PRO", interval: "month" },
    });

    const proAnnual = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 39000,
      currency: "usd",
      recurring: { interval: "year" },
      metadata: { plan: "PRO", interval: "year" },
    });

    PRICES.PRO_MONTHLY = proMonthly.id;
    PRICES.PRO_ANNUAL = proAnnual.id;
  }

  if (!bizProduct) {
    bizProduct = await stripe.products.create({
      name: "Peeeky Business",
      metadata: { plan: "BUSINESS" },
    });

    const bizMonthly = await stripe.prices.create({
      product: bizProduct.id,
      unit_amount: 12900,
      currency: "usd",
      recurring: { interval: "month" },
      metadata: { plan: "BUSINESS", interval: "month" },
    });

    const bizAnnual = await stripe.prices.create({
      product: bizProduct.id,
      unit_amount: 129000,
      currency: "usd",
      recurring: { interval: "year" },
      metadata: { plan: "BUSINESS", interval: "year" },
    });

    PRICES.BUSINESS_MONTHLY = bizMonthly.id;
    PRICES.BUSINESS_ANNUAL = bizAnnual.id;
  }

  // If products exist, fetch their prices
  if (proProduct && PRICES.PRO_MONTHLY === "price_pro_monthly") {
    const prices = await stripe.prices.list({
      product: proProduct.id,
      active: true,
    });
    for (const price of prices.data) {
      if (price.recurring?.interval === "month") PRICES.PRO_MONTHLY = price.id;
      if (price.recurring?.interval === "year") PRICES.PRO_ANNUAL = price.id;
    }
  }

  if (bizProduct && PRICES.BUSINESS_MONTHLY === "price_biz_monthly") {
    const prices = await stripe.prices.list({
      product: bizProduct.id,
      active: true,
    });
    for (const price of prices.data) {
      if (price.recurring?.interval === "month")
        PRICES.BUSINESS_MONTHLY = price.id;
      if (price.recurring?.interval === "year")
        PRICES.BUSINESS_ANNUAL = price.id;
    }
  }

  return PRICES;
}

export async function createCheckoutSession(
  orgId: string,
  plan: "PRO" | "BUSINESS",
  interval: "month" | "year",
  returnUrl: string
) {
  const prices = await ensureStripePrices();

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) throw new Error("Organization not found");

  let customerId = org.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { orgId },
    });
    customerId = customer.id;
    await prisma.organization.update({
      where: { id: orgId },
      data: { stripeCustomerId: customerId },
    });
  }

  const priceId =
    plan === "PRO"
      ? interval === "year"
        ? prices.PRO_ANNUAL
        : prices.PRO_MONTHLY
      : interval === "year"
        ? prices.BUSINESS_ANNUAL
        : prices.BUSINESS_MONTHLY;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${returnUrl}/documents?upgraded=true`,
    cancel_url: `${returnUrl}/settings/billing`,
    metadata: { orgId, plan },
  });

  return session.url;
}

export async function createPortalSession(orgId: string, returnUrl: string) {
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org?.stripeCustomerId) throw new Error("No billing account");

  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripeCustomerId,
    return_url: `${returnUrl}/settings/billing`,
  });

  return session.url;
}

export async function handleWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.orgId;
      const plan = session.metadata?.plan as "PRO" | "BUSINESS";

      if (orgId && plan) {
        await prisma.organization.update({
          where: { id: orgId },
          data: {
            plan,
            stripeSubId: session.subscription as string,
          },
        });

        // Activate referral on first payment
        await activateReferral(orgId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const org = await prisma.organization.findFirst({
        where: { stripeCustomerId: sub.customer as string },
      });

      if (org && sub.status === "active") {
        const priceId = sub.items.data[0]?.price.id;
        const prices = await ensureStripePrices();

        let plan: "FREE" | "PRO" | "BUSINESS" = "FREE";
        if (priceId === prices.PRO_MONTHLY || priceId === prices.PRO_ANNUAL)
          plan = "PRO";
        if (
          priceId === prices.BUSINESS_MONTHLY ||
          priceId === prices.BUSINESS_ANNUAL
        )
          plan = "BUSINESS";

        await prisma.organization.update({
          where: { id: org.id },
          data: { plan, stripeSubId: sub.id },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const org = await prisma.organization.findFirst({
        where: { stripeCustomerId: sub.customer as string },
      });

      if (org) {
        await prisma.organization.update({
          where: { id: org.id },
          data: { plan: "FREE", stripeSubId: null },
        });
      }
      break;
    }
  }
}
