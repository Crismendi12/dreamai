"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/lib/icons";

/**
 * Outcome ticker lines — static, developer-authored strings (no user input), so
 * rendering them via dangerouslySetInnerHTML on the .ticker-text span is safe.
 * They carry inline markup (<b> numerics, <span class="when"> qualifier) that the
 * CSS styles, which is why they can't be plain text.
 */
const TICKER_ITEMS = [
  "Clinically-validated IRT",
  "<b>~70%</b> fewer nightmares",
  "Rewrite it, rehearse it awake",
  "<b>4,200+</b> dreams rewritten",
  "Veteran &amp; clinician-built",
  "<b>10 min</b> a day, no meds",
  "Your dream, your control",
];

const SWAP_INTERVAL_MS = 3200;
const SWAP_BLUR_MS = 260;

/**
 * Standalone, in-canvas sign-in SCREEN shown after "Generate Rehearsal Film" and
 * before the film generates. Mocked: any auth button calls onSignIn().
 */
export default function SignInScreen({
  onSignIn,
  onBack,
}: {
  onSignIn: () => void;
  onBack?: () => void;
}) {
  const headlineId = useId();
  const signedInRef = useRef(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [swapping, setSwapping] = useState(false);

  const handleSignIn = () => {
    if (signedInRef.current) return; // one-shot guard against double-fire
    signedInRef.current = true;
    onSignIn();
  };

  // Outcome ticker: cross-fade through TICKER_ITEMS. Respect reduced motion.
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let swapTimeout: ReturnType<typeof setTimeout> | undefined;
    const interval = setInterval(() => {
      setSwapping(true);
      swapTimeout = setTimeout(() => {
        setTickerIndex((i) => (i + 1) % TICKER_ITEMS.length);
        setSwapping(false);
      }, SWAP_BLUR_MS);
    }, SWAP_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      if (swapTimeout) clearTimeout(swapTimeout);
    };
  }, []);

  return (
    <div
      className="w-full animate-fade-in"
      style={{ maxWidth: 440, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}
    >
      {onBack && (
        <button
          type="button"
          className="linklike"
          onClick={onBack}
          style={{ alignSelf: "flex-start", marginBottom: 18 }}
        >
          <Icon name="arrowleft" size={14} /> Back
        </button>
      )}

      <div
        className="panel"
        role="group"
        aria-labelledby={headlineId}
        style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "36px 28px 26px" }}
      >
        {/* Brand mark */}
        <div
          aria-hidden="true"
          style={{ width: 40, height: 40, borderRadius: 12, background: "var(--accent-soft)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22 }}
        >
          <Icon name="moon" size={20} />
        </div>

        {/* Outcome ticker */}
        <div aria-hidden="true" style={{ marginBottom: 24 }}>
          <div className="ticker">
            <span className="ticker-dot">
              <Icon name="check" size={11} />
            </span>
            {/* Static developer-authored HTML — safe, no user input. */}
            <span
              className={`ticker-text${swapping ? " is-swapping" : ""}`}
              dangerouslySetInnerHTML={{ __html: TICKER_ITEMS[tickerIndex] }}
            />
          </div>
        </div>

        {/* Headline */}
        <h2 id={headlineId} className="serif-hero" style={{ fontSize: "clamp(26px, 5vw, 32px)", margin: 0 }}>
          Save your new <span className="em">ending.</span>
        </h2>

        {/* Subcopy */}
        <p className="subhead" style={{ marginTop: 12 }}>
          Sign in to generate your rehearsal film. Your dream and your rewritten ending are already saved.
        </p>

        {/* Carry recap */}
        <div className="carry" style={{ width: "100%", textAlign: "left" }}>
          <div className="carry-label">
            <Icon name="check" /> Saved from your session
          </div>
          <div className="carry-row">
            <span className="carry-k">Unlocking</span>
            <span className="carry-v">A calm rehearsal film to watch before sleep.</span>
          </div>
        </div>

        {/* Auth buttons (mocked) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
          <button type="button" className="btn btn--brand btn--block" onClick={handleSignIn}>
            <Icon name="google" />
            Continue with Google
          </button>
          <button type="button" className="btn btn--ghost btn--block" onClick={handleSignIn}>
            <Icon name="mail" />
            Continue with email
          </button>
        </div>

        {/* Reassurance */}
        <p className="proof" style={{ marginTop: 18 }}>
          <Icon name="lock" size={13} style={{ opacity: 0.6 }} />
          Private by design. Your nightmares are never shared, sold, or used to train public models.
        </p>

        {/* Terms */}
        <p style={{ marginTop: 14, marginBottom: 0, fontSize: 12.5, color: "var(--faint)" }}>
          By continuing you agree to DreamAI&apos;s <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
