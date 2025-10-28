import { NextResponse } from "next/server";
import multer from "multer";
import fs from "fs";

import path from "path";
import { extractText } from "@/lib/utils/extractText";

const upload = multer({ dest: "/tmp/upload" });

function runMiddleware(req: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, {} as any, (result: any) => {
      if (result instanceof Error) reject(result);
      else resolve(result);
    });
  });
}

export async function POST(req: any) {
  await runMiddleware(req, upload.single("resume"));
  const file = req.file;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    // Extract text
    const text =  await extractText(file.path, file.originalname);
    fs.unlinkSync(file.path); // clean up temp file

    // Send to OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3.1:free",
        messages: [
          {
            role: "user",
            content: `Analyze the following resume text and provide a structured JSON with:
            - Experience summary
            - Top skills
            - Recommended career domains
            Resume text: ${text.slice(0, 15000)}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    const aiText = data?.choices?.[0]?.message?.content ?? "{}";
    const aiJson = JSON.parse(aiText);

    return NextResponse.json(aiJson);
  } catch (err: any) {
    console.error("Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
