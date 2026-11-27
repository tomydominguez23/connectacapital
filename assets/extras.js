(function () {
  const WA = 'https://wa.me/56979705286?text=', enc = encodeURIComponent;
  const q = (s, r) => (r || document).querySelector(s), qa = (s, r) => [...(r || document).querySelectorAll(s)];
  const el = (h) => { const d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstChild; };
  const fmt = (x) => Math.round(x).toLocaleString('es-CL');
  const page = document.body.dataset.page;
  const dlg = (inner) => { const d = el('<dialog class="x-dlg"><div class="in"><button type="button" class="x-close" aria-label="Cerrar">×</button>' + inner + '</div></dialog>'); document.body.appendChild(d); q('.x-close', d).onclick = () => d.close(); d.addEventListener('click', (e) => { if (e.target === d) d.close(); }); return d; };
  const div = (credUf, tasa, plazo, uf) => { const r = tasa / 100 / 12, n = plazo * 12; return n > 0 ? (r > 0 ? credUf * uf * r / (1 - Math.pow(1 + r, -n)) : credUf * uf / n) : 0; };

  /* ---------- Sitio público ---------- */
  if (page === 'index' && typeof P !== 'undefined') {
    const wraps = qa('.pwrap'); P.forEach((p, i) => { p.zona = wraps[i].dataset.zona; });
    // 1. WhatsApp con contexto
    wraps.forEach((w, i) => qa('a[href^="https://wa.me"]', w).forEach((a) => { a.href = WA + enc('Hola Diego, quiero la ficha y la disponibilidad de ' + P[i].nombre + ' (desde UF ' + P[i].uf + ').'); }));
    const calcA = qa('#calculadora a[href^="https://wa.me"]')[0];
    const setCalc = () => { calcA.href = WA + enc('Hola Diego, usé la calculadora de Connecta: podría comprar un departamento de UF ' + q('#o-valorUf').textContent + ' con un dividendo máximo de $' + q('#o-dividendo').textContent + '. ¿Lo revisamos?'); };
    ['pointerdown', 'focus', 'click'].forEach((ev) => calcA.addEventListener(ev, setCalc)); setCalc();
    const cmpA = el('<a class="x-btn wa" style="align-self:flex-start" href="#">Enviar esta comparación a Diego por WhatsApp</a>');
    q('#cmp-hay').after(cmpA);
    const setCmp = () => { const n = qa('#cmp-cols h3').map((h) => h.textContent); cmpA.href = WA + enc('Hola Diego, estoy comparando ' + n.join(', ') + '. ¿Cuál me recomiendas para mi caso?'); cmpA.style.display = n.length ? '' : 'none'; };
    ['pointerdown', 'focus', 'click'].forEach((ev) => cmpA.addEventListener(ev, setCmp));
    new MutationObserver(setCmp).observe(q('#cmp-cols'), { childList: true }); setCmp();

    // 2. Simulador de inversión
    const sim = el('<section id="simulador" class="x-sim"><div class="col"><div><div class="x-eyebrow">Simulador de inversión</div><h2>¿Se paga solo con el arriendo?</h2><p style="margin:0;font-size:16px;line-height:1.55;color:#535660">Elige un proyecto, ajusta el pie y escribe el arriendo que esperas cobrar. Calculamos el dividendo y cuánto te sobra o te falta cada mes.</p></div>' +
      '<div class="x-grid"><label>Proyecto<select id="s-proy">' + P.map((p, i) => '<option value="' + i + '">' + p.nombre + ' · UF ' + p.uf + '</option>').join('') + '</select></label>' +
      '<label>Valor del departamento (UF)<input id="s-valor" type="number"></label><label>Pie (%)<input id="s-pie" type="number" value="20"></label><label>Tasa anual (%)<input id="s-tasa" type="number" step="0.1" value="4.5"></label>' +
      '<label>Plazo (años)<input id="s-plazo" type="number" value="30"></label><label>Arriendo mensual esperado ($)<input id="s-arr" type="number" placeholder="Ej.: 450000"></label></div></div>' +
      '<div class="col"><div class="panel" style="display:flex;flex-direction:column;gap:14px"><div class="x-eyebrow">Resultado mensual</div>' +
      '<div class="x-out"><div class="hi" style="grid-column:1/-1">Flujo mensual (arriendo − dividendo)<strong id="s-flujo">—</strong></div><div>Dividendo estimado<strong id="s-div"></strong></div><div>Pie a juntar<strong id="s-pietot"></strong></div><div>Crédito<strong id="s-cred"></strong></div><div>Rentabilidad bruta anual<strong id="s-rent">—</strong></div></div>' +
      '<a id="s-wa" class="x-btn pri" href="#">Revisar esta simulación con Diego</a><p style="margin:0;font-size:12px;line-height:1.5;color:#535660">Cálculo referencial con el valor UF de la calculadora. No incluye gastos comunes, contribuciones, seguros ni meses sin arrendatario. El arriendo lo ingresas tú: pídele a Diego el valor de mercado de cada proyecto.</p></div></div></section>');
    q('#asesoria').before(sim);
    const g = (id) => Number(q('#' + id).value) || 0;
    const runSim = () => {
      const uf = Number(q('#f-uf').value) || 40000, valor = g('s-valor'), pie = valor * g('s-pie') / 100, cred = valor - pie, d = div(cred, g('s-tasa'), g('s-plazo'), uf), arr = g('s-arr');
      q('#s-div').textContent = '$' + fmt(d); q('#s-pietot').textContent = 'UF ' + fmt(pie) + ' · $' + fmt(pie * uf); q('#s-cred').textContent = 'UF ' + fmt(cred);
      const f = q('#s-flujo'); f.classList.remove('x-pos', 'x-neg');
      if (arr > 0) { const fl = arr - d; f.textContent = (fl >= 0 ? '+$' : '−$') + fmt(Math.abs(fl)); f.classList.add(fl >= 0 ? 'x-pos' : 'x-neg'); q('#s-rent').textContent = (arr * 12 / (valor * uf) * 100).toFixed(1).replace('.', ',') + '%'; }
      else { f.textContent = 'Ingresa el arriendo'; q('#s-rent').textContent = '—'; }
      q('#s-wa').href = WA + enc('Hola Diego, simulé ' + P[g('s-proy')].nombre + ' en UF ' + fmt(valor) + ' con ' + g('s-pie') + '% de pie: dividendo de $' + fmt(d) + (arr > 0 ? ' y arriendo esperado de $' + fmt(arr) : '') + '. ¿Lo revisamos?');
    };
    q('#s-proy').addEventListener('input', () => { q('#s-valor').value = P[g('s-proy')].n; runSim(); });
    qa('#simulador input').forEach((i) => i.addEventListener('input', runSim)); q('#f-uf').addEventListener('input', runSim);
    q('#s-valor').value = P[0].n; runSim();
    const navCalc = q('header nav a[href="#calculadora"]'); if (navCalc) navCalc.after(el('<a href="#simulador" style="' + navCalc.getAttribute('style') + '">Simulador</a>'));

    // 3. Asistente de 3 preguntas
    const fab = el('<button type="button" class="x-fab">Encuentra tu depto en 30 segundos</button>'); document.body.appendChild(fab);
    const d = dlg('<div id="qz"></div>'), box = q('#qz', d), ans = {};
    const steps = [['obj', '¿Para qué quieres comprar?', [['Invertir y arrendar', 'invertir'], ['Vivir yo', 'vivir'], ['Aún estoy explorando', 'explorar']]],
      ['zona', '¿Dónde te interesa?', [['Región Metropolitana', 'RM'], ['Costa', 'Costa'], ['Me da lo mismo', 'Todos']]],
      ['tope', '¿Hasta qué valor quieres llegar?', [['Hasta UF 2.500', 2500], ['Hasta UF 3.000', 3000], ['Hasta UF 4.000', 4000], ['Sin tope', 0]]]];
    const show = (k) => {
      if (k < 3) { const s = steps[k]; box.innerHTML = '<div class="x-eyebrow">Pregunta ' + (k + 1) + ' de 3</div><h2 style="margin:8px 0 14px">' + s[1] + '</h2><div class="x-opts">' + s[2].map((o, i) => '<button type="button" data-i="' + i + '">' + o[0] + '</button>').join('') + '</div>';
        qa('button', box).forEach((b) => { b.onclick = () => { ans[s[0]] = s[2][b.dataset.i]; show(k + 1); }; }); return; }
      let r = P.filter((p) => (ans.zona[1] === 'Todos' || p.zona === ans.zona[1]) && (ans.tope[1] === 0 || p.n <= ans.tope[1])).sort((a, b) => a.n - b.n);
      if (ans.obj[1] === 'vivir') r.sort((a, b) => (/inmediata/i.test(b.entrega) ? 1 : 0) - (/inmediata/i.test(a.entrega) ? 1 : 0));
      const top = r.slice(0, 3), msg = 'Hola Diego, hice el asistente de la web. Objetivo: ' + ans.obj[0] + '. Zona: ' + ans.zona[0] + '. Presupuesto: ' + ans.tope[0] + '.' + (top.length ? ' Me aparecieron: ' + top.map((p) => p.nombre).join(', ') + '.' : '') + ' ¿Conversemos?';
      box.innerHTML = '<div class="x-eyebrow">Tu resultado</div><h2 style="margin:8px 0 6px">' + (r.length ? r.length + (r.length === 1 ? ' proyecto calza' : ' proyectos calzan') + ' contigo' : 'Hoy no hay un proyecto publicado con ese filtro') + '</h2>' +
        '<p style="margin-bottom:12px">' + (r.length ? 'Estos son los que mejor se ajustan. Diego puede confirmarte disponibilidad y condiciones.' : 'Tenemos más alternativas que no están en la web. Cuéntale a Diego lo que buscas.') + '</p>' +
        '<div class="x-opts" style="margin-bottom:14px">' + top.map((p) => '<div class="x-res"><span><b>' + p.nombre + '</b><br><span style="font-size:13px;color:#535660">' + p.comuna + ' · ' + p.entrega + '</span></span><strong>UF ' + p.uf + '</strong></div>').join('') + '</div>' +
        '<div class="x-row"><a class="x-btn wa" href="' + WA + enc(msg) + '">Enviar mis respuestas a Diego</a>' + (r.length ? '<button type="button" class="x-btn" id="qz-ver">Ver estos proyectos</button>' : '') + '<button type="button" class="x-btn" id="qz-re">Empezar de nuevo</button></div>';
      q('#qz-re', box).onclick = () => show(0);
      const v = q('#qz-ver', box); if (v) v.onclick = () => { q('#f-zona').value = ans.zona[1]; q('#f-tope').value = [0, 2500, 3000, 3500, 4000].includes(ans.tope[1]) ? String(ans.tope[1]) : '0'; q('#f-zona').dispatchEvent(new Event('input')); d.close(); q('#proyectos').scrollIntoView({ behavior: 'smooth' }); };
    };
    fab.onclick = () => { show(0); d.showModal(); };
  }

  /* ---------- Galerías con fotos oficiales de cada inmobiliaria ---------- */
  const gal = (base, n, first) => (first || [base + '.jpg']).concat(Array.from({ length: n }, (_, i) => base + '-' + (i + 2) + '.jpg')).map((f) => 'assets/' + f);
  const G = [
    ['casa-bustamante.jpg', 'casa-patio.jpg', 'casa-lobby.jpg', 'casa-bustamante-4.jpg', 'casa-bustamante-5.jpg', 'casa-bustamante-6.jpg', 'casa-bustamante-7.jpg'].map((f) => 'assets/' + f),
    gal('eco-egana', 1), gal('los-barbechos', 0), gal('vima', 3), gal('eco-quilin', 2), gal('carmen-marin', 4), gal('tempus', 0), gal('parque-maranon', 4), gal('playa-penuelas', 5)];
  const CRED = ['Exxacon', 'Fundamenta', '', 'Ingevec', 'Fundamenta', 'Norte Verde', '', 'RVC', 'Norte Verde'];
  if (page === 'index' || page === 'brokers') qa('.pwrap').forEach((w, i) => {
    const img = q('img', w), fotos = G[i]; if (!img || fotos.length < 2) return;
    const box = img.parentElement; let k = 0; if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
    const count = el('<span class="x-count"></span>'), nombre = img.alt.replace('Proyecto ', '');
    const go = (d) => { k = (k + d + fotos.length) % fotos.length; img.src = fotos[k]; img.alt = nombre + ', foto ' + (k + 1) + ' de ' + fotos.length; count.textContent = (k + 1) + ' / ' + fotos.length; };
    const prev = el('<button type="button" class="x-gal prev" aria-label="Foto anterior de ' + nombre + '">‹</button>'), next = el('<button type="button" class="x-gal next" aria-label="Foto siguiente de ' + nombre + '">›</button>');
    prev.onclick = () => go(-1); next.onclick = () => go(1); box.append(prev, next, count); go(0);
    fotos.slice(1).forEach((f) => { const pre = new Image(); pre.loading = 'lazy'; pre.src = f; });
  });
  if (page === 'proyecto') {
    const main = q('section img'), grid = main.nextElementSibling, fotos = G[0];
    const row = el('<div class="x-thumbs" role="group" aria-label="Fotos de Casa Bustamante"></div>');
    fotos.forEach((f, i) => { const b = el('<button type="button" aria-pressed="' + (i === 0) + '" aria-label="Ver foto ' + (i + 1) + ' de ' + fotos.length + '"><img src="' + f + '" alt=""></button>');
      b.onclick = () => { main.src = f; qa('button', row).forEach((x) => x.setAttribute('aria-pressed', x === b)); }; row.appendChild(b); });
    grid.replaceWith(row); row.after(el('<p class="x-credit">Imágenes: Exxacon y Connecta Capital. Referenciales.</p>'));
  }
  if (page === 'proyecto') qa('a[href^="https://wa.me"]').forEach((a) => { a.href = WA + enc('Hola Diego, quiero evaluar Casa Bustamante (desde UF 3.956, entrega inmediata). ¿Me envías disponibilidad?'); });
  if (page === 'index' || page === 'proyecto') { document.body.classList.add('x-hasbar'); document.body.appendChild(el('<div class="x-mbar"><a class="x-btn gold" href="https://calendly.com/connectacapital/30min">Agendar 30 min</a><a class="x-btn wa" href="' + WA + enc('Hola Diego, quiero una asesoría sin costo.') + '">WhatsApp</a></div>')); }

  /* ---------- Brokers: cotizador ---------- */
  if (page === 'brokers') {
    const d = dlg('<div class="x-eyebrow">Cotización para un lead</div><h2 id="c-tit"></h2>' +
      '<div class="x-grid"><label>Nombre del lead<input id="c-lead" type="text" placeholder="Ej.: Fernanda Araya"></label><label>Precio lista (UF)<input id="c-uf" type="number"></label>' +
      '<label>Descuento (%)<input id="c-desc" type="number" value="0"></label><label>Pie (%)<input id="c-pie" type="number" value="20"></label><label>Cuotas de pie<input id="c-cuo" type="number" value="24"></label><label>Valor UF ($)<input id="c-vuf" type="number" value="40000"></label>' +
      '<label>Tasa anual (%)<input id="c-tasa" type="number" step="0.1" value="4.5"></label><label>Plazo (años)<input id="c-plazo" type="number" value="30"></label></div>' +
      '<div class="x-out"><div class="hi">Precio final<strong id="c-fin"></strong></div><div class="hi">Dividendo estimado<strong id="c-div"></strong></div><div>Pie total<strong id="c-pt"></strong></div><div>Cuota de pie mensual<strong id="c-cp"></strong></div></div>' +
      '<div class="x-row"><a id="c-wa" class="x-btn wa" href="#">Enviar por WhatsApp</a><button type="button" id="c-copy" class="x-btn">Copiar resumen</button></div><div class="x-toast" id="c-toast" role="status"></div><p style="font-size:12px">Valores referenciales, sujetos a confirmación de la inmobiliaria y evaluación bancaria.</p>');
    let nombre = '', texto = '';
    const g = (id) => Number(q('#' + id).value) || 0;
    const run = () => { const fin = g('c-uf') * (1 - g('c-desc') / 100), pie = fin * g('c-pie') / 100, cu = Math.max(1, g('c-cuo')), dv = div(fin - pie, g('c-tasa'), g('c-plazo'), g('c-vuf'));
      q('#c-fin').textContent = 'UF ' + fmt(fin); q('#c-div').textContent = '$' + fmt(dv); q('#c-pt').textContent = 'UF ' + fmt(pie) + ' · $' + fmt(pie * g('c-vuf')); q('#c-cp').textContent = '$' + fmt(pie * g('c-vuf') / cu) + ' × ' + cu;
      const lead = q('#c-lead').value.trim();
      texto = 'Hola' + (lead ? ' ' + lead.split(' ')[0] : '') + ', te envío la cotización de ' + nombre + ':\n• Precio: UF ' + fmt(fin) + (g('c-desc') ? ' (incluye ' + g('c-desc') + '% de descuento)' : '') + '\n• Pie ' + g('c-pie') + '%: UF ' + fmt(pie) + ' en ' + cu + ' cuotas de $' + fmt(pie * g('c-vuf') / cu) + '\n• Dividendo estimado: $' + fmt(dv) + ' a ' + g('c-plazo') + ' años\nValores referenciales, sujetos a confirmación. — Connecta Capital';
      q('#c-wa').href = 'https://wa.me/?text=' + enc(texto); };
    qa('input', d).forEach((i) => i.addEventListener('input', run));
    q('#c-copy').onclick = () => { const t = q('#c-toast'); (navigator.clipboard ? navigator.clipboard.writeText(texto) : Promise.reject()).then(() => { t.textContent = 'Resumen copiado.'; }, () => { t.textContent = 'No se pudo copiar aquí; usa el botón de WhatsApp.'; }); };
    qa('.pwrap').forEach((w) => { const n = q('h2', w).textContent, bs = qa('button', w);
      bs[0].onclick = () => { nombre = n; q('#c-tit').textContent = n; q('#c-uf').value = w.dataset.uf; q('#c-toast').textContent = ''; run(); d.showModal(); };
      const a = el('<a href="https://wa.me/?text=' + enc('Te comparto la ficha de ' + n + ' (' + w.dataset.comuna + '), desde UF ' + fmt(Number(w.dataset.uf)) + '. — Connecta Capital') + '">' + bs[1].textContent + '</a>');
      a.setAttribute('style', bs[1].getAttribute('style') + ';text-decoration:none;display:flex;align-items:center;justify-content:center;text-align:center'); bs[1].replaceWith(a); });
  }
})();
