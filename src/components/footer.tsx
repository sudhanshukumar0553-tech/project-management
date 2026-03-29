import Link from "next/link";
import { cn } from "@/lib/utils";

const footerItems = [
  { label: "Product", hasSeparator: true },
  { label: "Solutions", hasSeparator: true },
  { label: "Teams", hasSeparator: true },
  { label: "Pricing", hasSeparator: true },
  { label: "Resources", hasSeparator: false },
];

export const Footer = () => {
  return (
    <footer className="w-full bg-slate-900 px-4 py-12 md:px-24">
      <div className="md:max-w-screen-2xl mx-auto flex flex-col md:flex-row items-center w-full justify-between">
        <div className="mb-4 md:mb-0">
          <Link href="/" className="flex items-center gap-x-2">
            <div className="bg-white/20 h-6 w-16 rounded-sm flex items-center justify-center">
              <span className="text-white text-xs font-bold">Atlassian</span>
            </div>
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {footerItems.map((item) => (
            <div key={item.label} className="flex items-center">
              <Link
                href="#"
                className="text-sm font-medium text-slate-400 hover:text-slate-200 transition"
              >
                {item.label}
              </Link>
              {item.hasSeparator && (
                <div className="h-1 w-1 rounded-full bg-slate-600 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="md:max-w-screen-2xl mx-auto mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center">
        <p className="text-xs text-slate-400">
           © 2024 Trello, Inc. All rights reserved.
        </p>
        <div className="flex items-center gap-x-6 mt-4 md:mt-0">
          <Link href="#" className="text-xs text-slate-400 hover:text-slate-200 transition underline underline-offset-2">
            Privacy Policy
          </Link>
          <Link href="#" className="text-xs text-slate-400 hover:text-slate-200 transition underline underline-offset-2">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};
