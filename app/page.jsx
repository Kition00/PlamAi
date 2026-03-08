'use client'
import { useState, useCallback } from 'react'

// ══════════════════════════════════════════════
// TRANSLATIONS (inlined)
// ══════════════════════════════════════════════
const translations = {
  en: {
    lang:'en', langName:'English',
    nav:{ palm:'Palm Reading', kundli:'Kundli', tarot:'Tarot', numerology:'Numerology', face:'Face Reading', dream:'Dreams', startFree:'Start Free →' },
    payment:{ title:'Unlock Full Report', subtitle:'Choose payment method', priceIndia:'₹499', priceIntl:'$5.99', upiLabel:'GPay / UPI / Cards (India)', stripeLabel:'Credit / Debit Card (International)', paypalLabel:'PayPal (Global)', deliveryTitle:'Report Delivery', whatsappLabel:'Send to WhatsApp', whatsappPlaceholder:'+91 98765 43210', emailLabel:'Send to Email', emailPlaceholder:'your@email.com', inappLabel:'View in App', payNow:'Pay & Unlock Now', processing:'Processing payment...', success:'✓ Payment successful!', whatsappSending:'Sending PDF to WhatsApp...', emailSending:'Sending PDF to email...', delivered:'✓ Report delivered!', features:['Full 400+ word detailed report','PDF download','WhatsApp delivery','Email delivery','In-app reading'], secureNote:'🔒 Secured by Razorpay · Stripe · PayPal' },
    services:{ palm:{name:'Palm Reading',skt:'हस्त रेखा',desc:'Upload your palm photo. AI reads your life, heart, head and fate lines with Vedic precision.'}, kundli:{name:'Kundli & Astrology',skt:'जन्म कुंडली',desc:'Enter your birth details. Receive a full Vedic birth chart with planetary positions and predictions.'}, tarot:{name:'Tarot Reading',skt:'टैरो',desc:'Draw cards or ask a question. AI interprets your spread with deep symbolic wisdom.'}, numerology:{name:'Numerology',skt:'अंक ज्योतिष',desc:'Your name and birthdate hold cosmic numbers. Discover your life path, destiny and soul urge.'}, face:{name:'Face Reading',skt:'मुख विज्ञान',desc:'Samudrika Shastra — ancient face reading. Upload a selfie and reveal your personality secrets.'}, dream:{name:'Dream Interpreter',skt:'स्वप्न विज्ञान',desc:'Describe your dream. AI uncovers hidden meanings using Vedic, Jungian and cosmic symbolism.'} },
    form:{ name:'Full Name', dob:'Date of Birth', tob:'Time of Birth', pob:'Place of Birth', gender:'Gender', male:'Male', female:'Female', other:'Other', namePlaceholder:'Your full name', pobPlaceholder:'City, Country', generateKundli:'⭐ Generate My Kundli', calculateNumbers:'🔢 Calculate My Numbers', interpretDream:'💭 Interpret My Dream', shuffleDeck:'🃏 Shuffle the Cosmic Deck', beginReading:'✦ Begin Reading', retake:'← Retake', newReading:'← New Reading', uploadPalm:'Upload Your Palm Photo', uploadFace:'Upload Your Photo', choosePhoto:'Choose Photo', dreamPlaceholder:'I was standing in a vast golden field...', dreamHint:'The more detail you share, the deeper the reading', recurring:'This is a recurring dream', feelLabel:'How did you feel during the dream?', emotions:['Peaceful','Anxious','Joyful','Fearful','Mysterious','Excited','Confused'], spreadSingle:'Single Card', spreadThree:'Past · Present · Future', spreadCeltic:'Celtic Cross', questionLabel:'Your Question (optional)', tipTitle:'📸 Tips for Best Results', palmTips:'· Open palm facing camera, fingers spread\n· Bright natural light, no flash\n· Hold phone 20–30cm away', faceTips:'· Front-facing photo, face fully visible\n· Neutral expression, natural lighting\n· No sunglasses or face coverings' },
    results:{ unlockBtn:'🔓 Unlock Full Report', summary:'Your Reading Summary', life:'❤️ Life Force', finance:'💰 Wealth', love:'💞 Love', career:'💼 Career', health:'🌿 Health', relationships:'💞 Relationships', past:'⏮ Past', present:'⏺ Present', future:'⏭ Future', purpose:'🎯 Purpose', strengths:'💪 Strengths', challenges:'🌱 Challenges', personality:'🌟 Personality', subconscious:'🧠 Subconscious', spiritual:'🌌 Spiritual', action:'⚡ Action', cosmicMessage:'Cosmic Message', primarySymbol:'Primary Symbol', luckyNumbers:'Lucky Numbers', features:['Complete detailed analysis','PDF download','WhatsApp delivery','Email delivery'] },
    loading:{ palm:['Tracing the sacred lines of your palm...','Consulting the Vedic texts...','Reading your cosmic blueprint...'], kundli:['Calculating planetary positions...','Analysing the 12 houses...','Mapping your birth chart...'], face:['Activating Samudrika Shastra vision...','Reading your facial features...'], dream:['Entering the dream realm...','Consulting Swapna Shastra...'], numerology:['Calculating your life path...','Decoding destiny number...'], tarot:['Shuffling the cosmic deck...','Drawing your cards...','Interpreting ancient symbolism...'] },
    home:{ badge:'AI-Powered Vedic Readings', heroLine1:'Know Your', heroLine2:'Destiny', heroLine3:'Today.', heroDesc:'Five thousand years of Vedic wisdom, now available in seconds. Palm reading, astrology, tarot, numerology, face reading & dream interpretation.', exploreBtn:'Explore All Services ↓', tryBtn:'Try Palm Reading Free', servicesTitle:'Choose Your Reading', servicesDesc:'Six ancient sciences, each powered by AI.', howTitle:'How It Works', howDesc:'Three simple steps to your cosmic reading.', step1Title:'Choose Your Service', step1Desc:'Select from palm reading, astrology, tarot, numerology, face reading, or dream interpretation.', step2Title:'Provide Your Input', step2Desc:'Upload a photo, enter birth details, pick cards, or describe your dream.', step3Title:'Receive Your Reading', step3Desc:'AI channels 5,000 years of Vedic wisdom and delivers your personalized reading.', ctaTitle:'Begin Your Free Reading', ctaDesc:'No credit card required. Free preview for every service.', ctaBtn:'Start with Palm Reading →', footerTagline:'Ancient Vedic Wisdom · Powered by AI', disclaimer:'⚠️ For entertainment purposes only. © 2026 VedicAI', stats:{ readings:'Readings', rating:'Rating', services:'Services', instant:'Instant' } },
  },
  hi: {
    lang:'hi', langName:'हिंदी',
    nav:{ palm:'हस्त रेखा', kundli:'कुंडली', tarot:'टैरो', numerology:'अंक ज्योतिष', face:'मुख पठन', dream:'स्वप्न', startFree:'मुफ़्त शुरू करें →' },
    payment:{ title:'पूरी रिपोर्ट अनलॉक करें', subtitle:'भुगतान विधि चुनें', priceIndia:'₹499', priceIntl:'$5.99', upiLabel:'GPay / UPI / कार्ड (भारत)', stripeLabel:'क्रेडिट / डेबिट कार्ड', paypalLabel:'PayPal (वैश्विक)', deliveryTitle:'रिपोर्ट डिलीवरी', whatsappLabel:'WhatsApp पर भेजें', whatsappPlaceholder:'+91 98765 43210', emailLabel:'ईमेल पर भेजें', emailPlaceholder:'आपका@email.com', inappLabel:'ऐप में देखें', payNow:'अभी भुगतान करें', processing:'भुगतान हो रहा है...', success:'✓ भुगतान सफल!', whatsappSending:'WhatsApp पर PDF...', emailSending:'ईमेल पर PDF...', delivered:'✓ रिपोर्ट डिलीवर!', features:['पूरी ४००+ शब्द रिपोर्ट','PDF डाउनलोड','WhatsApp डिलीवरी','ईमेल डिलीवरी'], secureNote:'🔒 Razorpay · Stripe · PayPal' },
    services:{ palm:{name:'हस्त रेखा पठन',skt:'हस्त रेखा',desc:'हथेली की फ़ोटो अपलोड करें। AI वैदिक सटीकता से जीवन, हृदय, मस्तिष्क और भाग्य रेखाएँ पढ़ता है।'}, kundli:{name:'कुंडली और ज्योतिष',skt:'जन्म कुंडली',desc:'जन्म विवरण दर्ज करें। ग्रहों की स्थिति और भविष्यवाणियों के साथ पूर्ण वैदिक जन्म चार्ट पाएँ।'}, tarot:{name:'टैरो पठन',skt:'टैरो',desc:'कार्ड खींचें या प्रश्न पूछें। AI गहरी प्रतीकात्मक बुद्धि के साथ व्याख्या करता है।'}, numerology:{name:'अंक ज्योतिष',skt:'अंक ज्योतिष',desc:'नाम और जन्म तिथि में ब्रह्मांडीय अंक हैं। जीवन पथ, भाग्य और आत्मा की इच्छा जानें।'}, face:{name:'मुख पठन',skt:'मुख विज्ञान',desc:'समुद्रिका शास्त्र। सेल्फी अपलोड करें और व्यक्तित्व के रहस्य उजागर करें।'}, dream:{name:'स्वप्न व्याख्या',skt:'स्वप्न विज्ञान',desc:'सपना बताएँ। AI वैदिक और जुंगियन प्रतीकवाद से छिपे अर्थ उजागर करता है।'} },
    form:{ name:'पूरा नाम', dob:'जन्म तिथि', tob:'जन्म समय', pob:'जन्म स्थान', gender:'लिंग', male:'पुरुष', female:'महिला', other:'अन्य', namePlaceholder:'आपका पूरा नाम', pobPlaceholder:'शहर, देश', generateKundli:'⭐ मेरी कुंडली बनाएँ', calculateNumbers:'🔢 मेरे अंक जानें', interpretDream:'💭 सपना समझाएँ', shuffleDeck:'🃏 ताश पीटें', beginReading:'✦ पठन शुरू करें', retake:'← फिर खींचें', newReading:'← नई पठन', uploadPalm:'हथेली की फ़ोटो अपलोड करें', uploadFace:'फ़ोटो अपलोड करें', choosePhoto:'फ़ोटो चुनें', dreamPlaceholder:'मैं एक विशाल सुनहरे मैदान में खड़ा था...', dreamHint:'अधिक विवरण = गहरी व्याख्या', recurring:'यह बार-बार आने वाला सपना है', feelLabel:'सपने में कैसा महसूस हुआ?', emotions:['शांत','चिंतित','प्रसन्न','भयभीत','रहस्यमय','उत्साहित','भ्रमित'], spreadSingle:'एक कार्ड', spreadThree:'भूत · वर्तमान · भविष्य', spreadCeltic:'सेल्टिक क्रॉस', questionLabel:'आपका प्रश्न (वैकल्पिक)', tipTitle:'📸 सुझाव', palmTips:'· उँगलियाँ फैलाकर हथेली कैमरे की तरफ\n· तेज़ प्राकृतिक रोशनी', faceTips:'· आगे की ओर देखते हुए फ़ोटो\n· तटस्थ भाव, प्राकृतिक रोशनी' },
    results:{ unlockBtn:'🔓 पूरी रिपोर्ट अनलॉक करें', summary:'सारांश', life:'❤️ जीवन', finance:'💰 धन', love:'💞 प्रेम', career:'💼 करियर', health:'🌿 स्वास्थ्य', relationships:'💞 संबंध', past:'⏮ भूत', present:'⏺ वर्तमान', future:'⏭ भविष्य', purpose:'🎯 उद्देश्य', strengths:'💪 शक्तियाँ', challenges:'🌱 चुनौतियाँ', personality:'🌟 व्यक्तित्व', subconscious:'🧠 अवचेतन', spiritual:'🌌 आध्यात्मिक', action:'⚡ कार्य', cosmicMessage:'संदेश', primarySymbol:'प्रतीक', luckyNumbers:'भाग्यशाली अंक', features:['पूरा विश्लेषण','PDF डाउनलोड','WhatsApp','ईमेल'] },
    loading:{ palm:['हस्त रेखाओं का अध्ययन...','वैदिक ग्रंथों से परामर्श...'], kundli:['ग्रहों की गणना...','१२ भावों का विश्लेषण...'], face:['समुद्रिका शास्त्र...'], dream:['स्वप्न लोक में प्रवेश...'], numerology:['जीवन पथ गणना...'], tarot:['पत्ते फेंटे जा रहे हैं...'] },
    home:{ badge:'AI-संचालित वैदिक पठन', heroLine1:'जानिए अपना', heroLine2:'भाग्य', heroLine3:'आज ही।', heroDesc:'पाँच हज़ार वर्षों का वैदिक ज्ञान, अब कुछ ही सेकंड में।', exploreBtn:'सभी सेवाएँ देखें ↓', tryBtn:'हस्त रेखा मुफ़्त आज़माएँ', servicesTitle:'अपनी पठन चुनें', servicesDesc:'छह प्राचीन विज्ञान, AI द्वारा संचालित।', howTitle:'कैसे काम करता है', howDesc:'तीन सरल चरणों में पठन।', step1Title:'सेवा चुनें', step1Desc:'छह सेवाओं में से चुनें।', step2Title:'जानकारी दें', step2Desc:'फ़ोटो या विवरण प्रदान करें।', step3Title:'पठन पाएँ', step3Desc:'AI आपकी व्यक्तिगत पठन प्रदान करता है।', ctaTitle:'मुफ़्त पठन शुरू करें', ctaDesc:'कोई क्रेडिट कार्ड नहीं चाहिए।', ctaBtn:'हस्त रेखा से शुरू करें →', footerTagline:'प्राचीन वैदिक ज्ञान · AI द्वारा', disclaimer:'⚠️ केवल मनोरंजन के लिए। © 2026 VedicAI', stats:{ readings:'पठन', rating:'रेटिंग', services:'सेवाएँ', instant:'तुरंत' } },
  },
  gu: {
    lang:'gu', langName:'ગુજરાતી',
    nav:{ palm:'હસ્ત રેખા', kundli:'કુંડળી', tarot:'ટેરો', numerology:'અંક જ્યોતિષ', face:'મુખ વાંચન', dream:'સ્વપ્ન', startFree:'મફત શરૂ કરો →' },
    payment:{ title:'સંપૂર્ણ રિપોર્ટ અનલૉક', subtitle:'ચુકવણી પદ્ધતિ પસંદ કરો', priceIndia:'₹499', priceIntl:'$5.99', upiLabel:'GPay / UPI / કાર્ડ (ભારત)', stripeLabel:'ક્રેડિટ / ડેબિટ કાર્ડ', paypalLabel:'PayPal (વૈશ્વિક)', deliveryTitle:'અહેવાલ ડિલિવરી', whatsappLabel:'WhatsApp પર', whatsappPlaceholder:'+91 98765 43210', emailLabel:'ઇમેઇલ પર', emailPlaceholder:'તમારો@email.com', inappLabel:'એપ્પમાં', payNow:'હવે ચૂકવો', processing:'ચુકવણી...', success:'✓ સફળ!', whatsappSending:'WhatsApp PDF...', emailSending:'ઇમેઇલ PDF...', delivered:'✓ ડિલિવર!', features:['સંપૂર્ણ રિપોર્ટ','PDF ડાઉનલોડ','WhatsApp','ઇમેઇલ'], secureNote:'🔒 Razorpay · Stripe · PayPal' },
    services:{ palm:{name:'હસ્ત રેખા વાંચન',skt:'हस्त रेखा',desc:'હથેળીનો ફોટો અપલોડ કરો. AI વૈદિક ચોકસાઈ સાથે રેખા વાંચે છે.'}, kundli:{name:'કુંડળી અને જ્યોતિષ',skt:'जन्म कुंडली',desc:'જન્મ વિગત દાખલ કરો. સંપૂર્ણ વૈદિક જન્મ ચાર્ટ મેળવો.'}, tarot:{name:'ટેરો વાંચન',skt:'टैरो',desc:'કાર્ડ ખેંચો. AI ઊંડી સ્પ્રેડ સમજાવે છે.'}, numerology:{name:'અંક જ્યોતિષ',skt:'अंक ज्योतिष',desc:'નામ અને જન્મ તારીખ. જીવન માર્ગ, ભાગ્ય જાણો.'}, face:{name:'મુખ વાંચન',skt:'मुख विज्ञान',desc:'સમુદ્રિક શાસ્ત્ર. સેલ્ફી અપલોડ કરો.'}, dream:{name:'સ્વપ્ન વ્યાખ્યા',skt:'स्वप्न विज्ञान',desc:'સ્વપ્ન વર્ણવો. AI છુપા અર્થ ઉઘાડે.'} },
    form:{ name:'પૂરું નામ', dob:'જન્મ તારીખ', tob:'જન્મ સમય', pob:'જન્મ સ્થળ', gender:'લિંગ', male:'પુરુષ', female:'સ્ત્રી', other:'અન્ય', namePlaceholder:'તમારું નામ', pobPlaceholder:'શહેર, દેશ', generateKundli:'⭐ કુંડળી બનાવો', calculateNumbers:'🔢 અંક ગણો', interpretDream:'💭 સ્વપ્ન સમજો', shuffleDeck:'🃏 પત્તાં ભેળવો', beginReading:'✦ શરૂ કરો', retake:'← ફરી', newReading:'← નવું', uploadPalm:'હથેળીનો ફોટો', uploadFace:'ફોટો અપલોડ', choosePhoto:'ફોટો પસંદ', dreamPlaceholder:'સ્વપ્ન વર્ણવો...', dreamHint:'વધુ વિગત = ઊંડી વ્યાખ્યા', recurring:'વારંવાર આવે છે', feelLabel:'કેવું લાગ્યું?', emotions:['શાંત','ચિંતિત','પ્રસન્ન','ભયભીત','રહસ્ય','ઉત્સાહ','મૂંઝવણ'], spreadSingle:'એક', spreadThree:'ભૂત · વર્તમાન · ભવિષ્ય', spreadCeltic:'સેલ્ટિક ક્રોસ', questionLabel:'પ્રશ્ન', tipTitle:'📸 સૂચનો', palmTips:'· આંગળી ફેલાવો\n· સારો પ્રકાશ', faceTips:'· સ્પષ્ટ ફોટો\n· સ્વાભાવિક ભાવ' },
    results:{ unlockBtn:'🔓 અનલૉક', summary:'સારાંશ', life:'❤️ જીવન', finance:'💰 ધન', love:'💞 પ્રેમ', career:'💼 કારકિર્દી', health:'🌿 સ્વાસ્થ્ય', relationships:'💞 સંબંધ', past:'⏮ ભૂત', present:'⏺ વર્તમાન', future:'⏭ ભવિષ્ય', purpose:'🎯 હેતુ', strengths:'💪 શક્તિ', challenges:'🌱 પડકાર', personality:'🌟 વ્યક્તિત્વ', subconscious:'🧠 અવ:ચેતન', spiritual:'🌌 આધ્યાત્મ', action:'⚡ ક્રિયા', cosmicMessage:'સંદેશ', primarySymbol:'પ્રતીક', luckyNumbers:'ભાગ્ય અંક', features:['સંપૂર્ણ','PDF','WhatsApp','ઇમેઇલ'] },
    loading:{ palm:['હસ્ત રેખા...'], kundli:['ગ્રહ ગણના...'], face:['સમુદ્રિક...'], dream:['સ્વપ્ન...'], numerology:['અંક ગણના...'], tarot:['પત્તાં ભેળવવા...'] },
    home:{ badge:'AI-સંચાલિત વૈદિક', heroLine1:'જાણો તમારું', heroLine2:'ભાગ્ય', heroLine3:'આજે જ.', heroDesc:'પાંચ હજાર વર્ષોનું વૈદિક જ્ઞાન, સેકન્ડોમાં.', exploreBtn:'બધી સેવાઓ ↓', tryBtn:'હસ્ત રેખા મફત', servicesTitle:'વાંચન પસંદ કરો', servicesDesc:'છ પ્રાચીન વિજ્ઞાન.', howTitle:'કેવી રીતે', howDesc:'ત્રણ પગલાં.', step1Title:'સેવા પસંદ', step1Desc:'છ સેવામાંથી.', step2Title:'માહિતી', step2Desc:'ફોટો અથવા વિગત.', step3Title:'વાંચન', step3Desc:'AI વ્યક્તિગત.', ctaTitle:'મફત શરૂ', ctaDesc:'કાર્ડ જરૂરી નથી.', ctaBtn:'શરૂ →', footerTagline:'વૈદિક જ્ઞાન · AI', disclaimer:'⚠️ મનોરંજન. © 2026', stats:{ readings:'વાંચન', rating:'રેટિંગ', services:'સેવા', instant:'તત્કાળ' } },
  },
  ta: {
    lang:'ta', langName:'தமிழ்',
    nav:{ palm:'கை ரேகை', kundli:'ஜாதகம்', tarot:'தாரோ', numerology:'எண் ஜோதிடம்', face:'முக வாசிப்பு', dream:'கனவு', startFree:'இலவசம் →' },
    payment:{ title:'முழு அறிக்கை திறக்க', subtitle:'கட்டண முறை தேர்வு', priceIndia:'₹499', priceIntl:'$5.99', upiLabel:'GPay / UPI / அட்டைகள்', stripeLabel:'கிரெடிட் / டெபிட் கார்டு', paypalLabel:'PayPal', deliveryTitle:'அறிக்கை டெலிவரி', whatsappLabel:'WhatsApp', whatsappPlaceholder:'+91 98765 43210', emailLabel:'மின்னஞ்சல்', emailPlaceholder:'உங்கள்@email.com', inappLabel:'ஆப்பில்', payNow:'இப்போது செலுத்து', processing:'செயலாக்கம்...', success:'✓ வெற்றி!', whatsappSending:'WhatsApp PDF...', emailSending:'மின்னஞ்சல் PDF...', delivered:'✓ வழங்கப்பட்டது!', features:['முழு அறிக்கை','PDF','WhatsApp','மின்னஞ்சல்'], secureNote:'🔒 Razorpay · Stripe · PayPal' },
    services:{ palm:{name:'கை ரேகை வாசிப்பு',skt:'हस्त रेखा',desc:'உள்ளங்கை புகைப்படம். AI வேத துல்லியத்துடன் படிக்கிறது.'}, kundli:{name:'ஜாதகம் & ஜோதிடம்',skt:'जन्म कुंडली',desc:'பிறப்பு விவரங்கள். முழு வேத ஜாதகம்.'}, tarot:{name:'தாரோ வாசிப்பு',skt:'टैरो',desc:'அட்டைகள் எடுக்கவும். AI விளக்கமளிக்கிறது.'}, numerology:{name:'எண் ஜோதிடம்',skt:'अंक ज्योतिष',desc:'பெயரில் பிரபஞ்ச எண்கள். வாழ்க்கை பாதை.'}, face:{name:'முக வாசிப்பு',skt:'मुख विज्ञान',desc:'சமுத்திரிக்க சாஸ்திரம். செல்ஃபி பதிவேற்றவும்.'}, dream:{name:'கனவு விளக்கம்',skt:'स्वप्न विज्ञान',desc:'கனவை விவரிக்கவும். AI அர்த்தங்கள்.'} },
    form:{ name:'முழு பெயர்', dob:'பிறந்த தேதி', tob:'பிறந்த நேரம்', pob:'பிறந்த இடம்', gender:'பாலினம்', male:'ஆண்', female:'பெண்', other:'மற்றவை', namePlaceholder:'உங்கள் பெயர்', pobPlaceholder:'நகரம், நாடு', generateKundli:'⭐ ஜாதகம்', calculateNumbers:'🔢 எண்கள்', interpretDream:'💭 கனவு', shuffleDeck:'🃏 கலக்கவும்', beginReading:'✦ தொடங்கவும்', retake:'← மீண்டும்', newReading:'← புதியது', uploadPalm:'உள்ளங்கை புகைப்படம்', uploadFace:'புகைப்படம்', choosePhoto:'தேர்ந்தெடுக்கவும்', dreamPlaceholder:'கனவை விவரிக்கவும்...', dreamHint:'அதிக விவரம் = ஆழமான விளக்கம்', recurring:'மீண்டும் மீண்டும் வரும்', feelLabel:'எப்படி உணர்ந்தீர்கள்?', emotions:['அமைதி','கவலை','மகிழ்ச்சி','பயம்','மர்மம்','உற்சாகம்','குழப்பம்'], spreadSingle:'ஒரு அட்டை', spreadThree:'கடந்த · நிகழ்வு · எதிர்வு', spreadCeltic:'செல்டிக் கிராஸ்', questionLabel:'கேள்வி', tipTitle:'📸 குறிப்புகள்', palmTips:'· விரல் விரிக்கவும்\n· நல்ல ஒளி', faceTips:'· தெளிவான புகைப்படம்\n· இயல்பான தோற்றம்' },
    results:{ unlockBtn:'🔓 திறக்கவும்', summary:'சுருக்கம்', life:'❤️ உயிர்', finance:'💰 செல்வம்', love:'💞 காதல்', career:'💼 தொழில்', health:'🌿 ஆரோக்கியம்', relationships:'💞 உறவு', past:'⏮ கடந்தகாலம்', present:'⏺ நிகழ்காலம்', future:'⏭ எதிர்காலம்', purpose:'🎯 நோக்கம்', strengths:'💪 பலம்', challenges:'🌱 சவால்', personality:'🌟 ஆளுமை', subconscious:'🧠 ஆழ்மனம்', spiritual:'🌌 ஆன்மீகம்', action:'⚡ செயல்', cosmicMessage:'செய்தி', primarySymbol:'குறியீடு', luckyNumbers:'அதிர்ஷ்டம்', features:['முழு அறிக்கை','PDF','WhatsApp','மின்னஞ்சல்'] },
    loading:{ palm:['கை ரேகை...'], kundli:['கிரக கணக்கு...'], face:['சமுத்திரிக்க...'], dream:['கனவு உலகம்...'], numerology:['எண் கணக்கு...'], tarot:['அட்டைகள்...'] },
    home:{ badge:'AI வேத வாசிப்புகள்', heroLine1:'உங்கள்', heroLine2:'விதியை', heroLine3:'அறியுங்கள்.', heroDesc:'ஐந்தாயிரம் ஆண்டுகளின் வேத ஞானம், விநாடிகளில்.', exploreBtn:'சேவைகள் ↓', tryBtn:'கை ரேகை இலவசம்', servicesTitle:'வாசிப்பு தேர்ந்தெடு', servicesDesc:'ஆறு பண்டைய அறிவியல்கள்.', howTitle:'எப்படி', howDesc:'மூன்று படிகள்.', step1Title:'சேவை தேர்வு', step1Desc:'ஆறு சேவைகளில் இருந்து.', step2Title:'தகவல்', step2Desc:'புகைப்படம் அல்லது விவரங்கள்.', step3Title:'வாசிப்பு', step3Desc:'AI தனிப்பட்ட வாசிப்பு.', ctaTitle:'இலவச வாசிப்பு', ctaDesc:'கிரெடிட் கார்டு தேவையில்லை.', ctaBtn:'தொடங்கவும் →', footerTagline:'வேத ஞானம் · AI', disclaimer:'⚠️ பொழுதுபோக்கு. © 2026', stats:{ readings:'வாசிப்புகள்', rating:'மதிப்பீடு', services:'சேவைகள்', instant:'உடனடி' } },
  },
}
const DEFAULT_LANG = 'en'

