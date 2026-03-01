/// <reference lib="deno.ns" />

import "@supabase/functions-js/edge-runtime.d.ts";

type HookPayload = {
  user?: { email?: string };
  record?: { email?: string };
  email?: string;
};

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const payload = (await req.json()) as HookPayload;

    const email =
      payload?.user?.email ??
      payload?.record?.email ??
      payload?.email;

    if (!email) {
      return new Response(JSON.stringify({ error: "No email in payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY secret" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Until kavion.app is verified in Resend, use onboarding@resend.dev
    const from = Deno.env.get("WELCOME_FROM") ?? "AJ from Kavion <onboarding@resend.dev>";

    const html = `
      <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#070812;padding:24px;color:#EDEBFF;">
        <div style="max-width:560px;margin:0 auto;border:1px solid rgba(255,255,255,0.08);border-radius:18px;overflow:hidden;background:linear-gradient(180deg, rgba(18,16,33,0.95), rgba(10,10,20,0.95));box-shadow:0 24px 60px rgba(0,0,0,0.6);">
          <div style="height:4px;background:linear-gradient(90deg,#7C3AED,#A78BFA,#7C3AED);"></div>
          <div style="padding:22px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
              <span style="display:inline-block;width:14px;height:14px;border-radius:6px;background:#7C3AED;box-shadow:0 0 24px rgba(124,58,237,0.6);"></span>
              <div style="font-weight:800;letter-spacing:0.4px;color:#fff;">KAVION</div>
            </div>

            <h1 style="margin:0 0 10px 0;font-size:20px;color:#fff;font-weight:900;">
              Welcome to Kavion
            </h1>

            <p style="margin:0 0 14px 0;line-height:22px;color:rgba(237,235,255,0.78);font-size:14px;">
              Your command center is ready. Start with one module and build momentum.
            </p>

            <ul style="margin:0 0 16px 18px;color:rgba(237,235,255,0.72);font-size:13.5px;line-height:21px;">
              <li>Create your first <b>Idea</b> (problem → audience → solution)</li>
              <li>Add 1 project you’re shipping this week</li>
              <li>Track one habit that moves the needle</li>
            </ul>

            <p style="margin:16px 0 0 0;color:rgba(237,235,255,0.78);font-size:13px;">
              — AJ from Kavion
            </p>

            <p style="margin:10px 0 0 0;color:rgba(237,235,255,0.45);font-size:11.5px;">
              © Kavion • Automated message
            </p>
          </div>
        </div>
      </div>
    `;

    const resendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Welcome to Kavion — AJ here",
        html,
      }),
    });

    const resendData = await resendResp.json();

    if (!resendResp.ok) {
      return new Response(
        JSON.stringify({ error: "Resend API error", details: resendData }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ ok: true, email, resend: resendData }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});