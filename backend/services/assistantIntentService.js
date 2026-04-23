const extractAssistantIntent = (message = "") => {
  const normalized = String(message).trim();
  const lower = normalized.toLowerCase();

  const priceMatch =
    lower.match(
      /(?:under|below|less than|within|upto|up to|max(?:imum)?|budget(?: of)?)(?:\s*(?:rs\.?|₹|inr))?\s*(\d+)/i
    ) || lower.match(/(?:rs\.?|₹|inr)\s*(\d+)/i);

  const guestMatch = lower.match(
    /(\d+)\s*(?:guest|guests|people|person|persons|member|members)/i
  );

  const locationMatch = normalized.match(
    /(?:in|at|near)\s+([a-zA-Z\s]+?)(?=\s+(?:under|below|less|within|upto|up to|max|budget|for|with|from|to|and)|[,.!?]|$)/i
  );

  return {
    location: locationMatch?.[1]?.trim() || "",
    maxPrice: priceMatch?.[1] || "",
    guests: guestMatch?.[1] || "",
    wantsPropertySearch:
      Boolean(locationMatch || priceMatch || guestMatch) ||
      /\b(find|show|search|recommend|suggest|stay|hotel|property|family)\b/i.test(
        lower
      ),
    wantsTicketHelp:
      /\b(ticket|complaint|problem|issue|failed|pending|support|not working)\b/i.test(
        lower
      ),
  };
};

const buildFallbackReply = ({ message = "", intent, properties = [] }) => {
  const lower = message.toLowerCase();

  if (properties.length > 0) {
    return `I found ${properties.length} matching stay${
      properties.length === 1 ? "" : "s"
    }. You can open View Details to continue booking.`;
  }

  if (intent?.wantsPropertySearch) {
    return "I could not find matching stays for that request. Try changing the location, increasing the budget, or reducing the guest count.";
  }

  if (lower.includes("cancel")) {
    return "To cancel a booking, go to My Bookings, open the booking, and click Cancel. If the issue continues, create a support ticket.";
  }

  if (lower.includes("payment") || lower.includes("pay")) {
    return "For payment issues, check your selected payment method and booking payment status. If payment failed, you can retry the booking or raise a support ticket.";
  }

  if (lower.includes("book")) {
    return "To book a stay, open a property, select check-in date, check-out date, guest count, and click Book Now.";
  }

  if (lower.includes("family")) {
    return "For family stays, choose properties with higher maxGuests, helpful amenities, and good reviews.";
  }

  return "I can help with property search, booking steps, payment problems, cancellation, family stay suggestions, and support ticket guidance.";
};

module.exports = {
  buildFallbackReply,
  extractAssistantIntent,
};