// ══════════════════════════════════════════════
// TAROT DECK
// ══════════════════════════════════════════════
const TAROT_CARDS = ['The Fool','The Magician','The High Priestess','The Empress','The Emperor','The Hierophant','The Lovers','The Chariot','Strength','The Hermit','Wheel of Fortune','Justice','The Hanged Man','Death','Temperance','The Devil','The Tower','The Star','The Moon','The Sun','Judgement','The World','Ace of Wands','Two of Wands','Ace of Cups','Two of Cups','Ace of Swords','Ace of Pentacles','Page of Wands','Knight of Cups']

function compressImage(file, maxSize=800) {
  return new Promise((res,rej)=>{
    const reader=new FileReader()
    reader.onload=e=>{
      const img=new Image()
      img.onload=()=>{
        let w=img.naturalWidth,h=img.naturalHeight
        if(w>maxSize||h>maxSize){if(w>h){h=Math.round(h*maxSize/w);w=maxSize}else{w=Math.round(w*maxSize/h);h=maxSize}}
        const c=document.createElement('canvas');c.width=w;c.height=h
        c.getContext('2d').drawImage(img,0,0,w,h)
        res(c.toDataURL('image/jpeg',0.82).split(',')[1])
      }
      img.onerror=rej; img.src=e.target.result
    }
    reader.onerror=rej; reader.readAsDataURL(file)
  })
}

