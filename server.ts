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

// List of standard fallback devotionals if scraping fails or is incomplete.
// These are real daily features devotionals on whiteestate.org.
const FALLBACK_DEVOTIONALS = [
  {
    id: "mlt",
    title: "My Life Today",
    link: "https://whiteestate.org/devotional/mlt/",
    cover: "https://whiteestate.org/images/books/mlt.jpg",
    description: "Daily reflections on personal devotion, prayer, and Christian living."
  },
  {
    id: "ohc",
    title: "Our High Calling",
    link: "https://whiteestate.org/devotional/ohc/",
    cover: "https://whiteestate.org/images/books/ohc.jpg",
    description: "Reflections on our spiritual journey and high calling in Christ."
  },
  {
    id: "sdg",
    title: "Sons and Daughters of God",
    link: "https://whiteestate.org/devotional/sdg/",
    cover: "https://whiteestate.org/images/books/sdg.jpg",
    description: "Exploring the privileges, duties, and blessings of being God's children."
  },
  {
    id: "rc",
    title: "Reflecting Christ",
    link: "https://whiteestate.org/devotional/rc/",
    cover: "https://whiteestate.org/images/books/rc.jpg",
    description: "Daily thoughts on how to mirror Christ's character in everyday life."
  },
  {
    id: "cc",
    title: "Conflict and Courage",
    link: "https://whiteestate.org/devotional/cc/",
    cover: "https://whiteestate.org/images/books/cc.jpg",
    description: "Inspirational stories of biblical characters, their struggles, and victories."
  },
  {
    id: "mar",
    title: "Maranatha",
    link: "https://whiteestate.org/devotional/mar/",
    cover: "https://whiteestate.org/images/books/mar.jpg",
    description: "Daily meditations focusing on the second coming of Christ."
  },
  {
    id: "tmk",
    title: "That I May Know Him",
    link: "https://whiteestate.org/devotional/tmk/",
    cover: "https://whiteestate.org/images/books/tmk.jpg",
    description: "A devotional guide focusing on personal knowledge of Christ."
  },
  {
    id: "hp",
    title: "In Heavenly Places",
    link: "https://whiteestate.org/devotional/hp/",
    cover: "https://whiteestate.org/images/books/hp.jpg",
    description: "Thoughts on elevated Christian experiences and heavenly companionship."
  },
  {
    id: "gag",
    title: "God's Amazing Grace",
    link: "https://whiteestate.org/devotional/gag/",
    cover: "https://whiteestate.org/images/books/gag.jpg",
    description: "Comforting daily assurances of God's love, mercy, and sustaining grace."
  },
  {
    id: "tdg",
    title: "This Day With God",
    link: "https://whiteestate.org/devotional/tdg/",
    cover: "https://whiteestate.org/images/books/tdg.jpg",
    description: "Thought-provoking readings compiled from letters and diaries of Ellen G. White."
  },
  {
    id: "tblj",
    title: "To Be Like Jesus",
    link: "https://whiteestate.org/devotional/tblj/",
    cover: "https://whiteestate.org/images/books/tblj.jpg",
    description: "Practical daily counsel on Christian growth and character transformation."
  },
  {
    id: "yrp",
    title: "Ye Shall Receive Power",
    link: "https://whiteestate.org/devotional/yrp/",
    cover: "https://whiteestate.org/images/books/yrp.jpg",
    description: "Devoted entirely to the work and presence of the Holy Spirit."
  },
  {
    id: "lhu",
    title: "Lift Him Up",
    link: "https://whiteestate.org/devotional/lhu/",
    cover: "https://whiteestate.org/images/books/lhu.jpg",
    description: "Elevating the beauty and character of Jesus as our Saviour and Example."
  },
  {
    id: "fw",
    title: "Faith and Works",
    link: "https://whiteestate.org/devotional/fw/",
    cover: "https://whiteestate.org/images/books/fw.jpg",
    description: "A balanced perspective on salvation, righteousness by faith, and Christian fruits."
  },
  {
    id: "dbd",
    title: "Darkness Before Dawn",
    link: "https://whiteestate.org/devotional/dbd/",
    cover: "https://whiteestate.org/images/books/dbd.jpg",
    description: "Hope-filled insights for living in the final days of earth's history."
  },
  {
    id: "ul",
    title: "The Upward Look",
    link: "https://whiteestate.org/devotional/ul/",
    cover: "https://whiteestate.org/images/books/ul.jpg",
    description: "Assurances and warnings drawn from personal correspondence to guide daily walk."
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
 * 1. Scrape devotionals list from whiteestate.org/devotional/
 */
app.get("/api/scrape-devotionals", async (req, res) => {
  try {
    console.log("Scraping devotionals list...");
    const url = "https://whiteestate.org/devotional/";
    const response = await fetchWithTimeout(url, 10000);
    
    if (!response.ok) {
      console.warn(`Failed to fetch main page: ${response.status}. Using fallback database.`);
      return res.json({ success: true, source: "fallback", data: FALLBACK_DEVOTIONALS });
    }

    const html = await response.text();
    const scrapedList: any[] = [];

    // Parse the table rows
    // We search for <tr> tags and analyze their cells
    const trRegex = /<tr[\s\S]*?>([\s\S]*?)<\/tr>/gi;
    let trMatch;
    
    while ((trMatch = trRegex.exec(html)) !== null) {
      const trContent = trMatch[1];
      
      // Look for anchor links matching devotional subpaths
      const linkMatch = trContent.match(/href=["'](?:https:\/\/whiteestate\.org)?\/devotional\/([a-z]{2,5})\/?["']/i);
      if (linkMatch) {
        const devId = linkMatch[1].toLowerCase();
        const fullLink = `https://whiteestate.org/devotional/${devId}/`;
        
        // Find image src in this row
        const imgMatch = trContent.match(/src=["']([^"']*)["']/i);
        let coverUrl = "";
        if (imgMatch) {
          coverUrl = imgMatch[1];
          // Make absolute if relative
          if (!coverUrl.startsWith("http")) {
            coverUrl = new URL(coverUrl, "https://whiteestate.org/devotional/").toString();
          }
        } else {
          // Attempt standard image format if scraping missed it
          coverUrl = `https://whiteestate.org/images/books/${devId}.jpg`;
        }

        // Try to find Title in the cells.
        // Usually, the cells are: 1st img/link, 2nd link, 3rd title, or just text in cells.
        // Let's grab all text from cells in the row.
        const tdRegex = /<td[\s\S]*?>([\s\S]*?)<\/td>/gi;
        let tdMatch;
        const cellTexts: string[] = [];
        
        while ((tdMatch = tdRegex.exec(trContent)) !== null) {
          const text = tdMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          if (text) {
            cellTexts.push(text);
          }
        }

        // Match titles
        let title = "";
        if (cellTexts.length >= 3) {
          title = cellTexts[2]; // Usually the third cell
        } else if (cellTexts.length >= 2) {
          title = cellTexts[1]; // Or the second cell if 2 cells
        } else if (cellTexts.length === 1) {
          title = cellTexts[0];
        }

        // Clean up title (remove URLs or links if any)
        title = title.replace(/https?:\/\/[^\s]+/g, "").trim();

        // If title is too short or missing, lookup from our list to make it complete!
        const matchedFallback = FALLBACK_DEVOTIONALS.find(d => d.id === devId);
        if (!title || title.length < 3) {
          title = matchedFallback ? matchedFallback.title : devId.toUpperCase();
        }

        const description = matchedFallback ? matchedFallback.description : `Daily devotional readings from Ellen G. White.`;

        // Check for duplicates
        if (!scrapedList.some(d => d.id === devId)) {
          scrapedList.push({
            id: devId,
            title,
            link: fullLink,
            cover: coverUrl,
            description
          });
        }
      }
    }

    if (scrapedList.length > 0) {
      console.log(`Successfully scraped ${scrapedList.length} devotionals!`);
      return res.json({ success: true, source: "live", data: scrapedList });
    } else {
      console.warn("Scraped list was empty. Using fallback.");
      return res.json({ success: true, source: "fallback", data: FALLBACK_DEVOTIONALS });
    }
  } catch (error: any) {
    console.error("Scraping failed with error:", error.message);
    return res.json({ success: true, source: "fallback", error: error.message, data: FALLBACK_DEVOTIONALS });
  }
});

/**
 * Helper to paraphrase a devotional with Gemini API based on a requested profile style
 */
async function paraphraseDevotional(
  title: string,
  paragraphs: any[],
  profile: string
): Promise<{ title: string; paragraphs: any[] }> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not defined. Skipping paraphrase step.");
      return { title, paragraphs };
    }

    console.log(`Calling Gemini to paraphrase devotional in the "${profile}" profile style...`);

    const originalJson = JSON.stringify({ title, paragraphs }, null, 2);

    let profileInstruction = "";

    switch (profile) {
      case "clear_modern":
        profileInstruction = `
### PROFILE: "Clear & Modern"
- **Tone**: Articulate, clear, thoughtful, and professional.
- **Specific Rules**: Smooth out 19th-century passive structures and archaic vocabulary (e.g., replace words like "thou", "thee", "thine", "ye", "hath", "doth", "shalt", "wouldst" with clean, respectful modern equivalents). Keep the language respectful, dignified, and deep, but easily readable for a modern adult. Preserve the exact theological meaning and flow of logic.
`;
        break;
      case "everyday_conversational":
        profileInstruction = `
### PROFILE: "Everyday Conversational"
- **Tone**: Warm, relatable, direct, and encouraging.
- **Specific Rules**: Use active verbs and shorter, punchier sentences. Write it so it sounds completely natural when read aloud, like a podcast host or trusted mentor sharing a personal insight. Focus on immediate clarity and a warm personal connection.
`;
        break;
      case "expressive_digital":
        profileInstruction = `
### PROFILE: "Expressive / Digital Native"
- **Tone**: High-impact, concise, and energetic.
- **Specific Rules**: Eliminate wordy 19th-century transitions, repetitive descriptors, and complex subordinate clauses. Condense the text to its absolute core spiritual truth and practical takeaway, making it highly scannable.
`;
        break;
      case "professional_growth":
        profileInstruction = `
### PROFILE: "Professional Growth"
- **Tone**: Polished, structured, and insightful.
- **Specific Rules**: Highlight inherent themes of character building, focus, mental resilience, wisdom, and leadership. Use clean, sophisticated modern language suitable for an executive or professional doing morning reflection.
`;
        break;
      case "discovery_story":
        profileInstruction = `
### PROFILE: "Discovery & Story" (Elementary School Level)
- **Tone**: Enthusiastic, simple, highly visual, and concrete.
- **Specific Rules**: Lower the comprehension level to a 3rd-4th grade reading level. Break long paragraphs into 2-3 short sentences. Translate abstract theological metaphors into concrete, real-world examples a child easily understands (e.g., school dynamics, family, pets, or nature). Avoid punitive, scary, or overly academic terms.
`;
        break;
      case "real_life_everyday":
        profileInstruction = `
### PROFILE: "Real Life / Everyday" (High School Level)
- **Tone**: Authentic, direct, supportive, and non-judgmental.
- **Specific Rules**: Frame the devotional concepts around the real-world experiences of modern teenage life (school stress, identity, friendships, integrity, finding purpose, handling pressure). Eliminate dense 19th-century prose. Do NOT use transient internet or teen slang, which dates instantly; instead, use clean, modern, peer-to-peer language that treats the teenager with mature respect.
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
`;

    const response = await ai.models.generateContent({
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
                  }
                },
                required: ["id", "type", "text"]
              }
            }
          },
          required: ["title", "paragraphs"]
        }
      }
    });

    const responseText = response.text;
    if (responseText) {
      const parsed = JSON.parse(responseText.trim());
      if (parsed && parsed.title && Array.isArray(parsed.paragraphs)) {
        console.log(`Successfully paraphrased devotional for profile "${profile}" with Gemini!`);
        return parsed;
      }
    }

    console.warn("Invalid response structure from Gemini. Falling back to original content.");
    return { title, paragraphs };

  } catch (error: any) {
    console.error(`Error during Gemini paraphrasing for profile ${profile}:`, error.message);
    return { title, paragraphs };
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
    
    // If original/classic profile requested, skip paraphrase
    if (profile === "classic" || profile === "original") {
      return res.json({ title, paragraphs });
    }

    // Paraphrase with Gemini API
    const paraphrased = await paraphraseDevotional(title, paragraphs, profile);

    return res.json({
      title: paraphrased.title,
      paragraphs: paraphrased.paragraphs
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
