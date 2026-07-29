// lib/daraja.ts — paste this exact content into that new file
// Minimal Safaricom Daraja client: OAuth token + Lipa Na M-Pesa Online
// (STK Push). No SDK, just fetch — keeps this easy to audit.

const BASE_URL =
  process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

interface TokenCache {
  token: string;
  expiresAt: number; // epoch ms
}

declare global {
  // eslint-disable-next-line no-var
  var __darajaTokenCache: TokenCache | undefined;
}

async function getAccessToken(): Promise<string> {
  const cached = global.__darajaTokenCache;
  if (cached && cached.expiresAt > Date.now()) {
    return cached.token;
  }

  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  if (!key || !secret) {
    throw new Error("MPESA_CONSUMER_KEY / MPESA_CONSUMER_SECRET not set");
  }

  const credentials = Buffer.from(`${key}:${secret}`).toString("base64");

  const res = await fetch(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      method: "GET",
      headers: { Authorization: `Basic ${credentials}` },
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Daraja OAuth failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const token = data.access_token as string;

  global.__darajaTokenCache = {
    token,
    expiresAt: Date.now() + 55 * 60 * 1000,
  };

  return token;
}

function timestampNow(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

export function normalizeMsisdn(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.startsWith("7") || digits.startsWith("1")) return `254${digits}`;
  return digits;
}

export interface StkPushResult {
  merchantRequestId: string;
  checkoutRequestId: string;
  responseCode: string;
  responseDescription: string;
  customerMessage: string;
}

export async function initiateStkPush(params: {
  phone: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}): Promise<StkPushResult> {
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.MPESA_CALLBACK_URL;
  if (!shortcode || !passkey || !callbackUrl) {
    throw new Error(
      "MPESA_SHORTCODE / MPESA_PASSKEY / MPESA_CALLBACK_URL not set"
    );
  }

  const token = await getAccessToken();
  const timestamp = timestampNow();
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString(
    "base64"
  );
  const msisdn = normalizeMsisdn(params.phone);

  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.max(1, Math.round(params.amount)),
      PartyA: msisdn,
      PartyB: shortcode,
      PhoneNumber: msisdn,
      CallBackURL: callbackUrl,
      AccountReference: params.accountReference.slice(0, 12),
      TransactionDesc: params.transactionDesc.slice(0, 13),
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.ResponseCode !== "0") {
    const message =
      data.errorMessage || data.ResponseDescription || "STK push rejected";
    throw new Error(message);
  }

  return {
    merchantRequestId: data.MerchantRequestID,
    checkoutRequestId: data.CheckoutRequestID,
    responseCode: data.ResponseCode,
    responseDescription: data.ResponseDescription,
    customerMessage: data.CustomerMessage,
  };
}
