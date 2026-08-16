import { knowledgeBaseAsText } from "./knowledgeBase";
import knowledgeBase from "./knowledgeBase";

// This is the "RAG-lite" part: at this scale there's no vector DB, no
// chunking, no embeddings search — the whole knowledge base is small enough
// to inject directly into the system prompt on every request. The model is
// instructed to answer ONLY from that injected context and to hand off to a
// human for anything outside it, which is what makes this feel like a
// business-specific assistant instead of a generic wrapped chatbot.
export function buildSystemPrompt() {
  return `You are the AI support assistant embedded on the ${knowledgeBase.business.name} website.

Answer customer questions using ONLY the knowledge base below. Be concise, friendly, and specific (quote real prices, hours, and policies from the knowledge base when relevant).

If the answer isn't in the knowledge base, do NOT guess or make something up. Instead say something like: "I don't have that on hand — I'll connect you with a member of our team who can help." and suggest contacting ${knowledgeBase.business.phone} or ${knowledgeBase.business.email}.

Never invent prices, hours, or policies that aren't listed below.

--- KNOWLEDGE BASE START ---
${knowledgeBaseAsText()}
--- KNOWLEDGE BASE END ---`;
}
