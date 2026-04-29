// birthday-easter-egg.js
(function(){
    'use strict';

    function safeParse(s){
        try { return JSON.parse(s); } catch(e){ return null; }
    }

    function readProfile(){
        const raw = localStorage.getItem("cycles_app_state");
        if(!raw) return null;
        const st = safeParse(raw);
        if(!st || !st.birthDate) return null;
        return st;
    }

    function isBirthdayToday(birthDate){
        const today = new Date();
        const [, M, D] = String(birthDate).split("-").map(Number);
        return today.getDate() === D && today.getMonth() + 1 === M;
    }

    function injectStyles(){
        if(document.getElementById("birthday-styles")) return;

        const style = document.createElement("style");
        style.id = "birthday-styles";
        style.textContent = `
        #birthday-overlay{
        position:fixed;
        inset:0;
        z-index:9999;
        pointer-events:none;
        overflow:hidden;
        }

        .birthday-system-banner{
            position:fixed;
            top:92px;
            left:50%;
            transform:translateX(-50%);
            z-index:10000;
            padding:12px 18px;
            border-radius:999px;
            color:#001018;
            font-weight:900;
            letter-spacing:.04em;
            text-align:center;
            background:linear-gradient(90deg,#5ad1ff,#2eea8a,#ffd94d);
            box-shadow:0 0 18px rgba(90,209,255,.9), 0 0 42px rgba(46,234,138,.45);
            animation:birthdayPulse 1.8s ease-in-out infinite;
            max-width:calc(100vw - 24px);
            white-space:nowrap;
        }

        .birthday-subtitle{
            display:block;
            font-size:.72rem;
            font-weight:700;
            opacity:.85;
            letter-spacing:.02em;
            margin-top:2px;
        }

        .birthday-balloon{
            position:absolute;
            bottom:-80px;
            filter:drop-shadow(0 0 10px rgba(255,255,255,.35));
            animation-name:birthdayFloat;
            animation-timing-function:linear;
            animation-iteration-count:infinite;
        }

        .birthday-confetti{
            position:absolute;
            top:-20px;
            border-radius:2px;
            opacity:.9;
            animation-name:birthdayFall;
            animation-timing-function:linear;
            animation-iteration-count:infinite;
        }

        .birthday-spark{
            position:absolute;
            width:4px;
            height:4px;
            border-radius:999px;
            background:#fff;
            box-shadow:0 0 10px #fff, 0 0 18px #5ad1ff;
            animation:birthdaySpark 2.8s ease-in-out infinite;
        }

        .birthday-scan-glow{
            position:fixed;
            inset:0;
            z-index:9998;
            pointer-events:none;
            background:
            radial-gradient(circle at 20% 20%, rgba(90,209,255,.18), transparent 32%),
 radial-gradient(circle at 80% 30%, rgba(46,234,138,.14), transparent 34%),
 radial-gradient(circle at 50% 80%, rgba(255,217,77,.10), transparent 38%);
 animation:birthdayGlow 4s ease-in-out infinite alternate;
        }

        @keyframes birthdayFloat{
            0%{ transform:translateY(0) translateX(0) rotate(-4deg); opacity:0; }
            8%{ opacity:1; }
            50%{ transform:translateY(-55vh) translateX(24px) rotate(5deg); }
            100%{ transform:translateY(-115vh) translateX(-16px) rotate(-6deg); opacity:0; }
        }

        @keyframes birthdayFall{
            0%{ transform:translateY(0) rotate(0deg); opacity:1; }
            100%{ transform:translateY(115vh) rotate(720deg); opacity:0; }
        }

        @keyframes birthdayPulse{
            0%,100%{ transform:translateX(-50%) scale(1); }
            50%{ transform:translateX(-50%) scale(1.035); }
        }

        @keyframes birthdaySpark{
            0%,100%{ opacity:.15; transform:scale(.6); }
            50%{ opacity:1; transform:scale(1.7); }
        }

        @keyframes birthdayGlow{
            from{ opacity:.45; }
            to{ opacity:.85; }
        }
        `;

        document.head.appendChild(style);
    }

    function createOverlay(){
        if(document.getElementById("birthday-overlay")) return;

        const glow = document.createElement("div");
        glow.className = "birthday-scan-glow";

        const overlay = document.createElement("div");
        overlay.id = "birthday-overlay";

        const banner = document.createElement("div");
        banner.className = "birthday-system-banner";
        banner.innerHTML = `
        🎉 PROTOCOLO DE CELEBRACIÓN ACTIVADO 🎉
        <span class="birthday-subtitle">Sistema en estado de regeneración máxima</span>
        `;

        document.body.appendChild(glow);
        document.body.appendChild(overlay);
        document.body.appendChild(banner);
    }

    function createBalloon(){
        const el = document.createElement("div");
        const icons = ["🎈","✨","🎉"];

        el.className = "birthday-balloon";
        el.textContent = icons[Math.floor(Math.random()*icons.length)];
        el.style.left = Math.random()*100 + "%";
        el.style.fontSize = (26 + Math.random()*34) + "px";
        el.style.animationDuration = (7 + Math.random()*6) + "s";
        el.style.animationDelay = (Math.random()*5) + "s";

        return el;
    }

    function createConfetti(){
        const el = document.createElement("div");

        el.className = "birthday-confetti";
        el.style.left = Math.random()*100 + "%";
        el.style.width = (5 + Math.random()*5) + "px";
        el.style.height = (8 + Math.random()*9) + "px";
        el.style.background = `hsl(${Math.random()*360}, 90%, 62%)`;
        el.style.animationDuration = (4 + Math.random()*5) + "s";
        el.style.animationDelay = (Math.random()*5) + "s";

        return el;
    }

    function createSpark(){
        const el = document.createElement("div");

        el.className = "birthday-spark";
        el.style.left = Math.random()*100 + "%";
        el.style.top = Math.random()*100 + "%";
        el.style.animationDelay = (Math.random()*3) + "s";

        return el;
    }

    function runEffect(){
        const overlay = document.getElementById("birthday-overlay");
        if(!overlay) return;

        overlay.innerHTML = "";

        for(let i=0;i<20;i++) overlay.appendChild(createBalloon());
        for(let i=0;i<70;i++) overlay.appendChild(createConfetti());
        for(let i=0;i<35;i++) overlay.appendChild(createSpark());
    }

    function init(){
        const profile = readProfile();
        if(!profile) return;
        if(!isBirthdayToday(profile.birthDate)) return;

        injectStyles();
        createOverlay();
        runEffect();

        setInterval(runEffect, 45000);
    }

    if(document.readyState === "loading"){
        document.addEventListener("DOMContentLoaded", init);
    }else{
        init();
    }

})();
