'use client';

import { useState } from "react";

export default function SignOutButton() {
  const [message, setMessage] = useState<string | null>(null);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.localStorage.removeItem("synapse_token");
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
    >
      Sign out
    </button>
  );
}
