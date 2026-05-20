import { useRef, useCallback, useState, useEffect } from "react";
import { analyzeBrand, fetchWithBackoff } from "./api";

const SYSTEM_PROMPT = `You are a senior brand strategist. Always respond in English only. Respond with EXACTLY two blocks:

FIRST — \`\`\`json ... \`\`\` with valid JSON containing these keys:
brand, category, lifecycle, archetype, cbbe_level (1-10), cbbe_label,
aaker (awareness,loyalty,quality,associations,assets = 1-10),
health_funnel (awareness,consideration,preference,purchase,loyalty = 0-100),
positioning_map (x_axis: "Budget ← → Premium", y_axis: "Niche ← → Mass Market", brand_x 0-1 (0=budget, 0.5=mid-market, 1=premium), brand_y 0-1 (0=niche, 0.5=mid-market, 1=mass-market), competitors[] with each {name, x, y} same 0-1 scale). Position brands accurately vs competitors in same category.
kapferer (physique,personality,culture,relationship,reflection,self_image — descriptive string per facet),
pops[], pods[], parity[], purpose, audience (primary, secondary),
strategic_priorities[], quick_wins[], long_term_bets[],
activation_roadmap (single descriptive string),
swot (strengths[],weaknesses[],opportunities[],threats[]),
competitive_matrix (array of {name,share,positioning,strength,weakness}),
threat_radar[], whitespace (single descriptive string),
persona (name,demographics,psychographics,goals,pain_points — all descriptive strings),
customer_journey (array of {stage,description,brand_opportunity}),
voice_tone {voice,tone,dos[],donts[]},
positioning_statement, jobs (functional,emotional,social — each a single descriptive string),
mental_availability (1-10), physical_availability (1-10),
cultural_tension, top_risk, recommendation.

SECOND — Narrative. Write 1-2 sentences for EACH of these sections (in order):
Brand Snapshot | Category & Competition | Jobs-to-be-Done | Identity | Positioning | Equity | Brand Equity Level | Mental & Physical Availability | Brand Health Funnel | Cultural Angle | Competitive Landscape | Audience Profile | Strategy Roadmap | Blindspots & Risk | Recommendation.

Start with \`\`\`json. End with the last narrative sentence. No intros. No closings.
INDIA CONTEXT: Bharat vs India divide, value-seeking, D2C disruption.
TONE: Sharp, direct.`;

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export function useBrandAnalysis(initialLoading = false) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<Message[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: "user", content: text };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    const signal = controllerRef.current.signal;

    try {
      const updatedMessages = [...messagesRef.current, userMsg];

      const reply = await fetchWithBackoff(() =>
        analyzeBrand(
          [
            { role: "system", content: SYSTEM_PROMPT },
            ...updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          ],
          signal
        )
      );

      if (signal.aborted) return;

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setLoading(false);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      const message =
        err instanceof Error ? err.message : "Connection error. Please try again.";
      setError(message);
      setLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    controllerRef.current?.abort();
    setMessages([]);
    setLoading(false);
    setError(null);
  }, []);

  return { messages, loading, error, sendMessage, clearMessages };
}
