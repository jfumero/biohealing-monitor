import React from 'react';
import { BODY_PATHS, VEIN_BRANCHES } from './nanobots';

const OUTLINE='M223 96 L221 110 Q202 109 190 117 Q172 125 168 147 L161 190 L145 230 L135 257 L128 270 L125 279 Q124 284 128 284 L137 272 L132 292 Q133 298 137 293 L145 275 L142 296 Q145 300 148 294 L152 276 L152 295 Q156 298 158 292 L160 276 L164 289 Q169 292 168 284 L163 263 L180 226 L194 185 L197 204 L193 237 Q192 261 203 284 L201 318 L207 354 L204 394 L208 451 L199 469 Q197 478 207 479 L226 478 Q231 475 228 466 L228 437 L231 385 L235 351 L240 298 L245 351 L249 385 L252 437 L252 466 Q249 475 254 478 L273 479 Q283 478 281 469 L272 451 L276 394 L273 354 L279 318 L277 284 Q288 261 287 237 L283 204 L286 185 L300 226 L317 263 L312 284 Q311 292 316 289 L320 276 L322 292 Q324 298 328 295 L328 276 L332 294 Q335 300 338 296 L335 275 L343 293 Q347 298 348 292 L343 272 L352 284 Q356 284 355 279 L352 270 L345 257 L335 230 L319 190 L312 147 Q308 125 290 117 Q278 109 259 110 L257 96';
const MUSCLES=[
  {d:'M220 103 Q215 115 197 122 Q213 124 233 136 L235 111 Z',box:[199,106,35,30]},
  {d:'M196 121 Q177 124 174 144 L179 170 Q185 146 200 137 Z',box:[171,123,32,51]},
  {d:'M204 132 Q220 129 236 140 L236 171 Q218 178 193 160 Q189 145 204 132 Z',box:[191,133,46,41]},
  {d:'M182 161 Q169 173 170 193 L162 212 Q179 205 186 184 L191 165 Z',box:[164,163,28,54]},
  {d:'M172 161 Q163 179 165 199 L157 218 Q166 206 170 193 Z',box:[155,162,20,57]},
  {d:'M164 210 Q152 228 143 258 L148 267 Q156 248 169 225 L174 209 Z',box:[140,209,35,60]},
  {d:'M173 218 L158 262 L155 272 Q165 261 179 230 Z',box:[153,219,26,53]},
  {d:'M195 170 L210 183 L207 200 L198 218 Q199 194 195 170 Z',box:[192,173,22,48]},
  {d:'M208 203 L217 218 L219 245 L235 270 Q211 257 200 241 Z',box:[197,202,40,71]},
  {d:'M201 255 Q209 263 235 280 L235 298 Q215 282 205 280 Z',box:[200,257,36,46]},
  {d:'M205 282 Q203 294 205 317 L211 342 Q226 330 223 309 L214 284 Z',box:[201,280,29,66]},
  {d:'M221 289 Q237 315 229 344 L223 354 Q222 332 216 317 Z',box:[215,290,23,66]},
  {d:'M225 277 L237 295 L234 326 L226 348 Q229 314 218 289 Z',box:[217,278,24,73]},
  {d:'M211 351 Q222 345 229 354 L227 367 Q216 374 211 365 Z',box:[208,349,23,23]},
  {d:'M210 374 Q207 394 213 422 L217 445 L221 416 Q225 389 219 375 Z',box:[207,374,19,72]},
  {d:'M224 373 Q233 389 226 425 L226 454 L220 454 Q225 415 222 395 Z',box:[218,372,15,82]},
];

function Muscle({muscle,id,index}) {
  const [x,y,w,h]=muscle.box;
  const clip=`${id}-muscle-${index}`;
  return <g>
    <defs><clipPath id={clip}><path d={muscle.d}/></clipPath></defs>
    <path d={muscle.d} fill={`url(#${id}-muscle)`} stroke="#64b49a" strokeWidth=".7"/>
    <g clipPath={`url(#${clip})`} fill="none" stroke="#a0e4bd" strokeWidth=".45" opacity=".34">
      {Array.from({length:13},(_,i)=>{const sy=y+h*i/12;return <path key={i} d={`M ${x-2} ${sy} Q ${x+w*.55} ${sy-h*.12} ${x+w+3} ${y+h*.26+h*i/16}`}/>;})}
    </g>
  </g>;
}

