const Property = require("../models/Property");
const {
  buildFallbackReply,
  extractAssistantIntent,
} = require("../services/assistantIntentService");

const getMatchingProperties = async (intent) => {
  if (!intent.wantsPropertySearch) {
    return [];
  }

  const query = {};

  if (intent.location) {
    query.location = { $regex: intent.location, $options: "i" };
  }

  if (intent.maxPrice) {
    query.pricePerNight = { $lte: Number(intent.maxPrice) };
  }

  if (intent.guests) {
    query.maxGuests = { $gte: Number(intent.guests) };
  }

  if (!Object.keys(query).length) {
    return [];
  }

  return Property.find(query)
    .select("title location pricePerNight images amenities maxGuests")
    .sort({ pricePerNight: 1, maxGuests: -1 })
    .limit(6);
};

const askOpenRouter = async ({ message, intent, properties }) => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || typeof fetch !== "function") {
    return null;
  }

  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
  const propertyContext = properties.map((property) => ({
    id: property._id,
    title: property.title,
    location: property.location,
    pricePerNight: property.pricePerNight,
    maxGuests: property.maxGuests,
    amenities: property.amenities || [],
  }));

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.APP_URL || "http://localhost:5173",
      "X-Title": "StayNext AI Booking Help Assistant",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are StayNext AI Booking Help Assistant. Help users with property search, booking guidance, payment help, cancellation, family recommendations, and booking issue support. Be concise, friendly, and only recommend properties provided in the context. If a serious issue remains, tell the user they can create a support ticket from the assistant.",
        },
        {
          role: "user",
          content: JSON.stringify({
            userMessage: message,
            parsedIntent: intent,
            matchingProperties: propertyContext,
          }),
        },
      ],
      temperature: 0.3,
      max_tokens: 220,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
};

const askAssistant = async (req, res) => {
  try {
    const message = String(req.body.message || "").trim();

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const intent = extractAssistantIntent(message);
    const properties = await getMatchingProperties(intent);
    let reply = null;

    try {
      reply = await askOpenRouter({ message, intent, properties });
    } catch (error) {
      console.error("OpenRouter assistant error:", error.message);
    }

    if (!reply) {
      reply = buildFallbackReply({ message, intent, properties });
    }

    res.status(200).json({
      reply,
      intent,
      properties,
      canCreateTicket: intent.wantsTicketHelp,
    });
  } catch (error) {
    console.error("askAssistant error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  askAssistant,
};
