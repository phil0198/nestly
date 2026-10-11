"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Modal } from "../ui/Modal";
import { useUI } from "../ui/UIContext";
import { Icon } from "../icons";
import { Avatar } from "../ui/Avatar";
import { cn } from "@/lib/utils";

type Step = "email" | "password" | "signup";

function Field({
  label,
  type = "text",
  value,
  onChange,
  autoFocus,
  autoComplete,
  position,
  error,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  autoComplete?: string;
  position?: "top" | "bottom" | "single";
  error?: boolean;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <label
      className={cn(
        "relative block border px-3 pb-2 pt-6 transition-shadow focus-within:z-10 focus-within:rounded-lg focus-within:border-ink focus-within:shadow-ring",
        error ? "border-[#C13515] bg-[#FFF8F6]" : "border-[#B0B0B0]",
        position === "top" && "rounded-t-lg",
        position === "bottom" && "-mt-px rounded-b-lg",
        (!position || position === "single") && "rounded-lg",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute left-3 transition-all duration-150",
          value ? "top-2 text-xs" : "top-1/2 -translate-y-1/2 text-base",
          error ? "text-[#C13515]" : "text-muted",
        )}
      >
        {label}
      </span>
      <input
        type={isPassword && show ? "text" : type}
        value={value}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="peer w-full bg-transparent text-base text-ink outline-none"
      />
      {isPassword && value && (
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold underline">
          {show ? "Hide" : "Show"}
        </button>
      )}
    </label>
  );
}

export function AuthModal() {
  const { authOpen, authMode, closeAuth, runAfterLogin } = useUI();
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [known, setKnown] = useState<{ name: string | null; image: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (authOpen) {
      setStep("email");
      setPassword("");
      setError(null);
    }
  }, [authOpen]);

  async function finishLogin(emailValue: string, pw: string) {
    const res = await signIn("credentials", { email: emailValue, password: pw, redirect: false });
    if (!res || res.error) {
      setError("Invalid password. Please try again.");
      return false;
    }
    closeAuth();
    runAfterLogin();
    router.refresh();
    return true;
  }

  async function continueEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email.");
    setBusy(true);
    const res = await fetch("/api/auth/email-exists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setBusy(false);
    const data = (await res.json()) as { exists: boolean; name: string | null; image: string | null };
    if (data.exists) {
      setKnown({ name: data.name, image: data.image });
      setStep("password");
    } else {
      setStep("signup");
    }
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    await finishLogin(email, password);
    setBusy(false);
  }

  async function submitSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: first, lastName: last, email, password }),
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Something went wrong.");
      setBusy(false);
      return;
    }
    await finishLogin(email, password);
    setBusy(false);
  }

  async function demo() {
    setBusy(true);
    setEmail("guest@nestly.dev");
    await finishLogin("guest@nestly.dev", "password123");
    setBusy(false);
  }

  const title = step === "email" ? "Log in or sign up" : step === "password" ? "Log in" : "Finish signing up";
  const back =
    step !== "email" ? (
      <button type="button" aria-label="Back" onClick={() => setStep("email")} className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full hover:bg-faint">
        <Icon name="chevron-left" size={16} strokeWidth={2.5} />
      </button>
    ) : undefined;

  return (
    <Modal open={authOpen} onClose={closeAuth} title={title} headerLeft={back} width="max-w-[568px]">
      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-hairline p-4 text-sm" role="alert">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C13515] text-white">!</span>
          <span>
            <span className="block font-semibold">Let&rsquo;s try that again</span>
            {error}
          </span>
        </div>
      )}

      {step === "email" && (
        <form onSubmit={continueEmail}>
          <h2 className="mb-6 text-[22px] font-semibold leading-[26px]">
            {authMode === "signup" ? "Create your Nestly account" : "Welcome to Nestly"}
          </h2>
          <Field label="Email" type="email" autoComplete="email" value={email} onChange={setEmail} autoFocus />
          <p className="mt-2 text-xs text-muted">We&rsquo;ll check whether you already have an account. No spam, ever.</p>
          <button type="submit" disabled={busy} className="btn-brand mt-4 w-full">
            {busy ? "…" : "Continue"}
          </button>
          <div className="my-6 flex items-center gap-4 text-xs text-muted">
            <span className="h-px flex-1 bg-hairline" />
            or
            <span className="h-px flex-1 bg-hairline" />
          </div>
          <button type="button" onClick={demo} disabled={busy} className="flex w-full items-center rounded-lg border border-ink px-6 py-3 text-sm font-semibold hover:bg-faint">
            <Icon name="user" size={20} />
            <span className="flex-1 text-center">Continue with demo guest account</span>
          </button>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={submitPassword}>
          {known && (
            <div className="mb-6 flex items-center gap-4">
              <Avatar name={known.name ?? email} src={known.image} size={48} />
              <div>
                <div className="text-base font-semibold">Welcome back{known.name ? `, ${known.name}` : ""}</div>
                <div className="text-sm text-muted">{email}</div>
              </div>
            </div>
          )}
          <Field label="Password" type="password" autoComplete="current-password" value={password} onChange={setPassword} autoFocus error={!!error} />
          <button type="submit" disabled={busy || !password} className="btn-brand mt-4 w-full">
            {busy ? "…" : "Log in"}
          </button>
          <p className="mt-4 text-sm text-muted">
            Seeded accounts use the password <span className="font-semibold text-ink">password123</span>.
          </p>
        </form>
      )}

      {step === "signup" && (
        <form onSubmit={submitSignup}>
          <Field label="First name" autoComplete="given-name" value={first} onChange={setFirst} position="top" autoFocus />
          <Field label="Last name" autoComplete="family-name" value={last} onChange={setLast} position="bottom" />
          <p className="mb-4 mt-2 text-xs text-muted">Make sure it matches the name on your government ID.</p>
          <Field label="Email" type="email" autoComplete="email" value={email} onChange={setEmail} />
          <p className="mb-4 mt-2 text-xs text-muted">We&rsquo;ll email you trip confirmations and receipts.</p>
          <Field label="Password" type="password" autoComplete="new-password" value={password} onChange={setPassword} />
          <p className="mt-2 text-xs text-muted">At least 8 characters, including a number or symbol.</p>
          <p className="mt-6 text-xs leading-4 text-ink">
            By selecting <span className="font-semibold">Agree and continue</span>, I agree to Nestly&rsquo;s Terms of Service and acknowledge the
            Privacy Policy.
          </p>
          <button type="submit" disabled={busy} className="btn-brand mt-4 w-full">
            {busy ? "…" : "Agree and continue"}
          </button>
        </form>
      )}
    </Modal>
  );
}
