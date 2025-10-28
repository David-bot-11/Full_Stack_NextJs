"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please upload a file first");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("/api/resume", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      
      localStorage.setItem("aiResult", JSON.stringify(data.aiResponse));

      router.push("/result");
    } catch (err) {
      console.error(err);
      setError("Upload failed");
    }
  };

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white">
      <h1 className="text-3xl mb-4">Upload Your Resume</h1>

      <form onSubmit={handleUpload} className="flex flex-col items-center gap-4">
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="p-2 bg-gray-800 rounded-lg"
        />
        <button
          type="submit"
          className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-500"
        >
          Upload & Analyze
        </button>
      </form>

      {error && (
        <p className="mt-4 text-red-400 bg-red-900 px-4 py-2 rounded">{error}</p>
      )}

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="mt-8 bg-red-600 px-6 py-2 rounded-lg hover:bg-red-500"
      >
        Logout
      </button>
    </div>
  );
}
