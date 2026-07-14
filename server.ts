import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize GoogleGenAI client for modern professional paraphrasing
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.use(express.json());

// List of standard devotionals exactly as provided.
// These are real daily feature devotionals on whiteestate.org with accurate covers, titles, and descriptions.
const DEVOTIONALS_LIST = [
  {
    id: "ohc",
    title: "Our High Calling",
    cover: "https://media2.egwwritings.org/covers/81_s.jpg",
    link: "https://whiteestate.org/devotional/ohc/",
    description: "A classic devotional call to holiness, virtue, and a deeper commitment to Christ."
  },
  {
    id: "fh",
    title: "From the Heart",
    cover: "https://media2.egwwritings.org/covers/12210_s.jpg",
    link: "https://whiteestate.org/devotional/fh/",
    description: "A collection of encouraging messages that gently guide readers closer to Jesus and His soon return."
  },
  {
    id: "ul",
    title: "The Upward Look",
    cover: "https://media2.egwwritings.org/covers/147_s.jpg",
    link: "https://whiteestate.org/devotional/ul/",
    description: "These readings lift the heart heavenward and keep the focus fixed on Christ as our Savior and example."
  },
  {
    id: "tmk",
    title: "That I May Know Him",
    cover: "https://media2.egwwritings.org/covers/126_s.jpg",
    link: "https://whiteestate.org/devotional/tmk/",
    description: "A devotional book that invites readers into a richer knowledge of God through personal and heartfelt messages."
  },
  {
    id: "rc",
    title: "Reflecting Christ",
    cover: "https://media2.egwwritings.org/covers/89_s.jpg",
    link: "https://whiteestate.org/devotional/rc/",
    description: "A Christ-centered devotional that encourages believers to walk in the footsteps of Jesus."
  },
  {
    id: "ctr",
    title: "Christ Triumphant",
    cover: "https://media2.egwwritings.org/covers/9_s.jpg",
    link: "https://whiteestate.org/devotional/ctr/",
    description: "These daily readings highlight God's power to overcome and triumph in the great controversy."
  },
  {
    id: "cc",
    title: "Conflict and Courage",
    cover: "https://media2.egwwritings.org/covers/17_s.jpg",
    link: "https://whiteestate.org/devotional/cc/",
    description: "A devotional journey through salvation history that offers courage and hope for today."
  },
  {
    id: "ag",
    title: "God's Amazing Grace",
    cover: "https://media2.egwwritings.org/covers/33_s.jpg",
    link: "https://whiteestate.org/devotional/ag/",
    description: "These readings invite readers to experience the serenity and strength that come from daily connection with God."
  },
  {
    id: "hp",
    title: "In Heavenly Places",
    cover: "https://media2.egwwritings.org/covers/38_s.jpg",
    link: "https://whiteestate.org/devotional/hp/",
    description: "A devotional collection that draws readers into deeper fellowship with Christ and a fuller understanding of His character."
  },
  {
    id: "lhu",
    title: "Lift Him Up",
    cover: "https://media2.egwwritings.org/covers/44_s.jpg",
    link: "https://whiteestate.org/devotional/lhu/",
    description: "These reflections focus on Jesus as Teacher, Healer, King, and Redeemer."
  },
  {
    id: "mar",
    title: "Maranatha",
    cover: "https://media2.egwwritings.org/covers/74_s.jpg",
    link: "https://whiteestate.org/devotional/mar/",
    description: "A devotional centered on Christ's soon return and the hope of His glorious appearing."
  },
  {
    id: "mlt",
    title: "My Life Today",
    cover: "https://media2.egwwritings.org/covers/79_s.jpg",
    link: "https://whiteestate.org/devotional/mlt/",
    description: "This devotional touches every part of the Christian life with a steady focus on God's fatherly love."
  },
  {
    id: "ofc",
    title: "Our Father Cares",
    cover: "https://media2.egwwritings.org/covers/80_s.jpg",
    link: "https://whiteestate.org/devotional/ofc/",
    description: "A warm meditation on the Father's love and the comfort of being His child."
  },
  {
    id: "blj",
    title: "To Be Like Jesus",
    cover: "https://media2.egwwritings.org/covers/151_s.jpg",
    link: "https://whiteestate.org/devotional/blj/",
    description: "These devotionals call believers into deeper fellowship with God and a life shaped by Christ's likeness."
  },
  {
    id: "flb",
    title: "The Faith I Live By",
    cover: "https://media2.egwwritings.org/covers/131_s.jpg",
    link: "https://whiteestate.org/devotional/flb/",
    description: "A doctrine-centered devotional that strengthens faith through daily reflections on biblical truth."
  },
  {
    id: "hb",
    title: "Homeward Bound",
    cover: "https://media2.egwwritings.org/covers/12862_s.jpg",
    link: "https://whiteestate.org/devotional/hb/",
    description: "These readings encourage surrender, victory in Christ, and hope as we journey homeward."
  },
  {
    id: "rre",
    title: "Radiant Religion",
    cover: "https://media2.egwwritings.org/covers/14039_s.jpg",
    link: "https://whiteestate.org/devotional/rre/",
    description: "A foundational devotional collection that reflects the rich spiritual life of early Christian discipleship."
  },
  {
    id: "sd",
    title: "Sons and Daughters of God",
    cover: "https://media2.egwwritings.org/covers/102_s.jpg",
    link: "https://whiteestate.org/devotional/sd/",
    description: "These reflections invite readers to pursue the highest standard of spiritual attainment in Christ."
  },
  {
    id: "tdg",
    title: "This Day with God",
    cover: "https://media2.egwwritings.org/covers/149_s.jpg",
    link: "https://whiteestate.org/devotional/tdg/",
    description: "A devotional collection arranged by the day they were written, offering practical encouragement and counsel."
  },
  {
    id: "wgd",
    title: "With God at Dawn",
    cover: "https://media2.egwwritings.org/covers/13940_s.jpg",
    link: "https://whiteestate.org/devotional/wgd/",
    description: "These daily readings begin the day with spiritual focus and renewed commitment to God."
  },
  {
    id: "yrp",
    title: "Ye Shall Receive Power",
    cover: "https://media2.egwwritings.org/covers/153_s.jpg",
    link: "https://whiteestate.org/devotional/yrp/",
    description: "A devotional that highlights the promise and power of the Holy Spirit in everyday discipleship."
  },
  {
    id: "jnn",
    title: "Jesus, Name Above All Names",
    cover: "https://media2.egwwritings.org/covers/14150_s.jpg",
    link: "https://whiteestate.org/devotional/jnn/",
    description: "This devotional explores the many names of Jesus and draws readers into deeper love for Him."
  }
];

