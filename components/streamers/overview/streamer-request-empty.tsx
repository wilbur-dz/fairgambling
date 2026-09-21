"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getPublicApiUrl } from "@/lib/api/config";

const LINK_FIELDS = [
  {
    key: "kick" as const,
    label: "Kick link",
    placeholder: "https://kick.com/streamer",
    hosts: ["kick.com"],
  },
  {
    key: "x" as const,
    label: "X link",
    placeholder: "https://x.com/streamer",
    hosts: ["x.com", "twitter.com"],
  },
  {
    key: "discord" as const,
    label: "Discord link",
    placeholder: "https://discord.gg/invite",
    hosts: ["discord.gg", "discord.com"],
  },
  {
    key: "twitch" as const,
    label: "Twitch link",
    placeholder: "https://twitch.tv/streamer",
    hosts: ["twitch.tv"],
  },
];

type LinkKey = (typeof LINK_FIELDS)[number]["key"];

function isValidProfileUrl(raw: string, hosts: string[]): boolean {
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    return hosts.some((h) => host === h) && url.pathname.replace(/\/+$/, "").length > 1;
  } catch {
    return false;
  }
}

export function StreamerRequestEmpty({ query }: { query: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(query);
  const [links, setLinks] = useState<Record<LinkKey, string>>({
    kick: "",
    x: "",
    discord: "",
    twitch: "",
  });
  const [showAllLinks, setShowAllLinks] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const fieldStatus = (key: LinkKey) => {
    const value = links[key].trim();
    if (!value) return "empty" as const;
    const field = LINK_FIELDS.find((f) => f.key === key);
    if (!field || !isValidProfileUrl(value, field.hosts)) return "invalid" as const;
    return "valid" as const;
  };

  const kickOk = fieldStatus("kick") === "valid";
  const allLinksOk = LINK_FIELDS.every((f) => fieldStatus(f.key) !== "invalid");
  const canSubmit =
    name.trim().length >= 2 && kickOk && allLinksOk && status !== "sending";

  const inputClass = (state: "empty" | "valid" | "invalid") =>
    `w-full rounded-xl border bg-white/[0.5] px-3.5 py-2.5 text-[13px] text-[#2a274e] outline-none transition-colors placeholder:text-[rgba(42,39,78,0.3)] dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/30 ${
      state === "invalid"
        ? "border-red-500/60 focus:border-red-400"
        : state === "valid"
          ? "border-[#3ddc97]/40 focus:border-[#3ddc97]/70"
          : "border-[rgba(42,39,78,0.1)] focus:border-[#8874ff]/60 dark:border-white/10"
    }`;

  const submit = async () => {
    setStatus("sending");
    try {
      const linkBlob = LINK_FIELDS.filter((f) => fieldStatus(f.key) === "valid")
        .map((f) => links[f.key].trim())
        .join(" · ");
      const res = await fetch(`${getPublicApiUrl()}/api/streamers/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          links: linkBlob,
          message: message.trim(),
        }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto max-w-md py-10 text-center">
      <p className="text-[14px] text-[rgba(42,39,78,0.6)] dark:text-white/60">
        No streamers found
        {query ? (
          <>
            {" "}
            for{" "}
            <span className="font-medium text-[#2a274e] dark:text-white">
              “{query}”
            </span>
          </>
        ) : null}
        .
      </p>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          if (status === "error") setStatus("idle");
        }}
        className="nd-gradient-border mt-4 inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(270deg,#573bd7_0%,#8065ec_24.522%,#9a80f9_50%,#775ce7_75.485%,#573bd7_100%)] px-5 py-2.5 text-[13px] font-medium text-white backdrop-blur-[35.5px] transition-all hover:brightness-110 dark:bg-gradient-to-l dark:from-[#2a274e] dark:via-[#454181] dark:to-[#2a274e]"
      >
        Request a streamer to be tracked by FairGambling
      </button>
      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[300] flex items-center justify-center p-4"
              role="dialog"
              aria-modal
            >
              <div
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
                onClick={() => setOpen(false)}
              />
              <div className="nd-gradient-border relative w-full max-w-[440px] rounded-2xl bg-[#10131f] p-5 text-left shadow-2xl">
                {status === "done" ? (
                  <div className="py-6 text-center">
                    <p className="text-[15px] font-semibold text-[#2a274e] dark:text-white">
                      Request sent 🎉
                    </p>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-[rgba(42,39,78,0.45)] dark:text-white/45">
                      Our team reviews every request — if the streamer checks out,
                      they&apos;ll show up here soon.
                    </p>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="mt-4 rounded-full bg-[rgba(42,39,78,0.06)] px-5 py-2 text-[12.5px] font-medium text-[rgba(42,39,78,0.7)] hover:bg-white/[0.1] dark:bg-white/[0.06] dark:text-white/70"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-[15px] font-semibold text-[#2a274e] dark:text-white">
                      Request a Streamer
                    </h3>
                    <p className="mt-1 text-[12px] leading-relaxed text-[rgba(42,39,78,0.45)] dark:text-white/45">
                      Tell us who&apos;s missing — a valid Kick link is all we need.
                    </p>
                    <div className="mt-4 flex flex-col gap-2.5">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Streamer name"
                        maxLength={120}
                        className={inputClass("empty")}
                      />
                      {(showAllLinks ? LINK_FIELDS : LINK_FIELDS.slice(0, 1)).map(
                        (field) => {
                          const st = fieldStatus(field.key);
                          return (
                            <div key={field.key}>
                              <input
                                type="url"
                                value={links[field.key]}
                                onChange={(e) =>
                                  setLinks((prev) => ({
                                    ...prev,
                                    [field.key]: e.target.value,
                                  }))
                                }
                                placeholder={field.placeholder}
                                maxLength={200}
                                className={inputClass(st)}
                              />
                              {st === "invalid" ? (
                                <p className="mt-1 pl-1 text-[11px] text-red-400">
                                  Not a valid {field.label.replace(" link", "")}{" "}
                                  profile URL
                                </p>
                              ) : null}
                            </div>
                          );
                        },
                      )}
                      {!showAllLinks ? (
                        <button
                          type="button"
                          onClick={() => setShowAllLinks(true)}
                          className="self-start text-[12px] font-medium text-[#8874ff] hover:text-[#a99bff]"
                        >
                          + Add more socials (X, Discord, Twitch)
                        </button>
                      ) : null}
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Why should we track them? (optional)"
                        maxLength={2000}
                        rows={3}
                        className="w-full resize-none rounded-xl border border-[rgba(42,39,78,0.1)] bg-white/[0.5] px-3.5 py-2.5 text-[13px] text-[#2a274e] outline-none placeholder:text-[rgba(42,39,78,0.3)] focus:border-[#8874ff]/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/30"
                      />
                      {status === "error" ? (
                        <p className="text-[12px] text-red-400">
                          Could not send — please try again in a moment.
                        </p>
                      ) : null}
                      <p className="text-[12px] leading-relaxed text-[rgba(42,39,78,0.45)] dark:text-white/45">
                        Are you a streamer? Reach out to{" "}
                        <a
                          href="https://x.com/DegenHighs"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-[#8874ff] hover:underline"
                        >
                          @DegenHighs
                        </a>{" "}
                        on X to get fast-tracked.
                      </p>
                      <div className="mt-1 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="rounded-full px-4 py-2 text-[12.5px] font-medium text-[rgba(42,39,78,0.5)] hover:text-[#2a274e] dark:text-white/50 dark:hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={!canSubmit}
                          onClick={() => void submit()}
                          className="nd-gradient-border inline-flex items-center rounded-full bg-[linear-gradient(270deg,#573bd7_0%,#8065ec_24.522%,#9a80f9_50%,#775ce7_75.485%,#573bd7_100%)] px-5 py-2 text-[12.5px] font-medium text-white backdrop-blur-[35.5px] transition-all hover:brightness-110 disabled:opacity-50 dark:bg-gradient-to-l dark:from-[#2a274e] dark:via-[#454181] dark:to-[#2a274e]"
                        >
                          {status === "sending" ? "Sending…" : "Send request"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
