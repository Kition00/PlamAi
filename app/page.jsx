'use client'
import { useState, useCallback } from 'react'
import Nav from '@/components/Nav'
import PaymentModal from '@/components/PaymentModal'
import { translations, DEFAULT_LANG } from '@/lib/i18n/translations'

// ── Tarot deck ────────────────────────────────────────────────
const TAROT_CARDS = [
  'The Fool','The Magician','The High Priestess','The Empress','The Emperor',
  'The Hierophant','The Lovers','The Chariot','Strength','The Hermit',
  'Wheel of Fortune','Justice','The Hanged Man','Death','Temperance',
  'The Devil','The Tower','The Star','The Moon','The Sun','Judgement',
  'The World','Ace of Wands','Two of Wands','Three of Wands','Ace of Cups',
  'Two of Cups','Three of Cups','Ace of Swords','Two of Swords',
]

function compressImage(file, maxSize = 800) {
  return new Promise((res, rej) => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        let w = img.naturalWidth, h = img.naturalHeight
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = Math.round(h * maxSize / w); w = maxSize }
          else { w = Math.round(w * maxSize / h); h = maxSize }
        }
        const c = document.createElement('canvas'); c.width = w; c.height = h
        c.getContext('2d').drawImage(img, 0, 0, w, h)
        res(c.toDataURL('image/jpeg', 0.82).split(',')[1])
      }
      img.onerror = rej
      img.src = e.target.result
    }
    reader.onerror = rej
    reader.readAsDataURL(file)
  })
}

