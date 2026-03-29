import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight, Play } from "lucide-react";

export default function MarketingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative w-full pt-16 pb-20 md:pt-32 md:pb-32 bg-linear-to-br from-purple-700 via-purple-600 to-pink-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-x-12">
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left text-white">
                <div className="mb-6 flex items-center bg-amber-100/20 text-amber-200 px-4 py-2 rounded-full uppercase text-xs font-bold tracking-wider">
                   NEW: AI Features available!
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                    Capture, organize, and tackle your to-dos from anywhere.
                </h1>
                <p className="text-lg md:text-xl mb-10 text-white/90 max-w-xl">
                    Escape the clutter and chaos—unleash your productivity with Trello.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <input 
                      type="email" 
                      placeholder="Email" 
                      className="w-full sm:w-80 px-4 py-3 rounded-md text-neutral-800 placeholder-neutral-500 outline-none focus:ring-2 focus:ring-blue-400 font-sans"
                    />
                    <button className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 transition rounded-md font-semibold text-white">
                        Sign up - it’s free!
                    </button>
                </div>
                <div className="mt-8 flex flex-col sm:flex-row items-center gap-x-6 text-sm">
                   <p className="mb-4 sm:mb-0 text-white/70">By entering my email, I acknowledge the Privacy Policy</p>
                   <button className="flex items-center gap-x-2 text-white font-medium hover:underline">
                      <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                         <Play className="h-4 w-4 fill-white" />
                      </div>
                      Watch video
                   </button>
                </div>
            </div>
            <div className="w-full md:w-1/2 mt-12 md:mt-0">
               <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/30 hidden md:block">
                  <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover"
                  >
                    <source src="https://videos.ctfassets.net/rz1oowkt5gyp/4AJBdHGUKUIDo7Po3f2kWJ/3923727607407f50f70ccf34ab3e9d90/updatedhero-mobile-final.mp4" type="video/mp4" />
                  </video>
               </div>
            </div>
        </div>
      </section>

      {/* Feature Section 1 */}
      <section className="py-20 bg-slate-50 md:py-32">
         <div className="container mx-auto px-4">
            <div className="max-w-3xl mb-20 text-left">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">TRELLO 101</p>
                <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-6 leading-snug">
                   Your productivity powerhouse
                </h2>
                <p className="text-xl text-slate-600 text-left">
                    Stay organized and efficient with Inbox, Boards, and Planner. Every to-do, idea, or responsibility—no matter how small—finds its place, keeping you at the top of your game.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {['Inbox', 'Boards', 'Planner'].map((feature, i) => (
                    <div key={feature} className={cn(
                        "p-8 rounded-xl border-l-8 bg-white shadow-md hover:shadow-xl transition-all cursor-pointer group",
                        i === 0 ? "border-blue-500 bg-white" : "border-transparent opacity-60 hover:opacity-100"
                    )}>
                        <h4 className="text-2xl font-bold text-slate-800 mb-4">{feature}</h4>
                        <p className="text-slate-600">
                            {i === 0 && "When it’s on your mind, it goes in your Inbox. Capture your to-dos from anywhere, anytime."}
                            {i === 1 && "Your to-do list may be long, but it can be manageable! Keep tabs on everything from \"to-dos to tackle\" to \"mission accomplished!”"}
                            {i === 2 && "Drag, drop, get it done. Snap your top tasks into your calendar and make time for what truly matters."}
                        </p>
                    </div>
                ))}
            </div>
            
            <div className="mt-16 relative aspect-16/6 bg-slate-100 rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
               <div className="absolute inset-0 bg-linear-to-t from-slate-900/10 to-transparent z-10" />
               <img 
                 src="https://images.ctfassets.net/rz1oowkt5gyp/w3lwhF5VUl2zPrQhoo6zi/87076ead73cad0973c907db1960bacfc/board-slider.png?w=2184&fm=webp" 
                 alt="Trello Board Interface"
                 className="w-full h-full object-cover"
               />
            </div>
         </div>
      </section>

      {/* Feature Section 2 - Info Cards */}
      <section className="py-20 md:py-32">
         <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="order-2 md:order-1 relative group">
               <div className="absolute -inset-4 bg-linear-to-tr from-blue-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition duration-500" />
               <div className="relative aspect-square max-w-lg mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
                   <img 
                     src="https://images.ctfassets.net/rz1oowkt5gyp/2QvggeQ9nzUdaDnhJCSUwA/3ef97067e1aa3d0a5e6a04b5780fd751/email-todos.png?w=1110&fm=webp" 
                     alt="Email to Trello Integration"
                     className="w-full h-full object-contain p-4"
                   />
               </div>
            </div>
            <div className="order-1 md:order-2 flex flex-col md:items-start text-left">
               <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-8 leading-snug">
                  From message to action
               </h2>
               <p className="text-xl text-slate-600 mb-10">
                  Quickly turn communication from your favorite apps into to-dos, keeping all your discussions and tasks organized in one place.
               </p>
               
               <div className="space-y-12">
                   <div>
                       <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 text-left">EMAIL MAGIC</h3>
                       <p className="text-slate-700 leading-relaxed text-left">
                          Easily turn your emails into to-dos! Just forward them to your Trello Inbox, and they’ll be transformed by AI into organized to-dos with all the links you need.
                       </p>
                   </div>
                   <div>
                       <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 text-left">MESSAGE APP SORCERY</h3>
                       <p className="text-slate-700 leading-relaxed text-left">
                          Need to follow up on a message from Slack or Microsoft Teams? Send it directly to your Trello board! Your favorite app interface lets you save messages that appear in your Trello Inbox with AI-generated summaries and links.
                       </p>
                   </div>
               </div>
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-linear-to-r from-blue-700 to-indigo-800">
         <div className="container mx-auto px-4 text-center text-white">
            <h2 className="text-3xl md:text-5xl font-bold mb-10">More than just to-dos.</h2>
            <p className="text-xl mb-12 text-blue-100 max-w-2xl mx-auto">
                Join over 2,000,000 teams worldwide that use Trello to get more done.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
               <input 
                  type="email" 
                  placeholder="Email" 
                  className="px-6 py-4 rounded-md text-neutral-800 outline-none w-full"
                />
               <button className="px-8 py-4 bg-white text-blue-800 rounded-md font-bold hover:bg-blue-50 transition min-w-fit">
                  Sign up - it’s free!
               </button>
            </div>
         </div>
      </section>
    </div>
  );
}