// ══════════════════════════════════════════════
// NAV COMPONENT (inlined)
// ══════════════════════════════════════════════
function Nav({t, lang, onLangChange, onNav, currentPage}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const svcs = [{id:'palm',e:'🤚'},{id:'kundli',e:'⭐'},{id:'tarot',e:'🃏'},{id:'numerology',e:'🔢'},{id:'face',e:'👁'},{id:'dream',e:'💭'}]
  const LANGS = [{code:'en',label:'EN'},{code:'hi',label:'हि'},{code:'gu',label:'ગુ'},{code:'ta',label:'த'}]
  return (
    <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:1000,background:'rgba(250,247,242,0.96)',backdropFilter:'blur(12px)',borderBottom:'1px solid var(--border)',height:66,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',boxShadow:'0 2px 20px var(--shadow)'}}>
      <button onClick={()=>onNav('home')} style={{fontFamily:'var(--serif)',fontSize:24,fontWeight:700,color:'var(--saffron)',background:'none',border:'none',cursor:'pointer'}}>
        Vedic<span style={{color:'var(--terracotta)'}}>AI</span>
      </button>
      <div style={{display:'flex',gap:2,alignItems:'center',flexWrap:'wrap'}}>
        {svcs.map(s=>(
          <button key={s.id} onClick={()=>onNav(s.id)} style={{fontSize:13,fontWeight:500,color:currentPage===s.id?'var(--saffron)':'var(--ink3)',padding:'5px 8px',borderRadius:6,cursor:'pointer',transition:'all .18s',background:'none',border:'none'}}>
            {s.e} {t.nav[s.id]}
          </button>
        ))}
      </div>
      <div style={{display:'flex',gap:6,alignItems:'center'}}>
        <div style={{display:'flex',gap:3,background:'var(--bg2)',borderRadius:8,padding:3,border:'1px solid var(--border)'}}>
          {LANGS.map(l=>(
            <button key={l.code} onClick={()=>onLangChange(l.code)} style={{padding:'4px 8px',borderRadius:6,cursor:'pointer',border:'none',fontSize:12,fontWeight:700,background:lang===l.code?'var(--saffron)':'transparent',color:lang===l.code?'#fff':'var(--ink3)',transition:'all .15s'}}>
              {l.label}
            </button>
          ))}
        </div>
        <button onClick={()=>onNav('palm')} style={{fontSize:13,fontWeight:700,background:'var(--saffron)',color:'#fff',padding:'8px 16px',borderRadius:8,cursor:'pointer',border:'none',boxShadow:'0 4px 14px rgba(212,98,26,.3)'}}>
          {t.nav.startFree}
        </button>
      </div>
    </nav>
  )
}

