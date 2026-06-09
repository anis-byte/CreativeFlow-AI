// Canned sample outputs — used when no real provider key is configured.
// Shapes match each function's output schema exactly, so the UI renders the
// same way whether output is real or demo. Ported from the design mockup.

export const DEMO_OUTPUTS: Record<string, Record<string, unknown>> = {
  fn1: {
    angles: [
      { name: "Time-saving", description: "Position CreativeFlow AI as the shortcut serious marketers use. Save hours of filming, editing, and posting without sacrificing quality or audience trust." },
      { name: "FOMO", description: "Competitors are already deploying AI avatars at scale. Highlight the risk of falling behind and create urgency around early adoption." },
      { name: "Authority", description: "Position the brand as the definitive voice on AI-powered content. The masterclass and user numbers serve as proof of credibility." },
      { name: "Cost-saving", description: "Compare traditional video production costs vs the AI avatar approach. Show the math — same quality at a fraction of the ongoing cost." },
      { name: "Social proof", description: "Lead with real-world outcomes. Testimonials, case studies, and participation figures lower hesitation and accelerate trust-based decisions." },
      { name: "Curiosity", description: "\"What if you could post every day without ever being on camera?\" Use open-loop questions to drive qualified clicks to the registration page." },
      { name: "Transformation", description: "Before/after framing: overworked marketer filming endlessly to a calm professional with a fully automated content pipeline." },
      { name: "Simplicity", description: "\"You don't need to be technical.\" Remove the perceived complexity barrier. Show how any beginner sets up their first AI avatar in one session." },
      { name: "Urgency", description: "Limited seats. Live event. One-time window. Pair a real deadline with scarcity messaging to turn warm audiences into registered attendees." },
      { name: "Problem-first", description: "Open with the exact daily pain: \"You spend 3 hours filming every single day.\" Name it precisely, then present the solution as obvious." },
    ],
    pain_points: [
      "Fear of being replaced by AI",
      "No time to film content daily",
      "High video production costs",
    ],
    desires: [
      "Automate without losing authenticity",
      "Scale brand effortlessly",
      "Be seen as AI-forward",
    ],
    objections: [
      "\"AI avatars still look fake and robotic\"",
      "\"I'm not technical enough to set this up\"",
      "\"I don't have time to learn another tool\"",
    ],
  },
  fn2: {
    primary_texts: [
      "Stop spending hours filming. Your AI avatar shows up for you 24/7 — and your audience won't even notice. Join the free live masterclass.",
      "What if content creation took 20 minutes instead of 2 hours? AI avatars are changing the game for marketers who want to scale without burnout.",
      "Your competitors are already using AI avatars. Are you? Learn the exact system in one free live session — seats are limited.",
      "I used to spend 3 hours filming every week. Now my AI avatar does it for me. Join 200+ marketers who made the switch — free masterclass this Thursday.",
      "The fastest marketers don't film more. They work smarter. See how to build your AI avatar in one live session, completely free.",
    ],
    headlines: [
      "Create content in minutes, not hours",
      "Your AI twin is ready to post for you",
      "Free masterclass: AI avatars for marketers",
      "Scale your brand without the camera",
      "Stop filming. Start automating.",
      "200+ marketers can't be wrong",
      "The shortcut top marketers use now",
      "No camera. No editor. No problem.",
      "Your competitor just cloned themselves",
      "One session changes your content game",
    ],
    ctas: [
      "Reserve my free seat",
      "Join the live masterclass",
      "See it live — register now",
      "Claim my spot (free)",
      "Watch it happen live",
    ],
  },
  fn3: {
    hook: "\"Are you still filming content yourself in 2025? There's a faster way.\"",
    visual_concept:
      "Split-screen: stressed marketer in front of a camera setup (left) vs calm professional watching their AI avatar present on a MacBook (right). Pastel blue accent lighting. Clean, minimal studio setting.",
    scene_breakdown: [
      { timestamp: "0–3s", description: "Hook text on screen: \"Still filming daily?\" — cut to tired marketer" },
      { timestamp: "3–10s", description: "AI avatar presenting on MacBook — professional presenter, smooth delivery" },
      { timestamp: "10–20s", description: "Social proof callout: \"200+ marketers already using this\" — trust overlay" },
      { timestamp: "20–28s", description: "CTA card: \"Reserve your free seat\" with event date and countdown" },
    ],
    ai_image_prompt:
      "Professional woman presenter at minimal desk, MacBook showing AI avatar interface, white robot mascot, pastel blue studio lighting, deep black background, photorealistic, commercial ad, no text --ar 4:5 --style raw",
    designer_notes:
      "• Font: clean sans-serif, weight 500+. No script fonts.\n• Colors: deep black base, pastel blue accent, white text.\n• Do NOT use stock-photo styles — keep it editorial and modern.\n• Include brand logo bottom-right at 15% opacity.\n• For video: 25fps minimum, no jump cuts in the first 3 seconds.",
  },
};
