"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;

    try {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      router.push("/boards");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-10 rounded-sm shadow-xl border border-neutral-200">
        <div className="flex flex-col items-center mb-10 text-center">
           <div className="bg-blue-600 h-10 w-10 rounded-sm flex items-center justify-center mb-2">
              <div className="bg-white w-1/2 h-5 rounded-xs mr-0.5" />
              <div className="bg-white w-1/2 h-8 rounded-xs" />
           </div>
           <p className="text-2xl font-bold text-[#172b4d] mb-4">Sign up for your account</p>
           <p className="text-sm text-neutral-600 font-medium tracking-tight">One account for Trello, Jira, Confluence and more.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <input 
              type="email" 
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter email" 
              required
              className="w-full h-11 px-3 border-2 border-neutral-200 rounded-sm focus:border-blue-500 outline-none transition text-base font-sans"
            />
          </div>
          <p className="text-xs text-neutral-500 text-center">
            By signing up, you agree to our <Link href="#" className="underline">Terms of Service</Link> and <Link href="#" className="underline">Privacy Policy</Link>.
          </p>
          <button
            disabled={isSubmitting}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold rounded-sm transition"
          >
            {isSubmitting ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <div className="my-6 text-center text-xs text-neutral-500 font-bold uppercase tracking-wider relative">
           <span className="bg-white px-2 relative z-10">OR</span>
           <div className="absolute top-1/2 w-full h-px bg-neutral-200" />
        </div>

        <div className="space-y-4">
          <button className="w-full h-11 border-2 border-neutral-200 rounded-sm flex items-center px-4 hover:bg-neutral-50 transition font-bold text-neutral-600">
             Continue with Google
          </button>
          <button className="w-full h-11 border-2 border-neutral-200 rounded-sm flex items-center px-4 hover:bg-neutral-50 transition font-bold text-neutral-600">
             Continue with Microsoft
          </button>
          <button className="w-full h-11 border-2 border-neutral-200 rounded-sm flex items-center px-4 hover:bg-neutral-50 transition font-bold text-neutral-600">
             Continue with Apple
          </button>
          <button className="w-full h-11 border-2 border-neutral-200 rounded-sm flex items-center px-4 hover:bg-neutral-50 transition font-bold text-neutral-600">
             Continue with Slack
          </button>
        </div>

        <div className="mt-10 pt-6 border-t border-neutral-200 text-center">
           <Link href="/login" className="text-blue-600 text-sm hover:underline font-medium">
             Already have an Atlassian account? Log in
           </Link>
        </div>
      </div>
      <div className="mt-8 flex gap-x-4 text-xs text-neutral-500 font-bold uppercase tracking-tight">
          <span>Privacy Policy</span>
          <span>•</span>
          <span>Terms of Service</span>
      </div>
    </div>
  );
}
