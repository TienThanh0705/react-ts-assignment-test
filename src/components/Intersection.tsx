
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
/**
 * Cách 1: Counting Array — khi biết trước miền giá trị 0..1000
 * Time: O(n+m), Space: O(1001)
 */
export function intersectCounting(nums1: number[], nums2: number[]): number[] {
  const MAX = 1000;
  const cnt = new Array(MAX + 1).fill(0);
  for (const x of nums1) {
    cnt[x]++;
  }
  const res: number[] = [];
  for (const y of nums2) {
    if (cnt[y] > 0) {
      res.push(y);
      cnt[y]--;
    }
  }
  return res;
}

/**
 * Cách 2: Hash Map — khi miền giá trị lớn/không biết trước (hoặc vượt 0..1000)
 * Time: O(n + m) trung bình; Space: O(min(n, m))
 */
export function intersectMap(a: number[], b: number[]): number[] {
  if (a.length > b.length) return intersectMap(b, a);
  const map = new Map<number, number>();
  for (const x of a) map.set(x, (map.get(x) || 0) + 1);
  const res: number[] = [];
  for (const y of b) {
    const c = map.get(y) || 0;
    if (c > 0) {
      res.push(y);
      map.set(y, c - 1);
    }
  }
  return res;
}

/**
 * Cách 3: Two Pointers — khi HAI mảng ĐÃ SẮP XẾP (hoặc chấp nhận sort trước)
 * Nếu chưa sorted: sort bản sao rồi chạy O(n + m); chi phí sort: O(n log n + m log m)
 */
export function intersectTwoPointers(a: number[], b: number[], assumeSorted = false): number[] {
  const A = assumeSorted ? a : [...a].sort((x, y) => x - y);
  const B = assumeSorted ? b : [...b].sort((x, y) => x - y);
  let i = 0, j = 0;
  const res: number[] = [];
  while (i < A.length && j < B.length) {
    if (A[i] === B[j]) {
      res.push(A[i]);
      i++; j++;
    } else if (A[i] < B[j]) {
      i++;
    } else {
      j++;
    }
  }
  return res;
}

/**
 * Cách 4 (Follow-up): Streaming — đọc nums2 theo chunk từ đĩa khi RAM hạn chế
 */
export async function intersectStreamingDemo(
  nums1: number[],
  readChunkFromDisk: () => AsyncGenerator<number[], void, unknown>,
  valueRangeKnown0To1000 = true
): Promise<number[]> {
  let out: number[] = [];
  if (valueRangeKnown0To1000) {
    const MAX = 1000;
    const cnt = new Array(MAX + 1).fill(0);
    for (const x of nums1) cnt[x]++;
    for await (const chunk of readChunkFromDisk()) {
      for (const y of chunk) {
        if (y >= 0 && y <= MAX && cnt[y] > 0) {
          out.push(y);
          cnt[y]--;
        }
      }
    }
  } else {
    const map = new Map<number, number>();
    for (const x of nums1) map.set(x, (map.get(x) || 0) + 1);
    for await (const chunk of readChunkFromDisk()) {
      for (const y of chunk) {
        const c = map.get(y) || 0;
        if (c > 0) {
          out.push(y);
          map.set(y, c - 1);
        }
      }
    }
  }
  return out;
}

/* =====================================================================================
 * 2) Utilities: parse input, kiểm tra sorted, chọn thuật toán tối ưu
 * =====================================================================================*/

function parseArray(input: string): number[] {
  // Chấp nhận: "1,2,2,1" hoặc "[1,2,2,1]" hoặc " 1  ,  2 ,2 , 1 "
  const s = input.trim();
  if (!s) return [];
  try {
    if (s.startsWith("[")) {
      const arr = JSON.parse(s);
      if (Array.isArray(arr)) return arr.map((x) => Number(x)).filter((x) => Number.isFinite(x));
    }
  } catch {}
  return s
    .split(/[,\s]+/)
    .map((x) => Number(x))
    .filter((x) => Number.isFinite(x));
}

function inRange0To1000(arr: number[]): boolean {
  for (const x of arr) if (x < 0 || x > 1000) return false;
  return true;
}

function isNonDecreasing(arr: number[]): boolean {
  for (let i = 1; i < arr.length; i++) if (arr[i] < arr[i - 1]) return false;
  return true;
}
function chooseMethod(nums1: number[], nums2: number[]): {
  name: "counting" | "map" | "two-pointers-sorted" | "two-pointers-sort-first";
  reason: string;
} {
  const bothSorted = isNonDecreasing(nums1) && isNonDecreasing(nums2);
  const bothInRange = inRange0To1000(nums1) && inRange0To1000(nums2);

  if (bothSorted) {
    return { name: "two-pointers-sorted", reason: "Hai mảng đã sắp xếp → Two-Pointers O(n+m), không cần sort." };
  }
  if (bothInRange) {
    return { name: "counting", reason: "Giá trị 0..1000 → Counting Array O(n+m), dùng O(1001) bộ nhớ." };
  }
  return { name: "map", reason: "Miền giá trị rộng/không biết trước → Hash Map O(n+m), O(min(n,m))." };
}


