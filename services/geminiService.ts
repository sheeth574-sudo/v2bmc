import { GoogleGenAI, Type } from "@google/genai";
import { CampaignType, RewardTier } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const suggestBudgetAllocation = async (
  totalBudget: number,
  campaignTypes: CampaignType[],
  description: string,
  currentTiers: RewardTier[] = []
): Promise<RewardTier[]> => {
  const modelId = "gemini-3-flash-preview";

  // If the user has already defined tiers, we want to FILL them (Smart Allocation), not replace them.
  // If the user hasn't defined any tiers (or very few), we can generate them.
  const hasExistingTiers = currentTiers.length > 0;
  
  let prompt = "";

  if (hasExistingTiers) {
    prompt = `
      Act as a marketing expert. I have a total budget of ${totalBudget} THB.
      
      I have defined the following reward structure (tiers) with specific rank ranges:
      ${JSON.stringify(currentTiers)}
      
      TASK: Please calculate and fill in the 'amount' field for each tier so that the total payout fits the budget.
      
      Rules:
      1. The TOTAL PAYOUT must be close to (but not exceed) ${totalBudget}.
      2. Total Payout Calculation = Sum of (amount * (rankEnd - rankStart + 1)) for all tiers.
      3. Rank 1 should get the highest amount. Lower ranks get less.
      4. If 'rankStart' or 'rankEnd' are 0 or missing in the input, please assign logical sequential ranks (e.g. 1, 2, 3-10).
      5. If 'description' is empty, provide a short label (e.g. Gold, Silver, Bronze, Consolation).
      6. Return the EXACT SAME list of objects (same IDs), but with 'amount' (and rank/description if missing) updated.
      7. Do not add new tiers unless the input list is completely empty.
    `;
  } else {
    prompt = `
      Act as a marketing expert. I have a total budget of ${totalBudget} THB for an influencer marketing campaign that includes these components: ${campaignTypes.join(', ')}.
      Campaign Description: ${description}.
      
      Please distribute the budget wisely across the selected components and suggest detailed reward tiers for each.
      
      For 'GMV' (Sales), suggest tiers based on 'Rank' (e.g. Rank 1 gets X, Rank 2-5 gets Y).
      For 'CONTENT_VOLUME' (Most Videos), suggest tiers based on 'Rank' (e.g. Rank 1 gets X).
      For 'LUCKY_DRAW', suggest random winner slots.
      
      Return a single flat JSON array containing all tiers for all selected types.
      Ensure 'tierType' matches one of the inputs exactly.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING }, // Needed to map back to existing tiers
              tierType: { type: Type.STRING, enum: [CampaignType.GMV, CampaignType.CONTENT_VOLUME, CampaignType.LUCKY_DRAW] },
              rankStart: { type: Type.INTEGER, description: "Starting rank for this prize (e.g. 1)" },
              rankEnd: { type: Type.INTEGER, description: "Ending rank for this prize (e.g. 1 or 5)" },
              amount: { type: Type.NUMBER, description: "The cash reward PER PERSON in this tier" },
              description: { type: Type.STRING, description: "Short note, e.g. 'Top Seller' or 'Gift Set'" }
            },
            required: ["tierType", "rankStart", "rankEnd", "amount", "description"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return currentTiers;
    
    const generatedTiers = JSON.parse(text) as any[];

    // If we are updating existing tiers, try to merge properties to preserve any client-side IDs if AI messed them up
    if (hasExistingTiers) {
       return generatedTiers.map((genTier, index) => {
         // Try to find matching original tier by ID if possible, or fallback to index
         const original = currentTiers.find(t => t.id === genTier.id) || currentTiers[index];
         return {
           ...original,
           ...genTier,
           id: original ? original.id : genTier.id // Keep original ID if possible
         };
       });
    }
    
    return generatedTiers.map((tier, index) => ({
      ...tier,
      id: `generated-tier-${index}-${Date.now()}`,
      condition: tier.rankStart === tier.rankEnd ? `Rank ${tier.rankStart}` : `Rank ${tier.rankStart}-${tier.rankEnd}`
    }));

  } catch (error) {
    console.error("Error generating budget allocation:", error);
    // Fallback logic: return original or basic default
    if (hasExistingTiers) return currentTiers;
    
    return campaignTypes.flatMap((type, i) => ([
      { 
        id: `fb-${i}-1`, 
        tierType: type, 
        rankStart: 1, 
        rankEnd: 1, 
        condition: 'Rank 1', 
        amount: Math.floor(totalBudget * 0.2), 
        description: 'First Prize' 
      },
      { 
        id: `fb-${i}-2`, 
        tierType: type, 
        rankStart: 2, 
        rankEnd: 10, 
        condition: 'Rank 2-10', 
        amount: Math.floor(totalBudget * 0.05), 
        description: 'Runner ups' 
      }
    ]));
  }
};