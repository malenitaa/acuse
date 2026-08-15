# Acuse

**Ningún evento se pierde.** Acuse se pone entre quien manda un webhook y el sistema que
tiene que recibirlo, y garantiza que llegue: guarda el evento antes de contestar, reintenta
si el destino falla, y muestra cuántas entregas rescató.

---

## El problema

Una empresa conecta Shopify con su ERP, sus formularios con el CRM, su facturación con
contabilidad. Cada conexión es una URL que recibe un webhook.

Cuando el destino se cae dos minutos, esos webhooks **no vuelven**. El que los mandó
reintenta un par de veces, se cansa y los descarta. Nadie se entera. La factura no se emitió,
el lead no entró al CRM, el pedido no llegó al depósito — y se descubre tres días después,
cuando un cliente reclama.

Lo caro no es la caída de dos minutos. Es que fue **silenciosa**.

## Qué hace Acuse

1. **Recibe y guarda.** El evento se escribe en disco antes de contestarle al que lo mandó.
   A partir de ahí ya no se puede perder, aunque el destino esté muerto.
2. **Reintenta solo.** Backoff exponencial con jitter: 5s, 15s, 45s, 2m, 7m, 20m, 1h.
3. **Avisa antes de que duela.** Si una integración deja de responder, aparece en rojo
   mientras los eventos todavía se están reintentando — no cuando ya se perdieron.
4. **Deja reenviar a mano.** El contenido original queda guardado, así que "reenviar" es un
   botón que funciona y no uno que pide disculpas.
5. **Muestra el número.** Cuántas entregas fallaron el primer intento y terminaron llegando.
   Ese es el valor del producto, medido.

## Cómo funciona

```
  Shopify ─┐
Formulario ─┼──▶  POST /api/i/<clave>  ──▶  [ Postgres ]  ──▶  worker  ──▶  destino
Facturación ┘         (202, rápido)          eventos +          (cron)      del cliente
                                             intentos
```

Decisiones que vale la pena mirar:

**La ingesta no entrega.** El handler de ingesta hace un solo `INSERT` y contesta. No intenta
la entrega ahí mismo, porque hacer esperar al que manda es exactamente cómo se pierden
eventos: el sender se cansa de esperar y descarta.

**Los workers no se pisan.** Toman eventos con `for update skip locked`, así que se pueden
correr varios en paralelo y cada uno saltea los que otro ya agarró, en vez de bloquearse.
Un evento nunca se entrega dos veces por una carrera entre workers.

**El intento se escribe antes que el resultado.** Si el proceso se muere en el medio, el lease
vence y el evento se reintenta. Una entrega duplicada se arregla; una perdida en silencio no.

**El jitter no es decoración.** Cuando un destino vuelve a funcionar, sin jitter todos los
eventos encolados contra él salen en el mismo instante y lo tiran de nuevo.

**Se firma lo que sale.** Cada entrega lleva `acuse-signature: t=…,v1=HMAC-SHA256(t.body)`,
con el timestamp adentro de lo firmado, así una captura vieja no se puede reenviar después.

**La salud sale de la cola.** No hay heartbeat: una integración rota se ve porque los eventos
se le empiezan a acumular atrás. Es la señal más temprana y no requiere que el destino
colabore.

## Correrlo

Necesitás Postgres. En local:

```bash
brew services start postgresql@14 && createdb acuse
```

```bash
cp .env.example .env.local   # y completá DATABASE_URL
npm install
npm run db:reset             # crea las tablas
npm run seed                 # 3 integraciones de ejemplo
npm run dev
```

Con el server corriendo, en otra terminal:

```bash
npm run simulate -- --events=70 --seconds=110
```

El simulador manda tráfico contra las tres integraciones de ejemplo y después procesa la cola
mientras mirás el panel. Las tres cubren los tres estados que importan: una que anda, una que
falla y se recupera, y una que está caída.

## Desplegarlo

Anda en Vercel con Postgres administrado (Neon, Supabase o Vercel Postgres). El worker es una
ruta HTTP, así que se dispara con Vercel Cron:

```json
{ "crons": [{ "path": "/api/cron", "schedule": "* * * * *" }] }
```

Definí `CRON_SECRET` para que solo el scheduler pueda drenar la cola.

## Lo que todavía no está

Honestidad primero, porque esto es una v1:

- **Una sola cuenta.** No hay registro, ni API keys por cliente, ni aislamiento de datos.
- **El cron corre por minuto.** Es el piso de Vercel; el primer reintento de 5s en la práctica
  se convierte en "en el próximo minuto".
- **Las alertas viven en el panel.** Todavía no manda mail ni Slack.
- **Sin retención.** Los eventos se guardan para siempre; falta política de purga.
- **UI solo en castellano.** Los textos están concentrados, migrarlos es barato.

## Licencia

MIT — ver [LICENSE](LICENSE).
