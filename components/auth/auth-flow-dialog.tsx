"use client";

import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useAuthModal } from "@/components/auth/auth-modal-provider";

function ModalShell({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog backdrop"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-[420px] rounded-2xl border border-base-200 bg-white p-6 shadow-xl dark:border-white/[0.08] dark:bg-[#161c32]"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <h2
            id={titleId}
            className="text-xl font-semibold text-base-900 dark:text-white"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-base-500 transition-colors hover:bg-base-100 hover:text-base-900 dark:hover:bg-white/5 dark:hover:text-white"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AuthForm({
  mode,
  onModeChange,
  onClose,
}: {
  mode: "login" | "register";
  onModeChange: (mode: "login" | "register") => void;
  onClose: () => void;
}) {
  const { login, register, loginAsDemo } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login({ email, password });
        onClose();
      } else {
        await register({ email, password });
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-base-700 dark:text-base-200">
          Email
        </span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-11 rounded-[10px] border border-[#E4E7EC] bg-white px-3 text-base-900 outline-none ring-blue-500 focus:ring-2 dark:border-white/15 dark:bg-white/[0.04] dark:text-white"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-base-700 dark:text-base-200">
          Password
        </span>
        <input
          type="password"
          required
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-11 rounded-[10px] border border-[#E4E7EC] bg-white px-3 text-base-900 outline-none ring-blue-500 focus:ring-2 dark:border-white/15 dark:bg-white/[0.04] dark:text-white"
        />
      </label>
      {error ? (
        <p className="text-sm text-red-500 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        className="btn-grow flex h-11 items-center justify-center rounded-[10px] bg-[#4F2DEC] text-[15px] font-medium text-white shadow-[0.5px_0.5px_0px_0px_rgba(255,255,255,0.4)_inset] transition-colors hover:bg-[#5D3EF0] disabled:opacity-60"
      >
        <span className="btn-grow-label">
          {submitting
            ? "Please wait…"
            : mode === "login"
              ? "Login"
              : "Create account"}
        </span>
      </button>
      <button
        type="button"
        onClick={async () => {
          await loginAsDemo();
          onClose();
        }}
        className="text-sm text-base-500 underline underline-offset-2 transition-colors hover:text-[#8874ff] dark:text-base-400"
      >
        Continue as demo user
      </button>
      <p className="text-center text-sm text-base-500 dark:text-base-400">
        {mode === "login" ? "New here?" : "Already have an account?"}{" "}
        <button
          type="button"
          className="font-medium text-[#4F2DEC] dark:text-[#8874ff]"
          onClick={() =>
            onModeChange(mode === "login" ? "register" : "login")
          }
        >
          {mode === "login" ? "Register" : "Login"}
        </button>
      </p>
    </form>
  );
}

export function AuthFlowDialog({
  isOpen,
  mode,
  onClose,
  onModeChange,
}: {
  isOpen: boolean;
  mode: "login" | "register";
  onClose: () => void;
  onModeChange: (mode: "login" | "register") => void;
}) {
  return (
    <ModalShell
      open={isOpen}
      onClose={onClose}
      title={mode === "login" ? "Welcome back" : "Create your account"}
    >
      <AuthForm mode={mode} onModeChange={onModeChange} onClose={onClose} />
    </ModalShell>
  );
}

export function AuthDialog({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <ModalShell open={isOpen} onClose={onClose} title="Choose a username">
      {children}
    </ModalShell>
  );
}

export function UsernameSelectionForm({
  email,
  suggestedUsername,
  onSuccess,
}: {
  clerkToken: string;
  clerkUserId: string;
  email: string;
  suggestedUsername: string;
  method: "email" | "oauth";
  onSuccess: () => void;
}) {
  const { completeRegistration } = useAuth();
  const [username, setUsername] = useState(suggestedUsername);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await completeRegistration(username);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-base-500 dark:text-base-400">
        Finish signup for <span className="font-medium">{email}</span>
      </p>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-base-700 dark:text-base-200">
          Username
        </span>
        <input
          required
          minLength={3}
          maxLength={24}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="h-11 rounded-[10px] border border-[#E4E7EC] bg-white px-3 text-base-900 outline-none ring-blue-500 focus:ring-2 dark:border-white/15 dark:bg-white/[0.04] dark:text-white"
        />
      </label>
      {error ? (
        <p className="text-sm text-red-500 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        className="btn-grow flex h-11 items-center justify-center rounded-[10px] bg-[#4F2DEC] text-[15px] font-medium text-white shadow-[0.5px_0.5px_0px_0px_rgba(255,255,255,0.4)_inset] transition-colors hover:bg-[#5D3EF0] disabled:opacity-60"
      >
        <span className="btn-grow-label">
          {submitting ? "Saving…" : "Continue"}
        </span>
      </button>
    </form>
  );
}

/** Convenience bridge used by SiteHeader to own modal wiring. */
export function HeaderAuthDialogs() {
  const {
    pendingRegistration,
    clearPendingRegistration,
  } = useAuth();
  const {
    modalState,
    openLoginModal,
    openRegisterModal,
    closeModal,
  } = useAuthModal();

  return (
    <>
      <AuthFlowDialog
        isOpen={modalState.type === "login" || modalState.type === "register"}
        mode={modalState.type === "register" ? "register" : "login"}
        onClose={closeModal}
        onModeChange={(next) =>
          next === "register" ? openRegisterModal() : openLoginModal()
        }
      />
      {pendingRegistration ? (
        <AuthDialog isOpen onClose={clearPendingRegistration}>
          <UsernameSelectionForm
            {...pendingRegistration}
            onSuccess={() => {}}
          />
        </AuthDialog>
      ) : null}
    </>
  );
}
