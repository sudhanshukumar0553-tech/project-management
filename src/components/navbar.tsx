"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const navItems = [
  { 
    label: "Features", 
    hasDropdown: true,
    items: [
      { title: "Inbox", desc: "Capture every vital detail from emails, Slack, and more.", href: "/inbox" },
      { title: "Planner", desc: "Sync your calendar and allocate focused time slots.", href: "/planner" },
      { title: "Automation", desc: "Automate tasks and workflows with Trello.", href: "/butler-automation" },
      { title: "Power-Ups", desc: "Link their favorite tools with Trello plugins.", href: "/power-ups" },
    ]
  },
  { 
    label: "Solutions", 
    hasDropdown: true,
    items: [
      { title: "Marketing teams", desc: "Whether launching a new product, campaign, or creating content.", href: "/teams/marketing" },
      { title: "Product management", desc: "Use Trello’s management boards and roadmap features.", href: "/teams/product" },
      { title: "Engineering teams", desc: "Ship more code, faster, and be more agile.", href: "/teams/engineering" },
    ]
  },
  { 
    label: "Plans", 
    hasDropdown: true,
    items: [
      { title: "Standard", desc: "For teams that need to manage more work.", href: "/standard" },
      { title: "Premium", desc: "Best for teams up to 100 that need to track multiple projects.", href: "/premium" },
      { title: "Enterprise", desc: "Everything your enterprise teams and admins need.", href: "/enterprise" },
    ]
  },
  { label: "Pricing", href: "https://trello.com/pricing" },
  { 
    label: "Resources", 
    hasDropdown: true,
    items: [
      { title: "Trello guide", desc: "Take you from project set-up to Trello expert.", href: "/guide" },
      { title: "Remote work guide", desc: "Setting up your team for remote work success.", href: "/guide/remote-work" },
      { title: "Webinars", desc: "Enjoy our free Trello webinars.", href: "/webinars" },
    ]
  },
];

export const Navbar = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <nav className="fixed top-0 w-full h-14 px-4 border-b shadow-sm bg-white flex items-center z-50">
      <div className="md:max-w-screen-2xl mx-auto flex items-center w-full justify-between">
        <div className="flex items-center gap-x-8">
          <Link href="/" className="flex items-center gap-x-2">
             <div className="relative h-8 w-8 transition hover:opacity-75">
                <div className="bg-blue-600 h-full w-full rounded-sm flex items-center justify-center">
                    <div className="bg-white w-1/2 h-4 rounded-xs mr-0.5" />
                    <div className="bg-white w-1/2 h-6 rounded-xs" />
                </div>
             </div>
             <p className="text-xl font-bold text-neutral-700 pb-1">Trello</p>
          </Link>
          <div className="hidden md:flex items-center gap-x-4">
            {navItems.map((item) => (
              <div 
                key={item.label} 
                className="relative h-full"
                onMouseEnter={() => setActiveMenu(item.label)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button
                  className="flex items-center text-sm text-neutral-600 hover:text-neutral-900 px-3 py-4 transition"
                >
                  {item.label}
                  {item.hasDropdown && <ChevronDown className="h-4 w-4 ml-1" />}
                </button>
                {item.hasDropdown && activeMenu === item.label && (
                  <div className="absolute top-full left-0 w-100 bg-white border border-neutral-200 shadow-xl rounded-md p-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="grid gap-y-4">
                      {item.items?.map((sub) => (
                        <Link 
                          key={sub.title} 
                          href={sub.href}
                          className="group p-2 hover:bg-neutral-100 rounded-md transition"
                        >
                          <p className="text-sm font-bold text-neutral-800 group-hover:text-blue-600">
                            {sub.title}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {sub.desc}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-x-2">
          <Link href="/boards" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 px-4 py-2 transition">
            My Boards
          </Link>
          <Link 
            href="/signup" 
            className="text-sm font-white bg-blue-600 text-white px-4 py-2 rounded-sm hover:bg-blue-700 transition"
          >
            Get Trello for free
          </Link>
        </div>
      </div>
    </nav>
  );
};
