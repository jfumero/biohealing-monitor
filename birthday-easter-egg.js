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
        const [Y,M,D] = birthDate.split("-").map(Number);

        return (
            today.getDate() === D &&
            (today.getMonth()+1) === M
        );
    }

    function createContainer(){
        if(document.getElementById("birthday-overlay")) return;

        const container = document.createElement("div");
        container.id = "birthday-overlay";
        container.style.position = "fixed";
        container.style.inset = "0";
        container.style.pointerEvents = "none";
        container.style.zIndex = "999";

        document.body.appendChild(container);
    }

    function createBalloon(){
        const el = document.createElement("div");
        el.textContent = "🎈";

        el.style.position = "absolute";
        el.style.left = Math.random()*100 + "%";
        el.style.bottom = "-50px";
        el.style.fontSize = (20 + Math.random()*30) + "px";
        el.style.animation = `floatUp ${6 + Math.random()*4}s linear infinite`;

        return el;
    }

    function createConfetti(){
        const el = document.createElement("div");

        el.style.position = "absolute";
        el.style.left = Math.random()*100 + "%";
        el.style.top = "-10px";
        el.style.width = "6px";
        el.style.height = "10px";
        el.style.background = `hsl(${Math.random()*360}, 80%, 60%)`;
        el.style.opacity = "0.8";
        el.style.animation = `fallDown ${4 + Math.random()*3}s linear infinite`;

        return el;
    }

    function injectStyles(){
        if(document.getElementById("birthday-styles")) return;

        const style = document.createElement("style");
        style.id = "birthday-styles";
        style.innerHTML = `
        @keyframes floatUp {
            from { transform: translateY(0); opacity:1; }
            to { transform: translateY(-110vh); opacity:0; }
        }

        @keyframes fallDown {
            from { transform: translateY(0); }
            to { transform: translateY(110vh); }
        }
        `;
        document.head.appendChild(style);
    }

    function runEffect(){
        const container = document.getElementById("birthday-overlay");
        if(!container) return;

        for(let i=0;i<15;i++){
            container.appendChild(createBalloon());
        }

        for(let i=0;i<25;i++){
            container.appendChild(createConfetti());
        }
    }

    function init(){
        const profile = readProfile();
        if(!profile) return;

        if(!isBirthdayToday(profile.birthDate)) return;

        createContainer();
        injectStyles();
        runEffect();

        console.log("🎉 Birthday mode activo");
    }

    if(document.readyState === "loading"){
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
