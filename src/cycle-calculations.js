import * as Astro from 'astronomy-engine';
import { biorhythm, zodiac } from './profile.js';
    // === Utils ===
    const PI = Math.PI;
    const deg2rad = (d) => (d * PI) / 180;
    const rad2deg = (r) => (r * 180) / PI;
    const norm360 = (x) => ((x % 360) + 360) % 360;
    const pad2 = (n) => String(n).padStart(2, "0");

    const todayDateStr = () => {
      const d = new Date();
      return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
    };
    const dayOfYear = (date) => {
      const d = new Date(date.getFullYear(), 0, 0);
      return Math.floor((date - d) / (1000*60*60*24));
    };

    // === Biorritmos ===
    const bioVal = (birth, target, period) => biorhythm(birth,target,period)/100;

    // === Numerología (pitagórica) ===
    const vowels = new Set(["A","E","I","O","U","Y"]);
    const pythMap = new Map([
      ["A",1],["J",1],["S",1], ["B",2],["K",2],["T",2], ["C",3],["L",3],["U",3],
      ["D",4],["M",4],["V",4], ["E",5],["N",5],["W",5], ["F",6],["O",6],["X",6],
      ["G",7],["P",7],["Y",7], ["H",8],["Q",8],["Z",8], ["I",9],["R",9],
    ]);
    const stripAccents = (s)=> s.normalize("NFD").replace(/\p{Diacritic}/gu,"");
    const letterVal = (ch)=> pythMap.get(stripAccents(ch.toUpperCase())) || 0;
    const reduceNum = (n, keepMasters=true)=>{
      const isMaster = (x)=> x===11 || x===22;
      if(keepMasters && isMaster(n)) return n;
      while(n>9){
        n = String(n).split("").reduce((a,b)=>a+Number(b),0);
        if(keepMasters && isMaster(n)) return n;
      }
      return n;
    };
    const reduceNoMasters=(n)=>{ while(n>9) n=String(n).split("").reduce((a,b)=>a+Number(b),0); return n; };
    const lifePath = (d)=> reduceNum(reduceNoMasters(d.getDate())+reduceNoMasters(d.getMonth()+1)+reduceNoMasters(d.getFullYear()));
    const sumName = (name, which="all") =>
      [...name].reduce((acc,ch)=>{
        if(!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(ch)) return acc;
        const v=letterVal(ch); const up=stripAccents(ch.toUpperCase());
        if(which==="vowels") return acc+(vowels.has(up)?v:0);
        if(which==="consonants") return acc+(!vowels.has(up)?v:0);
        return acc+v;
      },0);
    const expressionNum=(name)=> reduceNum(sumName(name));
    const soulUrgeNum=(name)=> reduceNum(sumName(name,"vowels"));
    const personalityNum=(name)=> reduceNum(sumName(name,"consonants"));
    const maturityNum=(lp,exp)=> reduceNum(lp+exp);
    const personalYear=(birth,year)=> reduceNum(reduceNoMasters(birth.getDate())+reduceNoMasters(birth.getMonth()+1)+reduceNoMasters(year));
    const personalMonth=(pYear,month)=> reduceNum(pYear+month);
    const personalDay=(birth,target)=> reduceNum(personalMonth(personalYear(birth,target.getFullYear()), target.getMonth()+1) + target.getDate());

    // === Occidental (solar) ===
    const westernSun = zodiac;

    // === Chino ===
    const chineseAnimal=(y)=>["Rata","Buey","Tigre","Conejo","Dragón","Serpiente","Caballo","Cabra","Mono","Gallo","Perro","Cerdo"][((y-1900)%12+12)%12];
    const chineseElement=(y)=>["Madera","Madera","Fuego","Fuego","Tierra","Tierra","Metal","Metal","Agua","Agua"][((y-4)%10+10)%10];

    // === Tzolk’in Maya ===
    const gregorianToJDN=(y,m,d)=>{
      const a=Math.floor((14-m)/2), y2=y+4800-a, m2=m+12*a-3;
      return d + Math.floor((153*m2+2)/5) + 365*y2 + Math.floor(y2/4) - Math.floor(y2/100) + Math.floor(y2/400) - 32045;
    };
    const tzNames=[
      "Imix (Cocodrilo)","Ik (Viento)","Akbal (Noche)","Kan (Semilla)","Chicchan (Serpiente)",
      "Cimi (Enlazador)","Manik (Mano)","Lamat (Estrella)","Muluc (Luna)","Oc (Perro)",
      "Chuen (Mono)","Eb (Humano)","Ben (Caña)","Ix (Mago)","Men (Águila)",
      "Cib (Guerrero)","Caban (Tierra)","Etznab (Espejo)","Cauac (Tormenta)","Ahau (Sol)"
    ];
    const tzTones={1:"Magnético (propósito)",2:"Lunar (desafío)",3:"Eléctrico (servicio)",4:"Autoexistente (definición)",5:"Entonado (poder)",6:"Rítmico (equilibrio)",7:"Resonante (sintonía)",8:"Galáctico (integridad)",9:"Solar (intención)",10:"Planetario (manifestación)",11:"Espectral (liberación)",12:"Cristal (cooperación)",13:"Cósmico (presencia)"};
    const tzolkinForDate=(date)=>{
      const y=date.getFullYear(), m=date.getMonth()+1, d=date.getDate();
      const jdn=gregorianToJDN(y,m,d), base=584283, days=jdn-base;
      const tone=((days+4)%13)+1, nameIdx=(days+19)%20;
      return { tone, toneDesc: tzTones[tone], seal: tzNames[nameIdx] };
    };

    // === Runas ===
    const RUNES=[["Fehu","Riqueza, inicio, recursos"],["Uruz","Fuerza vital, salud, coraje"],["Thurisaz","Umbral, protección, ruptura"],["Ansuz","Comunicación, guía, inspiración"],["Raidho","Viaje, proceso, orden"],["Kenaz","Fuego interno, claridad"],["Gebo","Intercambio, pacto, regalo"],["Wunjo","Alegría, armonía"],["Hagalaz","Cambio brusco, prueba"],["Nauthiz","Necesidad, disciplina"],["Isa","Pausa, concentración"],["Jera","Cosecha, ritmos"],["Eihwaz","Eje, transformación"],["Perthro","Destino, azar, intuición"],["Algiz","Protección, límites"],["Sowilo","Éxito, vitalidad"],["Tiwaz","Dirección, justicia"],["Berkano","Nacimiento, cuidado"],["Ehwaz","Cooperación, avance"],["Mannaz","Humanidad, rol social"],["Laguz","Flujo, emociones"],["Ingwaz","Semilla, reposo fértil"],["Dagaz","Renovación, claridad"],["Othala","Legado, territorio"]];
    const natalRune=(birth)=>{ const n=dayOfYear(birth)%24; const idx=(n===0?24:n)-1; return { idx, name:RUNES[idx][0], meaning:RUNES[idx][1] }; };
    const yearlyRune=(birth,year)=>{ const d=new Date(year,birth.getMonth(),birth.getDate()); const n=dayOfYear(d)%24; const idx=(n===0?24:n)-1; return { idx, name:RUNES[idx][0], meaning:RUNES[idx][1] }; };

    // === Horas Planetarias ===
    const CHALDEAN=["Saturno","Júpiter","Marte","Sol","Venus","Mercurio","Luna"];
    const dayLordFromWeekday=(weekday)=>({0:"Luna",1:"Marte",2:"Mercurio",3:"Júpiter",4:"Venus",5:"Saturno",6:"Sol"})[weekday];
    const seqFromLord=(lord)=>{ const idx=CHALDEAN.indexOf(lord); const arr=[]; for(let i=0;i<24;i++) arr.push(CHALDEAN[(idx+i)%7]); return arr; };
    function sunriseSunset(date, latDeg, lonDeg, tzOffsetHours){
      const N=dayOfYear(date), lngHour=lonDeg/15;
      const calcFor=(isSunrise)=>{
        const t=N+((isSunrise?6:18)-lngHour)/24;
        const M=0.9856*t-3.289;
        let L=M+1.916*Math.sin(deg2rad(M))+0.020*Math.sin(deg2rad(2*M))+282.634; L=norm360(L);
        let RA=rad2deg(Math.atan(0.91764*Math.tan(deg2rad(L)))); RA=norm360(RA);
        const Lquad=Math.floor(L/90)*90, RAquad=Math.floor(RA/90)*90; RA=(RA+(Lquad-RAquad))/15;
        const sinDec=0.39782*Math.sin(deg2rad(L)), cosDec=Math.cos(Math.asin(sinDec));
        const cosH=(Math.cos(deg2rad(90.833))-sinDec*Math.sin(deg2rad(latDeg)))/(cosDec*Math.cos(deg2rad(latDeg)));
        if(cosH>1||cosH<-1) return null;
        let H=isSunrise?360-rad2deg(Math.acos(cosH)):rad2deg(Math.acos(cosH)); H/=15;
        const T=H+RA-0.06571*t-6.622; let UT=T-lngHour; while(UT<0)UT+=24; while(UT>=24)UT-=24;
        let local=UT+tzOffsetHours; while(local<0)local+=24; while(local>=24)local-=24;
        const hours=Math.floor(local), mins=Math.round((local-hours)*60);
        const dt=new Date(date); dt.setHours(hours,mins,0,0); return dt;
      };
      const sr=calcFor(true), ss=calcFor(false); return { sunrise:sr, sunset:ss };
    }
    const nextDay=(date)=>{ const d=new Date(date); d.setDate(d.getDate()+1); return d; };
    function planetaryHours(date, lat, lon, tzOffset){
      const { sunrise, sunset } = sunriseSunset(date, lat, lon, tzOffset) || {};
      const { sunrise: tomorrowSunrise } = sunriseSunset(nextDay(date), lat, lon, tzOffset) || {};
      if(!sunrise||!sunset||!tomorrowSunrise) return { error:"No se pudo calcular amanecer/atardecer.", rows:[], lord:null };
      const weekday=date.getDay();
      const lord=dayLordFromWeekday((weekday+6)%7);
      const seq=seqFromLord(lord);
      const dayDur=(sunset - sunrise)/12, nightDur=(tomorrowSunrise - sunset)/12;
      const rows=[];
      for(let i=0;i<12;i++){ const start=new Date(sunrise.getTime()+i*dayDur), end=new Date(sunrise.getTime()+(i+1)*dayDur); rows.push({ idx:i+1, planet:seq[i], start, end, phase:"Día" }); }
      for(let i=0;i<12;i++){ const start=new Date(sunset.getTime()+i*nightDur), end=new Date(sunset.getTime()+(i+1)*nightDur); rows.push({ idx:i+13, planet:seq[12+i], start, end, phase:"Noche" }); }
      return { rows, lord };
    }

    // === Astronomía (corregido): sin JulianDay/Equator ===
    const J2000_UTC = Date.UTC(2000,0,1,12,0,0);
    const centuriesSinceJ2000 = (date)=> (date.getTime()-J2000_UTC)/(86400000*36525);

    // Ayanamsa Lahiri: usa T desde J2000 (no depende de la lib)
    function ayanamsaLahiri(date){
      const T = centuriesSinceJ2000(date);
      const arcsec = 5028.796195*T + 1.1054348*T*T; // precesión
      return 23.852 + arcsec/3600;
    }

    // Longitud eclíptica (de fecha) de un cuerpo en grados [0,360)
    function eclipticLongitude(body, date){
      if(body === Astro.Body.Sun){
        // Sol: la lib ya da elon directamente
        return norm360(Astro.SunPosition(date).elon);
      }
      // Luna/planetas: vector geocéntrico -> eclíptica
      const vec = Astro.GeoVector(body, date, true); // aberration true
      const ecl = Astro.Ecliptic(vec);               // eclípticas de fecha
      return norm360(ecl.elon);
    }

    const siderealLongitude = (tropLon, ayan)=> norm360(tropLon - ayan);

    // === Jyotish ===
    const NAK_NAMES=["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"];
    const DASHA_LORDS=["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"];
    const DASHA_YEARS={Ketu:7,Venus:20,Sun:6,Moon:10,Mars:7,Rahu:18,Jupiter:16,Saturn:19,Mercury:17};
    function nakshatraFromLon(lonSid){
      const span=360/27; const idx=Math.floor(lonSid/span);
      const within=(lonSid%span)/span; const pada=Math.floor(within*4)+1;
      const name=NAK_NAMES[idx]; const lord=DASHA_LORDS[idx%9];
      return { idx:idx+1, name, pada, frac:within, lord };
    }
    function currentMahadasha(birth, target, moonSidAtBirth){
      const nk=nakshatraFromLon(moonSidAtBirth);
      const start=new Date(birth); const years=DASHA_YEARS[nk.lord];
      const remYears=(1-nk.frac)*years;
      let t0=new Date(start.getTime());
      let t1=new Date(start.getTime()+remYears*365.2425*24*3600*1000);
      let lord=nk.lord; let i=DASHA_LORDS.indexOf(lord);
      if(target<t1) return { lord, from:t0, to:t1 };
      t0=t1;
      for(let k=1;k<=18;k++){
        i=(i+1)%9; lord=DASHA_LORDS[i];
        const yrs=DASHA_YEARS[lord];
        t1=new Date(t0.getTime()+yrs*365.2425*24*3600*1000);
        if(target<t1) return { lord, from:t0, to:t1 };
        t0=t1;
      }
      return { lord, from:t0, to:t1 };
    }

    // === Human Design (básico) ===
    function findDesignDate(birth){
      const targetArc=88;
      const lonBirth=eclipticLongitude(Astro.Body.Sun, birth);
      for(let i=1;i<=120;i++){
        const t=new Date(birth); t.setDate(t.getDate()-i);
        const lonT=eclipticLongitude(Astro.Body.Sun, t);
        const arc=(lonBirth-lonT+360)%360;
        if(Math.abs(arc-targetArc)<0.25) return t;
      }
      const fallback=new Date(birth); fallback.setDate(fallback.getDate()-89); return fallback;
    }
    function gateFromDegreesUniform(deg){
      const width=360/64; const idx=Math.floor(((deg%360)+360)%360/width);
      const line=Math.floor(((((deg%width)+width)%width)/(width/6)))+1;
      return { gate:idx+1, line };
    }


export { PI, deg2rad, rad2deg, norm360, pad2, todayDateStr, dayOfYear, bioVal, vowels, pythMap, stripAccents, letterVal, reduceNum, reduceNoMasters, lifePath, sumName, expressionNum, soulUrgeNum, personalityNum, maturityNum, personalYear, personalMonth, personalDay, westernSun, chineseAnimal, chineseElement, gregorianToJDN, tzNames, tzTones, tzolkinForDate, RUNES, natalRune, yearlyRune, CHALDEAN, dayLordFromWeekday, seqFromLord, sunriseSunset, nextDay, planetaryHours, J2000_UTC, centuriesSinceJ2000, ayanamsaLahiri, eclipticLongitude, siderealLongitude, NAK_NAMES, DASHA_LORDS, DASHA_YEARS, nakshatraFromLon, currentMahadasha, findDesignDate, gateFromDegreesUniform };
