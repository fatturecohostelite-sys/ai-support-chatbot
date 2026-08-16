import knowledgeBase from "./knowledgeBase";

// Zero-key fallback so the demo works out of the box for anyone previewing
// this portfolio project without an API key configured. It does simple
// keyword retrieval over the same knowledge base that would otherwise be
// injected into the LLM prompt — same data source, no model call. Wiring up
// ANTHROPIC_API_KEY or OPENAI_API_KEY switches to a real LLM call (see
// app/api/chat/route.js) without touching the knowledge base at all.
export function demoRespond(userMessage) {
  const msg = userMessage.toLowerCase();

  const hit = (keywords) => keywords.some((k) => msg.includes(k));

  if (hit(["hour", "open", "close", "weekend", "sunday", "saturday"])) {
    const hoursText = knowledgeBase.hours
      .map((h) => `${h.day}: ${h.time}`)
      .join(", ");
    return `Our hours are — ${hoursText}. For emergencies we're reachable 24/7 on ${knowledgeBase.business.phone}.`;
  }

  if (hit(["emergency", "burst", "leak", "flood"])) {
    const svc = knowledgeBase.services.find((s) => /emergency/i.test(s.name));
    return `For emergencies like leaks or burst pipes: ${svc.price}. ${svc.notes} Call our 24/7 line at ${knowledgeBase.business.phone}.`;
  }

  if (hit(["drain", "clog", "block"])) {
    const svc = knowledgeBase.services.find((s) => /drain/i.test(s.name));
    return `${svc.name} is ${svc.price}. ${svc.notes}`;
  }

  if (hit(["water heater", "heater", "tank"])) {
    const svc = knowledgeBase.services.find((s) => /water heater/i.test(s.name));
    return `${svc.name}: ${svc.price}. ${svc.notes}`;
  }

  if (hit(["faucet", "toilet", "sink", "fixture", "install"])) {
    const svc = knowledgeBase.services.find((s) => /Fixture/i.test(s.name));
    return `${svc.name} is ${svc.price}. ${svc.notes}`;
  }

  if (hit(["price", "cost", "quote", "how much"])) {
    return `Pricing varies by job — for example: ${knowledgeBase.services
      .slice(0, 3)
      .map((s) => `${s.name} (${s.price})`)
      .join("; ")}. Non-emergency jobs get a free on-site quote.`;
  }

  if (hit(["area", "location", "where", "serve", "travel"])) {
    return knowledgeBase.serviceArea;
  }

  if (hit(["warranty", "guarantee"])) {
    return "All work is backed by a 12-month workmanship warranty covering parts and labor for that repair.";
  }

  if (hit(["pay", "payment", "cash", "card"])) {
    return "We accept cash, card, and bank transfer. Cheques aren't accepted.";
  }

  if (hit(["cancel", "reschedule"])) {
    return "Cancellations need at least 4 hours notice, otherwise a $35 fee applies.";
  }

  if (hit(["license", "insured", "bonded"])) {
    return "AquaFix Plumbing is fully licensed, bonded, and insured — license #PL-44921.";
  }

  if (hit(["hi", "hello", "hey"])) {
    return `Hi! I'm the AquaFix Plumbing assistant. Ask me about our services, pricing, hours, or service area.`;
  }

  return `I don't have that on hand — I'll connect you with a member of our team who can help. You can reach us directly at ${knowledgeBase.business.phone} or ${knowledgeBase.business.email}.`;
}