type MethodKey = "auto" | "counting" | "map" | "two-pointers";

export function SectionIntersection() {
  const [input1, setInput1] = useState("1,2,2,1");
  const [input2, setInput2] = useState("2,2");
  const [method, setMethod] = useState<MethodKey>("auto");
  const [result, setResult] = useState<number[]>([]);
  const [explain, setExplain] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [constraintOk, setConstraintOk] = useState<boolean>(true);

  /* Gợi ý nhanh & phân tích */
  const tips = useMemo(
    () => [
      "Ràng buộc 0..1000 → ưu tiên Counting Array (O(n+m), O(1001)).",
      "Miền giá trị lớn/không biết trước → Hash Map, build từ mảng nhỏ hơn.",
      "Đầu vào đã sorted → Two Pointers O(n+m), tránh sort lại.",
      "nums2 rất lớn/ở trên đĩa → đọc theo chunk; đối chiếu với bảng đếm từ nums1.",
      "Không yêu cầu giữ thứ tự; chỉ đảm bảo số lần xuất hiện chung.",
    ],
    []
  );

  const findings = useMemo(
    () => [
      {
        issue: "Duyệt lồng nhau O(n*m) gây chậm với dữ liệu lớn.",
        why: "Mỗi phần tử của nums1 lại tìm trong nums2 → chi phí bùng nổ.",
        fix: "Dùng Counting/Map (tra nhanh O(1) trung bình) hoặc Two Pointers nếu sorted.",
      },
      {
        issue: "Bỏ lỡ ràng buộc giá trị 0..1000.",
        why: "Counting Array kích thước 1001 rất nhỏ & nhanh.",
        fix: "Ưu tiên Counting khi phù hợp, đạt O(n+m), O(1001) bộ nhớ.",
      },
      {
        issue: "Sort cả hai mảng dù không cần thiết.",
        why: "Sort tốn O(n log n + m log m).",
        fix: "Chỉ Two Pointers trực tiếp khi input đã sorted; nếu không, cân nhắc Map/Counting.",
      },
    ],
    []
  );
  const parsed1 = useMemo(() => parseArray(input1), [input1]);
  const parsed2 = useMemo(() => parseArray(input2), [input2]);
  const autoChoice = useMemo(() => chooseMethod(parsed1, parsed2), [parsed1, parsed2]);
  useEffect(() => {
    const okLen = parsed1.length >= 1 && parsed1.length <= 1000 && parsed2.length >= 1 && parsed2.length <= 1000;
    const okRange = inRange0To1000(parsed1) && inRange0To1000(parsed2);
    setConstraintOk(okLen && okRange);
  }, [parsed1, parsed2]);

  const handleRun = useCallback(() => {
    setError("");
    try {
      let out: number[] = [];
      let reason = "";

      const m: MethodKey = method;
      if (m === "auto") {
        const choice = autoChoice;
        reason = `Auto chọn: ${choice.name}. Lý do: ${choice.reason}`;
        if (choice.name === "counting") {
          out = intersectCounting(parsed1, parsed2);
        } else if (choice.name === "map") {
          out = intersectMap(parsed1, parsed2);
        } else if (choice.name === "two-pointers-sorted") {
          out = intersectTwoPointers(parsed1, parsed2, /*assumeSorted*/ true);
        } else {
          out = intersectMap(parsed1, parsed2);
        }
      } else if (m === "counting") {
        if (!inRange0To1000(parsed1) || !inRange0To1000(parsed2)) {
          throw new Error("Counting Array yêu cầu giá trị trong khoảng 0..1000. Hãy dùng Hash Map hoặc Two Pointers.");
        }
        out = intersectCounting(parsed1, parsed2);
        reason = "Dùng Counting Array vì ràng buộc 0..1000.";
      } else if (m === "map") {
        out = intersectMap(parsed1, parsed2);
        reason = "Dùng Hash Map cho miền giá trị rộng/không biết trước.";
      } else if (m === "two-pointers") {
        const alreadySorted = isNonDecreasing(parsed1) && isNonDecreasing(parsed2);
        out = intersectTwoPointers(parsed1, parsed2, alreadySorted);
        reason = alreadySorted
          ? "Hai mảng đã sorted → Two Pointers O(n+m)."
          : "Hai mảng chưa sorted → sort trước rồi Two Pointers (tổng O(n log n + m log m)).";
      }

      setResult(out);
      setExplain(reason);
    } catch (e: any) {
      setError(e?.message || "Có lỗi xảy ra khi chạy thuật toán.");
      setResult([]);
      setExplain("");
    }
  }, [method, parsed1, parsed2, autoChoice]);

  const [bench, setBench] = useState<{ method: string; ms: number; note: string }[] | null>(null);
  const runBench = useCallback(() => {
    const gen = (n: number, max: number, sorted = false) => {
      const arr = Array.from({ length: n }, () => Math.floor(Math.random() * (max + 1)));
      return sorted ? arr.sort((a, b) => a - b) : arr;
    };
    const A = gen(20000, 1000);
    const B = gen(25000, 1000);

    const timeit = (label: string, fn: () => void, note = "") => {
      const t0 = performance.now();
      fn();
      const t1 = performance.now();
      return { method: label, ms: +(t1 - t0).toFixed(2), note };
    };

    const r: { method: string; ms: number; note: string }[] = [];
    r.push(timeit("Counting", () => intersectCounting(A, B), "0..1000"));
    r.push(timeit("Map", () => intersectMap(A, B), "Miền rộng/không biết trước"));
    r.push(timeit("TwoPointers (sort-first)", () => intersectTwoPointers(A, B, false), "Chưa sorted: phải sort"));
    setBench(r);
  }, []);

  const fullSnippet = useMemo(() => {
    return `// Intersection of Two Arrays II — 3 cách + streaming demo
${intersectCounting.toString()}

${intersectMap.toString()}

${intersectTwoPointers.toString()}

/** Streaming pseudo (đọc theo chunk) */
${intersectStreamingDemo.toString()}`;
  }, []);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullSnippet);
      setCopied(true);
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }, [fullSnippet]);

  const fillExample1 = useCallback(() => {
    setInput1("1,2,2,1");
    setInput2("2,2");
  }, []);
  const fillExample2 = useCallback(() => {
    setInput1("4,9,5");
    setInput2("9,4,9,8,4");
  }, []);
  const fillRandom = useCallback(() => {
    const rand = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 11)); // 0..10
    setInput1(rand(8).join(","));
    setInput2(rand(10).join(","));
  }, []);
  useEffect(() => {
    handleRun();
  }, []);
