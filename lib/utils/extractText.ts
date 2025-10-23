import { PDFParse } from "pdf-parse";


import fs from 'fs';
import mammoth from "mammoth";

export async function extractText(filePath: string, filename: string) {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.pdf')) {
    const buf = fs.readFileSync(filePath);
    const data =  new PDFParse(buf);
    const result = await data.getText();
    return result;
  } else if (lower.endsWith('.docx')) {
    const res = await mammoth.extractRawText({ path: filePath });
    return res.value;
  }
  throw new Error('Unsupported file type');
}