"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isBoardPage = pathname.startsWith("/board");

  return (
    <>
      {!isAuthPage && <Navbar />}
      <main className={cn("flex-1", !isAuthPage && "pt-14")}>{children}</main>
      {!isAuthPage && !isBoardPage && <Footer />}
    </>
  );
}
