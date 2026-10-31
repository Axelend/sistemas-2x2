const $ = (s) => document.querySelector(s);
      let xp = 0,
        best = 0,
        cur = "learn",
        g = { id: 0 };
      try {
        xp = +localStorage.getItem("xp") || 0;
        best = +localStorage.getItem("best") || 0;
      } catch (e) {}
      const save = () => {
        try {
          localStorage.setItem("xp", xp);
          localStorage.setItem("best", best);
        } catch (e) {}
      };
      const lvl = () => 1 + Math.floor(xp / 40);
      const xpb = () => {
        $("#lv").textContent = "Nivel " + lvl() + " · " + xp + " XP";
        $("#xb").style.width = ((xp % 40) / 40) * 100 + "%";
      };
      const addXP = (n) => {
        xp += n;
        save();
        xpb();
      };
      const m = (v) => (v < 0 ? "−" + -v : "" + v);
      const pv = (v) =>
        parseFloat(String(v).replace("−", "-").replace(",", "."));
      function term(k, v, f) {
        if (!k) return "";
        const a = Math.abs(k),
          c = (a === 1 ? "" : a) + v;
        return f ? (k < 0 ? "−" : "") + c : (k < 0 ? " − " : " + ") + c;
      }
      const eq = (a, b, c) => {
        let s = term(a, "x", 1);
        s += term(b, "y", !s);
        return (s || "0") + " = " + m(c);
      };
      const R = (k) => {
        let n = 0;
        while (!n) n = Math.floor(Math.random() * (2 * k + 1)) - k;
        return n;
      };
      function gen(lv) {
        const k = lv < 2 ? 3 : lv < 4 ? 5 : 7;
        for (;;) {
          const x = R(8),
            y = R(8);
          let a1 = R(k),
            b1 = R(k),
            a2 = R(k),
            b2 = R(k);
          if (lv < 2) a1 = 1;
          if (a1 * b2 - a2 * b1 === 0) continue;
          return {
            x,
            y,
            a1,
            b1,
            c1: a1 * x + b1 * y,
            a2,
            b2,
            c2: a2 * x + b2 * y,
          };
        }
      }
      function steps(S) {
        const { a1, b1, c1, a2, b2, c2 } = S,
          D = a1 * b2 - a2 * b1;
        return [
          `Elimina y: multiplica (1) por ${m(b2)} y (2) por ${m(b1)} → ${eq(a1 * b2, b1 * b2, c1 * b2)} ; ${eq(a2 * b1, b2 * b1, c2 * b1)}`,
          `Resta (1) − (2): ${term(D, "x", 1)} = ${m(c1 * b2 - c2 * b1)}`,
          `Despeja: x = ${m(S.x)}`,
          `Sustituye x en (1) y despeja: y = ${m(S.y)}. Comprueba en (2).`,
        ];
      }
      function graph(S) {
        const P = (x, y) => `${120 + 12 * x},${120 - 12 * y}`;
        let h =
          '<svg viewBox="0 0 240 240" class="gr" role="img" aria-label="Gráfica de las dos rectas"><path d="M0 120H240M120 0V240" stroke="var(--mut)"/>';
        for (let i = -9; i <= 9; i++)
          if (i)
            h += `<path d="M${120 + 12 * i} 0V240M0 ${120 + 12 * i}H240" stroke="var(--bd)" stroke-width=".5"/>`;
        [
          [S.a1, S.b1, S.c1, "var(--ac)"],
          [S.a2, S.b2, S.c2, "var(--bad)"],
        ].forEach(([a, b, c, col]) => {
          const p = b
            ? [-10, 10].map((x) => P(x, (c - a * x) / b))
            : [P(c / a, -10), P(c / a, 10)];
          h += `<polyline points="${p.join(" ")}" stroke="${col}" stroke-width="2" fill="none"/>`;
        });
        return (
          h +
          `<circle cx="${120 + 12 * S.x}" cy="${120 - 12 * S.y}" r="4.5" fill="var(--ok)"/></svg><div class="tip">Las rectas se cruzan en (${m(S.x)}, ${m(S.y)}): esa es la solución.</div>`
        );
      }
      function go(t) {
        clearInterval(g.id);
        cur = t;
        document
          .querySelectorAll("nav button")
          .forEach((b) => b.classList.toggle("on", b.dataset.t === t));
        ({
          learn: rL,
          prac: newP,
          game: rG0,
          prob: () => {
            pb.i = 0;
            rB();
          },
        })[t]();
        xpb();
      }

      /* APRENDE */
      const MT = {
        red: "Reducción",
        sus: "Sustitución",
        igu: "Igualación",
        gra: "Gráfico",
      };
      const MS = {
        red: [
          "Multiplica (2) por 3 para igualar los coeficientes de y: 12x − 3y = 15",
          "Suma esa ecuación con (1): 14x + 0y = 28 → 14x = 28",
          "Despeja: x = 28 ÷ 14 = 2",
          "Sustituye x = 2 en (1): 4 + 3y = 13 → 3y = 9 → y = 3",
          "Comprueba: 2(2) + 3(3) = 13 ✔ y 4(2) − 3 = 5 ✔",
        ],
        sus: [
          "Despeja y en (2): y = 4x − 5",
          "Sustituye en (1): 2x + 3(4x − 5) = 13",
          "Resuelve: 2x + 12x − 15 = 13 → 14x = 28 → x = 2",
          "Con x = 2: y = 4(2) − 5 = 3",
          "Comprueba en las dos ecuaciones ✔",
        ],
        igu: [
          "Despeja x en ambas: de (1) x = (13 − 3y)/2 y de (2) x = (5 + y)/4",
          "Iguala los dos resultados: (13 − 3y)/2 = (5 + y)/4",
          "Multiplica por 4: 2(13 − 3y) = 5 + y → 26 − 6y = 5 + y",
          "Resuelve: 21 = 7y → y = 3",
          "Sustituye: x = (5 + 3)/4 = 2. Comprueba ✔",
        ],
        gra: [
          "Despeja y: (1) y = (13 − 2x)/3 y (2) y = 4x − 5",
          "Tabula dos puntos por recta: (2, 3) y (5, 1) para (1); (1, −1) y (2, 3) para (2)",
          "Traza ambas rectas en el plano",
          "Se cruzan en (2, 3): x = 2, y = 3",
        ],
      };
      let L = { k: "red", n: 1 };
      function rL() {
        const S0 = { a1: 2, b1: 3, c1: 13, a2: 4, b2: -1, c2: 5, x: 2, y: 3 },
          st = MS[L.k];
        $("#app").innerHTML =
          `<div class="card"><h2>Ejemplo guiado</h2><div class="eqs">(1) 2x + 3y = 13<br>(2) 4x − y = 5</div>
<div class="row">${Object.keys(MT)
            .map(
              (k) =>
                `<button class="${k === L.k ? "" : "s"}" onclick="L={k:'${k}',n:1};rL()">${MT[k]}</button>`,
            )
            .join("")}</div>
${st
  .slice(0, L.n)
  .map((t, i) => `<div class="step"><b>Paso ${i + 1}.</b> ${t}</div>`)
  .join("")}
<div class="row"><button onclick="L.n=L.n<${st.length}?L.n+1:1;rL()">${L.n < st.length ? "Siguiente paso" : "Reiniciar"}</button></div>
${L.k === "gra" && L.n === st.length ? graph(S0) : ""}</div>
<div class="tip">📖 <b>Con tu Baldor:</b> busca el capítulo de ecuaciones simultáneas de primer grado con dos incógnitas (el número de capítulo y de página cambia según la edición). Lee cómo explica cada método, copia un ejemplo resuelto y haz primero los ejercicios propuestos; revisa las respuestas al final del libro y luego practica aquí.</div>
<div class="tip"><b>¿Cuántas soluciones?</b> Rectas que se cruzan → una solución. Rectas paralelas → ninguna (sistema incompatible). Rectas que coinciden → infinitas (sistema indeterminado).</div>`;
      }

      /* PRACTICA */
      let pr = {};
      function newP() {
        pr = { S: gen(Math.min(5, lvl())), h: 0, t: 0 };
        const S = pr.S;
        $("#app").innerHTML =
          `<div class="card"><h2>Resuelve el sistema</h2><div class="eqs">(1) ${eq(S.a1, S.b1, S.c1)}<br>(2) ${eq(S.a2, S.b2, S.c2)}</div>
<div class="row">x = <input id="ax" inputmode="decimal"> y = <input id="ay" inputmode="decimal"></div>
<div class="row"><button id="go" onclick="chk()">Comprobar</button><button class="s" onclick="hint()">Pista</button><button class="s" onclick="hint(1)">Ver solución</button><button class="s" onclick="newP()">Otro</button></div>
<div id="fb"></div><div id="sol"></div></div><div class="tip">Usa el método que prefieras (reducción, sustitución o igualación). Las pistas muestran el camino por reducción. Sin pistas ganas más XP.</div>`;
      }
      const fb = (t, c) => {
        $("#fb").innerHTML = `<p class="${c ? "ok" : "no"}">${t}</p>`;
      };
      function hint(all) {
        const st = steps(pr.S);
        pr.h = all ? st.length : Math.min(pr.h + 1, st.length);
        $("#sol").innerHTML =
          st
            .slice(0, pr.h)
            .map((t) => `<div class="step">${t}</div>`)
            .join("") + (all ? graph(pr.S) : "");
      }
      function chk() {
        const S = pr.S,
          x = pv($("#ax").value),
          y = pv($("#ay").value);
        if (isNaN(x) || isNaN(y))
          return fb("Escribe un número en x y otro en y.", 0);
        pr.t++;
        if (x === S.x && y === S.y) {
          const n = pr.h ? 5 : pr.t === 1 ? 15 : 10;
          addXP(n);
          fb(
            `¡Correcto! +${n} XP. Comprobación: ${m(S.a1)}(${m(x)}) + ${m(S.b1)}(${m(y)}) = ${m(S.c1)} ✔`,
            1,
          );
          $("#sol").innerHTML = graph(S);
          return;
        }
        const e1 = S.a1 * x + S.b1 * y,
          e2 = S.a2 * x + S.b2 * y;
        fb(
          `Todavía no. Con tus valores, (1) da ${m(e1)} (debe ser ${m(S.c1)}) y (2) da ${m(e2)} (debe ser ${m(S.c2)}). ${x === S.x ? "Tu x está bien: revisa y." : y === S.y ? "Tu y está bien: revisa x." : "Revisa los signos al operar."}`,
          0,
        );
      }

      /* RETO */
      function rG0() {
        $("#app").innerHTML =
          `<div class="card"><h2>🎮 Reto contrarreloj</h2><p>Tienes 3 vidas y 40 segundos por sistema. Cada acierto suma puntos; las rachas y la rapidez dan bonus. Los sistemas se vuelven más difíciles.</p><p>Mejor puntaje: <b>${best}</b></p><button id="go" onclick="gStart()">Comenzar</button></div>`;
      }
      function gStart() {
        g = { id: 0, lives: 3, score: 0, streak: 0, round: 0 };
        gNext();
      }
      function gNext() {
        clearInterval(g.id);
        g.round++;
        g.S = gen(Math.min(5, 1 + Math.floor(g.round / 3)));
        g.t = 40;
        gR();
        g.id = setInterval(() => {
          g.t--;
          const e = $("#tm");
          if (e) e.textContent = g.t;
          if (g.t <= 0) gLose("¡Se acabó el tiempo!");
        }, 1000);
      }
      function gR() {
        const S = g.S;
        $("#app").innerHTML =
          `<div class="card"><div class="row"><span>${"❤️".repeat(g.lives)}</span><span>⏱ <b id="tm">${g.t}</b> s</span><span>⭐ ${g.score}</span><span>🔥 ${g.streak}</span></div>
<div class="eqs">(1) ${eq(S.a1, S.b1, S.c1)}<br>(2) ${eq(S.a2, S.b2, S.c2)}</div>
<div class="row">x = <input id="ax" inputmode="decimal"> y = <input id="ay" inputmode="decimal"><button id="go" onclick="gSend()">Enviar</button></div></div>`;
        $("#ax").focus();
      }
      function gSend() {
        const S = g.S,
          x = pv($("#ax").value),
          y = pv($("#ay").value);
        if (isNaN(x) || isNaN(y)) return;
        if (x === S.x && y === S.y) {
          g.score += 10 + g.streak * 2 + Math.floor(g.t / 4);
          g.streak++;
          gNext();
        } else gLose("Incorrecto.");
      }
      function gLose(msg) {
        clearInterval(g.id);
        g.lives--;
        g.streak = 0;
        const S = g.S;
        if (g.lives <= 0) return gEnd();
        $("#app").innerHTML =
          `<div class="card"><p class="no big">${msg}</p><p>La solución era x = ${m(S.x)}, y = ${m(S.y)}.</p>${steps(
            S,
          )
            .map((t) => `<div class="step">${t}</div>`)
            .join(
              "",
            )}<p>Vidas: ${"❤️".repeat(g.lives)}</p><button id="go" onclick="gNext()">Siguiente</button></div>`;
      }
      function gEnd() {
        const nb = g.score > best;
        if (nb) best = g.score;
        addXP(Math.floor(g.score / 10));
        save();
        $("#app").innerHTML =
          `<div class="card"><h2>Fin del juego</h2><p class="big">${g.score} puntos</p><p>${nb ? "🏆 ¡Nuevo récord!" : "Récord: " + best}. Ganaste ${Math.floor(g.score / 10)} XP.</p><button id="go" onclick="gStart()">Jugar otra vez</button></div>`;
      }

      /* PROBLEMAS */
      const PB = [
        {
          t: "La suma de dos números es 25 y su diferencia es 7. ¿Cuáles son?",
          v: "x = número mayor, y = número menor",
          o: [
            "x + y = 25 ; y − x = 7",
            "x + y = 25 ; x − y = 7",
            "x · y = 25 ; x − y = 7",
          ],
          ok: 1,
          s: [16, 9],
          ex: "“Suma” y “diferencia” se traducen directo.",
        },
        {
          t: "2 lápices y 3 cuadernos cuestan $39; 3 lápices y 1 cuaderno cuestan $20. ¿Cuánto cuesta cada uno?",
          v: "x = precio del lápiz, y = precio del cuaderno",
          o: [
            "3x + 2y = 39 ; x + 3y = 20",
            "2x + 3y = 20 ; 3x + y = 39",
            "2x + 3y = 39 ; 3x + y = 20",
          ],
          ok: 2,
          s: [3, 11],
          ex: "Cada compra es una ecuación: cantidad × precio.",
        },
        {
          t: "Un padre tiene 4 veces la edad de su hijo y juntos suman 50 años. ¿Qué edad tiene cada uno?",
          v: "x = edad del padre, y = edad del hijo",
          o: [
            "x + y = 50 ; x − 4y = 0",
            "x − y = 50 ; x = 4y",
            "x + y = 50 ; 4x = y",
          ],
          ok: 0,
          s: [40, 10],
          ex: "“4 veces” multiplica a la edad del hijo: x = 4y.",
        },
        {
          t: "Se vendieron 120 boletos: adultos a $50 y niños a $30. Se recaudaron $5200. ¿Cuántos boletos de cada tipo se vendieron?",
          v: "x = boletos de adulto, y = boletos de niño",
          o: [
            "x + y = 120 ; 30x + 50y = 5200",
            "x + y = 120 ; 50x + 30y = 5200",
            "x + y = 5200 ; 50x + 30y = 120",
          ],
          ok: 1,
          s: [80, 40],
          ex: "Una ecuación cuenta boletos y otra cuenta dinero.",
        },
        {
          t: "El perímetro de un rectángulo mide 36 cm y su largo es 6 cm mayor que su ancho. Halla las medidas.",
          v: "x = largo, y = ancho",
          o: [
            "x + y = 36 ; x − y = 6",
            "x + y = 6 ; 2x + 2y = 36",
            "2x + 2y = 36 ; x − y = 6",
          ],
          ok: 2,
          s: [12, 6],
          ex: "El perímetro suma los cuatro lados: 2x + 2y.",
        },
      ];
      let pb = { i: 0 };
      function rB() {
        const p = PB[pb.i];
        $("#app").innerHTML =
          `<div class="card"><b>Problema ${pb.i + 1} de ${PB.length}</b><p>${p.t}</p><div class="tip">${p.v}</div><b>1. Elige el sistema que plantea el problema</b>${p.o.map((s, j) => `<button class="s" style="display:block;margin:6px 0;width:100%;text-align:left" onclick="pick(${j})">${"ABC"[j]}) ${s}</button>`).join("")}<div id="pf"></div></div>`;
      }
      function pick(j) {
        const p = PB[pb.i];
        if (j !== p.ok) {
          $("#pf").innerHTML =
            '<p class="no">Todavía no. Traduce cada frase del enunciado a una ecuación y revisa qué representa cada incógnita.</p>';
          return;
        }
        $("#pf").innerHTML =
          `<p class="ok">✔ ¡Buen planteamiento! ${p.ex}</p><b>2. Resuelve con el método que prefieras</b><div class="row">x = <input id="bx" inputmode="decimal"> y = <input id="by" inputmode="decimal"><button id="go" onclick="bchk()">Comprobar</button></div><div id="bf"></div>`;
      }
      function bchk() {
        const p = PB[pb.i],
          x = pv($("#bx").value),
          y = pv($("#by").value);
        if (x === p.s[0] && y === p.s[1]) {
          addXP(20);
          $("#bf").innerHTML =
            `<p class="ok">¡Correcto! +20 XP</p><button id="go" onclick="pb.i=(pb.i+1)%PB.length;rB()">${pb.i < PB.length - 1 ? "Siguiente problema" : "Volver al primero"}</button>`;
        } else
          $("#bf").innerHTML =
            '<p class="no">Esos valores no cumplen el sistema. Resuelve de nuevo y comprueba en las dos ecuaciones.</p>';
      }

      document.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const b = $("#go");
          b && b.click();
        }
      });
      go("learn");
