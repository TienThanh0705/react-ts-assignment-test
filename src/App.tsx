import React, { useState } from "react";
import "./styles.css";

import { UserListFixed } from "./components/UserListFixed";
import { UserProfile } from "./components/UserProfile";
import { ModalExamples } from "./components/ModalExamples";
import { SectionReview } from "./components/SectionReview";
import type { User } from "./types";
import { useToggle } from "./hooks/useToggle";
import { SectionIntersection } from "./components/Intersection";

const MOCK_USERS: User[] = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com" },
  { id: 2, name: "Bob Smith", email: "bob@example.com" },
  { id: 3, name: "Charlie Nguyen", email: "charlie@example.com" },
];

type Tab = "core" | "profile" | "modal" | "review"|"intersection";

function App() {
  const [tab, setTab] = useState<Tab>("core");
  const [on, toggle, reset] = useToggle(true);
  const navBtn = (id: Tab, label: string) => (
    <button
      key={id}
      className={`tab-btn ${tab === id ? "active" : ""}`}  
      onClick={() => setTab(id)}
    >
      {label}
    </button>
  );

  return (
    <div className="container">
      <h1>Frontend Technical Assessment</h1>

      <div className="nav">
        {navBtn("core", "Section 1 – Core Concepts")}
        {navBtn("profile", "Section 2 – UserProfile")}
        {navBtn("modal", "Section 3 – Modal")}
        {navBtn("review", "Section 4 – Code Review")}
        {navBtn("intersection", "Section 5 – Algorithm Test")}
      </div>
      {tab === "core" && (
  <div
    style={{
      maxHeight: "600px",  
      overflowY: "auto",   
      paddingRight: "8px"  
    }}
  >
    <div className="card">
      <h2>Question 1.1 – useState vs useRef</h2>
      <ul>
        <li>
          <strong>useState</strong>: Dùng để quản lý state có ảnh hưởng đến việc render lại component. 
          Khi giá trị state thay đổi, React sẽ re-render component để cập nhật giao diện.
        </li>
        <li>
          <strong>useRef</strong>: Dùng để lưu trữ giá trị có thể thay đổi nhưng không gây re-render khi thay đổi. 
          Thường được dùng để truy cập trực tiếp đến DOM element hoặc giữ giá trị tham chiếu giữa các lần render.
        </li>
        <li>
          <strong>Khi nào dùng?</strong> 
          Dùng <code>useState</code> khi dữ liệu thay đổi cần phản ánh ngay trên giao diện (state điều khiển UI).<br />
          Dùng <code>useRef</code> khi cần lưu trữ dữ liệu hoặc truy cập DOM mà không muốn trigger render lại, giúp tăng hiệu suất.
        </li>
      </ul>
    </div>

    <UserListFixed users={MOCK_USERS} />

    <div className="card">
      <h2>Question 1.3 – Create a custom hook called useToggle that:</h2>

      <p style={{ margin: "8px 0" }}>
        Trạng thái hiện tại: <strong>{on ? "ON" : "OFF"}</strong>
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={toggle} className="btn">Toggle</button>
        <button onClick={reset} className="btn btn-secondary">Reset</button>
      </div>
      {on && (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
          <em>Nội dung này chỉ hiển thị khi trạng thái đang ON.</em>
        </div>
      )}
    </div>
  </div>
       )}
      {tab === "profile" && <UserProfile />}
      {tab === "modal" && <ModalExamples />}
      {tab === "review" && <SectionReview />}
      {tab === "intersection" && <SectionIntersection />}
    </div>
  );
}

export default App;