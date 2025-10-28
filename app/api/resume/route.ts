import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
import PDFParser from "pdf2json";
import os from "os";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    
    const formData = await req.formData();
    const uploadedFile = formData.get("resume");

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json(
        { error: "No valid file uploaded" },
        { status: 400 }
      );
    }

    
    const fileId = uuidv4();
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `${fileId}_${uploadedFile.name}`);

    
    const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());
    await fs.writeFile(tempFilePath, fileBuffer);

   
    const pdfParser = new (PDFParser as any)(null, 1);

    const parsedText: string = await new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (err: any) =>
        reject(err.parserError)
      );
      pdfParser.on("pdfParser_dataReady", () =>
        resolve(pdfParser.getRawTextContent())
      );
      pdfParser.loadPDF(tempFilePath);
    });

    
    await fs.unlink(tempFilePath).catch(() => {});

    if (!parsedText || parsedText.trim().length === 0) {
      return NextResponse.json(
        { error: "Failed to extract text from PDF." },
        { status: 400 }
      );
    }

    
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing AI API key. Set OPENROUTER_API_KEY in .env." },
        { status: 500 }
      );
    }

    const limitedText = parsedText.slice(0, 15000);

    const aiResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct:free",
          messages: [
            {
              role: "system",
              content:
                "You are an expert career coach. Analyze resumes and return structured JSON.",
            },
            {
              role: "user",
              content: `Analyze this resume and return JSON with the following:
              {
                "ExperienceSummary": "",
                "TopSkills": [],
                "RecommendedCareerDomains": [],
                "LearningSuggestions": []
              }
              Resume text: ${limitedText}`,
            },
          ],
          response_format: { type: "json_object" },
        }),
      }
    );

    // 5️⃣ Handle AI response
    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API Error:", errorText);
      return NextResponse.json(
        { error: "AI request failed", details: errorText },
        { status: aiResponse.status }
      );
    }

    const data = await aiResponse.json();
    const aiText = data?.choices?.[0]?.message?.content ?? "{}";

    let aiJson;
    try {
      aiJson = JSON.parse(aiText);
    } catch {
      aiJson = { rawResponse: aiText };
    }

    // 6️⃣ Return the AI analysis
    return NextResponse.json(
      {
        message: "Resume analyzed successfully",
        aiResponse: aiJson,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Resume analysis error:", err.message);
    return NextResponse.json(
      { error: err.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}
