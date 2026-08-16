# Acuse

Guardián de webhooks: ningún evento se pierde.
*Webhook delivery guardian for self-hosting — no event gets lost. Spanish-first UI.*

---

## ¿Qué es esto?

Cuando los sistemas de una empresa se hablan entre sí, lo hacen mandándose avisos
automáticos: la tienda online le avisa al sistema de facturación que hubo una venta, el
formulario de la web le avisa al CRM que entró un cliente, el sistema de cobros le avisa a
contabilidad. Esos avisos se llaman **webhooks**.

El problema: si el sistema que recibe el aviso está caído aunque sea dos minutos —un
reinicio, una actualización, un proveedor con problemas— **el aviso se pierde y nadie se
entera**. La venta no se factura, el cliente no aparece en el CRM. Te enterás días después,
cuando alguien reclama.

**Acuse se pone en el medio y hace de escribano**: recibe cada aviso, lo guarda antes que
nada, insiste hasta entregarlo (esperando un poco más entre cada intento), y deja
constancia de todo. Si un destino está caído un rato largo, el panel te lo marca *antes*
de que se pierda algo. Y te muestra el número que importa: cuántos avisos rescató que sin
él se perdían en silencio.

## Qué vas a ver en el panel

- **Eventos rescatados** — el número grande: entregas que fallaron al primer intento y
  llegaron igual gracias a los reintentos.
- **Integraciones** — cada conexión (ej.: "Shopify → ERP") con su estado: sana, inestable
  o caída.
- **El registro completo** — cada evento con todos sus intentos: cuándo, qué respondió el
  destino, cuánto tardó. Si algo agotó los reintentos, un botón lo reenvía a mano.
- **Dos temas a elección** (arriba a la derecha): «instrumento», una consola oscura a
  pantalla completa, o «libro», un libro contable en papel. El panel recuerda tu elección.

## Instalarlo en tu empresa

No hace falta ser programador, pero sí animarse a seguir pasos en pantallas nuevas — o
pedirle 30 minutos a la persona de sistemas. Todo lo necesario tiene capa gratuita.

**Vas a necesitar:**

1. Una cuenta en [GitHub](https://github.com) (donde vive este código).
2. Una cuenta en [Vercel](https://vercel.com) (la plataforma que ejecuta la aplicación).
3. Una cuenta en [Neon](https://neon.tech) (la base de datos donde se guardan los eventos).

**Pasos:**

1. **Copiá el proyecto**: arriba a la derecha en esta página, botón **Fork**. Eso crea tu
   propia copia del código.
2. **Creá la base de datos**: en Neon, "New project", elegí la región más cercana y
   copiá la dirección de conexión (empieza con `postgresql://`). Esa dirección funciona
   como una contraseña: no la compartas.
3. **Cargá el esquema**: en Neon, abrí el "SQL Editor", pegá el contenido del archivo
   [`db/schema.sql`](db/schema.sql) de este proyecto y ejecutalo. Eso crea las tablas
   donde vive todo.
4. **Desplegá en Vercel**: "Add New → Project", elegí tu copia de acuse, y antes de
   confirmar agregá dos variables de entorno:
   - `DATABASE_URL` → la dirección de Neon del paso 2.
   - `CRON_SECRET` → una clave larga inventada por vos (protege el motor de reintentos).
5. **Listo.** Vercel te da una dirección (`tuempresa-acuse.vercel.app`). Ahí está tu
   panel, y el motor de reintentos queda programado solo (viene definido en
   [`vercel.json`](vercel.json)).
6. **Cargá tus integraciones**: por ahora se dan de alta con una fila en la base (no hay
   pantalla de alta todavía — está en la lista de pendientes). En el SQL Editor de Neon,
   un `INSERT` en la tabla `endpoints` (el script [`scripts/seed.mts`](scripts/seed.mts)
   sirve de ejemplo), o pedíselo a la persona técnica: cada integración define a qué URL
   entregar y obtiene su
   dirección de ingreso `https://tu-acuse.vercel.app/api/i/<clave>` para pegar en el
   sistema que manda los avisos.

> **Importante sobre seguridad:** esta versión no tiene usuarios ni contraseña — cualquiera
> que conozca la dirección puede ver y operar el panel. Para uso real, activá la protección
> de acceso de Vercel (Settings → Deployment Protection) o ponelo detrás del sistema de
> acceso que use tu empresa.

<details>
<summary><strong>Para la persona técnica: correrlo local y generar tráfico de prueba</strong></summary>

Requiere Node 20+ y Postgres.

```bash
createdb acuse
cp .env.example .env.local   # setear DATABASE_URL
npm install
npm run db:reset             # crea el esquema
npm run seed                 # tres integraciones de ejemplo
npm run dev
```

Tráfico realista contra las integraciones de ejemplo (una sana, una que falla y se
recupera, una caída — los tres estados que el panel tiene que saber contar):

```bash
npm run simulate -- --events=70 --seconds=140
```

El worker de reintentos en producción es una ruta HTTP disparada por Vercel Cron cada
minuto, protegida por `CRON_SECRET`.

</details>

<details>
<summary><strong>Para la persona técnica: cómo funciona por dentro</strong></summary>

```
   Shopify ─┐
 Web forms ─┼──▶  POST /api/i/<key>  ──▶  [ Postgres ]  ──▶  worker  ──▶  destino
   Cobros  ─┘        (202, rápido)         events +          (cron)
                                           attempts
```

- La ingesta nunca entrega en línea: un `INSERT` y responder. Hacer esperar al emisor por
  un tercero es exactamente cómo se pierden eventos.
- Los workers toman eventos con `FOR UPDATE SKIP LOCKED`: varios en paralelo sin entregas
  dobles.
- El intento se registra antes que el resultado. Si el proceso muere a mitad de entrega,
  el lease vence y se reintenta: un duplicado se recupera, una pérdida silenciosa no.
- Backoff exponencial con jitter (5s, 15s, 45s, 2m, 7m, 20m, 1h) para no voltear de nuevo
  a un destino recién recuperado.
- Cada entrega sale firmada (`t=…,v1=HMAC-SHA256(t.body)`) para que el destino verifique
  origen y rechace replays.
- La salud de cada integración se deriva de la cola (los eventos se apilan detrás de un
  destino roto), sin heartbeats.

Stack: Next.js 16, React 19, Tailwind 4, Postgres (driver `pg`). Single-tenant, sin
cuentas, sin alertas por mail/Slack todavía, retención infinita. Para esta categoría a
escala existen productos comerciales (Svix, Hookdeck); acuse es la versión chica,
self-hosted y legible.

</details>

## Preguntas frecuentes

**¿Cuánto cuesta tenerlo andando?** Con las capas gratuitas de Vercel y Neon, $0 para
volúmenes chicos y medianos.

**¿Se pierden avisos si acuse se reinicia?** No: cada evento se guarda en la base de datos
*antes* de responderle al emisor. Ahí ya no se puede perder.

**¿Qué pasa si el destino está caído un día entero?** Acuse reintenta con esperas
crecientes hasta agotar los intentos; el evento queda marcado "sin entregar" con su botón
de reenviar. Nada se borra solo.

**¿Sirve para cualquier sistema?** Cualquier cosa que mande webhooks (avisos HTTP) puede
apuntar a acuse, y cualquier sistema que reciba HTTP puede ser destino.

## Enjoyed it?

If this was useful and you'd like to support the project:

- [Cafecito](https://cafecito.app/rezamalena)
- [Ko-fi](https://ko-fi.com/malenitaa)

## License

MIT — see [LICENSE](LICENSE).
