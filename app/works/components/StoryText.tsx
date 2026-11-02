// app/works/components/StoryText.tsx — จัดหน้าเรื่องเล่าของผลงานจากข้อความธรรมดา (ไม่ใช่ HTML/Markdown)
// รูปแบบที่ทีมพิมพ์ใน stopdrinknetwork: "■ หัวข้อ" · "ขั้นที่ N ..." · "- รายการ" · "1) หัวข้อย่อย" · เว้นบรรทัด = ย่อหน้าใหม่
// แสดงเป็นข้อความ React ล้วน — ไม่มี dangerouslySetInnerHTML

type Block =
  | { t: 'h'; text: string }
  | { t: 'sub'; text: string }
  | { t: 'ul'; items: string[] }
  | { t: 'p'; text: string };

function parse(raw: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ t: 'p', text: para.join(' ') });
    para = [];
  };
  for (const line of raw.replace(/\r\n/g, '\n').split('\n')) {
    const s = line.trim();
    if (!s) { flush(); continue; }
    if (/^■\s*/.test(s)) { flush(); blocks.push({ t: 'h', text: s.replace(/^■\s*/, '') }); continue; }
    if (/^ขั้นที่\s*\d+/.test(s)) { flush(); blocks.push({ t: 'h', text: s }); continue; }
    if (/^\d+\)\s+/.test(s)) { flush(); blocks.push({ t: 'sub', text: s }); continue; }
    if (/^[-•·]\s+/.test(s)) {
      flush();
      const item = s.replace(/^[-•·]\s+/, '');
      const last = blocks[blocks.length - 1];
      if (last?.t === 'ul') last.items.push(item);
      else blocks.push({ t: 'ul', items: [item] });
      continue;
    }
    para.push(s);
  }
  flush();
  return blocks;
}

export default function StoryText({ text, lead = false }: { text: string; lead?: boolean }) {
  const blocks = parse(text);
  return (
    <div className="space-y-4">
      {blocks.map((b, i) => {
        if (b.t === 'h') return <h3 key={i} className="pt-3 text-lg font-bold text-gray-900">{b.text}</h3>;
        if (b.t === 'sub') return <p key={i} className="pt-1 font-semibold text-gray-900">{b.text}</p>;
        if (b.t === 'ul')
          return (
            <ul key={i} className="space-y-2 pl-5 list-disc marker:text-yellow-500">
              {b.items.map((it, j) => <li key={j} className="leading-relaxed text-gray-700">{it}</li>)}
            </ul>
          );
        // ย่อหน้าแรกของบทนำเป็นคำโปรย — ตัวใหญ่ขึ้น
        const first = lead && i === 0;
        return (
          <p key={i} className={first ? 'text-xl sm:text-2xl font-semibold leading-relaxed text-gray-900' : 'leading-[1.9] text-gray-700'}>
            {b.text}
          </p>
        );
      })}
    </div>
  );
}