// Helper to scrape a URL
async function fetchWithTimeout(url: string, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * 1. Scrape devotionals list from whiteestate.org/devotional/ - Optimized to return user-defined list
 */
app.get("/api/scrape-devotionals", async (req, res) => {
  try {
    console.log("Serving user-defined static list of devotionals...");
    return res.json({ success: true, source: "static", data: DEVOTIONALS_LIST });
  } catch (error: any) {
    console.error("API failed with error:", error.message);
    return res.json({ success: true, source: "static", error: error.message, data: DEVOTIONALS_LIST });
  }
});

/**
 * Helper to paraphrase a devotional with Gemini API based on a requested profile style
 */
async function paraphraseDevotional(
  title: string,
  paragraphs: any[],
  profile: string
): Promise<{ title: string; paragraphs: any[]; warning?: string; isFallback?: boolean }> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not defined. Skipping paraphrase step.");
      return { 
        title, 
        paragraphs: paragraphs.map(p => ({ ...p, pronunciationOverrides: [] })), 
        isFallback: true 
      };
    }

    console.log(`Calling Gemini to paraphrase devotional in the "${profile}" profile style and extract pronunciation overrides...`);

    const PRONUNCIATION_TOKENS = [
      "LIVE_VERB",
      "LIVE_ADJECTIVE",
      "READ_PRESENT",
      "READ_PAST",
      "LEAD_VERB",
      "LEAD_METAL",
      "WIND_AIR",
      "WIND_TURN",
      "TEAR_RIP",
      "TEAR_CRY",
      "BASS_MUSIC",
      "BASS_FISH",
      "CLOSE_NEAR",
      "CLOSE_SHUT",
      "MINUTE_TIME",
      "MINUTE_TINY",
      "OBJECT_NOUN",
      "OBJECT_VERB",
      "RECORD_NOUN",
      "RECORD_VERB",
      "PRESENT_NOUN",
      "PRESENT_VERB"
    ];

    const originalJson = JSON.stringify({ 
      title, 
      paragraphs, 
      pronunciationTokens: PRONUNCIATION_TOKENS 
    }, null, 2);

    let profileInstruction = "";

    switch (profile) {
      case "classic":
      case "original":
        profileInstruction = `
### PROFILE: "Classic / Original"
- **Tone**: Keep the text exactly verbatim as in the original input.
- **Specific Rules**: Do NOT change, rewrite, or paraphrase any words of the original input. Keep the 'title' and each paragraph's 'text' exactly the same. Your primary task under this profile is ONLY to identify and generate the 'pronunciationOverrides' list.
`;
        break;
      case "clear_modern":
        profileInstruction = `
### PROFILE: "Clear & Modern"
- **Tone**: Articulate, clear, thoughtful, and professional.
- **Specific Rules**: Smooth out 19th-century passive structures and archaic vocabulary (e.g., replace words like "thou", "thee", "thine", "ye", "hath", "doth", "shalt", "wouldst" with clean, respectful modern equivalents). Keep the language respectful, dignified, and deep, but easily readable for a modern adult. Preserve the exact theological meaning and flow of logic.
`;
        break;
      case "easy_reading":
        profileInstruction = `
### PROFILE: "Easy Reading"
- **Tone**: Simple, clear, encouraging, and direct.
- **Specific Rules**:
  - Translate abstract metaphors into direct, literal statements.
  - Place Bible references in parentheses immediately following the relevant text (e.g., '1 Timothy 6:9, 10').
  - Use short, active-voice sentences.
  - No meta-commentary or conversational preambles; keep the text purely instructional and reflective.
  - Match the length and reading duration of each paraphrased paragraph to its specific original counterpart, using a higher count of simple sentences to fill out the longer sections.
`;
        break;
      case "young_adult":
        profileInstruction = `
### PROFILE: "Young Adult"
- **Tone**: Authentic, conversational, raw, and intellectually challenging.
- **Specific Rules**:
  - Reframe themes around modern culture, ethics, social media, and personal identity.
  - Place Bible references in parentheses immediately following the relevant text (e.g., '1 Timothy 6:9, 10').
  - Avoid preachy or patronizing language. Write from an authentic peer-to-peer perspective.
  - Match the scale of each paraphrased paragraph to its respective original counterpart, expanding on the modern psychological and societal impacts to naturally fill out the longer paragraphs.
`;
        break;
      case "teens_youth":
        profileInstruction = `
### PROFILE: "Teens & Youth"
- **Tone**: Dynamic, empathetic, direct, and mentoring.
- **Specific Rules**:
  - Map abstract spiritual traps to relatable teenager experiences like digital comparison, peer group pressure, management of allowance/talents, and finding self-worth.
  - Place Bible references in parentheses immediately following the relevant text (e.g., '1 Timothy 6:9, 10').
  - Avoid sounding like an lecturing adult; frame choices around personal integrity and character growth.
  - Ensure each paraphrased paragraph corresponds directly to the length of its original counterpart, scaling the student-focused real-world applications up or down to match the original size.
`;
        break;
      case "kids_primary":
        profileInstruction = `
### PROFILE: "Kids & Primary"
- **Tone**: Enthusiastic, story-driven, imaginative, and highly visual.
- **Specific Rules**:
  - Translate complex, frightening, or mature theological terms into concrete stories about sharing, being happy with what we have, and making kind choices at school or home.
  - Place Bible references in parentheses immediately following the relevant text (e.g., '1 Timothy 6:9, 10').
  - Absolutely no meta-commentary, introductory storytelling hooks, or conversational preambles.
  - Match the length of each paraphrased paragraph to its specific original counterpart, intentionally adjusting the depth of sensory descriptions and story details to fit shorter or longer segments.
`;
        break;
      default:
        // Default fallback
        profileInstruction = `
### PROFILE: "Clear & Modern"
- **Tone**: Articulate, clear, thoughtful, and professional.
- **Specific Rules**: Smooth out 19th-century passive structures and archaic vocabulary. Keep the language respectful, dignified, and deep, but easily readable for a modern adult. Preserve the exact theological meaning and flow of logic.
`;
    }

    const systemInstruction = `
You are a highly skilled, sophisticated copywriter specializing in personal growth, spiritual development, and daily reflections.
Your task is to take a daily devotional reading (comprising a Title, a Scripture text paragraph, and several Devotional body paragraphs) and paraphrase it based on the specified profile:

${profileInstruction}

### CRITICAL RULES & CONSTRAINTS:
1. **Theological Integrity**: NEVER alter, subtract from, or compromise the underlying theological, moral, ethical, or core scriptural message of the text. Keep all teachings completely consistent with Ellen G. White's views and general scriptural integrity.
2. **Reverence**: Maintain a deep sense of respect and meaning throughout.
3. **Paragraph Structure**: Keep the paraphrased paragraphs matching the original sequence and paragraph count. The scripture/verse paragraph (type: "scripture") must also be paraphrased into clean, modern-day English matching the chosen profile style while maintaining deep reverence.
4. **Length Consistency**: Ensure the paraphrased paragraphs are approximately the same duration/reading length as the original paragraphs to keep the text-to-speech reading flow, speed, and time structure aligned.
5. **No Meta-Commentary**: Do not add external commentary, introductory fluff (e.g., "Here is your modern version:"), or meta-commentary inside the fields. Only return the final paraphrased text.
6. **Output Format**: You MUST return the output in JSON matching the input schema exactly, preserving all the paragraph IDs, their order, and their 'type' ('scripture' or 'body').
7. **Pronunciation Overrides**: For each paragraph, include a \`pronunciationOverrides\` array. Its purpose is to identify individual words whose pronunciation cannot be reliably determined by a typical English text-to-speech engine.
- Only include an override when the pronunciation is ambiguous. If no overrides are needed, return an empty array.
- Each override must contain:
  - \`text\` – the exact word as it appears in the paragraph text.
  - \`occurrence\` – the 1-based occurrence number of that word within the paragraph text.
  - \`token\` – one of the allowed pronunciation tokens provided in the \`pronunciationTokens\` field of the input.
- Do NOT modify the paragraph text.
- Do NOT return phonetic spellings.
- Do NOT return SSML.
- Do NOT invent new pronunciation tokens. Only select from the provided \`pronunciationTokens\`.
`;

    let response;
    let lastError: any = null;
    let delayMs = 1500;
    const maxAttempts = 4;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [
            {
              text: `Here is the original devotional content to paraphrase:\n\n${originalJson}`
            }
          ],
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: "The paraphrased title of the devotional entry"
                },
                paragraphs: {
                  type: Type.ARRAY,
                  description: "The list of paragraphs preserving their exact sequence, IDs, types, and containing the paraphrased content",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: {
                        type: Type.STRING,
                        description: "The original id of the paragraph"
                      },
                      type: {
                        type: Type.STRING,
                        description: "The original type of the paragraph ('scripture' or 'body')"
                      },
                      text: {
                        type: Type.STRING,
                        description: "The paraphrased version of the paragraph text matching the requested profile"
                      },
                      pronunciationOverrides: {
                        type: Type.ARRAY,
                        description: "Identify individual words whose pronunciation cannot be reliably determined by a typical English text-to-speech engine. Only include when ambiguous. If none, return an empty array.",
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            text: {
                              type: Type.STRING,
                              description: "The exact word as it appears in the paragraph"
                            },
                            occurrence: {
                              type: Type.INTEGER,
                              description: "The 1-based occurrence number of that word within the paragraph"
                            },
                            token: {
                              type: Type.STRING,
                              description: "One of the allowed pronunciation tokens"
                            }
                          },
                          required: ["text", "occurrence", "token"]
                        }
                      }
                    },
                    required: ["id", "type", "text", "pronunciationOverrides"]
                  }
                }
              },
              required: ["title", "paragraphs"]
            }
          }
        });
        
        // If successful, break out of retry loop
        break;
      } catch (err: any) {
        lastError = err;
        let errMsg = err.message || String(err);
        try {
          const parsedErr = JSON.parse(errMsg);
          if (parsedErr?.error?.message) {
            errMsg = parsedErr.error.message;
          }
        } catch (e) {
          // Not valid JSON, keep original
        }
        
        console.warn(`Gemini API call failed on attempt ${attempt}/${maxAttempts} for profile "${profile}" with error: ${errMsg}`);
        
        // Analyze error type to determine if we should fail fast
        const lowerMsg = errMsg.toLowerCase();
        const isQuotaExceeded = lowerMsg.includes("quota") || lowerMsg.includes("limit") || lowerMsg.includes("exhausted") || lowerMsg.includes("429");
        const isAuthError = lowerMsg.includes("auth") || lowerMsg.includes("unauthorized") || lowerMsg.includes("api_key") || lowerMsg.includes("invalid key") || lowerMsg.includes("key is not valid") || lowerMsg.includes("403") || lowerMsg.includes("401");
        const isSafetyError = lowerMsg.includes("safety") || lowerMsg.includes("block");
        const isHighDemand = lowerMsg.includes("high demand") || lowerMsg.includes("overloaded") || lowerMsg.includes("temporary") || lowerMsg.includes("503");
        
        if (isQuotaExceeded || isAuthError || isSafetyError) {
          console.warn(`Non-retryable error encountered (${errMsg}). Aborting retries immediately to fallback.`);
          break;
        }
        
        if (isHighDemand && attempt >= 2) {
          console.warn(`High demand continues on attempt ${attempt}. Aborting retries to keep user experience responsive.`);
          break;
        }

        if (attempt < maxAttempts) {
          console.log(`Waiting ${delayMs}ms before retrying...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          delayMs *= 2; // Exponential backoff
        }
      }
    }

    if (!response) {
      throw lastError || new Error("Failed to generate content from Gemini after all retry attempts.");
    }

    const responseText = response.text;
    if (responseText) {
      const parsed = JSON.parse(responseText.trim());
      if (parsed && parsed.title && Array.isArray(parsed.paragraphs)) {
        console.log(`Successfully paraphrased devotional for profile "${profile}" with Gemini!`);
        // Ensure every paragraph has a valid pronunciationOverrides array and log overrides
        parsed.paragraphs = parsed.paragraphs.map((p: any) => {
          const overrides = Array.isArray(p.pronunciationOverrides) ? p.pronunciationOverrides : [];
          if (overrides.length > 0) {
            console.log(`[Pronunciation Overrides found for paragraph ${p.id}]:`, JSON.stringify(overrides, null, 2));
          }
          return {
            ...p,
            pronunciationOverrides: overrides
          };
        });
        return parsed;
      }
    }

    console.warn("Invalid response structure from Gemini. Falling back to original content.");
    return { 
      title, 
      paragraphs: paragraphs.map(p => ({ ...p, pronunciationOverrides: [] })), 
      warning: "The AI response format was unexpected. Showing original text.", 
      isFallback: true 
    };

  } catch (error: any) {
    let errMsg = error?.message || String(error);
    try {
      const parsedErr = JSON.parse(errMsg);
      if (parsedErr?.error?.message) {
        errMsg = parsedErr.error.message;
      }
    } catch (e) {
      // Not valid JSON
    }
    
    console.error(`Error during Gemini paraphrasing for profile ${profile}:`, errMsg);
    
    let warning = "An error occurred during translation. Showing original text.";
    if (errMsg.includes("429") || errMsg.toLowerCase().includes("quota") || errMsg.toLowerCase().includes("limit") || errMsg.toLowerCase().includes("exhausted")) {
      warning = "The daily AI translation quota (20 requests/day for Gemini free tier) is currently fully exhausted. Displaying the original authentic text instead.";
    } else if (errMsg.includes("503") || errMsg.toLowerCase().includes("demand") || errMsg.toLowerCase().includes("temporary") || errMsg.toLowerCase().includes("unavailable") || errMsg.toLowerCase().includes("overloaded")) {
      warning = "The Gemini AI service is currently experiencing high demand or is temporarily unavailable. Displaying the original authentic text instead.";
    }
    
    return { 
      title, 
      paragraphs: paragraphs.map(p => ({ ...p, pronunciationOverrides: [] })), 
      warning, 
      isFallback: true 
    };
  }
}

/**
 * 2. Fetch specific devotional page and parse its content
 */
app.get("/api/fetch-devotional", async (req, res) => {
  const devUrl = req.query.url as string;
  const profile = (req.query.profile as string) || "classic";
  if (!devUrl) {
    return res.status(400).json({ error: "Missing 'url' parameter" });
  }

  try {
    console.log(`Fetching devotional content from ${devUrl}... (Profile: ${profile})`);
    const response = await fetchWithTimeout(devUrl, 10000);
    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch devotional page: ${response.statusText}` });
    }

    const html = await response.text();

    // 1. Extract Page Title (e.g. <h1 class="page-title pull-left">The Precious Treasure of Time, June 30</h1>)
    const titleMatch = html.match(/<h1[^>]*class=["'][^"']*page-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i);
    let title = "";
    if (titleMatch) {
      title = titleMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    } else {
      // Fallback: match any H1
      const generalH1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      title = generalH1Match ? generalH1Match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "Daily Devotional";
    }

    // 2. Extract paragraph blocks of class egw_content_wrapper
    const paragraphs: any[] = [];
    // Using matchAll to capture all matching paragraph structures
    const pMatches = html.matchAll(/<p\s+([\s\S]*?)>([\s\S]*?)<\/p>/gi);

    for (const match of pMatches) {
      const attributes = match[1];
      const body = match[2];

      if (attributes.includes("egw_content_wrapper")) {
        // Extract ID
        const idMatch = attributes.match(/id=["']([^"']*)["']/i);
        const id = idMatch ? idMatch[1] : `p_${paragraphs.length + 1}`;

        // Determine if scripture or body
        let type = "body";
        if (attributes.includes("devotionaltext")) {
          type = "scripture";
        }

        // Clean text content but keep scripture citation inner text if present
        // Strips tags cleanly and replaces multiple spaces/newlines
        const text = body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

        if (text) {
          paragraphs.push({
            id,
            type,
            text
          });
        }
      }
    }

    console.log(`Successfully fetched devotional "${title}" with ${paragraphs.length} paragraphs.`);
    
    // Paraphrase with Gemini API (handles both paraphrased styles AND classic style for pronunciation overrides)
    const paraphrased = await paraphraseDevotional(title, paragraphs, profile);

    return res.json({
      title: paraphrased.title,
      paragraphs: paraphrased.paragraphs,
      warning: paraphrased.warning,
      isFallback: paraphrased.isFallback
    });

  } catch (error: any) {
    console.error(`Error fetching devotional from ${devUrl}:`, error.message);
    return res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
