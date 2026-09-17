export const MODULES = [
  { id: 'org-internos', title: 'Órganos internos', detail: 'Rejuvenecimiento', icon: '✧' },
  { id: 'org-externos', title: 'Piel y tejidos', detail: 'Renovación', icon: '◈' },
  { id: 'glucosa', title: 'Equilibrio de azúcar', detail: 'Regulación', icon: '⌁' },
  { id: 'globulos', title: 'Sistema inmune', detail: 'Protección', icon: '◇' },
  { id: 'presion', title: 'Presión arterial', detail: 'Equilibrio', icon: '♡' },
  { id: 'detox', title: 'Función hepática', detail: 'Depuración', icon: '✳' },
  { id: 'metabolismo', title: 'Metabolismo', detail: 'Energía', icon: 'ϟ' },
];
export const QUEUE = ['Agua','Oxígeno','Carbohidratos','Grasas saludables','Proteínas','Minerales','Vitaminas','Dopamina','Serotonina','GABA','Glutamato','Acetilcolina','Insulina','Glucagón','T3/T4','GH','Cortisol','Melatonina','Testosterona','Estrógeno','Progesterona','Leptina','Grelina','Metabolismo energético','Sistema inmune','Microbiota intestinal','Sodio','Potasio','Calcio','Músculos','Huesos','Tejido conectivo','Movimiento','Sueño','Gestión emocional','Conexión social','Alimentación','Hidratación','Exposición solar','Aire limpio','Higiene y prevención','ADN','Reparación celular','Células madre','Telómeros','Autofagia'];
export const SESSION_SECONDS = 60;
export const INITIAL_SESSION = { status: 'idle', elapsed: 0 };
export function sessionReducer(state, action) {
  switch (action.type) {
    case 'start': return { status: 'running', elapsed: 0 };
    case 'pause': return state.status === 'running' ? { ...state, status: 'paused' } : state;
    case 'resume': return state.status === 'paused' ? { ...state, status: 'running' } : state;
    case 'cancel': return { ...state, status: 'cancelled' };
    case 'tick': {
      if (state.status !== 'running') return state;
      const elapsed = Math.min(SESSION_SECONDS, state.elapsed + action.seconds);
      return { elapsed, status: elapsed >= SESSION_SECONDS ? 'complete' : 'running' };
    }
    default: return state;
  }
}
export function progress(elapsed) { return Math.max(0, Math.min(100, elapsed / SESSION_SECONDS * 100)); }
