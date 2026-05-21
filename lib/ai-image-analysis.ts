import "server-only";

import { z } from "zod";
import issueAiAnalysisJsonSchema from "@/lib/issue-ai-analysis.schema.json";

type GeminiPart =
  | {
      text: string;
    }
  | {
      inline_data: {
        data: string;
        mime_type: string;
      };
    };

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

const MAX_IMAGES_TO_ANALYZE = 3;

const issueAiAnalysisSchema = z.object({
  title: z.string().trim().min(3).max(40),
  visibleDamage: z.string().trim().min(1).max(150),
});

export type IssueAiAnalysis = z.infer<typeof issueAiAnalysisSchema>;

function getGeminiConfig() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return null;
  }

  return {
    apiKey,
    model: process.env.GEMINI_VISION_MODEL || "gemini-2.5-flash-lite",
  };
}

function getGeminiGenerateContentUrl(model: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

function extractResponseText(response: GeminiResponse) {
  return (
    response.candidates
      ?.flatMap((candidate) => candidate.content?.parts ?? [])
      .map((part) => part.text)
      .find((text): text is string => Boolean(text?.trim()))
      ?.trim() ?? null
  );
}

async function fileToGeminiPart(file: File): Promise<GeminiPart> {
  const buffer = Buffer.from(await file.arrayBuffer());

  return {
    inline_data: {
      data: buffer.toString("base64"),
      mime_type: file.type,
    },
  };
}

function parseIssueAiAnalysis(text: string) {
  try {
    console.log("Parsing Gemini response proste:", text);
    return issueAiAnalysisSchema.parse(JSON.parse(text));
  } catch (error) {
    console.error("Gemini image analysis JSON validation failed:", error);
    return null;
  }
}

export async function analyzeIssueImages(images: File[]) {
  const config = getGeminiConfig();
  const imagesToAnalyze = images.slice(0, MAX_IMAGES_TO_ANALYZE);

  if (!config || imagesToAnalyze.length === 0) {
    return null;
  }

  try {
    const imageInputs = await Promise.all(
      imagesToAnalyze.map((image) => fileToGeminiPart(image)),
    );
    const parts: GeminiPart[] = [
      {
        text:
          "Jestes ekspertem od odbiorow i remontow. Obejrzyj zdjecia usterki i zwroc JSON zgodny ze schematem. NIE DODAWAJ NICZEGO POZA JSONEM " +
          "Pole title ma byc krotka nazwa usterki do formularza, np. 'Pekniecie plytki przy scianie'. I nie przekraczaj 40 znakow razem z spacjami. " +
          "Pole visibleDamage ma byc jednozdaniowym opisem widocznej szkody, ktory trafi bezposrednio do pola opisu usterki ma nie przekraczac 80 znakow razem z spacjami. " +
          "Pisz po polsku, konkretnie i technicznie. Nie zmyslaj faktow, ktorych nie widac. " +
          "Jesli przyczyna nie jest pewna, opisz ja jako prawdopodobna." +
          "Nie zwracaj pustych pól. Każdy string musi zawierać konkretną treść.",
      },
      ...imageInputs,
    ];
    const response = await fetch(getGeminiGenerateContentUrl(config.model), {
      body: JSON.stringify({
        contents: [
          {
            parts,
            role: "user",
          },
        ],
        generationConfig: {
          maxOutputTokens: 2000,
          responseJsonSchema: issueAiAnalysisJsonSchema,
          responseMimeType: "application/json",
        },
      }),
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": config.apiKey,
      },
      method: "POST",
    });

    const payload = (await response.json()) as GeminiResponse;

    if (!response.ok) {
      console.error(
        "Gemini image analysis failed:",
        payload.error?.message ?? response.statusText,
      );
      return null;
    }

    const text = extractResponseText(payload);
    const analysis = text ? parseIssueAiAnalysis(text) : null;

    return analysis
      ? {
          analysis,
          description: analysis.visibleDamage,
        }
      : null;
  } catch (error) {
    console.error("Gemini image analysis failed:", error);
    return null;
  }
}
