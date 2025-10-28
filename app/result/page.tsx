"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResultPage() {
  const router = useRouter();
  const [aiResult, setAiResult] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("aiResult");
    if (stored) {
      setAiResult(JSON.parse(stored));
    } else {
      router.push("/upload");
    }
  }, [router]);

  if (!aiResult) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-950 text-white">
        <p>Loading results...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-10 px-6">
      <h1 className="text-4xl font-semibold mb-6">AI Resume Analysis</h1>

      <div className="max-w-3xl w-full bg-gray-900 rounded-xl shadow-lg p-6 space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-blue-400 mb-2">
            Experience Summary
          </h2>
          <p className="text-gray-300 leading-relaxed">
            {aiResult.ExperienceSummary || "No summary available."}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-blue-400 mb-2">
            Top Skills
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {aiResult.TopSkills?.map((skill: string, idx: number) => (
              <li
                key={idx}
                className="bg-gray-800 px-4 py-2 rounded-lg text-center text-gray-200"
              >
                {skill}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-blue-400 mb-2">
            Recommended Career Domains
          </h2>
          <ul className="list-disc list-inside text-gray-300">
            {aiResult.RecommendedCareerDomains?.map(
              (domain: string, idx: number) => (
                <li key={idx}>{domain}</li>
              )
            )}
          </ul>
        </section>
      </div>

      <button
        onClick={() => router.push("/upload")}
        className="mt-8 bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-500"
      >
        Back to Upload
      </button>
    </div>
  );
}
