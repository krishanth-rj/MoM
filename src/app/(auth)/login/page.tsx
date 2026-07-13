"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage(null);
    setIsSubmitting(true);

    const supabase = createClient();

    const { error } =
      tab === "login"
        ? await supabase.auth.signInWithPassword({
            email,
            password,
          })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: fullName,
              },
            },
          });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (tab === "login") {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setErrorMessage("Account created. Check your email to confirm your signup.");
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-6xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-xl shadow-black/30">
        <div className="flex flex-col lg:flex-row">
          {/* Left — Kinetic Hero */}
          <div className="lg:w-1/2 border-b border-border lg:border-b-0 lg:border-r border-border px-8 md:px-16 py-16 lg:py-20 flex flex-col justify-center bg-background">
            <div className="max-w-xl">
              <div className="text-[clamp(4rem,8vw,8rem)] font-bold uppercase leading-[0.85] tracking-tighter mb-4">
                MoM
              </div>
              <div className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold uppercase tracking-tighter text-muted-foreground mb-6">
                Minutes of Meeting
              </div>
              <p className="text-base md:text-lg text-muted-foreground max-w-lg leading-7">
                AI-powered meeting minutes. Record, transcribe, and generate structured summaries in seconds.
              </p>
            </div>
          </div>

          {/* Right — Auth Form */}
          <div className="lg:w-1/2 px-8 md:px-16 py-16 lg:py-20 flex items-center justify-center bg-background">
            <div className="w-full max-w-md">
              <div className="rounded-[1.5rem] border border-border bg-background/95 p-8 shadow-lg shadow-black/20">
                {/* Tabs */}
                <div className="flex border border-border rounded-sm mb-10 overflow-hidden">
                  {(["login", "signup"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTab(t)}
                      className={`flex-1 py-4 font-bold uppercase tracking-wider text-sm transition-colors ${
                        tab === t
                          ? "bg-primary text-primary-foreground"
                          : "bg-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t === "login" ? "Sign In" : "Sign Up"}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {tab === "signup" && (
                    <div>
                      <label className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3">
                        Full Name
                      </label>
                      <Input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Full Name"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3">
                      Password
                    </label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  {errorMessage && (
                    <p className="text-sm text-muted-foreground">{errorMessage}</p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Please wait..."
                      : tab === "login"
                      ? "Sign In"
                      : "Create Account"}
                  </Button>
                </form>

                {tab === "login" && (
                  <p className="text-center mt-8 text-sm text-muted-foreground">
                    <button
                      type="button"
                      className="text-primary hover:underline font-bold uppercase tracking-wider"
                    >
                      Forgot Password?
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
