'use client'
// components/Nav.jsx
import { useState } from 'react'

export default function Nav({ t, lang, onLangChange, onNav, currentPage }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const services = [
    { id:'palm',        emoji:'🤚' },
    { id:'kundli',      emoji:'⭐' },
    { id:'tarot',       emoji:'🃏' },
    { id:'numerology',  emoji:'🔢' },
    { id:'face',        emoji:'👁' },
    { id:'dream',       emoji:'💭' },
  ]

  const LANGS = [
    { code:'en', label:'EN' },
    { code:'hi', label:'हि' },
    { code:'gu', label:'ગુ' },
    { code:'ta', label:'த' },
  ]

  return (
    <nav style={{
      position:'fixed',top:0,left:0,right:0,zIndex:1000,
      background:'rgba(250,247,242,0.95)',
      backdropFilter:'blur(12px)',
      borderBottom:'1px solid var(--border)',
      height:66,
      display:'flex',alignItems:'center',justifyContent:'space-between',
      padding:'0 28px',
      boxShadow:'0 2px 20px var(--shadow)',
    }}>

      {/* Logo */}
      <button onClick={()=>onNav('home')} style={{
        fontFamily:'var(--serif)',fontSize:24,fontWeight:700,
        color:'var(--saffron)',background:'none',border:'none',cursor:'pointer',
        letterSpacing:'-.01em',padding:0,
      }}>
        Vedic<span style={{color:'var(--terracotta)'}}>AI</span>
      </button>

      {/* Desktop links */}
      <div style={{display:'flex',gap:2,alignItems:'center'}} className="nav-links">
        {services.map(s => (
          <button key={s.id} onClick={()=>onNav(s.id)} style={{
            fontFamily:'var(--sans)',fontSize:14,fontWeight:500,
            color:currentPage===s.id?'var(--saffron)':'var(--ink3)',
            padding:'6px 10px',borderRadius:6,cursor:'pointer',
            transition:'all .18s',background:'none',border:'none',
            letterSpacing:'-.01em',
          }}
            onMouseOver={e=>e.currentTarget.style.color='var(--saffron)'}
            onMouseOut={e=>e.currentTarget.style.color=currentPage===s.id?'var(--saffron)':'var(--ink3)'}
          >
            {s.emoji} {t.nav[s.id]}
          </button>
        ))}
      </div>

      {/* Right: lang + CTA */}
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        {/* Language switcher */}
        <div style={{display:'flex',gap:4,background:'var(--bg2)',borderRadius:8,padding:3,border:'1px solid var(--border)'}}>
          {LANGS.map(l => (
            <button key={l.code} className={`lang-btn ${lang===l.code?'active':''}`}
              onClick={()=>onLangChange(l.code)}
              style={{minWidth:32,padding:'4px 8px',fontSize:13}}
            >
              {l.label}
            </button>
          ))}
        </div>

        <button onClick={()=>onNav('palm')} style={{
          fontFamily:'var(--sans)',fontSize:14,fontWeight:700,
          background:'var(--saffron)',color:'#fff',
          padding:'8px 18px',borderRadius:8,cursor:'pointer',border:'none',
          transition:'all .18s',boxShadow:'0 4px 16px rgba(212,98,26,.3)',
          letterSpacing:'.01em',
        }}
          onMouseOver={e=>{e.currentTarget.style.background='var(--terracotta)';e.currentTarget.style.transform='translateY(-1px)'}}
          onMouseOut={e=>{e.currentTarget.style.background='var(--saffron)';e.currentTarget.style.transform='none'}}
        >
          {t.nav.startFree}
        </button>

        {/* Mobile burger */}
        <button onClick={()=>setMenuOpen(!menuOpen)} style={{
          display:'none',background:'none',border:'none',cursor:'pointer',
          padding:6,color:'var(--ink)',fontSize:22,
        }} className="burger">☰</button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position:'absolute',top:66,left:0,right:0,
          background:'var(--bg)',borderBottom:'1px solid var(--border)',
          padding:'16px 20px',
          boxShadow:'0 8px 32px var(--shadow)',
          display:'flex',flexDirection:'column',gap:4,
        }}>
          {services.map(s => (
            <button key={s.id} onClick={()=>{onNav(s.id);setMenuOpen(false)}} style={{
              fontFamily:'var(--sans)',fontSize:16,fontWeight:500,
              color:'var(--ink3)',padding:'10px 12px',borderRadius:8,
              cursor:'pointer',transition:'all .18s',background:'none',border:'none',
              textAlign:'left',
            }}>
              {s.emoji} {t.nav[s.id]}
            </button>
          ))}
          <div style={{display:'flex',gap:6,marginTop:8,flexWrap:'wrap'}}>
            {LANGS.map(l => (
              <button key={l.code} className={`lang-btn ${lang===l.code?'active':''}`}
                onClick={()=>{onLangChange(l.code);setMenuOpen(false)}}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media(max-width:900px){.nav-links{display:none!important}}
        @media(max-width:900px){.burger{display:flex!important}}
      `}</style>
    </nav>
  )
}
