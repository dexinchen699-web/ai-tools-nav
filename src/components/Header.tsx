'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

const NAV_LINKS = [
  { href: '/tools',     label: 'AI 工具' },
  { href: '/compare',   label: '对比评测' },
  { href: '/tutorials', label: '教程' },
  { href: '/articles',  label: '文章' },
  { href: '/news',      label: '资讯' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchVal.trim();
    if (q) { router.push(`/tools?q=${encodeURIComponent(q)}`); setSearchVal(''); }
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: scrolled
          ? 'rgba(5,5,15,0.92)'
          : 'rgba(5,5,15,0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: scrolled
          ? '1px solid rgba(139,92,246,0.15)'
          : '1px solid rgba(255,255,255,0.05)',
        transition: 'background 0.3s, border-color 0.3s',
      }}
    >
      <div className="container-content">
        <div style={{ display: 'flex', alignItems: 'center', height: '3.5rem', gap: '1.5rem' }}>

          {/* Logo */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <span style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: 800,
              color: '#fff',
              fontFamily: 'var(--font-display)',
              boxShadow: '0 0 12px rgba(139,92,246,0.4)',
            }}>A</span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '1rem',
              color: '#f0f0ff',
              letterSpacing: '-0.01em',
            }}>
              AI导航
            </span>
          </Link>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            style={{ flex: 1, maxWidth: 320, position: 'relative', display: 'flex', alignItems: 'center' }}
          >
            <svg
              style={{ position: 'absolute', left: '0.625rem', color: 'rgba(200,200,230,0.35)', pointerEvents: 'none' }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              ref={searchRef}
              className="search-input"
              type="search"
              placeholder="搜索 AI 工具…"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
            />
          </form>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}
               className="hidden-mobile">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: 6,
                  fontSize: '0.8125rem',
                  fontWeight: isActive(href) ? 600 : 400,
                  color: isActive(href) ? '#f0f0ff' : 'rgba(200,200,230,0.55)',
                  background: isActive(href) ? 'rgba(139,92,246,0.15)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'color 0.15s, background 0.15s',
                  fontFamily: 'var(--font-body)',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  if (!isActive(href)) {
                    (e.currentTarget as HTMLElement).style.color = '#f0f0ff';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive(href)) {
                    (e.currentTarget as HTMLElement).style.color = 'rgba(200,200,230,0.55)';
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }
                }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Submit CTA */}
          <Link href="/submit" className="btn-primary hidden-mobile" style={{ fontSize: '0.75rem', padding: '0.375rem 0.875rem' }}>
            提交工具
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="show-mobile"
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.375rem',
              color: 'rgba(200,200,230,0.7)',
              display: 'none',
            }}
            aria-label="菜单"
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: 'rgba(5,5,15,0.97)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '0.75rem 1.25rem 1rem',
        }}>
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: 'block',
                padding: '0.625rem 0.5rem',
                fontSize: '0.9375rem',
                color: isActive(href) ? '#f0f0ff' : 'rgba(200,200,230,0.6)',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                fontWeight: isActive(href) ? 600 : 400,
              }}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/submit"
            className="btn-primary"
            style={{ marginTop: '0.75rem', width: '100%', justifyContent: 'center' }}
          >
            提交工具
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile   { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
}
