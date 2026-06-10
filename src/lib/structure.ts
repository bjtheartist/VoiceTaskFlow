import Anthropic from "@anthropic-ai/sdk";

export interface StructuredNote {
  summary: string;
  mood: "energized" | "steady" | "stretched" | "drained" | "reflective";
  tasks: string[];
}

const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    summary: {
      type: "string",
      description:
        "A 1-2 sentence first-person summary of the note, written in the speaker's voice.",
    },
    mood: {
      type: "string",
      enum: ["energized", "steady", "stretched", "drained", "reflective"],
      description: "The overall mood of the note.",
    },
    tasks: {
      type: "array",
      items: { type: "string" },
      description:
        "Each concrete, actionable task mentioned, as a short imperative phrase (e.g. 'Email Frankye the staging link'). Empty if none.",
    },
  },
  required: ["summary", "mood", "tasks"],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT = `You turn rambling voice-note transcripts from a daily journal into structured data.

Rules:
- Tasks must be things the speaker actually intends to do — not vague hopes, not things already done.
- One task per item, short imperative phrasing, keep names and specifics from the transcript.
- Do not invent tasks that were not mentioned. If the note is purely reflective, return an empty tasks array.
- The summary should sound like a clean journal line in the speaker's own voice, not a robotic report.`;

/**
 * Structure a transcript with Claude. Falls back to a keyword heuristic when
 * no API key is configured or the API call fails, so saving a note never breaks.
 */
export async function structureTranscript(
  transcript: string
): Promise<StructuredNote> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return heuristicStructure(transcript);
  }
  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-opus-4-8",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: transcript }],
      output_config: {
        format: { type: "json_schema", schema: OUTPUT_SCHEMA },
      },
    });
    const text = response.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") throw new Error("No text in response");
    return JSON.parse(text.text) as StructuredNote;
  } catch (err) {
    console.error("Claude structuring failed, using heuristic:", err);
    return heuristicStructure(transcript);
  }
}

const TASK_CUES =
  /\b(need to|needs to|have to|gotta|got to|should|must|remember to|don't forget( to)?|todo|to-do|make sure( to| i)?|going to|gonna|plan to|want to|finish|call|email|text|send|buy|schedule|book|pay|submit|follow up( with| on)?)\b/i;

const LEAD_IN =
  /^(so|and|also|then|um|uh|okay|ok|like|i think|i guess|today)\s+/i;

const CUE_PREFIX =
  /^(i|we)?\s*(also\s+)?(really\s+)?(need to|needs to|have to|gotta|got to|should|must|remember to|don't forget to|make sure (to|i)|going to|gonna|plan to|want to)\s+/i;

function heuristicStructure(transcript: string): StructuredNote {
  const sentences = transcript
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+|,\s+(?=(?:and\s+)?(?:i\s+)?(?:also\s+)?(?:need|have|should|gotta|remember|don't forget))/i)
    .map((s) => s.trim())
    .filter(Boolean);

  const tasks: string[] = [];
  for (let s of sentences) {
    if (!TASK_CUES.test(s)) continue;
    s = s.replace(LEAD_IN, "");
    s = s.replace(CUE_PREFIX, "");
    s = s.replace(/[.!?]+$/, "").trim();
    if (s.length < 3) continue;
    tasks.push(s.charAt(0).toUpperCase() + s.slice(1));
  }

  const summary =
    sentences.slice(0, 2).join(" ").slice(0, 200) || transcript.slice(0, 200);

  return { summary, mood: "steady", tasks };
}
