import type { BrandData } from "./utils";

export const DEMO_MESSAGES = [
  {
    role: "assistant" as const,
    content: `\`\`\`json
{
  "brand": "Nike",
  "category": "Athletic Footwear & Apparel",
  "lifecycle": "Maturity",
  "archetype": "Hero",
  "cbbe_level": 8,
  "cbbe_label": "Resonance",
  "aaker": { "awareness": 9, "loyalty": 8, "quality": 8, "associations": 9, "assets": 7 },
  "health_funnel": { "awareness": 95, "consideration": 80, "preference": 65, "purchase": 70, "loyalty": 55 },
  "purpose": "To bring inspiration and innovation to every athlete in the world (and if you have a body, you are an athlete).",
  "audience": { "primary": "Athletes and fitness aspirants aged 16-35 who treat sport as identity", "secondary": "Lifestyle consumers and status-driven youth who buy into the cultural cachet" },
  "strategic_priorities": ["Re-anchor performance credibility through the running ecosystem (Couch to 5K to marathon)", "Defend lifestyle relevance via scarcity-driven drops and cultural collaborations", "Reduce China revenue exposure by accelerating India and SEA market entry"],
  "quick_wins": ["Expand Nike Run Club app with free training plans to capture beginner runners", "Launch SNKRS loyalty tier to reward repeat buyers and reduce bot-driven resentment", "Partner with 3 emerging Gen Z athletes for authentic short-form content"],
  "long_term_bets": ["Build a direct-to-consumer subscription model (Nike+ premium with training, content, early access)", "Develop circular economy programs (take-back, refurbish, resell) to own sustainability narrative", "Invest in AI-powered hyper-personalised fitting and design at scale"],
  "activation_roadmap": "Phase 1 (0-6 months): Launch free training plans in NRC app, pilot SNKRS loyalty tiers, sign 3 Gen Z athlete ambassadors. Phase 2 (6-18 months): Roll out Nike+ subscription in top 5 markets, open first circular retail lab in Portland. Phase 3 (18-36 months): Scale AI personalisation across all digital touchpoints, expand circular to 20 markets.",
  "swot": { "strengths": ["Unmatched brand equity and cultural relevance", "Deep athlete endorsement pipeline and IP", "Global supply chain and retail presence"], "weaknesses": ["D2C subscription revenue still negligible vs wholesale", "SNKRS bot culture alienates genuine fans", "Over-indexed on China revenue"], "opportunities": ["Running category ecosystem moat (app + events + gear)", "AI-powered personalisation at mass scale", "Circular economy / resale as brand differentiator"], "threats": ["On and Hoka eroding performance credibility with serious runners", "New Balance and Adidas regaining lifestyle share through collaborations", "Trade war escalation affecting China supply chain" ] },
  "competitive_matrix": [{ "name": "Adidas", "share": "~16%", "positioning": "Terrace culture + lifestyle revival (Samba, Gazelle)", "strength": "Strong cultural momentum with Gen Z", "weakness": "Still recovering from Yeezy loss, thin performance credibility" },{ "name": "On", "share": "~4%", "positioning": "Premium performance Swiss engineering", "strength": "Rapidly growing serious runner share", "weakness": "Limited lifestyle/cultural cachet" },{ "name": "New Balance", "share": "~8%", "positioning": "Heritage + smart collaborations (ALD, JJJJound)", "strength": "Consistent collab quality, revived cool", "weakness": "Still seen as dad-shoe legacy brand to mass market" }],
  "threat_radar": ["On and Hoka capturing serious runners with superior comfort narratives", "Adidas terrace culture revival cutting into Nike lifestyle share", "Manufactured scarcity fatigue — Gen Z resenting drop culture", "China trade war escalation as geopolitical wildcard"],
  "whitespace": "The full running journey ecosystem — no competitor owns beginner-to-marathon lifecycle with digital adjacencies (training plans, route sharing, community). Nike has the assets (NRC, Run Club) but hasn't connected them into a cohesive switching-cost moat.",
  "persona": { "name": "Alex, 26", "demographics": "Urban professional, $55k income, lives in a midsize US city", "psychographics": "Treats fitness as identity marker, posts runs to Strava, follows athlete culture on IG", "goals": "Run a sub-4 marathon, look the part, feel part of a community of achievers", "pain_points": "Overwhelmed by gear choices, wants one trusted brand for everything, frustrated by limited SNKRS drops" },
  "customer_journey": [{ "stage": "Awareness", "description": "Discovers Nike through athlete endorsements, social media, or cultural moments", "brand_opportunity": "Own discovery through athlete storytelling and cultural relevance" },{ "stage": "Consideration", "description": "Compares Nike with Adidas, On, New Balance across performance and style", "brand_opportunity": "Differentiate through ecosystem depth — NRC app, training plans, community" },{ "stage": "Purchase", "description": "Buys via Nike.com, SNKRS app, or retail store", "brand_opportunity": "Frictionless direct purchase with personalised recommendations" },{ "stage": "Post-Purchase", "description": "Uses the product, engages with NRC app, may join Run Club events", "brand_opportunity": "Convert into recurring engagement through training plans and community" },{ "stage": "Advocacy", "description": "Shares runs on Strava, recommends Nike to peers, posts unboxings", "brand_opportunity": "Amplify through user-generated content and athlete-level storytelling" }],
  "voice_tone": { "voice": "Inspirational, direct, never corporate — speaks like a coach who believes you can do more", "tone": "Bold and aspirational in hero moments, warm and encouraging in community contexts", "dos": ["Speak in short declarative sentences", "Challenge the audience to push harder", "Celebrate the athlete's journey not just the product"], "donts": ["Sound like a press release", "Use jargon or passive voice", "Apologise for being ambitious" ] },
  "positioning_map": {
    "x_axis": "Affordable ← → Premium",
    "y_axis": "Functional ← → Aspirational",
    "brand_x": 0.65, "brand_y": 0.75,
    "competitors": [
      { "name": "Adidas", "x": 0.55, "y": 0.6 },
      { "name": "Under Armour", "x": 0.4, "y": 0.45 },
      { "name": "New Balance", "x": 0.5, "y": 0.35 }
    ]
  },
  "kapferer": {
    "physique": "Swoosh logo, bold typography, premium materials, innovation-driven design",
    "personality": "Determined, inspirational, rebellious, aspirational",
    "culture": "Win-at-all-costs excellence, empowerment through sport, Just Do It ethos",
    "relationship": "Coach-mentor dynamic — pushes you to be better, celebrates your wins",
    "reflection": "Athletes, weekend warriors, fitness aspirants, status-driven youth",
    "self_image": "I am disciplined, ambitious, and unstoppable"
  },
  "pops": ["Performance durability", "Global availability", "Athlete endorsements", "Innovation in footwear tech"],
  "pods": ["Just Do It cultural authority", "Emotional storytelling at scale", "Community (Nike Run Club, Training Club)", "Scarcity-driven drops (SNKRS)"],
  "parity": ["Quality materials & construction", "Competitive price-value ratio", "Omnichannel retail presence", "Social media engagement"],
  "positioning_statement": "For athletes and fitness aspirants, Nike is the athletic brand that unlocks human potential through relentless innovation and inspirational storytelling because it understands the mindset of champions.",
  "jobs": {
    "functional": "High-performance footwear and apparel that enhances athletic output",
    "emotional": "Feel unstoppable, part of an elite tribe of achievers",
    "social": "Signal ambition, discipline, and cultural relevance to peers"
  },
  "mental_availability": 9,
  "physical_availability": 8,
  "cultural_tension": "The contradiction between mass-market accessibility and premium aspirational identity — how to stay 'for everyone' while feeling exclusive",
  "top_risk": "D2C-native competitors (On, Hoka) eroding performance credibility while lifestyle brands (Fear of God, Essentials) erode cultural cachet with Gen Z",
  "recommendation": "Double down on the running community ecosystem — own the full runner journey from beginner Couch to 5K programs to marathon race-day gear, creating exit barriers that new entrants can't easily replicate"
}
\`\`\`

**Brand Snapshot**
Nike sits at the intersection of mass-market accessibility and aspirational exclusivity — a tension that defines its category leadership. At maturity with Customer-Based Brand Equity Level 4 (Resonance), it enjoys the rare privilege of being both a performance brand and a cultural status symbol.

**Category & Competition**
The athletic footwear market is splitting in two. On the performance side, On and Hoka are stealing serious runners with superior comfort narratives. On the lifestyle side, New Balance has revived through strategic collaborations (Aimé Leon Dore, JJJJound) and Adidas is finding its footing again through Terrace culture (Samba, Gazelle). Nike's middle ground is under attack from both flanks.

**Jobs-to-be-Done**
Functional job: Gear up for athletic performance without thinking twice. Emotional job: Tap into the feeling of invincibility that comes with pushing limits. Social job: Broadcast "I take my fitness seriously" without saying a word.

**Blindspots & Risk**
The SNKRS drop model created artificial scarcity that built hype but also built resentment. Gen Z is increasingly skeptical of manufactured exclusivity. At the same time, Nike's China exposure remains a geopolitical wildcard — any escalation in US-China trade tensions hits harder than competitors with more diversified supply chains.

**Strategic Recommendation**
Own the full running journey — from absolute beginner (Couch to 5K) to marathon elite. Build digital adjacencies (training plans, route sharing, run clubs) that create switching costs. This re-anchors Nike's performance credibility where new entrants are weakest: ecosystem depth.`
  }
];
