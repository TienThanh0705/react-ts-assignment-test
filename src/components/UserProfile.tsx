// src/components/UserProfile.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

// Khai báo type User (hoặc import từ ../types nếu bạn đã có)
// import type { User } from "../types";
type User = {
  id: number;
  name: string;
  email: string;
};

const ENDPOINT = "https://jsonplaceholder.typicode.com/users/1";
type FetchState = "idle" | "loading" | "success" | "error";

export function UserProfile() {
  const [state, setState] = useState<FetchState>("idle");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const prevUserRef = useRef<User | null>(null); // để rollback nếu save lỗi

  // Fetch on mount + Abort nếu unmount
  useEffect(() => {
    const c = new AbortController();
    (async () => {
      setState("loading");
      setError(null);
      try {
        const res = await fetch(ENDPOINT, { signal: c.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as User;
        setUser(data);
        setState("success");
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setError(e?.message ?? "Unknown error");
        setState("error");
      }
    })();
    return () => c.abort();
  }, []);

  const startEdit = () => {
    if (!user) return;
    setEditing(true);
    setNameDraft(user.name);
  };

  const cancelEdit = () => {
    setEditing(false);
    setNameDraft("");
  };

  const canSave = useMemo(
    () => editing && nameDraft.trim().length > 0,
    [editing, nameDraft]
  );

  const save = async () => {
    if (!user || !canSave) return;

    // Optimistic update
    prevUserRef.current = user;
    const next = { ...user, name: nameDraft.trim() } as User;
    setUser(next);
    setEditing(false);

    try {
      // JSONPlaceholder trả 200 nhưng không lưu thật — minh họa PATCH
      const res = await fetch(ENDPOINT, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: next.name }),
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
    } catch (e: any) {
      // Rollback nếu lỗi
      if (prevUserRef.current) setUser(prevUserRef.current);
      alert(e?.message ?? "Update failed");
    }
  };

  return (
    <div className="card">
      <h2>Section 2: State Management & Effects</h2>
      <h2>UserProfile</h2>

      {state === "loading" && (
        <div
          className="card skeleton"
          style={{ height: 84 }}
          aria-busy="true"
          aria-label="Loading"
        />
      )}

      {state === "error" && (
        <div role="alert" className="card" style={{ background: "#fee2e2" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {state === "success" && user && (
        <div>
          <div className="row">
            <div className="card" style={{ flex: "1 1 320px" }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <div className="badge">id: {user.id}</div>
                  <h3 style={{ margin: "6px 0" }}>{user.name}</h3>
                  <p style={{ margin: 0 }}>{user.email}</p>
                </div>
                {!editing && (
                  <button onClick={startEdit} aria-label="Edit name">
                    Edit
                  </button>
                )}
              </div>

              {editing && (
                <div style={{ marginTop: 12 }}>
                  <input
                    className="input"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    aria-label="Edit user name"
                  />
                  <div className="footer">
                    <button onClick={cancelEdit}>Cancel</button>
                    <button onClick={save} disabled={!canSave} aria-disabled={!canSave}>
                      Save (optimistic)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