// ══════════════════════════════════════════════
// PAYMENT MODAL (inlined)
// ══════════════════════════════════════════════
function PaymentModal({service, result, userName, lang, t, onClose, onSuccess}) {
  const p = t.payment
  const [step, setStep] = useState('choose')
  const [payMethod, setPayMethod] = useState('razorpay')
  const [deliveryMethods, setDeliveryMethods] = useState(['inapp'])
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [statusMsg, setStatusMsg] = useState('')
  const [pdfBase64, setPdfBase64] = useState(null)
  const [error, setError] = useState('')

  function toggleDelivery(m) {
    setDeliveryMethods(prev=>prev.includes(m)?prev.filter(x=>x!==m):[...prev,m])
  }

  async function deliverReport() {
    setStatusMsg(p.success)
    if(deliveryMethods.includes('whatsapp')&&phone){
      setStatusMsg(p.whatsappSending)
      const r=await fetch('/api/deliver/whatsapp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone,service,result,userName,lang})})
      const d=await r.json(); if(d.pdfBase64) setPdfBase64(d.pdfBase64)
    }
    if(deliveryMethods.includes('email')&&email){
      setStatusMsg(p.emailSending)
      const r=await fetch('/api/deliver/email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,service,result,userName,lang})})
      const d=await r.json(); if(d.pdfBase64&&!pdfBase64) setPdfBase64(d.pdfBase64)
    }
    setStatusMsg(p.delivered); setStep('done'); onSuccess?.()
  }

  async function handlePay() {
    setStep('processing'); setStatusMsg(p.processing)
    try {
      if(payMethod==='razorpay'){
        const r=await fetch('/api/payment/razorpay',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({service,lang})})
        const order=await r.json(); if(order.error) throw new Error(order.error)
        await new Promise((res,rej)=>{
          const rzp=new window.Razorpay({key:order.keyId,amount:order.amount,currency:order.currency,order_id:order.orderId,name:'VedicAI',description:`${service} Reading`,theme:{color:'#D4621A'},
            handler:async(resp)=>{const v=await fetch('/api/payment/razorpay',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(resp)});const vd=await v.json();vd.verified?res():rej(new Error('Verification failed'))},
            modal:{ondismiss:()=>rej(new Error('Payment cancelled'))}})
          rzp.open()
        })
      } else if(payMethod==='stripe'){
        const r=await fetch('/api/payment/stripe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({service,lang})})
        const d=await r.json(); if(d.error) throw new Error(d.error)
        const stripe=window.Stripe(d.publishableKey)
        const {error:se}=await stripe.confirmCardPayment(d.clientSecret,{payment_method:{card:{token:'tok_visa'},billing_details:{name:userName||'Customer'}}})
        if(se) throw new Error(se.message)
      } else {
        const r=await fetch('/api/payment/paypal',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({service,lang})})
        const d=await r.json(); if(d.error) throw new Error(d.error)
        const popup=window.open(`https://www.sandbox.paypal.com/checkoutnow?token=${d.orderId}`,'paypal','width=600,height=700')
        await new Promise((res,rej)=>{
          const timer=setInterval(async()=>{
            if(popup.closed){clearInterval(timer)
              const cr=await fetch('/api/payment/paypal',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId:d.orderId})})
              const cd=await cr.json(); cd.verified?res():rej(new Error('Payment not completed'))}
          },1000)
          setTimeout(()=>{clearInterval(timer);rej(new Error('Timeout'))},300000)
        })
      }
      await deliverReport()
    } catch(err){ setError(err.message); setStep('error') }
  }

  const payMethods=[
    {id:'razorpay',icon:'₹',bg:'linear-gradient(135deg,#3395FF,#0070BA)',label:p.upiLabel,sub:'GPay · PhonePe · Paytm · UPI'},
    {id:'stripe',icon:'💳',bg:'linear-gradient(135deg,#635BFF,#4B42E0)',label:p.stripeLabel,sub:'Visa · Mastercard · Google Pay'},
    {id:'paypal',icon:'P',bg:'linear-gradient(135deg,#003087,#009CDE)',label:p.paypalLabel,sub:'PayPal balance · Cards'},
  ]

  return (
    <div style={{position:'fixed',inset:0,zIndex:9000,background:'rgba(28,20,16,.75)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:'var(--bg)',borderRadius:20,width:'100%',maxWidth:500,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 24px 80px rgba(100,60,30,.3)'}}>
        <div style={{background:'var(--saffron)',padding:'24px 28px',borderRadius:'20px 20px 0 0',position:'relative'}}>
          <button onClick={onClose} style={{position:'absolute',top:14,right:14,background:'rgba(255,255,255,.2)',border:'none',color:'#fff',width:30,height:30,borderRadius:'50%',cursor:'pointer',fontSize:16}}>×</button>
          <div style={{fontFamily:'var(--serif)',fontSize:22,fontWeight:700,color:'#fff'}}>{p.title}</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,.75)',marginTop:4}}>{p.subtitle}</div>
        </div>
        <div style={{padding:'22px 24px'}}>
          {step==='choose'&&<>
            <div style={{display:'flex',gap:10,marginBottom:18}}>
              <div style={{flex:1,textAlign:'center',padding:'10px',background:'rgba(212,98,26,.08)',border:'2px solid rgba(212,98,26,.25)',borderRadius:12}}>
                <div style={{fontSize:10,fontWeight:700,color:'var(--saffron)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:3}}>India 🇮🇳</div>
                <div style={{fontFamily:'var(--serif)',fontSize:24,fontWeight:700,color:'var(--ink)'}}>{p.priceIndia}</div>
              </div>
              <div style={{flex:1,textAlign:'center',padding:'10px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12}}>
                <div style={{fontSize:10,fontWeight:700,color:'var(--muted)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:3}}>International 🌍</div>
                <div style={{fontFamily:'var(--serif)',fontSize:24,fontWeight:700,color:'var(--ink)'}}>{p.priceIntl}</div>
              </div>
            </div>
            <div style={{marginBottom:16}}>
              {payMethods.map(pm=>(
                <button key={pm.id} onClick={()=>setPayMethod(pm.id)} style={{width:'100%',padding:'13px 16px',border:`2px solid ${payMethod===pm.id?'var(--saffron)':'var(--border)'}`,borderRadius:10,background:payMethod===pm.id?'rgba(212,98,26,.06)':'var(--card-bg)',cursor:'pointer',display:'flex',alignItems:'center',gap:12,marginBottom:8,transition:'all .18s'}}>
                  <div style={{width:36,height:36,borderRadius:8,background:pm.bg,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:16,flexShrink:0}}>{pm.icon}</div>
                  <div style={{textAlign:'left'}}>
                    <div style={{fontWeight:700,fontSize:14,color:'var(--ink)'}}>{pm.label}</div>
                    <div style={{fontSize:12,color:'var(--muted)'}}>{pm.sub}</div>
                  </div>
                </button>
              ))}
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:'var(--muted)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8}}>{p.deliveryTitle}</div>
              <div style={{display:'flex',gap:6,marginBottom:10}}>
                {['whatsapp','email','inapp'].map(m=>(
                  <button key={m} onClick={()=>toggleDelivery(m)} style={{flex:1,padding:'8px 4px',borderRadius:8,cursor:'pointer',border:`2px solid ${deliveryMethods.includes(m)?'var(--saffron)':'var(--border)'}`,background:deliveryMethods.includes(m)?'rgba(212,98,26,.07)':'var(--card-bg)',fontSize:12,fontWeight:700,color:deliveryMethods.includes(m)?'var(--saffron)':'var(--muted)',transition:'all .18s'}}>
                    {m==='whatsapp'?'📱 WA':m==='email'?'📧 Email':'📲 App'}
                  </button>
                ))}
              </div>
              {deliveryMethods.includes('whatsapp')&&<input className="f-input" placeholder={p.whatsappPlaceholder} value={phone} onChange={e=>setPhone(e.target.value)} style={{marginBottom:8,fontSize:15}}/>}
              {deliveryMethods.includes('email')&&<input className="f-input" type="email" placeholder={p.emailPlaceholder} value={email} onChange={e=>setEmail(e.target.value)} style={{fontSize:15}}/>}
            </div>
            <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,padding:'12px 16px',marginBottom:16}}>
              {p.features.map((f,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,fontSize:13,color:'var(--ink3)'}}><span style={{color:'var(--saffron)'}}>✓</span>{f}</div>)}
            </div>
            <button className="btn-primary" style={{width:'100%',justifyContent:'center',fontSize:16,padding:14}} onClick={handlePay}>
              {p.payNow} {payMethod==='razorpay'?p.priceIndia:p.priceIntl}
            </button>
            <div style={{textAlign:'center',fontSize:12,color:'var(--muted)',marginTop:10}}>{p.secureNote}</div>
          </>}
          {step==='processing'&&<div style={{textAlign:'center',padding:'32px 0'}}>
            <div className="ring-wrap" style={{margin:'0 auto 20px'}}><div className="r1"/><div className="r2"/><div className="r3"/><span>💳</span></div>
            <div style={{fontFamily:'var(--serif)',fontSize:20,fontWeight:700,color:'var(--saffron)',marginBottom:8}}>{statusMsg}</div>
            <div style={{fontSize:14,color:'var(--muted)'}}>Please do not close this window</div>
          </div>}
          {step==='done'&&<div style={{textAlign:'center',padding:'24px 0'}}>
            <div style={{fontSize:52,marginBottom:12}}>✨</div>
            <div style={{fontFamily:'var(--serif)',fontSize:24,fontWeight:700,color:'var(--ink)',marginBottom:6}}>Report Delivered!</div>
            <div style={{fontSize:14,color:'var(--muted)',marginBottom:20,lineHeight:1.7}}>
              {deliveryMethods.includes('whatsapp')&&phone&&<div>📱 WhatsApp: <strong>{phone}</strong></div>}
              {deliveryMethods.includes('email')&&email&&<div>📧 Email: <strong>{email}</strong></div>}
            </div>
            <div style={{display:'flex',gap:10,justifyContent:'center'}}>
              {pdfBase64&&<button className="btn-primary" onClick={()=>{const a=document.createElement('a');a.href=`data:application/pdf;base64,${pdfBase64}`;a.download=`VedicAI_${service}.pdf`;a.click()}}>⬇ Download PDF</button>}
              <button className="btn-secondary" onClick={onClose}>View Reading →</button>
            </div>
          </div>}
          {step==='error'&&<div style={{textAlign:'center',padding:'24px 0'}}>
            <div style={{fontSize:42,marginBottom:12}}>⚠️</div>
            <div style={{fontFamily:'var(--serif)',fontSize:20,fontWeight:700,color:'var(--terracotta)',marginBottom:8}}>Payment Issue</div>
            <div style={{fontSize:14,color:'var(--muted)',marginBottom:20}}>{error}</div>
            <div style={{display:'flex',gap:10,justifyContent:'center'}}>
              <button className="btn-primary" onClick={()=>{setStep('choose');setError('')}}>Try Again</button>
              <button className="btn-secondary" onClick={onClose}>Cancel</button>
            </div>
          </div>}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════
export default function VedicAIApp() {
  const [lang, setLang] = useState(DEFAULT_LANG)
  const t = translations[lang] || translations[DEFAULT_LANG]
  const [page, setPage] = useState('home')
  const [payModal, setPayModal] = useState(null)
  const [unlockedReports, setUnlockedReports] = useState({})
  const [svcState, setSvcState] = useState({
    palm:       {step:'upload',imageBase64:null,previewUrl:null,loading:false,result:null,error:null,loadMsg:''},
    kundli:     {step:'form',loading:false,result:null,error:null},
    tarot:      {step:'setup',spread:1,drawnCards:[],deck:[],loading:false,result:null,error:null},
    numerology: {step:'form',loading:false,result:null,error:null},
    face:       {step:'upload',imageBase64:null,previewUrl:null,loading:false,result:null,error:null,loadMsg:''},
    dream:      {step:'form',emotion:null,recurring:false,loading:false,result:null,error:null},
  })
  const [kundliForm, setKundliForm] = useState({name:'',dob:'',tob:'',pob:'',gender:'Male'})
  const [numForm, setNumForm]       = useState({name:'',dob:''})
  const [dreamForm, setDreamForm]   = useState({text:''})

  const upd = useCallback((svc,changes)=>setSvcState(prev=>({...prev,[svc]:{...prev[svc],...changes}})),[])

  async function handleImageUpload(file,svc) {
    if(!file?.type?.startsWith('image/')) return
    const base64=await compressImage(file)
    upd(svc,{imageBase64:base64,previewUrl:URL.createObjectURL(file),step:'preview'})
  }

  async function analyze(svc,body) {
    upd(svc,{loading:true,step:'loading',error:null})
    const msgs=t.loading[svc]||['Loading...']
    let mi=0; upd(svc,{loadMsg:msgs[0]})
    const iv=setInterval(()=>{mi=(mi+1)%msgs.length;upd(svc,{loadMsg:msgs[mi]})},1600)
    try {
      const res=await fetch(`/api/analyze/${svc}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,lang})})
      const data=await res.json()
      clearInterval(iv)
      if(data.error){upd(svc,{loading:false,step:'error',error:data.error});return}
      upd(svc,{loading:false,result:data.result,step:'result'})
    } catch(err){ clearInterval(iv); upd(svc,{loading:false,step:'error',error:err.message}) }
  }

  function reset(svc) {
    const step=['palm','face'].includes(svc)?'upload':svc==='tarot'?'setup':'form'
    setSvcState(prev=>({...prev,[svc]:{step,imageBase64:null,previewUrl:null,loading:false,result:null,error:null,loadMsg:'',spread:1,drawnCards:[],deck:[]}}))
    setUnlockedReports(prev=>({...prev,[svc]:false}))
  }

  function goTo(p){setPage(p);window.scrollTo({top:0,behavior:'smooth'})}

  function LoadingScreen({svc,emoji}) {
    return (
      <div style={{textAlign:'center',padding:'60px 0'}}>
        <div className="ring-wrap"><div className="r1"/><div className="r2"/><div className="r3"/><span>{emoji}</span></div>
        <div style={{fontFamily:'var(--serif)',fontSize:20,fontWeight:700,color:'var(--saffron)',marginBottom:8}}>{svcState[svc].loadMsg}</div>
        <div style={{fontSize:14,color:'var(--muted)',fontStyle:'italic'}}>"The cosmos is aligning your reading..."</div>
      </div>
    )
  }

  function ResultGate({svc,summaryItems,badgeText,title}) {
    const s=svcState[svc]; const unlocked=unlockedReports[svc]
    const name=kundliForm.name||numForm.name||''
    return (
      <div style={{textAlign:'center'}}>
        <div className="result-badge">✦ {badgeText}</div>
        {title&&<h2 style={{fontFamily:'var(--serif)',fontSize:24,fontWeight:700,color:'var(--ink)',marginBottom:12}}>{title}</h2>}
        <div className="result-grid" style={{marginBottom:14}}>
          {summaryItems.map((item,i)=>(
            <div key={i} className="result-card">
              <div className="rc-label">{item.label}</div>
              <div className="rc-text">{item.text}</div>
            </div>
          ))}
        </div>
        {!unlocked?(
          <div className="gate-wrap">
            <div className="gate-blur">{(s.result?.detailed_report||'').slice(0,240)}...</div>
            <div className="gate-footer">
              <p className="gate-title">{t.results.unlockBtn}</p>
              {t.results.features.map((f,i)=><div key={i} className="gate-feat"><span className="gate-feat-dot"/>{f}</div>)}
              <button className="btn-primary" style={{marginTop:16}} onClick={()=>setPayModal({svc,result:s.result,name})}>
                🔓 {t.results.unlockBtn}
              </button>
            </div>
          </div>
        ):(
          <div style={{background:'var(--card-bg)',border:'1px solid var(--border)',borderRadius:14,padding:22,marginBottom:16,textAlign:'left',maxHeight:400,overflowY:'auto',boxShadow:'0 2px 12px var(--shadow)'}}>
            <div style={{fontSize:11,fontWeight:700,color:'var(--saffron)',letterSpacing:'.12em',textTransform:'uppercase',marginBottom:12}}>✦ Full Report Unlocked</div>
            {(s.result?.detailed_report||'').split('\n\n').map((p,i)=>(
              <p key={i} style={{fontSize:16,color:'var(--ink3)',marginBottom:12,lineHeight:1.85}}>{p}</p>
            ))}
          </div>
        )}
        <button className="btn-secondary" style={{marginTop:10}} onClick={()=>reset(svc)}>{t.form.newReading}</button>
      </div>
    )
  }

  function PageHero({svc,accent='var(--saffron)'}) {
    const d=t.services[svc]
    return (
      <div style={{padding:'72px 28px 52px',textAlign:'center',borderBottom:'1px solid var(--border)',background:'linear-gradient(160deg,var(--bg2) 0%,var(--bg) 60%)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',right:-30,top:'50%',transform:'translateY(-50%)',fontFamily:'serif',fontSize:260,color:'rgba(212,98,26,.04)',lineHeight:1,pointerEvents:'none',userSelect:'none',fontWeight:700}}>OM</div>
        <p style={{fontSize:13,fontWeight:700,color:accent,letterSpacing:'.14em',textTransform:'uppercase',marginBottom:10}}>{d?.skt}</p>
        <h1 style={{fontFamily:'var(--serif)',fontSize:'clamp(34px,6vw,64px)',fontWeight:700,color:'var(--ink)',marginBottom:12,letterSpacing:'-.02em',lineHeight:1.1}}>{d?.name}</h1>
        <p style={{fontSize:18,color:'var(--muted)',maxWidth:500,margin:'0 auto',lineHeight:1.75}}>{d?.desc}</p>
      </div>
    )
  }

  // ── PALM ────────────────────────────────────
  function PalmPage() {
    const s=svcState.palm
    return <div className="page-content">
      <PageHero svc="palm"/>
      <div style={{maxWidth:620,margin:'0 auto',padding:'48px 24px'}}>
        {s.step==='upload'&&<>
          <label style={{cursor:'pointer'}}>
            <div className="upload-zone">
              <div style={{fontSize:56,marginBottom:14,animation:'floatY 3s ease-in-out infinite'}}>🤚</div>
              <p style={{fontFamily:'var(--serif)',fontSize:24,fontWeight:700,color:'var(--ink)',marginBottom:8}}>{t.form.uploadPalm}</p>
              <p style={{fontSize:15,color:'var(--muted)',marginBottom:20}}>JPG · PNG · WEBP</p>
              <div className="btn-primary" style={{pointerEvents:'none'}}>{t.form.choosePhoto}</div>
            </div>
            <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleImageUpload(e.target.files[0],'palm')}/>
          </label>
          <div className="card" style={{marginTop:18}}><p style={{fontSize:15,fontWeight:700,color:'var(--ink)',marginBottom:10}}>{t.form.tipTitle}</p><p style={{fontSize:15,color:'var(--muted)',lineHeight:1.8,whiteSpace:'pre-line'}}>{t.form.palmTips}</p></div>
        </>}
        {s.step==='preview'&&<div style={{textAlign:'center'}}>
          <img src={s.previewUrl} alt="palm" style={{width:'100%',maxWidth:320,borderRadius:14,border:'2px solid var(--border)',display:'block',margin:'0 auto 14px',boxShadow:'0 8px 28px var(--shadow)'}}/>
          <div style={{display:'flex',gap:12,justifyContent:'center'}}>
            <button className="btn-secondary" onClick={()=>reset('palm')}>{t.form.retake}</button>
            <button className="btn-primary" onClick={()=>analyze('palm',{imageBase64:s.imageBase64})}>{t.form.beginReading}</button>
          </div>
        </div>}
        {s.step==='loading'&&<LoadingScreen svc="palm" emoji="🤚"/>}
        {s.step==='result'&&s.result&&<ResultGate svc="palm" badgeText={`${s.result.dominant_trait||''} · ${s.result.lucky_element||''}`} title="Your Palm Reading" summaryItems={[{label:t.results.life,text:s.result.summary?.life||''},{label:t.results.finance,text:s.result.summary?.finance||''},{label:t.results.love,text:s.result.summary?.relationships||''}]}/>}
        {s.step==='error'&&<><div className="status-error">{s.error}</div><button className="btn-secondary" style={{marginTop:14}} onClick={()=>reset('palm')}>{t.form.retake}</button></>}
      </div>
    </div>
  }

  // ── KUNDLI ──────────────────────────────────
  function KundliPage() {
    const s=svcState.kundli
    return <div className="page-content">
      <PageHero svc="kundli" accent="#B89A2A"/>
      <div style={{maxWidth:540,margin:'0 auto',padding:'48px 24px'}}>
        {s.step==='form'&&<>
          <div className="f-group"><label className="f-label">{t.form.name}</label><input className="f-input" placeholder={t.form.namePlaceholder} value={kundliForm.name} onChange={e=>setKundliForm(p=>({...p,name:e.target.value}))}/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div className="f-group"><label className="f-label">{t.form.dob}</label><input type="date" className="f-input" value={kundliForm.dob} onChange={e=>setKundliForm(p=>({...p,dob:e.target.value}))}/></div>
            <div className="f-group"><label className="f-label">{t.form.tob}</label><input type="time" className="f-input" value={kundliForm.tob} onChange={e=>setKundliForm(p=>({...p,tob:e.target.value}))}/></div>
          </div>
          <div className="f-group"><label className="f-label">{t.form.pob}</label><input className="f-input" placeholder={t.form.pobPlaceholder} value={kundliForm.pob} onChange={e=>setKundliForm(p=>({...p,pob:e.target.value}))}/></div>
          <div className="f-group">
            <label className="f-label">{t.form.gender}</label>
            <div style={{display:'flex',gap:10}}>
              {[t.form.male,t.form.female,t.form.other].map(g=>(
                <button key={g} onClick={()=>setKundliForm(p=>({...p,gender:g}))} style={{flex:1,padding:12,borderRadius:10,cursor:'pointer',fontFamily:'var(--sans)',fontSize:15,fontWeight:600,background:kundliForm.gender===g?'rgba(212,98,26,.08)':'var(--card-bg)',border:`2px solid ${kundliForm.gender===g?'rgba(212,98,26,.3)':'var(--border)'}`,color:kundliForm.gender===g?'var(--saffron)':'var(--muted)',transition:'all .18s'}}>{g}</button>
              ))}
            </div>
          </div>
          <button className="btn-primary" style={{width:'100%',justifyContent:'center',fontSize:17,padding:15}} onClick={()=>analyze('kundli',{...kundliForm})} disabled={!kundliForm.dob||!kundliForm.pob}>{t.form.generateKundli}</button>
        </>}
        {s.step==='loading'&&<LoadingScreen svc="kundli" emoji="⭐"/>}
        {s.step==='result'&&s.result&&<ResultGate svc="kundli" badgeText={`${s.result.rashi||''} · ${s.result.nakshatra||''}`} title="Your Vedic Birth Chart" summaryItems={[{label:t.results.career,text:s.result.summary?.career||''},{label:t.results.relationships,text:s.result.summary?.relationships||''},{label:t.results.health,text:s.result.summary?.health||''}]}/>}
        {s.step==='error'&&<div className="status-error">{s.error}</div>}
      </div>
    </div>
  }

  // ── TAROT ────────────────────────────────────
  function TarotPage() {
    const s=svcState.tarot
    function startDraw(){upd('tarot',{step:'draw',deck:[...TAROT_CARDS].sort(()=>Math.random()-.5).slice(0,14),drawnCards:[]})}
    function drawCard(card){
      if(s.drawnCards.length>=s.spread) return
      const nd=[...s.drawnCards,card]; upd('tarot',{drawnCards:nd})
      if(nd.length>=s.spread) setTimeout(()=>analyze('tarot',{cards:nd,spread:s.spread}),500)
    }
    return <div className="page-content">
      <PageHero svc="tarot" accent="var(--plum)"/>
      <div style={{maxWidth:660,margin:'0 auto',padding:'48px 24px'}}>
        {s.step==='setup'&&<>
          <p style={{fontFamily:'var(--serif)',fontSize:20,fontWeight:700,color:'var(--ink)',marginBottom:14,textAlign:'center'}}>Choose Your Spread</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:24}}>
            {[1,3,5].map(n=>(
              <button key={n} className={`spread-btn ${s.spread===n?'active':''}`} onClick={()=>upd('tarot',{spread:n})}>
                <p style={{fontWeight:700,fontSize:15,color:'var(--ink)',marginBottom:3}}>{n===1?t.form.spreadSingle:n===3?t.form.spreadThree:t.form.spreadCeltic}</p>
                <p style={{fontSize:13,color:'var(--muted)'}}>{n} card{n>1?'s':''}</p>
              </button>
            ))}
          </div>
          <button className="btn-primary" style={{width:'100%',justifyContent:'center',fontSize:17,padding:15}} onClick={startDraw}>{t.form.shuffleDeck}</button>
        </>}
        {s.step==='draw'&&<div style={{textAlign:'center'}}>
          <p style={{fontFamily:'var(--serif)',fontSize:20,fontWeight:700,color:'var(--ink)',marginBottom:8}}>{s.drawnCards.length<s.spread?`Draw ${s.spread-s.drawnCards.length} more`:'Cards drawn! ✓'}</p>
          {s.drawnCards.length>0&&<div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap',marginBottom:20}}>
            {s.drawnCards.map((c,i)=><div key={i} style={{background:'rgba(106,45,106,.08)',border:'2px solid rgba(106,45,106,.3)',padding:'8px 10px',borderRadius:10,textAlign:'center',minWidth:72}}><div style={{fontSize:22,marginBottom:4}}>🃏</div><p style={{fontSize:11,fontWeight:700,color:'var(--plum)',lineHeight:1.3}}>{c}</p></div>)}
          </div>}
          <div style={{display:'flex',gap:7,flexWrap:'wrap',justifyContent:'center'}}>
            {s.deck.map((card,i)=><button key={i} onClick={()=>drawCard(card)} style={{width:58,height:84,borderRadius:7,cursor:'pointer',border:'2px solid rgba(106,45,106,.2)',background:'linear-gradient(145deg,#f5ede0,#ede0d0)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,color:'rgba(106,45,106,.35)',transition:'all .18s',opacity:s.drawnCards.includes(card)?.3:1,pointerEvents:s.drawnCards.includes(card)?'none':'auto'}}>✦</button>)}
          </div>
        </div>}
        {s.step==='loading'&&<LoadingScreen svc="tarot" emoji="🃏"/>}
        {s.step==='result'&&s.result&&<ResultGate svc="tarot" badgeText={s.result.overall_energy||'Cosmic Reading'} title="Your Tarot Reading" summaryItems={[{label:t.results.past,text:s.result.summary?.past||''},{label:t.results.present,text:s.result.summary?.present||''},{label:t.results.future,text:s.result.summary?.future||''}]}/>}
        {s.step==='error'&&<div className="status-error">{s.error}</div>}
      </div>
    </div>
  }

  // ── NUMEROLOGY ───────────────────────────────
  function NumerologyPage() {
    const s=svcState.numerology
    return <div className="page-content">
      <PageHero svc="numerology" accent="var(--sage)"/>
      <div style={{maxWidth:500,margin:'0 auto',padding:'48px 24px'}}>
        {s.step==='form'&&<>
          <div className="f-group"><label className="f-label">{t.form.name}</label><input className="f-input" placeholder={t.form.namePlaceholder} value={numForm.name} onChange={e=>setNumForm(p=>({...p,name:e.target.value}))}/></div>
          <div className="f-group"><label className="f-label">{t.form.dob}</label><input type="date" className="f-input" value={numForm.dob} onChange={e=>setNumForm(p=>({...p,dob:e.target.value}))}/></div>
          <button className="btn-primary" style={{width:'100%',justifyContent:'center',fontSize:17,padding:15}} onClick={()=>analyze('numerology',{...numForm})} disabled={!numForm.name||!numForm.dob}>{t.form.calculateNumbers}</button>
        </>}
        {s.step==='loading'&&<LoadingScreen svc="numerology" emoji="🔢"/>}
        {s.step==='result'&&s.result&&<>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:18,textAlign:'center'}}>
            {[{v:s.result.life_path_number,l:'Life Path',c:'var(--sage)'},{v:s.result.destiny_number,l:'Destiny',c:'var(--saffron)'},{v:s.result.soul_urge_number,l:'Soul Urge',c:'var(--plum)'},{v:s.result.personality_number,l:'Personality',c:'var(--teal)'},{v:s.result.birth_day_number,l:'Birth Day',c:'var(--terracotta)'},{v:(s.result.lucky_numbers||[]).join('·'),l:'Lucky',c:'var(--saffron)'}].map((n,i)=>(
              <div key={i} className="num-box"><div className="num-val" style={{color:n.c}}>{n.v}</div><div className="num-label">{n.l}</div></div>
            ))}
          </div>
          <ResultGate svc="numerology" badgeText={`Life Path ${s.result.life_path_number}`} title="" summaryItems={[{label:t.results.purpose,text:s.result.summary?.purpose||''},{label:t.results.strengths,text:s.result.summary?.strengths||''},{label:t.results.challenges,text:s.result.summary?.challenges||''}]}/>
        </>}
        {s.step==='error'&&<div className="status-error">{s.error}</div>}
      </div>
    </div>
  }

  // ── FACE ────────────────────────────────────
  function FacePage() {
    const s=svcState.face
    return <div className="page-content">
      <PageHero svc="face" accent="var(--teal)"/>
      <div style={{maxWidth:620,margin:'0 auto',padding:'48px 24px'}}>
        {s.step==='upload'&&<>
          <label style={{cursor:'pointer'}}>
            <div className="upload-zone">
              <div style={{fontSize:56,marginBottom:14,animation:'floatY 3.5s ease-in-out infinite'}}>👁</div>
              <p style={{fontFamily:'var(--serif)',fontSize:24,fontWeight:700,color:'var(--ink)',marginBottom:8}}>{t.form.uploadFace}</p>
              <p style={{fontSize:15,color:'var(--muted)',marginBottom:20}}>JPG · PNG · WEBP</p>
              <div className="btn-primary" style={{pointerEvents:'none'}}>{t.form.choosePhoto}</div>
            </div>
            <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleImageUpload(e.target.files[0],'face')}/>
          </label>
          <div className="card" style={{marginTop:18}}><p style={{fontSize:15,fontWeight:700,color:'var(--ink)',marginBottom:10}}>{t.form.tipTitle}</p><p style={{fontSize:15,color:'var(--muted)',lineHeight:1.8,whiteSpace:'pre-line'}}>{t.form.faceTips}</p></div>
        </>}
        {s.step==='preview'&&<div style={{textAlign:'center'}}>
          <img src={s.previewUrl} alt="face" style={{width:'100%',maxWidth:280,borderRadius:16,border:'2px solid var(--border)',display:'block',margin:'0 auto 14px',boxShadow:'0 8px 28px var(--shadow)'}}/>
          <div style={{display:'flex',gap:12,justifyContent:'center'}}>
            <button className="btn-secondary" onClick={()=>reset('face')}>{t.form.retake}</button>
            <button className="btn-primary" onClick={()=>analyze('face',{imageBase64:s.imageBase64})}>👁 {t.form.beginReading}</button>
          </div>
        </div>}
        {s.step==='loading'&&<LoadingScreen svc="face" emoji="👁"/>}
        {s.step==='result'&&s.result&&<ResultGate svc="face" badgeText={`${s.result.dominant_trait||''} · ${s.result.element||''}`} title="Your Face Reading" summaryItems={[{label:t.results.personality,text:s.result.summary?.personality||''},{label:t.results.career,text:s.result.summary?.career||''},{label:t.results.relationships,text:s.result.summary?.relationships||''}]}/>}
        {s.step==='error'&&<div className="status-error">{s.error}</div>}
      </div>
    </div>
  }

  // ── DREAM ───────────────────────────────────
  function DreamPage() {
    const s=svcState.dream
    return <div className="page-content">
      <PageHero svc="dream" accent="var(--rose)"/>
      <div style={{maxWidth:600,margin:'0 auto',padding:'48px 24px'}}>
        {s.step==='form'&&<>
          <div className="f-group"><label className="f-label">{t.form.dreamHint}</label><textarea className="f-input" rows={5} placeholder={t.form.dreamPlaceholder} value={dreamForm.text} onChange={e=>setDreamForm(p=>({...p,text:e.target.value}))} style={{resize:'vertical',lineHeight:1.75}}/></div>
          <div className="f-group">
            <label className="f-label">{t.form.feelLabel}</label>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {t.form.emotions.map(emo=><button key={emo} className={`emo-btn ${s.emotion===emo?'active':''}`} onClick={()=>upd('dream',{emotion:emo})}>{emo}</button>)}
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:24}}>
            <div className={`toggle ${s.recurring?'on':''}`} onClick={()=>upd('dream',{recurring:!s.recurring})}><div className="toggle-knob"/></div>
            <span style={{fontSize:16,fontWeight:500,color:'var(--ink3)'}}>{t.form.recurring}</span>
          </div>
          <button className="btn-primary" style={{width:'100%',justifyContent:'center',fontSize:17,padding:15}} onClick={()=>analyze('dream',{dreamText:dreamForm.text,emotion:s.emotion,recurring:s.recurring})} disabled={!dreamForm.text.trim()}>{t.form.interpretDream}</button>
        </>}
        {s.step==='loading'&&<LoadingScreen svc="dream" emoji="💭"/>}
        {s.step==='result'&&s.result&&<>
          <div style={{background:'rgba(138,58,90,.07)',border:'1px solid rgba(138,58,90,.18)',borderRadius:14,padding:'16px 20px',marginBottom:16,textAlign:'center'}}>
            <p style={{fontSize:11,fontWeight:800,color:'var(--rose)',letterSpacing:'.12em',textTransform:'uppercase',marginBottom:6}}>{t.results.cosmicMessage}</p>
            <p style={{fontFamily:'var(--serif)',fontSize:18,fontStyle:'italic',color:'var(--ink)',lineHeight:1.65}}>{s.result.cosmic_message}</p>
          </div>
          <ResultGate svc="dream" badgeText={`Chakra: ${s.result.chakra_affected||'Ajna'}`} title="Your Dream Interpretation" summaryItems={[{label:t.results.subconscious,text:s.result.summary?.subconscious||''},{label:t.results.spiritual,text:s.result.summary?.spiritual||''},{label:t.results.action,text:s.result.summary?.action||''}]}/>
        </>}
        {s.step==='error'&&<div className="status-error">{s.error}</div>}
      </div>
    </div>
  }

  // ── HOME ────────────────────────────────────
  const svcs=[{id:'palm',e:'🤚',accent:'#D4621A',tag:'Most Popular'},{id:'kundli',e:'⭐',accent:'#B89A2A',tag:null},{id:'tarot',e:'🃏',accent:'#6A2D6A',tag:null},{id:'numerology',e:'🔢',accent:'#5A7A5A',tag:null},{id:'face',e:'👁',accent:'#2A6B7A',tag:null},{id:'dream',e:'💭',accent:'#8A3A5A',tag:null}]
  const h=t.home

  function HomePage() {
    return <div className="page-content">
      <div style={{background:'var(--saffron)',overflow:'hidden',whiteSpace:'nowrap',padding:'10px 0'}}>
        <div style={{display:'inline-block',animation:'ticker 36s linear infinite',fontSize:13,fontWeight:600,color:'rgba(255,255,255,.75)',letterSpacing:'.14em',textTransform:'uppercase'}}>{h.badge+' · '+Object.values(t.services).map(s=>s.name).join(' · ')+' · '}{h.badge+' · '+Object.values(t.services).map(s=>s.name).join(' · ')+' · '}</div>
      </div>
      <section style={{minHeight:'90vh',display:'flex',alignItems:'center',position:'relative',overflow:'hidden',background:'linear-gradient(150deg,#FAF7F2 0%,#F4EFE6 40%,#EDE5D8 100%)',padding:'60px 28px'}}>
        <div style={{position:'absolute',right:-30,top:'50%',transform:'translateY(-50%)',fontFamily:'serif',fontSize:'clamp(180px,25vw,360px)',color:'rgba(212,98,26,.05)',lineHeight:1,pointerEvents:'none',userSelect:'none',fontWeight:700}}>OM</div>
        <div style={{position:'relative',zIndex:2,maxWidth:740,paddingLeft:'clamp(0px,5vw,70px)'}}>
          <div className="eyebrow" style={{marginBottom:18}}>✦ {h.badge}</div>
          <h1 style={{fontFamily:'var(--serif)',fontSize:'clamp(50px,9vw,108px)',fontWeight:700,lineHeight:.92,letterSpacing:'-.03em',color:'var(--ink)',marginBottom:22}}>
            {h.heroLine1}<br/><span style={{color:'var(--saffron)'}}>{h.heroLine2}</span><br/><span style={{fontStyle:'italic',color:'var(--terracotta)'}}>{h.heroLine3}</span>
          </h1>
          <div style={{width:56,height:4,background:'var(--saffron)',borderRadius:2,marginBottom:20}}/>
          <p style={{fontSize:19,color:'var(--ink3)',lineHeight:1.7,marginBottom:32,maxWidth:500}}>{h.heroDesc}</p>
          <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:44}}>
            <button className="btn-primary" onClick={()=>document.getElementById('svc-sec')?.scrollIntoView({behavior:'smooth'})}>{h.exploreBtn}</button>
            <button className="btn-secondary" onClick={()=>goTo('palm')}>{h.tryBtn}</button>
          </div>
          <div style={{display:'flex',background:'var(--card-bg)',border:'1px solid var(--border)',borderRadius:14,overflow:'hidden',boxShadow:'0 4px 20px var(--shadow)',width:'fit-content'}}>
            {[['2M+',h.stats.readings],['4.9★',h.stats.rating],['6',h.stats.services],['<30s',h.stats.instant]].map(([v,l],i,a)=>(
              <div key={i} style={{textAlign:'center',padding:'10px 18px',borderRight:i<a.length-1?'1px solid var(--border)':'none'}}>
                <div style={{fontFamily:'var(--serif)',fontSize:22,fontWeight:700,color:'var(--saffron)'}}>{v}</div>
                <div style={{fontSize:11,fontWeight:600,color:'var(--muted)',letterSpacing:'.1em',textTransform:'uppercase',marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="svc-sec" style={{padding:'90px 0',background:'var(--bg2)',borderTop:'1px solid var(--border)'}}>
        <div style={{maxWidth:1180,margin:'0 auto',padding:'0 24px'}}>
          <div style={{textAlign:'center',marginBottom:48}}>
            <div className="eyebrow">Six Ancient Sciences</div>
            <h2 className="sec-title">{h.servicesTitle}</h2>
            <p className="sec-desc">{h.servicesDesc}</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:18}}>
            {svcs.map(svc=>(
              <button key={svc.id} onClick={()=>goTo(svc.id)} style={{background:'var(--card-bg)',border:'1px solid var(--border)',borderRadius:16,padding:'26px 22px',cursor:'pointer',transition:'all .22s',textAlign:'left',boxShadow:'0 2px 12px var(--shadow)',position:'relative',overflow:'hidden'}}
                onMouseOver={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 40px rgba(100,60,30,.18)'}}
                onMouseOut={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 2px 12px var(--shadow)'}}>
                {svc.tag&&<div style={{position:'absolute',top:0,right:0,background:svc.accent,color:'#fff',fontSize:10,fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',padding:'3px 10px',borderRadius:'0 16px 0 8px'}}>{svc.tag}</div>}
                <div style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:12}}>
                  <div style={{width:48,height:48,borderRadius:11,background:`${svc.accent}18`,border:`2px solid ${svc.accent}28`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{svc.e}</div>
                  <div><p style={{fontSize:11,fontWeight:700,color:svc.accent,letterSpacing:'.14em',textTransform:'uppercase',marginBottom:2}}>{t.services[svc.id]?.skt}</p><h3 style={{fontFamily:'var(--serif)',fontSize:20,color:'var(--ink)',fontWeight:700}}>{t.services[svc.id]?.name}</h3></div>
                </div>
                <p style={{fontSize:15,color:'var(--ink3)',lineHeight:1.7,marginBottom:12}}>{t.services[svc.id]?.desc}</p>
                <div style={{fontSize:13,fontWeight:700,color:svc.accent}}>Begin Reading →</div>
              </button>
            ))}
          </div>
        </div>
      </section>
      <section style={{padding:'90px 0',background:'var(--bg)',borderTop:'1px solid var(--border)'}}>
        <div style={{maxWidth:960,margin:'0 auto',padding:'0 24px'}}>
          <div style={{textAlign:'center',marginBottom:52}}>
            <div className="eyebrow">Simple Process</div>
            <h2 className="sec-title">{h.howTitle}</h2>
            <p className="sec-desc">{h.howDesc}</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:36}}>
            {[[h.step1Title,h.step1Desc,'01'],[h.step2Title,h.step2Desc,'02'],[h.step3Title,h.step3Desc,'03']].map(([title,desc,n])=>(
              <div key={n} style={{textAlign:'center'}}>
                <div style={{width:68,height:68,borderRadius:'50%',background:'rgba(212,98,26,.1)',border:'2px solid rgba(212,98,26,.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 18px',fontFamily:'var(--serif)',fontSize:20,fontWeight:700,color:'var(--saffron)'}}>{n}</div>
                <h3 style={{fontFamily:'var(--serif)',fontSize:20,color:'var(--ink)',marginBottom:8,fontWeight:700}}>{title}</h3>
                <p style={{fontSize:16,color:'var(--muted)',lineHeight:1.75}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{padding:'90px 28px',textAlign:'center',background:'var(--saffron)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontFamily:'serif',fontSize:300,color:'rgba(255,255,255,.05)',pointerEvents:'none',fontWeight:700}}>OM</div>
        <div style={{position:'relative',zIndex:2}}>
          <h2 style={{fontFamily:'var(--serif)',fontSize:'clamp(28px,5vw,52px)',color:'#fff',marginBottom:12,fontWeight:700,letterSpacing:'-.02em'}}>{h.ctaTitle}</h2>
          <p style={{fontSize:17,color:'rgba(255,255,255,.8)',margin:'0 auto 32px',maxWidth:460,lineHeight:1.7}}>{h.ctaDesc}</p>
          <button style={{background:'#fff',color:'var(--saffron)',fontFamily:'var(--sans)',fontSize:17,fontWeight:800,padding:'14px 32px',borderRadius:10,border:'none',cursor:'pointer',boxShadow:'0 8px 32px rgba(0,0,0,.18)'}} onClick={()=>goTo('palm')}>{h.ctaBtn}</button>
        </div>
      </section>
      <footer style={{background:'var(--ink)',color:'rgba(250,247,242,.8)',padding:'44px 24px 24px',textAlign:'center'}}>
        <div style={{fontFamily:'serif',fontSize:40,color:'var(--saffron)',opacity:.5,marginBottom:6}}>OM</div>
        <div style={{fontFamily:'var(--serif)',fontSize:24,fontWeight:700,color:'var(--saffron)',marginBottom:5}}>VedicAI</div>
        <p style={{fontSize:12,color:'rgba(250,247,242,.35)',letterSpacing:'.15em',textTransform:'uppercase',marginBottom:18}}>{h.footerTagline}</p>
        <div style={{display:'flex',gap:18,justifyContent:'center',flexWrap:'wrap',marginBottom:18}}>
          {svcs.map(s=><span key={s.id} onClick={()=>goTo(s.id)} style={{cursor:'pointer',fontSize:14,color:'rgba(250,247,242,.4)'}}>{s.e} {t.services[s.id]?.name}</span>)}
        </div>
        <p style={{fontSize:12,color:'rgba(250,247,242,.22)'}}>{h.disclaimer}</p>
      </footer>
    </div>
  }

  const pages={home:<HomePage/>,palm:<PalmPage/>,kundli:<KundliPage/>,tarot:<TarotPage/>,numerology:<NumerologyPage/>,face:<FacePage/>,dream:<DreamPage/>}

  return <>
    <Nav t={t} lang={lang} onLangChange={setLang} onNav={goTo} currentPage={page}/>
    {pages[page]||<HomePage/>}
    {payModal&&<PaymentModal service={payModal.svc} result={payModal.result} userName={payModal.name} lang={lang} t={t} onClose={()=>setPayModal(null)} onSuccess={()=>{setUnlockedReports(prev=>({...prev,[payModal.svc]:true}));setPayModal(null)}}/>}
  </>
}
