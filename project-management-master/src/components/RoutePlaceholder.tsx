import Link from "next/link";

interface RoutePlaceholderProps {
  title: string;
  description: string;
}

export function RoutePlaceholder({ title, description }: RoutePlaceholderProps) {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Coming Soon
        </p>
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        <p className="mt-3 text-slate-600">{description}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/boards"
            className="rounded-md bg-[#0079bf] px-4 py-2 text-sm font-medium text-white hover:bg-[#026aa7]"
          >
            Go to My Boards
          </Link>
          <Link
            href="/"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}