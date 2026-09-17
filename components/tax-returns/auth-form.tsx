"use client";

import { useState } from "react";
import { SignInForm, SignUpForm } from "./account-forms";

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  return (
    <div className="space-y-4">
      <div className="flex rounded-lg border border-border p-1">
        <button
          type="button"
          className={`flex-1 rounded-md py-2 text-sm ${mode === "login" ? "bg-primary text-primary-foreground" : ""}`}
          onClick={() => setMode("login")}
        >
          Log in
        </button>
        <button
          type="button"
          className={`flex-1 rounded-md py-2 text-sm ${mode === "register" ? "bg-primary text-primary-foreground" : ""}`}
          onClick={() => setMode("register")}
        >
          Create account
        </button>
      </div>
      {mode === "login" ? <SignInForm /> : <SignUpForm />}
    </div>
  );
}