export function AnatomicalBody({id,opacity=.7}) {
  return <g className="anatomical-body" opacity={opacity} aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-shell`} x1="0" y1="0" x2="1" y2="0"><stop stopColor="#0a373b"/><stop offset=".28" stopColor="#377f69"/><stop offset=".5" stopColor="#0c3336"/><stop offset=".75" stopColor="#3d8c73"/><stop offset="1" stopColor="#103d42"/></linearGradient>
      <radialGradient id={`${id}-muscle`} cx=".32" cy=".25" r=".85"><stop stopColor="#6aaf84" stopOpacity=".95"/><stop offset=".47" stopColor="#368369" stopOpacity=".92"/><stop offset="1" stopColor="#103e40" stopOpacity=".95"/></radialGradient>
      <radialGradient id={`${id}-head`} cx=".35" cy=".25" r=".85"><stop stopColor="#80b69a"/><stop offset=".6" stopColor="#397865"/><stop offset="1" stopColor="#103b3e"/></radialGradient>
    </defs>
    <path d={OUTLINE} fill={`url(#${id}-shell)`} stroke="#70bfa5" strokeWidth="1"/>
    <path d="M215 56 Q215 30 240 29 Q265 30 265 56 L264 78 Q258 99 240 104 Q222 99 216 78 Z" fill={`url(#${id}-head)`} stroke="#80c0a4" strokeWidth=".85"/>
    <path d="M216 62 Q207 58 211 75 L218 81 M264 62 Q273 58 269 75 L262 81" fill="#337461" stroke="#78b39b" strokeWidth=".8"/>
    <g stroke="#a7d7b8" strokeWidth=".55" fill="none" opacity=".55"><path d="M218 61 Q227 53 236 62 M244 62 Q253 53 262 61 M235 62 L232 76 L239 79 M245 62 L248 76 L241 79 M229 88 Q240 84 251 88 M231 92 Q240 96 249 92 M218 72 Q224 79 230 82 M262 72 Q256 79 250 82 M226 40 Q235 44 237 55 M254 40 Q245 44 243 55 M240 32 V55"/></g>
    <path d="M221 64 Q228 60 233 65 Q227 68 221 64 M247 65 Q252 60 259 64 Q253 68 247 65" fill="#112d30" opacity=".8"/>
    {[false,true].map(mirror=><g key={String(mirror)} transform={mirror?'translate(480 0) scale(-1 1)':undefined}>
      {MUSCLES.map((muscle,i)=><Muscle key={i} muscle={muscle} id={id} index={`${mirror?'r':'l'}-${i}`}/>)}
      {[0,1,2,3].map(i=><g key={i}><path d={`M220 ${180+i*19} Q228 ${175+i*19} 237 ${179+i*19} L236 ${192+i*19} Q227 ${197+i*19} 219 ${192+i*19} Z`} fill={`url(#${id}-muscle)`} stroke="#6aa888" strokeWidth=".65"/><path d={`M223 ${184+i*19} Q229 ${181+i*19} 234 ${183+i*19}`} fill="none" stroke="#a0d1a9" strokeWidth=".5" opacity=".6"/></g>)}
      <g stroke="#99c7ab" fill="none" strokeWidth=".55" opacity=".55"><path d="M222 99 L235 132 M218 102 L229 129 M214 111 L234 138 M178 172 L167 204 M175 219 L157 265 M165 227 L149 264 M160 236 L144 263 M217 445 L215 466 M221 447 L222 466 M207 470 L224 470 M208 474 L225 474"/>
        {[0,1,2,3].map(i=><path key={i} d={`M${200+i*2} ${177+i*7} l12 7`}/>)}</g>
    </g>)}
    <path d="M240 114 V266 M236 275 Q240 279 244 275" stroke="#acddba" strokeWidth=".9" opacity=".45" fill="none"/>
    <ellipse cx="240" cy="252" rx="2.2" ry="3" fill="#123c37"/>
    <path d="M220 107 Q240 114 260 107 M198 128 Q215 118 235 129 M245 129 Q265 118 282 128" stroke="#b9e5c2" strokeWidth="1" fill="none" opacity=".5"/>
  </g>;
}

const asPath=points=>points.map((p,i)=>`${i?'L':'M'}${p.join(' ')}`).join(' ');
export function VascularLayer({opacity,id}) {
  return <g className="vascular-layer" opacity={opacity} aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <g stroke="#65e5bc" strokeWidth="4" opacity=".16" filter={`url(#${id}-glow)`}>{BODY_PATHS.map((path,i)=><path key={i} d={asPath(path)}/>)}</g>
    {BODY_PATHS.map((path,i)=><path key={i} d={asPath(path)} stroke={i%2?'#53b5c3':'#83eac3'} strokeWidth={i>7&&i<12?1.65:1.2} opacity=".84"/>)}
    {VEIN_BRANCHES.map((path,i)=><path key={i} d={asPath(path)} stroke={i%2?'#63c1c2':'#7cd6b4'} strokeWidth=".7" opacity=".7"/>)}
    <path d="M245 153 C237 149 237 141 243 142 Q249 137 253 145 Q259 147 252 155 L248 159 Z" fill="#6ccaa9" stroke="#b4f3cb" strokeWidth=".6" opacity=".65"/>
  </g>;
}
