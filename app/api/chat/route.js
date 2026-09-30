import { NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/systemPrompt";
import { demoRespond } from "@/lib/demoResponder";

export const runtime = "nodejs";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === "user")?.content || "";

    let reply;
    let source;

    if (process.env.GROQ_API_KEY) {
      reply = await callGroq(messages);
      source = "groq";
    } else if (process.env.ANTHROPIC_API_KEY) {
      reply = await callAnthropic(messages);
      source = "anthropic";
    } else if (process.env.OPENAI_API_KEY) {
      reply = await callOpenAI(messages);
      source = "openai";
    } else {
      // No API key configured — fall back to local keyword retrieval over
      // the same knowledge base, so the demo still works out of the box.
      reply = demoRespond(lastUserMessage);
      source = "demo";
    }

    return NextResponse.json({ reply, source }, { headers: corsHeaders() });
  } catch (err) {
    console.error("chat api error:", err);
    return NextResponse.json(
      {
        reply:
          "Something went wrong on our end — please try again, or reach us directly.",
        error: true,
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function callGroq(messages) {
  // Groq offers a free API tier (no credit card) with OpenAI-compatible
  // chat completions, running fast open models like Llama 3.3.
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      max_tokens: 400,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Groq API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return (
    data.choices?.[0]?.message?.content?.trim() ||
    "Sorry, I couldn't generate a response."
  );
}

async function callAnthropic(messages) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
      max_tokens: 400,
      system: buildSystemPrompt(),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text?.trim() || "Sorry, I couldn't generate a response.";
}

async function callOpenAI(messages) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      max_completion_tokens: 4400,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return (
    data.choices?.[0]?.message?.content?.trim() ||
    "Scusa, il mio cervello IA ha avuto un bug, puoi rifarmi la domanda?"
  );
}
