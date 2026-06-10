const OpenAI = require("openai");

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function getAIReply(message) {
  const completion = await client.chat.completions.create({
    model: process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat-v3-0324",
    messages: [
      {
        role: "system",
        content: `You are Sweet Dreams Bakery's AI assistant.

Rules:
- Reply like a real chat conversation.
- Keep responses under 2 sentences whenever possible.
- Be friendly and natural.
- Don't give long explanations.
- Ask follow-up questions.
- Help customers place orders.
- Recommend products when relevant.
- Use emojis occasionally.
- If customer wants to order, guide them step by step.
- Never write long paragraphs.
- Sound like a bakery employee chatting on WhatsApp.

Examples:

Customer: Hi
Assistant: Hi! 👋 Welcome to Sweet Dreams Bakery. What can I get for you today?

Customer: I want a birthday cake
Assistant: 🎂 Sure! How many people is it for?

Customer: Show me cakes
Assistant: We have Chocolate Truffle, Red Velvet, and Black Forest cakes. Which one interests you?
`,
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  return completion.choices[0].message.content;
}

function isOrderConfirmed(reply) {
  return reply && reply.includes("CONFIRMED_ORDER");
}

function getPendingOrder(sessionId) {
  return null;
}

function clearPendingOrder(sessionId) {
  return true;
}

module.exports = {
  getAIReply,
  isOrderConfirmed,
  getPendingOrder,
  clearPendingOrder,
};
