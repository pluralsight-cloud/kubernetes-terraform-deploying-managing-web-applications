"use client";

import { FormEvent, useState } from "react";

type Props = {
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  eventId?: string;
};

export default function ConferenceSignup({
  title,
  subtitle,
  description,
  ctaLabel,
  eventId,
}: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, eventId }),
      });

      if (!res.ok) {
        throw new Error("Registration failed");
      }

      setStatus("success");
      setMessage("You're registered for the Future Conference!");
      setName("");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <>
      <div className="content-right text-center md:text-center">
        <h3 className="text-2xl font-light tracking-[2px] leading-[19px]">
          {title}
        </h3>
        <span className="text-base">{subtitle}</span>
        <div className="my-2.5 text-center">
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              setStatus("idle");
              setMessage("");
            }}
            className="rounded-full bg-globo-teal px-10 py-2.5 text-base text-white hover:bg-globo-teal-hover"
          >
            {ctaLabel}
          </button>
        </div>
        <p className="mx-auto max-w-[220px] px-2 text-xs font-normal not-italic md:px-[20px]">
          {description}
        </p>
      </div>

      {open && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded bg-white p-6 text-left text-globo-gray shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-globo-header">
                {title} {subtitle}
              </h2>
              <button
                type="button"
                className="text-2xl leading-none text-globo-muted"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm" htmlFor="reg-name">
                  Name
                </label>
                <input
                  id="reg-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm" htmlFor="reg-email">
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
              {message && (
                <p
                  className={`text-sm ${
                    status === "success" ? "text-green-700" : "text-red-600"
                  }`}
                >
                  {message}
                </p>
              )}
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-full bg-globo-teal px-6 py-2.5 font-semibold text-white hover:bg-globo-teal-hover disabled:opacity-60"
              >
                {status === "loading" ? "Submitting..." : "Register"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
