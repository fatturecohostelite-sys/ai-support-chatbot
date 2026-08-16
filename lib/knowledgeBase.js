// Custom knowledge base for the demo business: AquaFix Plumbing.
// In a real client engagement this would come from their price sheet,
// FAQ page, booking policy doc, etc. Swapping this file (or the source it's
// loaded from) is how the same widget gets re-skinned for any business.

const knowledgeBase = {
  business: {
    name: "AquaFix Plumbing",
    tagline: "Same-day plumbing repairs across Metro Ridge",
    phone: "(555) 214-7788",
    email: "hello@aquafixplumbing.demo",
    address: "142 Harbor Lane, Metro Ridge",
  },

  hours: [
    { day: "Monday - Friday", time: "7:00 AM - 7:00 PM" },
    { day: "Saturday", time: "8:00 AM - 4:00 PM" },
    { day: "Sunday", time: "Closed (emergency line only)" },
  ],

  services: [
    {
      name: "Emergency leak & burst pipe repair",
      price: "$120 call-out + parts, 24/7 emergency line",
      notes: "Response within 60 minutes inside Metro Ridge city limits.",
    },
    {
      name: "Drain cleaning & unclogging",
      price: "Starting at $89",
      notes: "Covers kitchen, bathroom, and main line clogs.",
    },
    {
      name: "Water heater installation / repair",
      price: "Repair from $95, new tank install from $850 (unit not included)",
      notes: "We install gas, electric, and tankless units.",
    },
    {
      name: "Fixture installation (faucets, toilets, sinks)",
      price: "Starting at $75 per fixture",
      notes: "Customer-supplied or AquaFix-supplied fixtures both fine.",
    },
    {
      name: "Full bathroom / kitchen re-piping",
      price: "Free on-site quote required",
      notes: "Typical turnaround 2-4 days depending on scope.",
    },
  ],

  serviceArea:
    "We serve Metro Ridge and the surrounding suburbs within a 25-mile radius, including Brookvale, Hollow Creek, and Pinewood Heights. Outside that radius, a $40 travel fee may apply.",

  policies: [
    "Free estimates for all non-emergency jobs.",
    "All work is backed by a 12-month workmanship warranty.",
    "We accept cash, card, and bank transfer. No cheques.",
    "Cancellations need at least 4 hours notice or a $35 fee applies.",
    "Licensed, bonded, and insured — license #PL-44921.",
  ],

  faqs: [
    {
      q: "Do you offer emergency plumbing at night?",
      a: "Yes — our emergency line is open 24/7, including weekends, for burst pipes and major leaks. Standard rates apply outside business hours.",
    },
    {
      q: "How fast can someone come out?",
      a: "Emergencies: within 60 minutes in Metro Ridge. Standard bookings: usually next-day, often same-day if booked before noon.",
    },
    {
      q: "Do you give free quotes?",
      a: "Yes, all non-emergency jobs get a free, no-obligation on-site quote before any work starts.",
    },
    {
      q: "Is there a warranty on repairs?",
      a: "Every job comes with a 12-month workmanship warranty covering parts and labor for that specific repair.",
    },
  ],
};

// Flattens the structured KB into plain text that gets injected into the
// system prompt. Keeping it as readable text (not raw JSON) makes it easier
// for the model to quote numbers and hours accurately.
export function knowledgeBaseAsText() {
  const kb = knowledgeBase;
  const lines = [];

  lines.push(`Business: ${kb.business.name} — ${kb.business.tagline}`);
  lines.push(`Phone: ${kb.business.phone} | Email: ${kb.business.email}`);
  lines.push(`Address: ${kb.business.address}`);

  lines.push("\nHours:");
  kb.hours.forEach((h) => lines.push(`- ${h.day}: ${h.time}`));

  lines.push("\nServices & Pricing:");
  kb.services.forEach((s) =>
    lines.push(`- ${s.name}: ${s.price}. ${s.notes}`)
  );

  lines.push(`\nService Area: ${kb.serviceArea}`);

  lines.push("\nPolicies:");
  kb.policies.forEach((p) => lines.push(`- ${p}`));

  lines.push("\nFrequently Asked Questions:");
  kb.faqs.forEach((f) => lines.push(`Q: ${f.q}\nA: ${f.a}`));

  return lines.join("\n");
}

export default knowledgeBase;
