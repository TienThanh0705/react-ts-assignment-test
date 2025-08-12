
import React, { useCallback, useMemo, useRef, useState } from "react";

export function SectionReview() {
  const tips = useMemo(
    () => [
      "Thêm try/catch + hiển thị lỗi; đảm bảo không kẹt trạng thái loading.",
      "Dùng AbortController để huỷ request khi unmount (tránh race condition/memory leak).",
      "Thêm key khi .map, alt cho <img>, aria-label cho input (accessibility).",
      "Tối ưu lọc bằng useMemo; debounce input nếu danh sách lớn.",
      "Tách thẻ Card thành component nhỏ; tránh inline style lặp lại.",
      "Có empty state/skeleton; phân tách Loading/Error/Empty/Success rõ ràng.",
      "Format tiền tệ nhất quán.",
      "Cân nhắc virtualization (react-window/react-virtualized) khi list rất lớn.",
    ],
    []
  );

  const findings = useMemo(
    () => [
      {
        issue: "Không xử lý lỗi khi fetch; có thể kẹt 'Loading...' nếu API hỏng.",
        why: "Trải nghiệm người dùng kém; khó debug; không có đường lui.",
        fix: "Bọc try/catch; setError; finally setLoading(false); hiển thị thông báo thân thiện.",
      },
      {
        issue: "Không huỷ request khi unmount.",
        why: "Gây memory leak hoặc setState trên component đã unmount.",
        fix: "Dùng AbortController; abort trong cleanup của useEffect.",
      },
      {
        issue: "Thiếu 'key' khi .map; thiếu 'alt' cho <img>.",
        why: "React cần key để tối ưu diff; alt giúp accessibility/SEO.",
        fix: "Dùng 'product.id' làm key; thêm alt={product.name}.",
      },
      {
        issue: "Inline style lặp lại tại Card; tên class rời rạc.",
        why: "Khó tái sử dụng & test; khó maintain.",
        fix: "Tách thành <ProductCard/> hoặc dùng className thống nhất.",
      },
      {
        issue: "Lọc mỗi render; không debounce; thiếu tối ưu cho list lớn.",
        why: "Hiệu năng giảm khi dữ liệu lớn.",
        fix: "useMemo cho filtered; debounce input; cân nhắc virtualization.",
      },
      {
        issue: "Hiển thị giá tiền thô (string template '$' + price).",
        why: "Không theo locale; làm tròn/định dạng không nhất quán.",
        fix: "Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price).",
      },
      {
        issue: "UX trạng thái chưa rõ (Loading/Empty/Error).",
        why: "Người dùng không hiểu chuyện gì xảy ra.",
        fix: "Tách rõ 4 trạng thái; có empty-state/skeleton.",
      },
    ],
    []
  );

  const [open, setOpen] = useState(true);

  const codeSample = useMemo(
    () =>
      String.raw`import React, { useEffect, useMemo, useRef, useState } from 'react';

type Product = { id: string; name: string; price: number; image: string };
function ProductCard({ p }: { p: Product }) {
  return (
    <article className="card" style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
      <h3 style={{ marginBottom: 8 }}>{p.name}</h3>
      <p style={{ margin: '4px 0 8px' }}>
        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p.price)}
      </p>
      <img
        src={p.image}
        alt={p.name}
        width={120}
        height={120}
        style={{ objectFit: 'cover', borderRadius: 6 }}
        loading="lazy"
      />
    </article>
  );
}

export function ProductListBetter() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [debouncedFilter, setDebouncedFilter] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedFilter(filter), 300);
    return () => clearTimeout(t);
  }, [filter]);

  useEffect(() => {
    const c = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/products', { signal: c.signal });
        if (!res.ok) throw new Error('HTTP ' + res.status);

        const data = (await res.json()) as Product[];
        setProducts(data ?? []);
      } catch (e: any) {
        // Bỏ qua AbortError do unmount
        if (e?.name !== 'AbortError') setError(e?.message ?? 'Unknown error');
      } finally {
        setLoading(false);
      }
    })();

    return () => c.abort();
  }, []); 

  const filtered = useMemo(() => {
    const q = debouncedFilter.trim().toLowerCase();
    return q ? products.filter(p => p.name.toLowerCase().includes(q)) : products;
  }, [products, debouncedFilter]);

  if (loading) {
    return <div style={{ padding: 12 }}>Loading products…</div>;
  }

  if (error) {
    return (
      <div role="alert" style={{ padding: 12, color: '#b42318' }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
          style={{ width: 280, padding: '6px 10px' }}
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: 12, color: '#555' }}>
          No products found. Try another keyword.
        </div>
      ) : (
        <div
          className="grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 12,
          }}
        >
          {filtered.map(p => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
`,
    []
  );

  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codeSample);
      setCopied(true);
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }, [codeSample]);

  return (
    <div className="card" style={{
      border: "1px solid #e5e7eb",
      padding: 16,
      borderRadius: 12,
      maxHeight: 600,         
      overflowY: "auto"        
    }}>
      <h2 style={{ marginBottom: 8 }}>Section 4 – Code Review</h2>

      <button onClick={() => setOpen((v) => !v)} style={{ marginBottom: 8 }}>
        {open ? "Ẩn gợi ý nhanh" : "Hiện gợi ý nhanh"}
      </button>

      {open && (
        <ol style={{ paddingLeft: 18, marginBottom: 16 }}>
          {tips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ol>
      )}

      <h3 style={{ marginTop: 8 }}>Phản hồi chi tiết & giải thích</h3>
      <ul style={{ paddingLeft: 18, marginBottom: 16 }}>
        {findings.map((f, i) => (
          <li key={i} style={{ marginBottom: 10 }}>
            <div><b>Vấn đề:</b> {f.issue}</div>
            <div><b>Vì sao:</b> {f.why}</div>
            <div><b>Cách khắc phục:</b> {f.fix}</div>
          </li>
        ))}
      </ul>

      <details>
        <summary>Mẫu Update </summary>

        <div
          className="row"
          style={{ justifyContent: "space-between", alignItems: "center", margin: "8px 0" }}
        >
          <span className="badge" style={{ fontSize: 12, background: "#eef2ff", padding: "4px 8px", borderRadius: 8 }}>
            Refactor snippet
          </span>
          <button onClick={handleCopy}>{copied ? "Copied!" : "Copy"}</button>
        </div>

        <pre style={{ whiteSpace: "pre-wrap" }}>{codeSample}</pre>
      </details>

     
    </div>
  );
}
