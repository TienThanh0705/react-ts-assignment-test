// Section 1.2 – Fix component
import React, { useState } from "react";
import type { User } from "../types";

interface Props {
  users: User[];
}

/**
 * Các lỗi ban đầu:
 * - Thiếu import useState
 * - Không có key khi map
 * - setSelectedUser lưu id nhưng hiển thị selectedUser.name
 * - onClick đặt ở <div> không có role/keyboard (accessibility)
 */
export function UserListFixed({ users }: Props) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <div className="card" aria-live="polite">
      <h2>Question 1.2 Fix the following component that has multiple issues:</h2>
      <h4>Các lỗi ban đầu:</h4>
      <ul style={{ margin: "8px 0 16px", paddingLeft: 20 }}>
            <li>Thiếu import <code>useState</code></li>
            <li>Không có <code>key</code> khi <code>map</code></li>
            <li><code>setSelectedUser</code> lưu <code>id</code> nhưng lại hiển thị <code>selectedUser.name</code></li>
            <li><code>onClick</code> đặt ở <code>&lt;div&gt;</code> không có role/keyboard (accessibility)</li>
     </ul>
      <h2>Users</h2>
      <div className="row" style={{ alignItems: "stretch" }}>
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => setSelectedUser(user)}
            className="card"
            style={{ textAlign: "left", flex: "1 1 260px" }}
            aria-pressed={selectedUser?.id === user.id}
          >
            <h3 style={{ margin: 0 }}>{user.name}</h3>
            <p style={{ margin: "6px 0 0" }}>{user.email}</p>
          </button>
        ))}
      </div>

      {selectedUser && (
        <div className="card" style={{ background: "#f8fafc" }}>
          <h3 style={{ margin: 0 }}>Selected: {selectedUser.name}</h3>
        </div>
      )}
    </div>
  );
}