# 🎉 La Gran Despedida · Antonio & Estefany

Maestro de ceremonias digital para la despedida de solteros. Abres la app en el celular, presionas **COMENZAR LA FIESTA**, lees el speech, sigues los pasos, registras al ganador y avanzas hasta la premiación y el brindis final.

Hecha con **React + TypeScript + Tailwind + Vite**. Funciona sin internet una vez abierta (PWA) y guarda todo en el celular (localStorage).

---

## 🚀 Publicarla en GitHub Pages (sin instalar nada)

1. Entra a [github.com](https://github.com) y crea un repositorio nuevo (ej. `despedida`). Puede ser público.
2. Dentro del repo: **Add file → Upload files**. Arrastra **todo el contenido** de esta carpeta (incluida la carpeta oculta `.github`). Presiona **Commit changes**.
   - Si no ves la carpeta `.github` al arrastrar, créala a mano: **Add file → Create new file**, escribe `.github/workflows/deploy.yml` como nombre y pega el contenido de ese archivo.
3. Ve a **Settings → Pages** y en **Source** elige **GitHub Actions**.
4. Ve a la pestaña **Actions**: verás “Publicar en GitHub Pages” corriendo. Espera el ✅ (1–2 minutos).
5. Tu app queda en: `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`

Cada vez que subas cambios a la rama `main`, se vuelve a publicar sola.

> La configuración usa rutas relativas (`base: './'` y rutas con `#`), así que funciona con cualquier nombre de repositorio.

## 📲 Instalarla en el celular

- **Android (Chrome):** menú ⋮ → *Instalar app* / *Agregar a pantalla principal*.
- **iPhone (Safari):** Compartir ⬆️ → *Agregar a inicio*.
- Ábrela **una vez con internet** antes de la fiesta; luego funciona sin conexión.

## 🧑‍💻 Correrla en tu computadora (opcional)

Necesitas [Node.js 20+](https://nodejs.org).

```bash
npm install
npm run dev      # abre http://localhost:5173
npm run build    # genera la carpeta dist/ lista para publicar
```

## 🎮 Cómo se usa en la fiesta

| Pantalla | Para qué sirve |
|---|---|
| 🏠 Inicio | Portada, progreso y botón para continuar donde te quedaste |
| 🎮 Itinerario | Las 12 etapas en orden + 2 comodines. Estados: 🔒 pendiente · 🎮 en curso · ✅ completado · 🏆 ganador · ⏭️ omitido |
| Juego | Guion, preparación, reglas, frases, cronómetro y registro de ganador |
| 🎤 Modo conductor | Tarjetas paso a paso: 🎤 decir · 🛠️ hacer · 🎵 música · ⚠️ regla. Desliza o usa los botones |
| 🏆 Marcador | Team Antonio vs Team Estefany + marcador aparte Hombres vs Mujeres |
| ⚙️ Ajustes | Puntuación editable, tamaño de letra, desbloquear premiación, reiniciar evento |

- **Puntos por defecto:** ganador 3 · perdedor 1 · empate 2 c/u (editable).
- **Corregir un resultado** lo reemplaza: nunca duplica puntos.
- Juegos individuales o por parejas pueden asignarse a un equipo (o a ninguno).
- La **Gran Premiación** se desbloquea al completar u omitir las etapas 0–9. Los comodines no bloquean.
- Si sales del modo conductor, al volver **continúa en el mismo paso**.
- La pantalla se mantiene encendida en modo conductor (en celulares que lo soportan).
- Si otra persona toma la posta, solo pásale el celular: todo sigue exactamente donde quedó.

## ✏️ Editar textos o juegos

Todo el contenido (speeches, reglas, frases, música, preguntas) está en **`src/data/games.ts`**, separado de la interfaz. Cambia el texto, sube el archivo a GitHub y se republica sola.

## 📁 Estructura

```
src/
  data/games.ts        ← contenido de todos los juegos
  data/types.ts        ← tipos
  lib/store.tsx        ← estado, guardado y cálculo de puntos
  components/          ← Conductor, ResultSheet, Timer, Blocks, efectos (confeti)
  screens/             ← Home, Itinerary, ActivityScreen, Scoreboard, Settings
public/
  manifest.webmanifest, sw.js, icons/   ← PWA
.github/workflows/deploy.yml            ← publicación automática
```

---

Hecho con 💗💙 para Antonio & Estefany. Nadie está obligado a tomar: ¡la diversión va primero!
