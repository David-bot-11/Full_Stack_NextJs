import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import multer from "multer";
import { extractText } from "@/lib/utils/extractText";
import fs from "fs";
import { authOptions } from "../auth/[...nextauth]/route";


const upload = multer({ dest: "/tmp/uploads" });

// Multer middleware wrapper for Next.js (since App Router doesn’t support middleware directly)
function runMiddleware(req: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, {} as any, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reqWithFile: any = req;
  await runMiddleware(reqWithFile, upload.single("resume"));

  const file = reqWithFile.file;
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const filePath = file.path;
  const fileName = file.originalname;

  try {
    // Extract resume text
    const text = await extractText(filePath, fileName);

    // Save resume content in Prisma
    const resume = await prisma.resume.create({
      data: {
        content: text,
        userId: session.user.id,
      },
    });

  
    const aiResponse = await fetch(process.env.AI_API_URL!, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const aiData = await aiResponse.json();

    // Save AI response
    await prisma.aIResponse.create({
      data: {
        resumeId: resume.id,
        contentfromai: JSON.stringify(aiData),
      },
    });

    // Cleanup file
    fs.unlinkSync(filePath);

    return NextResponse.json({ message: "Resume processed", aiData });
  } catch (err: any) {
    console.error("Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


    let file = files.resume || Object.values(files)[0];
    if (Array.isArray(file)) file = file[0];

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    // 🧠 Use your shared utility
    const text = await extractText(file.filePath,file.filename);

    // Find the user from session
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    try {
    const resume = await prisma.resume.create({
      data: {
        content: text,
        userId: user.id,
      },
    });

    return NextResponse.json({
      message: "Resume uploaded and text extracted successfully",
      resume,
    });
  } catch (err: any) {
    console.error("Error uploading resume:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