const btnSky: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid #0284c7", // xanh da trời đậm hơn một chút
  background: "#0ea5e9", // xanh da trời
  color: "white", // chữ trắng
  cursor: "pointer",
};
  return (
    <div
      role="region"
      aria-label="Intersection of Two Arrays II"
      style={{
        border: "1px solid #e5e7eb",
        padding: 16,
        borderRadius: 12,
        maxHeight: 720,
        overflow: "auto",
        background: "#fff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Intersection of Two Arrays II – Giải tối ưu (JS/TS)</h2>
       
      </div>

      <details>
        <summary style={{ cursor: "pointer", fontWeight: 600, marginBottom: 8 }}>Đề bài</summary>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: "#374151", marginTop: 8 }}>
          Cho hai mảng số nguyên <code>nums1</code> và <code>nums2</code>, trả về <b>giao</b> của chúng. Mỗi phần tử trong
          kết quả phải xuất hiện <b>đúng bằng số lần</b> nó xuất hiện ở <b>cả hai</b> mảng; thứ tự bất kỳ đều được.
          <div style={{ marginTop: 8 }}>
            <b>Ví dụ 1</b>: nums1 = [1,2,2,1], nums2 = [2,2] → Output: [2,2]
          </div>
          <div>
            <b>Ví dụ 2</b>: nums1 = [4,9,5], nums2 = [9,4,9,8,4] → Output: [4,9] (hoặc [9,4])
          </div>
          <div style={{ marginTop: 6 }}>
            <b>Ràng buộc</b>: 1 ≤ length ≤ 1000; 0 ≤ giá trị ≤ 1000
          </div>
        </div>
      </details>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#555" }}>nums1 (vd: 1,2,2,1 hoặc [1,2,2,1])</span>
          <input
            aria-label="Input array nums1"
            value={input1}
            onChange={(e) => setInput1(e.target.value)}
            placeholder="1,2,2,1"
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              outline: "none",
            }}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#555" }}>nums2 (vd: 2,2 hoặc [2,2])</span>
          <input
            aria-label="Input array nums2"
            value={input2}
            onChange={(e) => setInput2(e.target.value)}
            placeholder="2,2"
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              outline: "none",
            }}
          />
        </label>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={fillExample1} title="Đổ dữ liệu Ví dụ 1" style={btnSky}>Ví dụ 1</button>
          <button onClick={fillExample2} title="Đổ dữ liệu Ví dụ 2" style={btnSky}>Ví dụ 2</button>
          <button onClick={fillRandom} title="Sinh dữ liệu ngẫu nhiên (0..10)" style={btnSky}>Random</button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
          <label htmlFor="method" style={{ fontSize: 12, color: "#555" }}>Thuật toán:</label>
          <select
            id="method"
            aria-label="Chọn thuật toán"
            value={method}
            onChange={(e) => setMethod(e.target.value as MethodKey)}
            style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid #e5e7eb" }}
          >
            <option value="auto">
              Auto — {autoChoice.name} ({autoChoice.reason})
            </option>
            <option value="counting">Counting Array (0..1000)</option>
            <option value="map">Hash Map (miền rộng)</option>
            <option value="two-pointers">Two Pointers (sorted / sort trước)</option>
          </select>

          <button onClick={handleRun} style={btnSky}>Chạy</button>
        </div>
      </div>
      {error ? (
        <div role="alert" style={{ color: "#b91c1c", marginTop: 10 }}>
          <b>Lỗi:</b> {error}
        </div>
      ) : (
        <>
          <div style={{ marginTop: 10, fontSize: 12, color: "#374151" }}>
            <b>Giải thích:</b> {explain || "—"}
          </div>
          <div
            style={{
              background: "#f9fafb",
              border: "1px dashed #e5e7eb",
              padding: 12,
              borderRadius: 10,
              marginTop: 8,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Kết quả (thứ tự bất kỳ đều hợp lệ):</div>
            <div>[{result.join(", ")}]</div>
          </div>
        </>
      )}
      <div style={{ marginTop: 10, fontSize: 12, color: "#555" }}>
        <b>Độ phức tạp:</b> Counting/Map: O(n+m). Two Pointers: O(n+m) nếu đã sorted; nếu chưa, tổng thể O(n log n + m log m).
      </div>
      <h3 style={{ marginTop: 14 }}>Phân tích & tối ưu</h3>
      <ul style={{ paddingLeft: 18, marginBottom: 8 }}>
        {findings.map((f, i) => (
          <li key={i} style={{ marginBottom: 8 }}>
            <div><b>Vấn đề:</b> {f.issue}</div>
            <div><b>Vì sao:</b> {f.why}</div>
            <div><b>Cách khắc phục:</b> {f.fix}</div>
          </li>
        ))}
      </ul>
      <details>
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>Code 3 cách </summary>
        <div className="row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "8px 0" }}>
         
          <button onClick={handleCopy} style={{ ...btnPrimary, padding: "6px 10px", borderRadius: 8, background: copied ? "#065f46" : "#111827" }} aria-live="polite">
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <pre style={{ whiteSpace: "pre-wrap" }}>{fullSnippet}</pre>
      </details>
      <div style={{ marginTop: 12 }}>
        <button onClick={runBench} title="Chạy benchmark nhanh (random 0..1000)" style={btnSky }>
          Chạy benchmark nhỏ
        </button>
        {bench && (
          <div style={{ marginTop: 10, border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>Phương pháp</th>
                  <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #e5e7eb" }}>Thời gian (ms)</th>
                  <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {bench.map((b, i) => (
                  <tr key={i}>
                    <td style={{ padding: 8, borderBottom: "1px solid #f3f4f6" }}>{b.method}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f3f4f6", textAlign: "right" }}>{b.ms}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f3f4f6" }}>{b.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ fontSize: 12, color: "#6b7280", padding: 8 }}>
              *Kết quả phụ thuộc máy & trình duyệt; Counting thường nhanh nhất khi thoả 0..1000.
            </div>
          </div>
        )}
      </div>
      <details style={{ marginTop: 12 }}>
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>Follow-up: trả lời chi tiết</summary>
        <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6 }}>
          <p>
            <b>1) Nếu mảng đã sắp xếp?</b> Dùng <code>Two Pointers</code> để đạt O(n+m) mà không cần sort. Con trỏ i và j
            quét một lần, ghép phần tử khi bằng nhau, di chuyển con trỏ phía có giá trị nhỏ hơn khi không bằng.
          </p>
          <p>
            <b>2) Nếu nums1 rất nhỏ so với nums2?</b> Build <code>Hash Map</code> từ <code>nums1</code> (mảng nhỏ) để tiết kiệm
            bộ nhớ, rồi duyệt <code>nums2</code> lớn. Độ phức tạp vẫn O(n+m) và space O(|nums1|).
          </p>
          <p>
            <b>3) Nếu nums2 ở trên đĩa và bộ nhớ hạn chế?</b> Xây bảng đếm (Counting hoặc Map) từ <code>nums1</code> trong RAM,
            sau đó đọc <code>nums2</code> theo <i>chunk</i>/stream từ đĩa; nếu còn count &gt; 0 thì ghép & giảm count.
          </p>
        </div>
      </details>
    </div>
  );
}
const btnPrimary: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "#111827",
  color: "white",
  cursor: "pointer",
};

const btnLight: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "#f3f4f6",
  cursor: "pointer",
};
