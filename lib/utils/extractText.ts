import fs from "fs";
import * as pdfParse from "pdf-parse";
import mammoth from "mammoth";

export async function extractText(file: File): Promise<string> {
  const filePath = (file as any).filepath || (file as any).path;
  if (!filePath) throw new Error("File path missing");

  const fileName = (file as any).originalFilename || file.name || "";
  const lower = fileName.toLowerCase();

  if (lower.endsWith(".pdf")) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer) as string;
    return data;
  } else if (lower.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  throw new Error("Unsupported file type. Only PDF and DOCX are allowed.");
}
