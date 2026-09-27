/* ============== VERİ MODÜLÜ ==============
   Kelimeler artık data/kelimeler.json dosyasından yükleniyor.
   Yeni kategori/kelime eklemek için sadece o dosyayı düzenlemek yeterli. */
let KATEGORILER = [];


const TR_HARFLER = ["E","R","T","Y","U","I","O","P","Ğ","Ü","A","S","D","F","G","H","J","K","L","Ş","İ","Z","C","V","B","N","M","Ö","Ç"];

let state = { kategoriId:null, durakIndex:0, aktifKelime:0, grid:null };
const kayit = JSON.parse(localStorage.getItem("ky_kayit") || "{}");
kayit.toplamSkor = kayit.toplamSkor || 0;
function kaydet(){ localStorage.setItem("ky_kayit", JSON.stringify(kayit)); }

function goster(id){ document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active")); document.getElementById(id).classList.add("active"); }

/* ---- Ana menü ---- */
function anaMenuOlustur(){
  document.getElementById("toplam-skor").textContent = kayit.toplamSkor;
  const liste = document.getElementById("kategori-liste"); liste.innerHTML = "";
  KATEGORILER.forEach(k=>{
    const b = document.createElement("button");
    b.className = "kategori-kart";
    b.innerHTML = `<span class="emoji">${k.emoji}</span><span>${k.ad}</span>`;
    b.onclick = ()=> kategoriyeGir(k.id);
    liste.appendChild(b);
  });
}
function anaMenuyeDon(){ anaMenuOlustur(); goster("anamenu"); }

/* ---- Harita ---- */
function manzaraCiz(kat){
  const [a,b] = kat.renk;
  let agaclar = "";
  for(let i=0;i<6;i++){
    const x = 20 + i*70 + (i%2?15:-10), y = 690 + (i%3)*32, boy = 34 + (i%2)*10;
    agaclar += `<g transform="translate(${x},${y})">
      <rect x="-3" y="0" width="6" height="${boy*0.4}" fill="#8a5a3b"/>
      <circle cx="0" cy="-${boy*0.35}" r="${boy*0.5}" fill="${b}"/>
    </g>`;
  }
  document.getElementById("manzara-svg").innerHTML = `
    <defs>
      <linearGradient id="gokyuzu" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#CFEBFF"/><stop offset="1" stop-color="#EAF6FF"/>
      </linearGradient>
    </defs>
    <rect width="400" height="800" fill="url(#gokyuzu)"/>
    <circle cx="320" cy="90" r="58" fill="var(--sun)" opacity=".25"/>
    <circle cx="320" cy="90" r="36" fill="var(--sun)"/>
    <g opacity=".85">
      <ellipse cx="80" cy="120" rx="38" ry="14" fill="#fff"/>
      <ellipse cx="106" cy="112" rx="26" ry="12" fill="#fff"/>
      <ellipse cx="250" cy="175" rx="30" ry="11" fill="#fff"/>
    </g>
    <path d="M0,800 L0,620 Q100,570 200,620 T400,610 L400,800 Z" fill="${a}" opacity=".55"/>
    <path d="M0,800 L0,700 Q120,650 220,700 T400,690 L400,800 Z" fill="${a}"/>
    <path d="M0,800 L0,760 Q140,720 220,760 T400,750 L400,800 Z" fill="${b}"/>
    ${agaclar}`;
}
function kategoriyeGir(id){ state.kategoriId = id; goster("harita"); haritaOlustur(); }
function haritaOlustur(){
  const kat = KATEGORILER.find(k=>k.id===state.kategoriId);
  kayit[kat.id] = kayit[kat.id] || { acikDurak:0, yildizlar:[] };
  manzaraCiz(kat);
  document.getElementById("harita-baslik").textContent = kat.emoji + " " + kat.ad;
  const wrap = document.getElementById("duraklar"); wrap.innerHTML = "";

  const sayi = kat.duraklar.length;
  const araPay = 120, ustBosluk = 50, altBosluk = 50, durakBoy = 78;
  const yukseklik = ustBosluk + altBosluk + durakBoy + (sayi-1)*araPay;
  wrap.style.height = yukseklik + "px";

  const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("class","patika-svg");
  wrap.appendChild(svg);

  // duraklar için zigzag (kıvrılan yol) konumları: 0. durak en altta
  const noktalar = [];
  for(let i=0;i<sayi;i++){
    noktalar.push({ xYuzde: 50 + 26*Math.sin(i*1.15), y: yukseklik - altBosluk - durakBoy/2 - i*araPay });
  }

  kat.duraklar.forEach((d,i)=>{
    const acik = i <= kayit[kat.id].acikDurak;
    const oncuDurak = i===kayit[kat.id].acikDurak;
    const btn = document.createElement("button");
    btn.className = "durak" + (acik?"":" kilitli") + (oncuDurak?" aktif":"");
    btn.textContent = acik ? (i+1) : "🔒";
    btn.style.left = noktalar[i].xYuzde + "%";
    btn.style.top = noktalar[i].y + "px";
    const yildizSayisi = kayit[kat.id].yildizlar[i];
    if(yildizSayisi){ const s=document.createElement("span"); s.className="yildiz"; s.textContent="⭐".repeat(yildizSayisi); btn.appendChild(s); }
    if(acik) btn.onclick = ()=> durakaGir(i);
    wrap.appendChild(btn);
    if(oncuDurak){
      const bayrak = document.createElement("span");
      bayrak.className = "durak-bayrak";
      bayrak.textContent = "🚩";
      bayrak.style.left = noktalar[i].xYuzde + "%";
      bayrak.style.top = noktalar[i].y + "px";
      wrap.appendChild(bayrak);
    }
  });

  // duraklar arasında kıvrılan toprak patika (açılan kısım ayak izi gibi vurgulanır)
  const genislik = wrap.clientWidth;
  let tumYol = "", acikYol = "";
  noktalar.forEach((n,i)=>{
    const px = (n.xYuzde/100)*genislik;
    tumYol += (i===0 ? "M":"L") + px + "," + n.y + " ";
    if(i <= kayit[kat.id].acikDurak) acikYol += (i===0 ? "M":"L") + px + "," + n.y + " ";
  });
  svg.innerHTML = `
    <path d="${tumYol}" fill="none" stroke="var(--yol-kenar)" stroke-width="16" stroke-linecap="round"/>
    <path d="${tumYol}" fill="none" stroke="var(--yol)" stroke-width="11" stroke-linecap="round"/>
    <path d="${acikYol}" fill="none" stroke="var(--grass)" stroke-width="4" stroke-dasharray="1 13" stroke-linecap="round" opacity=".9"/>
  `;
}
function haritayaDon(){ goster("harita"); haritaOlustur(); }

/* ---- Bulmaca / Grid modülü ---- */
let bulmacaSkoru = 0;
function aktifDurak(){ return KATEGORILER.find(k=>k.id===state.kategoriId).duraklar[state.durakIndex]; }

function gridOlustur(durak){
  durak.kelimeler.forEach(k=>{
    k.cells = [];
    for(let i=0;i<k.kelime.length;i++){
      const r = k.yon==="v" ? k.r+i : k.r;
      const c = k.yon==="h" ? k.c+i : k.c;
      k.cells.push({r,c,harf:k.kelime[i]});
    }
  });
  const map = {};
  durak.kelimeler.forEach((k,wi)=>{
    k.cells.forEach(cell=>{
      const key = cell.r+","+cell.c;
      if(!map[key]) map[key] = { harf:cell.harf, dolu:null, kelimeler:[] };
      map[key].kelimeler.push(wi);
    });
  });
  return map;
}

function durakaGir(i){
  state.durakIndex = i; state.aktifKelime = 0; bulmacaSkoru = 0;
  const durak = aktifDurak();
  state.grid = gridOlustur(durak);
  klavyeOlustur();
  gridCiz();
  ipucuKutusuGuncelle();
  digerKelimeleriCiz();
  goster("bulmaca");
}

function gridCiz(){
  const g = document.getElementById("grid");
  g.innerHTML = "";
  const anahtarlar = Object.keys(state.grid);
  const rs = anahtarlar.map(k=>+k.split(",")[0]), cs = anahtarlar.map(k=>+k.split(",")[1]);
  const minR = Math.min(...rs), minC = Math.min(...cs);
  anahtarlar.forEach(key=>{
    const hucre = state.grid[key];
    const [r,c] = key.split(",").map(Number);
    const d = document.createElement("div");
    d.className = "hucre" + (hucre.dolu ? (hucre.kelimeler.length>1?" dolu kesisim":" dolu") : "");
    if(hucre.kelimeler.includes(state.aktifKelime)) d.classList.add("aktif-hucre");
    d.textContent = hucre.dolu || "";
    d.style.gridRowStart = (r-minR+1);
    d.style.gridColumnStart = (c-minC+1);
    d.dataset.key = key;
    g.appendChild(d);
  });
}

function ipucuKutusuGuncelle(){
  const k = aktifDurak().kelimeler[state.aktifKelime];
  document.getElementById("aktif-emoji").textContent = k.emoji;
  document.getElementById("aktif-ipucu").textContent = k.ipucu + (k.tip==="es_anlam" ? " (başka adı)" : "");
  document.getElementById("bulmaca-skor").textContent = bulmacaSkoru;
}

function digerKelimeleriCiz(){
  const durak = aktifDurak();
  const wrap = document.getElementById("diger-kelimeler"); wrap.innerHTML = "";
  durak.kelimeler.forEach((k,i)=>{
    const dolu = k.cells.every(cell=> state.grid[cell.r+","+cell.c].dolu !== null);
    const el = document.createElement("div");
    el.className = "mini-kelime" + (i===state.aktifKelime?" aktif-mini":"") + (dolu?" tamam":"");
    el.textContent = k.emoji;
    el.onclick = ()=>{ if(!dolu){ state.aktifKelime = i; ipucuKutusuGuncelle(); gridCiz(); digerKelimeleriCiz(); } };
    wrap.appendChild(el);
  });
}

function klavyeOlustur(){
  const satirlar = [TR_HARFLER.slice(0,11), TR_HARFLER.slice(11,21), TR_HARFLER.slice(21)];
  const kw = document.getElementById("klavye"); kw.innerHTML = "";
  satirlar.forEach(satir=>{
    const row = document.createElement("div"); row.className = "klavye-satir";
    satir.forEach(h=>{
      const b = document.createElement("button");
      b.className = "tus"; b.textContent = h;
      b.onclick = ()=> harfDene(h);
      row.appendChild(b);
    });
    kw.appendChild(row);
  });
}

function harfDene(harf){
  const durak = aktifDurak();
  const k = durak.kelimeler[state.aktifKelime];
  const hedef = k.cells.find(cell => cell.harf===harf && state.grid[cell.r+","+cell.c].dolu===null);
  if(!hedef){
    bulmacaSkoru = Math.max(0, bulmacaSkoru-2);
    document.getElementById("bulmaca-skor").textContent = bulmacaSkoru;
    const ilkBos = k.cells.map(c=>document.querySelector(`[data-key="${c.r},${c.c}"]`)).find(el=>el && !el.classList.contains("dolu"));
    if(ilkBos){ ilkBos.classList.add("sarsil"); setTimeout(()=>ilkBos.classList.remove("sarsil"),350); }
    return;
  }
  state.grid[hedef.r+","+hedef.c].dolu = harf;
  bulmacaSkoru += 10;
  gridCiz();
  document.getElementById("bulmaca-skor").textContent = bulmacaSkoru;

  const kelimeTamam = k.cells.every(cell => state.grid[cell.r+","+cell.c].dolu !== null);
  if(kelimeTamam){ bulmacaSkoru += 50; k.ipucuKullanildi = k.ipucuKullanildi || false; setTimeout(sonrakiKelime, 450); }
}

function ipucuGoster(){
  const k = aktifDurak().kelimeler[state.aktifKelime];
  const bos = k.cells.find(cell => state.grid[cell.r+","+cell.c].dolu===null);
  if(!bos) return;
  k.ipucuKullanildi = true;
  state.grid[bos.r+","+bos.c].dolu = bos.harf;
  bulmacaSkoru = Math.max(0, bulmacaSkoru-15);
  gridCiz(); document.getElementById("bulmaca-skor").textContent = bulmacaSkoru;
  const tamam = k.cells.every(cell => state.grid[cell.r+","+cell.c].dolu !== null);
  if(tamam){ bulmacaSkoru += 50; setTimeout(sonrakiKelime, 450); }
}

function sonrakiKelime(){
  digerKelimeleriCiz();
  const durak = aktifDurak();
  const kalan = durak.kelimeler.findIndex(k => !k.cells.every(cell => state.grid[cell.r+","+cell.c].dolu !== null));
  if(kalan === -1){ durakTamamlandi(); return; }
  state.aktifKelime = kalan;
  ipucuKutusuGuncelle(); gridCiz(); digerKelimeleriCiz();
}

function konfetiPatlat(){
  const renkler = ["#FF6B6B","#FFC93C","#06D6A0","#118AB2","#FFB703"];
  for(let i=0;i<28;i++){
    const p = document.createElement("div");
    p.className = "konfeti-parca";
    p.style.left = Math.random()*100+"vw";
    p.style.background = renkler[i%renkler.length];
    p.style.animationDuration = (1.6+Math.random())+"s";
    document.body.appendChild(p);
    setTimeout(()=>p.remove(), 2800);
  }
}

function durakTamamlandi(){
  const kat = KATEGORILER.find(k=>k.id===state.kategoriId);
  const durak = aktifDurak();
  const ipucusuz = durak.kelimeler.every(k=>!k.ipucuKullanildi);
  const kacTane = durak.kelimeler.filter(k=>k.ipucuKullanildi).length;
  const yildiz = ipucusuz ? 3 : (kacTane<=1 ? 2 : 1);
  kayit[kat.id].yildizlar[state.durakIndex] = Math.max(kayit[kat.id].yildizlar[state.durakIndex]||0, yildiz);
  if(state.durakIndex >= kayit[kat.id].acikDurak && state.durakIndex+1 < kat.duraklar.length){
    kayit[kat.id].acikDurak = state.durakIndex+1;
  }
  kayit.toplamSkor += bulmacaSkoru;
  kaydet();
  document.getElementById("tamam-detay").textContent = `${"⭐".repeat(yildiz)}  •  Bu bulmacada ${bulmacaSkoru} puan kazandın!`;
  goster("tamam");
  konfetiPatlat();
}
function tamamdanDevam(){ haritaOlustur(); goster("harita"); }

/* ============== PWA MODÜLÜ ==============
   manifest.json <head> içinde <link rel="manifest"> ile bağlı.
   Service worker ayrı sw.js dosyasından kayıt ediliyor. */
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js").catch(()=>{});
}

/* ================== BAŞLANGIÇ ================== */
fetch("data/kelimeler.json")
  .then(r => r.json())
  .then(veri => {
    KATEGORILER = veri;
    anaMenuOlustur();
    goster("anamenu");
  })
  .catch(err => {
    document.body.innerHTML = "<p style='padding:24px;font-family:sans-serif'>Kelime verisi yüklenemedi. Bu dosyayı bir sunucu üzerinden açtığından emin ol (GitHub Pages, `npx serve`, vb.) — tarayıcıda doğrudan çift tıklayarak (file://) açmak fetch() işlemini engeller.</p>";
    console.error(err);
  });
