"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
export function LogoutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div>
      <Button
        variant="outline"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            const response = await fetch("/api/auth/logout", {
              method: "POST",
            });
            if (!response.ok) throw new Error();
            window.location.assign("/signup");
          } catch {
            setError("Could not log out. Please try again.");
            setBusy(false);
          }
        }}
      >
        {busy ? "Logging out…" : "Log out"}
      </Button>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