export default function VedicAIApp() {
  const [lang, setLang] = useState(DEFAULT_LANG)
  const t = translations[lang] || translations[DEFAULT_LANG]

  const [page, setPage] = useState('home')
  const [payModal, setPayModal] = useState(null)
  const [unlockedReports, setUnlockedReports] = useState({})

  // Per-service state
  const [svcState, setSvcState] = useState({
    palm:        { step:'upload', imageBase64:null, previewUrl:null, loading:false, result:null, error:null, loadMsg:'' },
    kundli:      { step:'form', loading:false, result:null, error:null },
    tarot:       { step:'setup', spread:1, drawnCards:[], deck:[], loading:false, result:null, error:null },
    numerology:  { step:'form', loading:false, result:null, error:null },
    face:        { step:'upload', imageBase64:null, previewUrl:null, loading:false, result:null, error:null, loadMsg:'' },
    dream:       { step:'form', emotion:null, recurring:false, loading:false, result:null, error:null },
  })
  const [kundliForm, setKundliForm] = useState({ name:'', dob:'', tob:'', pob:'', gender:'Male' })
  const [numForm, setNumForm]       = useState({ name:'', dob:'' })
  const [dreamForm, setDreamForm]   = useState({ text:'' })

  const upd = useCallback((svc, changes) => {
    setSvcState(prev => ({ ...prev, [svc]: { ...prev[svc], ...changes } }))
  }, [])

  // ── Image upload ──────────────────────────────────────────────
  async function handleImageUpload(file, svc) {
    if (!file?.type?.startsWith('image/')) return
    const base64 = await compressImage(file)
    const url = URL.createObjectURL(file)
    upd(svc, { imageBase64: base64, previewUrl: url, step: 'preview' })
  }

  // ── Call AI API ────────────────────────────────────────────────
  async function analyze(svc, body) {
    upd(svc, { loading: true, step: 'loading', error: null })
    const msgs = t.loading[svc] || ['Loading...']
    let mi = 0
    upd(svc, { loadMsg: msgs[0] })
    const iv = setInterval(() => { mi = (mi + 1) % msgs.length; upd(svc, { loadMsg: msgs[mi] }) }, 1600)
    try {
      const res = await fetch(`/api/analyze/${svc}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, lang }),
      })
      const data = await res.json()
      clearInterval(iv)
      if (data.error) { upd(svc, { loading:false, step:'error', error: data.error }); return }
      upd(svc, { loading:false, result: data.result, step:'result' })
    } catch (err) {
      clearInterval(iv)
      upd(svc, { loading:false, step:'error', error: err.message })
    }
  }

  function reset(svc) {
    setSvcState(prev => ({
      ...prev,
      [svc]: {
        step: ['palm','face'].includes(svc) ? 'upload' : ['tarot'].includes(svc) ? 'setup' : 'form',
        imageBase64:null, previewUrl:null, loading:false, result:null, error:null, loadMsg:'',
        spread:1, drawnCards:[], deck:[],
      }
    }))
    setUnlockedReports(prev => ({ ...prev, [svc]: false }))
  }

  function openPayModal(svc, result, name) {
    setPayModal({ svc, result, name })
  }
  function onPaySuccess(svc) {
    setUnlockedReports(prev => ({ ...prev, [svc]: true }))
    setPayModal(null)
  }

  // ── Loading screen ────────────────────────────────────────────
  function LoadingScreen({ svc, emoji }) {
    const s = svcState[svc]
    return (
      <div style={{textAlign:'center',padding:'60px 0'}}>
        <div className="ring-wrap"><div className="r1"/><div className="r2"/><div className="r3"/><span>{emoji}</span></div>
        <div style={{fontFamily:'var(--serif)',fontSize:22,fontWeight:700,color:'var(--saffron)',marginBottom:10}}>{s.loadMsg}</div>
        <div style={{fontSize:15,color:'var(--muted)',maxWidth:300,margin:'0 auto',lineHeight:1.75,fontStyle:'italic'}}>
          "The cosmos is aligning your reading..."
        </div>
      </div>
    )
  }

  // ── Result / Gate ──────────────────────────────────────────────
  function ResultGate({ svc, summaryItems, badgeText, title }) {
    const s = svcState[svc]
    const unlocked = unlockedReports[svc]
    const name = kundliForm.name || numForm.name || ''
    return (
      <div style={{textAlign:'center'}}>
        <div className="result-badge">✦ {badgeText}</div>
        <h2 style={{fontFamily:'var(--serif)',fontSize:26,fontWeight:700,color:'var(--ink)',marginBottom:6}}>{title}</h2>
        <div className="result-grid" style={{marginBottom:16}}>
          {summaryItems.map((item, i) => (
            <div key={i} className="result-card">
              <div className="rc-label">{item.label}</div>
              <div className="rc-text">{item.text}</div>
            </div>
          ))}
        </div>
        {!unlocked ? (
          <div className="gate-wrap">
            <div className="gate-blur">
              {s.result?.detailed_report?.slice(0, 220) || ''}...
            </div>
            <div className="gate-footer">
              <p className="gate-title">{t.results.unlockBtn}</p>
              {t.results.features.map((f,i) => (
                <div key={i} className="gate-feat"><span className="gate-feat-dot"/>{f}</div>
              ))}
              <button className="btn-primary" style={{marginTop:18}} onClick={()=>openPayModal(svc, s.result, name)}>
                🔓 {t.results.unlockBtn}
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            background:'var(--card-bg)', border:'1px solid var(--border)', borderRadius:14,
            padding:24, marginBottom:18, textAlign:'left', maxHeight:420, overflowY:'auto',
            boxShadow:'0 2px 12px var(--shadow)', lineHeight:1.9,
          }}>
            <div style={{fontSize:11,fontWeight:700,color:'var(--saffron)',letterSpacing:'.12em',textTransform:'uppercase',marginBottom:14}}>
              ✦ Full Report Unlocked
            </div>
            {(s.result?.detailed_report || '').split('\n\n').map((p, i) => (
              <p key={i} style={{fontSize:16,color:'var(--ink3)',marginBottom:14}}>{p}</p>
            ))}
          </div>
        )}
        <button className="btn-secondary" style={{marginTop:10}} onClick={()=>reset(svc)}>
          {t.form.newReading}
        </button>
      </div>
    )
  }

  // ── PAGE HERO ──────────────────────────────────────────────────
  function PageHero({ svc, accentColor = 'var(--saffron)' }) {
    const svcData = t.services[svc]
    return (
      <div style={{
        padding:'72px 28px 56px', textAlign:'center',
        borderBottom:'1px solid var(--border)',
        background:`linear-gradient(160deg,var(--bg2) 0%,var(--bg) 60%)`,
        position:'relative',overflow:'hidden',
      }}>
        <div style={{position:'absolute',right:-30,top:'50%',transform:'translateY(-50%)',fontFamily:'serif',fontSize:280,color:'rgba(212,98,26,.04)',lineHeight:1,pointerEvents:'none',userSelect:'none',fontWeight:700}}>OM</div>
        <p style={{fontSize:13,fontWeight:700,color:accentColor,letterSpacing:'.14em',textTransform:'uppercase',marginBottom:10}}>{svcData?.skt}</p>
        <h1 style={{fontFamily:'var(--serif)',fontSize:'clamp(36px,6vw,68px)',fontWeight:700,color:'var(--ink)',marginBottom:14,letterSpacing:'-.02em',lineHeight:1.1}}>{svcData?.name}</h1>
        <p style={{fontSize:18,color:'var(--muted)',maxWidth:520,margin:'0 auto',lineHeight:1.75}}>{svcData?.desc}</p>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════
  //  SERVICE PAGES
  // ═══════════════════════════════════════════════════

  // ── PALM ──────────────────────────────────────────
  function PalmPage() {
    const s = svcState.palm
    return (
      <div className="page-content">
        <PageHero svc="palm"/>
        <div style={{maxWidth:640,margin:'0 auto',padding:'52px 28px'}}>
          {s.step === 'upload' && (
            <>
              <label style={{cursor:'pointer'}}>
                <div className="upload-zone">
                  <div style={{fontSize:60,marginBottom:16,animation:'floatY 3s ease-in-out infinite'}}>🤚</div>
                  <p style={{fontFamily:'var(--serif)',fontSize:26,fontWeight:700,color:'var(--ink)',marginBottom:8}}>{t.form.uploadPalm}</p>
                  <p style={{fontSize:16,color:'var(--muted)',marginBottom:22}}>JPG · PNG · WEBP</p>
                  <div className="btn-primary" style={{pointerEvents:'none'}}>{t.form.choosePhoto}</div>
                </div>
                <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleImageUpload(e.target.files[0],'palm')}/>
              </label>
              <div className="card" style={{marginTop:20}}>
                <p style={{fontSize:16,fontWeight:700,color:'var(--ink)',marginBottom:10}}>{t.form.tipTitle}</p>
                <p style={{fontSize:16,color:'var(--muted)',lineHeight:1.85,whiteSpace:'pre-line'}}>{t.form.palmTips}</p>
              </div>
            </>
          )}
          {s.step === 'preview' && (
            <div style={{textAlign:'center'}}>
              <p style={{fontFamily:'var(--serif)',fontSize:24,fontWeight:700,color:'var(--ink)',marginBottom:16}}>Your Palm Awaits</p>
              <img src={s.previewUrl} alt="palm" style={{width:'100%',maxWidth:340,borderRadius:14,border:'2px solid var(--border)',display:'block',margin:'0 auto 16px',boxShadow:'0 8px 32px var(--shadow)'}}/>
              <div style={{display:'flex',gap:12,justifyContent:'center'}}>
                <button className="btn-secondary" onClick={()=>reset('palm')}>{t.form.retake}</button>
                <button className="btn-primary" onClick={()=>analyze('palm',{imageBase64:s.imageBase64})}>{t.form.beginReading}</button>
              </div>
            </div>
          )}
          {s.step === 'loading' && <LoadingScreen svc="palm" emoji="🤚"/>}
          {s.step === 'result' && s.result && (
            <ResultGate svc="palm"
              badgeText={`${s.result.dominant_trait} · ${s.result.lucky_element}`}
              title="Your Sacred Palm Reading"
              summaryItems={[
                {label:t.results.life, text:s.result.summary?.life||''},
                {label:t.results.finance, text:s.result.summary?.finance||''},
                {label:t.results.love, text:s.result.summary?.relationships||''},
              ]}
            />
          )}
          {s.step === 'error' && (
            <div style={{textAlign:'center',padding:'32px 0'}}>
              <div className="status-error" style={{marginBottom:20}}>{s.error}</div>
              <button className="btn-secondary" onClick={()=>reset('palm')}>{t.form.retake}</button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── KUNDLI ────────────────────────────────────────
  function KundliPage() {
    const s = svcState.kundli
    return (
      <div className="page-content">
        <PageHero svc="kundli" accentColor="#B89A2A"/>
        <div style={{maxWidth:560,margin:'0 auto',padding:'52px 28px'}}>
          {s.step === 'form' && (
            <>
              <div className="f-group"><label className="f-label">{t.form.name}</label><input className="f-input" placeholder={t.form.namePlaceholder} value={kundliForm.name} onChange={e=>setKundliForm(p=>({...p,name:e.target.value}))}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <div className="f-group"><label className="f-label">{t.form.dob}</label><input type="date" className="f-input" value={kundliForm.dob} onChange={e=>setKundliForm(p=>({...p,dob:e.target.value}))}/></div>
                <div className="f-group"><label className="f-label">{t.form.tob}</label><input type="time" className="f-input" value={kundliForm.tob} onChange={e=>setKundliForm(p=>({...p,tob:e.target.value}))}/></div>
              </div>
              <div className="f-group"><label className="f-label">{t.form.pob}</label><input className="f-input" placeholder={t.form.pobPlaceholder} value={kundliForm.pob} onChange={e=>setKundliForm(p=>({...p,pob:e.target.value}))}/></div>
              <div className="f-group">
                <label className="f-label">{t.form.gender}</label>
                <div style={{display:'flex',gap:10}}>
                  {[t.form.male,t.form.female,t.form.other].map((g,i) => (
                    <button key={g} onClick={()=>setKundliForm(p=>({...p,gender:g}))} style={{
                      flex:1,padding:12,borderRadius:10,cursor:'pointer',
                      fontFamily:'var(--sans)',fontSize:15,fontWeight:600,
                      background:kundliForm.gender===g?'rgba(212,98,26,.08)':'var(--card-bg)',
                      border:`2px solid ${kundliForm.gender===g?'rgba(212,98,26,.3)':'var(--border)'}`,
                      color:kundliForm.gender===g?'var(--saffron)':'var(--muted)',
                      transition:'all .18s',
                    }}>{g}</button>
                  ))}
                </div>
              </div>
              <button className="btn-primary" style={{width:'100%',justifyContent:'center',fontSize:17,padding:16}}
                onClick={()=>analyze('kundli',{...kundliForm})}
                disabled={!kundliForm.dob||!kundliForm.pob}>
                {t.form.generateKundli}
              </button>
            </>
          )}
          {s.step === 'loading' && <LoadingScreen svc="kundli" emoji="⭐"/>}
          {s.step === 'result' && s.result && (
            <ResultGate svc="kundli"
              badgeText={`${s.result.rashi||''} · ${s.result.nakshatra||''}`}
              title="Your Vedic Birth Chart"
              summaryItems={[
                {label:t.results.career, text:s.result.summary?.career||''},
                {label:t.results.relationships, text:s.result.summary?.relationships||''},
                {label:t.results.health, text:s.result.summary?.health||''},
              ]}
            />
          )}
          {s.step === 'error' && <div className="status-error">{s.error}</div>}
        </div>
      </div>
    )
  }

  // ── TAROT ─────────────────────────────────────────
  function TarotPage() {
    const s = svcState.tarot
    function startDraw() {
      const shuffled = [...TAROT_CARDS].sort(()=>Math.random()-.5).slice(0,14)
      upd('tarot',{step:'draw',deck:shuffled,drawnCards:[]})
    }
    function drawCard(card) {
      if (s.drawnCards.length >= s.spread) return
      const newDrawn = [...s.drawnCards, card]
      upd('tarot',{drawnCards:newDrawn})
      if (newDrawn.length >= s.spread) {
        setTimeout(()=>analyze('tarot',{cards:newDrawn,spread:s.spread,question:''}),500)
      }
    }
    const positions = ['Past','Present','Future','Above','Below']
    return (
      <div className="page-content">
        <PageHero svc="tarot" accentColor="var(--plum)"/>
        <div style={{maxWidth:680,margin:'0 auto',padding:'52px 28px'}}>
          {s.step==='setup' && (
            <>
              <p style={{fontFamily:'var(--serif)',fontSize:22,fontWeight:700,color:'var(--ink)',marginBottom:16,textAlign:'center'}}>Choose Your Spread</p>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:28}}>
                {[1,3,5].map(n=>(
                  <button key={n} className={`spread-btn ${s.spread===n?'active':''}`} onClick={()=>upd('tarot',{spread:n})}>
                    <p style={{fontWeight:700,fontSize:16,color:'var(--ink)',marginBottom:4}}>{n===1?t.form.spreadSingle:n===3?t.form.spreadThree:t.form.spreadCeltic}</p>
                    <p style={{fontSize:14,color:'var(--muted)'}}>{n} card{n>1?'s':''}</p>
                  </button>
                ))}
              </div>
              <button className="btn-primary" style={{width:'100%',justifyContent:'center',fontSize:17,padding:16}} onClick={startDraw}>{t.form.shuffleDeck}</button>
            </>
          )}
          {s.step==='draw' && (
            <div style={{textAlign:'center'}}>
              <p style={{fontFamily:'var(--serif)',fontSize:22,fontWeight:700,color:'var(--ink)',marginBottom:8}}>
                {s.drawnCards.length < s.spread ? `Draw ${s.spread - s.drawnCards.length} more card${s.spread-s.drawnCards.length!==1?'s':''}` : 'Cards drawn! ✓'}
              </p>
              <p style={{fontSize:16,color:'var(--muted)',marginBottom:22}}>Focus your intention, then tap a card</p>
              {s.drawnCards.length > 0 && (
                <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap',marginBottom:24}}>
                  {s.drawnCards.map((c,i)=>(
                    <div key={i} className="tarot-drawn-card">
                      <div style={{fontSize:24,marginBottom:5}}>🃏</div>
                      <p style={{fontSize:12,fontWeight:700,color:'var(--plum)',lineHeight:1.3}}>{c}</p>
                      <p style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{positions[i]||''}</p>
                    </div>
                  ))}
                </div>
              )}
              <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center'}}>
                {s.deck.map((card,i)=>(
                  <button key={i} className={`tarot-card-item ${s.drawnCards.includes(card)?'drawn':''}`}
                    onClick={()=>drawCard(card)}>✦</button>
                ))}
              </div>
            </div>
          )}
          {s.step==='loading' && <LoadingScreen svc="tarot" emoji="🃏"/>}
          {s.step==='result' && s.result && (
            <ResultGate svc="tarot"
              badgeText={s.result.overall_energy||'Cosmic Reading'}
              title="Your Tarot Reading"
              summaryItems={[
                {label:t.results.past, text:s.result.summary?.past||''},
                {label:t.results.present, text:s.result.summary?.present||''},
                {label:t.results.future, text:s.result.summary?.future||''},
              ]}
            />
          )}
          {s.step==='error' && <div className="status-error">{s.error}</div>}
        </div>
      </div>
    )
  }

  // ── NUMEROLOGY ────────────────────────────────────
  function NumerologyPage() {
    const s = svcState.numerology
    return (
      <div className="page-content">
        <PageHero svc="numerology" accentColor="var(--sage)"/>
        <div style={{maxWidth:520,margin:'0 auto',padding:'52px 28px'}}>
          {s.step==='form' && (
            <>
              <div className="f-group"><label className="f-label">{t.form.name}</label><input className="f-input" placeholder={t.form.namePlaceholder} value={numForm.name} onChange={e=>setNumForm(p=>({...p,name:e.target.value}))}/></div>
              <div className="f-group"><label className="f-label">{t.form.dob}</label><input type="date" className="f-input" value={numForm.dob} onChange={e=>setNumForm(p=>({...p,dob:e.target.value}))}/></div>
              <button className="btn-primary" style={{width:'100%',justifyContent:'center',fontSize:17,padding:16}}
                onClick={()=>analyze('numerology',{...numForm})}
                disabled={!numForm.name||!numForm.dob}>
                {t.form.calculateNumbers}
              </button>
            </>
          )}
          {s.step==='loading' && <LoadingScreen svc="numerology" emoji="🔢"/>}
          {s.step==='result' && s.result && (
            <>
              <div style={{textAlign:'center',marginBottom:20}}>
                <div className="result-badge">✦ Life Path {s.result.life_path_number}</div>
                <h2 style={{fontFamily:'var(--serif)',fontSize:26,fontWeight:700,color:'var(--ink)',marginBottom:16}}>Your Numerology</h2>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:18}}>
                  {[
                    {v:s.result.life_path_number, l:'Life Path', c:'var(--sage)'},
                    {v:s.result.destiny_number, l:'Destiny', c:'var(--saffron)'},
                    {v:s.result.soul_urge_number, l:'Soul Urge', c:'var(--plum)'},
                    {v:s.result.personality_number, l:'Personality', c:'var(--teal)'},
                    {v:s.result.birth_day_number, l:'Birth Day', c:'var(--terracotta)'},
                    {v:s.result.lucky_numbers?.join('·'), l:'Lucky', c:'var(--saffron)'},
                  ].map((n,i)=>(
                    <div key={i} className="num-box">
                      <div className="num-val" style={{color:n.c}}>{n.v}</div>
                      <div className="num-label">{n.l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <ResultGate svc="numerology"
                badgeText={`Life Path ${s.result.life_path_number}`}
                title=""
                summaryItems={[
                  {label:t.results.purpose, text:s.result.summary?.purpose||''},
                  {label:t.results.strengths, text:s.result.summary?.strengths||''},
                  {label:t.results.challenges, text:s.result.summary?.challenges||''},
                ]}
              />
            </>
          )}
          {s.step==='error' && <div className="status-error">{s.error}</div>}
        </div>
      </div>
    )
  }

  // ── FACE ──────────────────────────────────────────
  function FacePage() {
    const s = svcState.face
    return (
      <div className="page-content">
        <PageHero svc="face" accentColor="var(--teal)"/>
        <div style={{maxWidth:640,margin:'0 auto',padding:'52px 28px'}}>
          {s.step==='upload' && (
            <>
              <label style={{cursor:'pointer'}}>
                <div className="upload-zone">
                  <div style={{fontSize:60,marginBottom:16,animation:'floatY 3.5s ease-in-out infinite'}}>👁</div>
                  <p style={{fontFamily:'var(--serif)',fontSize:26,fontWeight:700,color:'var(--ink)',marginBottom:8}}>{t.form.uploadFace}</p>
                  <p style={{fontSize:16,color:'var(--muted)',marginBottom:22}}>JPG · PNG · WEBP</p>
                  <div className="btn-primary" style={{pointerEvents:'none'}}>{t.form.choosePhoto}</div>
                </div>
                <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleImageUpload(e.target.files[0],'face')}/>
              </label>
              <div className="card" style={{marginTop:20}}>
                <p style={{fontSize:16,fontWeight:700,color:'var(--ink)',marginBottom:10}}>{t.form.tipTitle}</p>
                <p style={{fontSize:16,color:'var(--muted)',lineHeight:1.85,whiteSpace:'pre-line'}}>{t.form.faceTips}</p>
              </div>
            </>
          )}
          {s.step==='preview' && (
            <div style={{textAlign:'center'}}>
              <img src={s.previewUrl} alt="face" style={{width:'100%',maxWidth:280,borderRadius:16,border:'2px solid var(--border)',display:'block',margin:'0 auto 16px',boxShadow:'0 8px 32px var(--shadow)'}}/>
              <div style={{display:'flex',gap:12,justifyContent:'center'}}>
                <button className="btn-secondary" onClick={()=>reset('face')}>{t.form.retake}</button>
                <button className="btn-primary" onClick={()=>analyze('face',{imageBase64:s.imageBase64})}>👁 {t.form.beginReading}</button>
              </div>
            </div>
          )}
          {s.step==='loading' && <LoadingScreen svc="face" emoji="👁"/>}
          {s.step==='result' && s.result && (
            <ResultGate svc="face"
              badgeText={`${s.result.dominant_trait} · ${s.result.element}`}
              title="Your Samudrika Shastra Reading"
              summaryItems={[
                {label:t.results.personality, text:s.result.summary?.personality||''},
                {label:t.results.career, text:s.result.summary?.career||''},
                {label:t.results.relationships, text:s.result.summary?.relationships||''},
              ]}
            />
          )}
          {s.step==='error' && <div className="status-error">{s.error}</div>}
        </div>
      </div>
    )
  }

  // ── DREAM ─────────────────────────────────────────
  function DreamPage() {
    const s = svcState.dream
    return (
      <div className="page-content">
        <PageHero svc="dream" accentColor="var(--rose)"/>
        <div style={{maxWidth:620,margin:'0 auto',padding:'52px 28px'}}>
          {s.step==='form' && (
            <>
              <div className="f-group">
                <label className="f-label">{t.form.dreamHint}</label>
                <textarea className="f-input" rows={6} placeholder={t.form.dreamPlaceholder} value={dreamForm.text} onChange={e=>setDreamForm(p=>({...p,text:e.target.value}))} style={{resize:'vertical',lineHeight:1.75}}/>
              </div>
              <div className="f-group">
                <label className="f-label">{t.form.feelLabel}</label>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {t.form.emotions.map(emo=>(
                    <button key={emo} className={`emo-btn ${s.emotion===emo?'active':''}`} onClick={()=>upd('dream',{emotion:emo})}>{emo}</button>
                  ))}
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:28}}>
                <div className={`toggle ${s.recurring?'on':''}`} onClick={()=>upd('dream',{recurring:!s.recurring})}>
                  <div className="toggle-knob"/>
                </div>
                <span style={{fontSize:16,fontWeight:500,color:'var(--ink3)'}}>{t.form.recurring}</span>
              </div>
              <button className="btn-primary" style={{width:'100%',justifyContent:'center',fontSize:17,padding:16}}
                onClick={()=>analyze('dream',{dreamText:dreamForm.text,emotion:s.emotion,recurring:s.recurring})}
                disabled={!dreamForm.text.trim()}>
                {t.form.interpretDream}
              </button>
            </>
          )}
          {s.step==='loading' && <LoadingScreen svc="dream" emoji="💭"/>}
          {s.step==='result' && s.result && (
            <>
              <div style={{textAlign:'center',marginBottom:20}}>
                <div style={{background:'rgba(138,58,90,.07)',border:'1px solid rgba(138,58,90,.18)',borderRadius:14,padding:'18px 24px',marginBottom:18}}>
                  <p style={{fontSize:13,fontWeight:800,color:'var(--rose)',letterSpacing:'.12em',textTransform:'uppercase',marginBottom:8}}>{t.results.cosmicMessage}</p>
                  <p style={{fontFamily:'var(--serif)',fontSize:20,fontStyle:'italic',color:'var(--ink)',lineHeight:1.65}}>{s.result.cosmic_message}</p>
                </div>
                <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap',marginBottom:16}}>
                  {(s.result.symbols||[]).map((sym,i)=>(
                    <span key={i} style={{fontSize:14,fontWeight:600,color:'var(--rose)',background:'rgba(138,58,90,.08)',border:'1px solid rgba(138,58,90,.2)',padding:'4px 14px',borderRadius:8}}>✦ {sym}</span>
                  ))}
                </div>
              </div>
              <ResultGate svc="dream"
                badgeText={`Chakra: ${s.result.chakra_affected||'Ajna'}`}
                title="Your Dream Interpretation"
                summaryItems={[
                  {label:t.results.subconscious, text:s.result.summary?.subconscious||''},
                  {label:t.results.spiritual, text:s.result.summary?.spiritual||''},
                  {label:t.results.action, text:s.result.summary?.action||''},
                ]}
              />
            </>
          )}
          {s.step==='error' && <div className="status-error">{s.error}</div>}
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════
  //  HOME PAGE
  // ═══════════════════════════════════════════════════
  const svcs = [
    {id:'palm',      emoji:'🤚', accent:'#D4621A', tag:'Most Popular'},
    {id:'kundli',    emoji:'⭐', accent:'#B89A2A', tag:null},
    {id:'tarot',     emoji:'🃏', accent:'#6A2D6A', tag:null},
    {id:'numerology',emoji:'🔢', accent:'#5A7A5A', tag:null},
    {id:'face',      emoji:'👁', accent:'#2A6B7A', tag:null},
    {id:'dream',     emoji:'💭', accent:'#8A3A5A', tag:null},
  ]

  function HomePage() {
    const h = t.home
    return (
      <div className="page-content">
        {/* Ticker */}
        <div style={{background:'var(--saffron)',overflow:'hidden',whiteSpace:'nowrap',padding:'10px 0'}}>
          <div style={{display:'inline-block',animation:'ticker 36s linear infinite',fontSize:13,fontWeight:600,color:'rgba(255,255,255,.75)',letterSpacing:'.14em',textTransform:'uppercase'}}>
            {h.ticker}{h.ticker}
          </div>
        </div>

        {/* Hero */}
        <section style={{minHeight:'92vh',display:'flex',alignItems:'center',position:'relative',overflow:'hidden',background:'linear-gradient(150deg,#FAF7F2 0%,#F4EFE6 40%,#EDE5D8 100%)',padding:'60px 28px'}}>
          <div style={{position:'absolute',right:-40,top:'50%',transform:'translateY(-50%)',fontFamily:'serif',fontSize:'clamp(200px,28vw,380px)',color:'rgba(212,98,26,.05)',lineHeight:1,pointerEvents:'none',userSelect:'none',fontWeight:700}}>OM</div>
          <div style={{position:'absolute',top:-80,left:-80,width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(212,98,26,.08),transparent 70%)',pointerEvents:'none'}}/>
          <div style={{position:'relative',zIndex:2,maxWidth:760,paddingLeft:'clamp(0px,6vw,80px)'}}>
            <div className="eyebrow" style={{marginBottom:20}}>✦ {h.badge}</div>
            <h1 style={{fontFamily:'var(--serif)',fontSize:'clamp(52px,9vw,110px)',fontWeight:700,lineHeight:.92,letterSpacing:'-.03em',color:'var(--ink)',marginBottom:24}}>
              {h.heroLine1}<br/>
              <span style={{color:'var(--saffron)'}}>{h.heroLine2}</span><br/>
              <span style={{fontStyle:'italic',color:'var(--terracotta)'}}>{h.heroLine3}</span>
            </h1>
            <div style={{width:60,height:4,background:'var(--saffron)',borderRadius:2,marginBottom:24}}/>
            <p style={{fontSize:20,color:'var(--ink3)',lineHeight:1.7,marginBottom:36,maxWidth:520}}>{h.heroDesc}</p>
            <div style={{display:'flex',gap:14,flexWrap:'wrap',marginBottom:48}}>
              <button className="btn-primary" onClick={()=>document.getElementById('svc-section').scrollIntoView({behavior:'smooth'})}>{h.exploreBtn}</button>
              <button className="btn-secondary" onClick={()=>setPage('palm')}>{h.tryBtn}</button>
            </div>
            {/* Stats */}
            <div style={{display:'flex',background:'var(--card-bg)',border:'1px solid var(--border)',borderRadius:14,overflow:'hidden',boxShadow:'0 4px 20px var(--shadow)',width:'fit-content'}}>
              {[['2M+',h.stats.readings],['4.9★',h.stats.rating],['6',h.stats.services],['<30s',h.stats.instant]].map(([v,l],i,a)=>(
                <div key={i} style={{textAlign:'center',padding:'10px 20px',borderRight:i<a.length-1?'1px solid var(--border)':'none'}}>
                  <div style={{fontFamily:'var(--serif)',fontSize:24,fontWeight:700,color:'var(--saffron)'}}>{v}</div>
                  <div style={{fontSize:12,fontWeight:600,color:'var(--muted)',letterSpacing:'.1em',textTransform:'uppercase',marginTop:3}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="svc-section" style={{padding:'100px 0',background:'var(--bg2)',borderTop:'1px solid var(--border)'}}>
          <div style={{maxWidth:1200,margin:'0 auto',padding:'0 28px'}}>
            <div style={{textAlign:'center',marginBottom:56}}>
              <div className="eyebrow">Six Ancient Sciences</div>
              <h2 className="sec-title">{h.servicesTitle}</h2>
              <p className="sec-desc">{h.servicesDesc}</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:20}}>
              {svcs.map(svc => (
                <button key={svc.id} onClick={()=>setPage(svc.id)} style={{
                  background:'var(--card-bg)',border:'1px solid var(--border)',borderRadius:16,
                  padding:'28px 24px',cursor:'pointer',transition:'all .22s',textAlign:'left',
                  boxShadow:'0 2px 12px var(--shadow)',position:'relative',overflow:'hidden',
                  '--accent':svc.accent,
                }} onMouseOver={e=>{e.currentTarget.style.transform='translateY(-5px)';e.currentTarget.style.boxShadow='0 14px 44px rgba(100,60,30,.18)'}}
                   onMouseOut={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 2px 12px var(--shadow)'}}>
                  {svc.tag && <div style={{position:'absolute',top:0,right:0,background:svc.accent,color:'#fff',fontSize:10,fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',padding:'4px 12px',borderRadius:'0 16px 0 8px'}}>{svc.tag}</div>}
                  <div style={{display:'flex',gap:14,alignItems:'flex-start',marginBottom:14}}>
                    <div style={{width:52,height:52,borderRadius:12,background:`${svc.accent}18`,border:`2px solid ${svc.accent}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{svc.emoji}</div>
                    <div>
                      <p style={{fontSize:11,fontWeight:700,color:svc.accent,letterSpacing:'.14em',textTransform:'uppercase',marginBottom:3}}>{t.services[svc.id]?.skt}</p>
                      <h3 style={{fontFamily:'var(--serif)',fontSize:22,color:'var(--ink)',fontWeight:700}}>{t.services[svc.id]?.name}</h3>
                    </div>
                  </div>
                  <p style={{fontSize:16,color:'var(--ink3)',lineHeight:1.7,marginBottom:14}}>{t.services[svc.id]?.desc}</p>
                  <div style={{fontSize:14,fontWeight:700,color:svc.accent,display:'flex',alignItems:'center',gap:6}}>Begin Reading <span style={{fontSize:18}}>→</span></div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section style={{padding:'100px 0',background:'var(--bg)',borderTop:'1px solid var(--border)'}}>
          <div style={{maxWidth:1000,margin:'0 auto',padding:'0 28px'}}>
            <div style={{textAlign:'center',marginBottom:56}}>
              <div className="eyebrow">Simple Process</div>
              <h2 className="sec-title">{h.howTitle}</h2>
              <p className="sec-desc">{h.howDesc}</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:40}}>
              {[[h.step1Title,h.step1Desc,'01'],[h.step2Title,h.step2Desc,'02'],[h.step3Title,h.step3Desc,'03']].map(([title,desc,n])=>(
                <div key={n} style={{textAlign:'center'}}>
                  <div style={{width:72,height:72,borderRadius:'50%',background:'rgba(212,98,26,.1)',border:'2px solid rgba(212,98,26,.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',fontFamily:'var(--serif)',fontSize:22,fontWeight:700,color:'var(--saffron)'}}>{n}</div>
                  <h3 style={{fontFamily:'var(--serif)',fontSize:22,color:'var(--ink)',marginBottom:10,fontWeight:700}}>{title}</h3>
                  <p style={{fontSize:16,color:'var(--muted)',lineHeight:1.75}}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{padding:'100px 28px',textAlign:'center',background:'var(--saffron)',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontFamily:'serif',fontSize:320,color:'rgba(255,255,255,.05)',pointerEvents:'none',userSelect:'none',fontWeight:700}}>OM</div>
          <div style={{position:'relative',zIndex:2}}>
            <h2 style={{fontFamily:'var(--serif)',fontSize:'clamp(30px,5vw,54px)',color:'#fff',marginBottom:14,fontWeight:700,letterSpacing:'-.02em'}}>{h.ctaTitle}</h2>
            <p style={{fontSize:18,color:'rgba(255,255,255,.8)',margin:'0 auto 36px',maxWidth:480,lineHeight:1.7}}>{h.ctaDesc}</p>
            <button style={{background:'#fff',color:'var(--saffron)',fontFamily:'var(--sans)',fontSize:17,fontWeight:800,padding:'15px 36px',borderRadius:10,border:'none',cursor:'pointer',boxShadow:'0 8px 32px rgba(0,0,0,.18)',transition:'all .2s'}}
              onClick={()=>setPage('palm')}
              onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'}
              onMouseOut={e=>e.currentTarget.style.transform='none'}>
              {h.ctaBtn}
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer style={{background:'var(--ink)',color:'rgba(250,247,242,.8)',padding:'48px 28px 28px',textAlign:'center'}}>
          <div style={{fontFamily:'serif',fontSize:42,color:'var(--saffron)',opacity:.5,marginBottom:6}}>OM</div>
          <div style={{fontFamily:'var(--serif)',fontSize:26,fontWeight:700,color:'var(--saffron)',marginBottom:6}}>VedicAI</div>
          <p style={{fontSize:13,color:'rgba(250,247,242,.4)',letterSpacing:'.15em',textTransform:'uppercase',marginBottom:22}}>{h.footerTagline}</p>
          <div style={{display:'flex',gap:20,justifyContent:'center',flexWrap:'wrap',marginBottom:20}}>
            {svcs.map(s=>(
              <span key={s.id} onClick={()=>setPage(s.id)} style={{cursor:'pointer',fontSize:14,color:'rgba(250,247,242,.45)',transition:'color .2s'}}
                onMouseOver={e=>e.currentTarget.style.color='var(--saffron)'}
                onMouseOut={e=>e.currentTarget.style.color='rgba(250,247,242,.45)'}>
                {s.emoji} {t.services[s.id]?.name}
              </span>
            ))}
          </div>
          <p style={{fontSize:13,color:'rgba(250,247,242,.25)'}}>{h.disclaimer}</p>
        </footer>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════
  const pages = { home:<HomePage/>, palm:<PalmPage/>, kundli:<KundliPage/>, tarot:<TarotPage/>, numerology:<NumerologyPage/>, face:<FacePage/>, dream:<DreamPage/> }

  return (
    <>
      <Nav t={t} lang={lang} onLangChange={setLang} onNav={pg=>{setPage(pg);window.scrollTo({top:0,behavior:'smooth'})}} currentPage={page}/>
      {pages[page] || <HomePage/>}
      {payModal && (
        <PaymentModal
          service={payModal.svc}
          result={payModal.result}
          userName={payModal.name}
          lang={lang}
          t={t}
          onClose={()=>setPayModal(null)}
          onSuccess={()=>onPaySuccess(payModal.svc)}
        />
      )}
    </>
  )
}
