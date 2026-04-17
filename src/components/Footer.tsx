import Link from 'next/link';

const LINKS = {
  '工具分类': [
    { href: '/category/ai-chat',    label: 'AI 对话' },
    { href: '/category/ai-image',   label: 'AI 绘图' },
    { href: '/category/ai-code',    label: 'AI 编程' },
    { href: '/category/ai-writing', label: 'AI 写作' },
    { href: '/category/ai-video',   label: 'AI 视频' },
  ],
  '内容': [
    { href: '/compare',   label: '对比评测' },
    { href: '/tutorials', label: '使用教程' },
    { href: '/news',      label: 'AI 资讯' },
  ],
  '关于': [
    { href: '/about',    label: '关于我们' },
    { href: '/submit',   label: '提交工具' },
    { href: '/feedback', label: '意见反馈' },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      background: 'var(--bg-footer)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      marginTop: 'auto',
    }}>
      {/* Gradient divider */}
      <div className="divider" />

      <div className="container-content" style={{ padding: '3rem 1.25rem 2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '2rem',
        }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '0.875rem' }}>
              <span style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.875rem', fontWeight: 800, color: '#fff',
                fontFamily: 'var(--font-display)',
                boxShadow: '0 0 12px rgba(139,92,246,0.35)',
              }}>A</span>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.9375rem',
                color: '#f0f0ff',
              }}>AI导航</span>
            </Link>
            <p style={{
              fontSize: '0.8125rem',
              color: 'rgba(200,200,230,0.4)',
              lineHeight: 1.7,
              maxWidth: 200,
            }}>
              发现最好用的 AI 工具，提升你的工作效率。
            </p>
            {/* Social icons placeholder */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              {['GitHub', 'Twitter'].map(s => (
                <span key={s} style={{
                  width: 30, height: 30, borderRadius: 6,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.625rem',
                  color: 'rgba(200,200,230,0.4)',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}>{s[0]}</span>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <p style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(200,200,230,0.35)',
                marginBottom: '0.875rem',
                fontFamily: 'var(--font-display)',
              }}>{group}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {items.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="footer-link" style={{ fontSize: '0.8125rem' }}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          marginTop: '2.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <p style={{ fontSize: '0.75rem', color: 'rgba(200,200,230,0.3)', margin: 0 }}>
            © {year} AI导航 · 收录最优质的 AI 工具
          </p>
          <p style={{ fontSize: '0.75rem', color: 'rgba(200,200,230,0.25)', margin: 0 }}>
            数据持续更新中
          </p>
        </div>
      </div>
    </footer>
  );
}
