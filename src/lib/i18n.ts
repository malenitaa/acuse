import type { EndpointHealth, EventStatus } from './types'

/**
 * The whole interface in both languages. Spanish is the product's home voice;
 * English is how it travels. Keep this file free of server imports: server
 * pages read the visitor's language from a cookie (see lang.ts) and pass it
 * down, so every string renders correctly on the first paint.
 *
 * `en` is typed as `typeof es`, so forgetting a translation is a type error.
 */

export type Lang = 'es' | 'en'
export const LANGS: Lang[] = ['es', 'en']

const es = {
  meta: {
    title: 'Acuse: ningún evento se pierde',
    description:
      'Recibe los webhooks de tus integraciones, reintenta los que fallan y te muestra cuántos rescató.',
  },
  shell: {
    tagline: 'registro de entregas · ningún evento se pierde',
    demoNote: 'Instancia de demostración · el tráfico lo genera',
    themeNames: { instrumento: 'instrumento', plano: 'plano', libro: 'libro' },
    navDashboard: 'Panel',
    navEvents: 'Eventos',
    navNew: 'Nueva integración',
    backToSite: '← Ver el sitio',
  },
  status: {
    delivered: 'entregado',
    pending: 'reintentando',
    dead: 'sin entregar',
    queued: 'en cola',
  } as Record<EventStatus | 'queued', string>,
  health: {
    healthy: 'sano',
    degraded: 'inestable',
    down: 'caído',
    idle: 'sin tráfico',
  } as Record<EndpointHealth['health'], string>,
  actions: {
    processQueue: 'Procesar cola ahora',
    processing: 'procesando…',
    recorded: 'asentado',
    redeliver: 'Reenviar ahora',
    redelivered: 'reenviado',
    pause: 'Pausar entregas',
    resume: 'Reanudar entregas',
    done: 'hecho',
    copy: 'Copiar',
    copied: 'copiado',
    reveal: 'Mostrar',
    hide: 'Ocultar',
  },
  dashboard: {
    headline: 'Eventos rescatados',
    headlineDesc: (n: string) =>
      `Entregas que fallaron en el primer intento y terminaron llegando gracias a los reintentos. Sin Acuse en el medio, estas ${n} se perdían en silencio.`,
    barFirstTry: 'primer intento',
    barRescued: 'rescatados',
    barRetrying: 'en reintento',
    barDead: 'sin entregar',
    noteOne: (name: string) => `«${name}» dejó de responder.`,
    noteMany: (count: number, names: string) =>
      `${count} integraciones dejaron de responder: ${names}.`,
    noteTail:
      'Los eventos siguen guardados y se reintentan solos; esta anotación aparece antes de que se pierda nada.',
    received: 'Eventos recibidos',
    delivered: 'Entregados',
    ofTotal: (pct: string) => `${pct} del total`,
    retrying: 'En reintento',
    nextRetry: (when: string) => `próximo ${when}`,
    queueEmpty: 'cola vacía',
    dead: 'Sin entregar',
    needHuman: 'necesitan una persona',
    none: 'ninguno',
    integrations: 'Integraciones',
    colName: 'Nombre',
    colStatus: 'Estado',
    colReceived: 'Recibidos',
    colRescued: 'Rescatados',
    colDead: 'Sin entregar',
    colLastDelivery: 'Última entrega',
    paused: '(en pausa)',
    customize: 'Personalizar',
    sectionNumber: 'El número',
    sectionTotals: 'Totales',
    latestEvents: 'Últimos eventos',
    viewAll: 'ver todos →',
    emptyIntegrations: 'No hay integraciones todavía. Corré',
    emptyEvents: 'Todavía no llegó ningún evento. Corré',
    attempts: (n: number) =>
      n === 0 ? 'sin intentos' : `${n} ${n === 1 ? 'intento' : 'intentos'}`,
  },
  events: {
    back: 'volver al panel',
    title: 'Eventos',
    filterAll: 'Todos',
    filterPending: 'En reintento',
    filterDead: 'Sin entregar',
    filterDelivered: 'Entregados',
    filterArchived: 'Archivo',
    restore: 'Restaurar',
    restored: 'restaurado',
    archive: 'Archivar',
    archivedNote: 'Este evento está archivado: no aparece en las listas operativas, pero nada se borra nunca.',
    colEvent: 'Evento',
    colIntegration: 'Integración',
    colStatus: 'Estado',
    colAttempts: 'Intentos',
    colReceived: 'Recibido',
    empty: 'No hay eventos con ese estado.',
    replayAll: (n: number) => (n === 1 ? 'Reenviar el evento' : `Reenviar los ${n}`),
    replayAllNote: 'Todos vuelven a la cola y se van entregando ya mismo.',
    showingLatest: (shown: number, total: number) =>
      `Mostrando los últimos ${shown} de ${total} eventos.`,
  },
  event: {
    received: 'Recibido',
    delivered: 'Entregado',
    attempts: 'Intentos',
    nextAttempt: 'Próximo intento',
    lastError: 'Último error',
    postponeLabel: 'Posponer el próximo intento hasta',
    postpone: 'Posponer',
    postponed: 'pospuesto',
    attemptsTitle: 'Intentos de entrega',
    noAttempts: 'Todavía no se intentó entregar. El evento ya está guardado.',
    payloadTitle: 'Contenido recibido',
    noResponse: 'sin respuesta',
  },
  onboarding: {
    title: '¿Cómo empiezo?',
    step1: 'Creá una integración: un nombre y la URL de destino adonde hay que entregar cada aviso.',
    step2:
      'Acuse te da una URL de ingreso. Pegala en el sistema que emite los webhooks (tu tienda online, tu CRM, tu plataforma de automatización, un formulario…) en lugar del destino directo.',
    step3:
      'Listo: cada aviso que llegue se guarda antes de responder, se entrega con reintentos, y este panel te avisa si algo se cae antes de que se pierda nada.',
    cta: 'Crear la primera integración',
    demoHint: 'Para llenar el panel con datos de ejemplo, en la terminal:',
  },
  newEndpoint: {
    title: 'Nueva integración',
    dashboardLink: '+ nueva integración',
    intro:
      'Una integración es un caño con garantía: acuse recibe los webhooks de un sistema y se encarga de que lleguen al destino. Al crearla, acuse te da una URL de ingreso: esa es la que pegás en el sistema que emite los avisos (tu tienda online, tu CRM, tu plataforma de automatización, un formulario…) en lugar del destino directo.',
    nameLabel: 'Nombre',
    namePlaceholder: 'App → CRM',
    nameHelp: 'Cómo la vas a reconocer en el panel.',
    destinationLabel: 'URL de destino',
    destinationPlaceholder: 'https://tu-sistema.com/webhook',
    destinationHelp: 'Adónde entregamos cada evento que llegue.',
    attemptsLabel: 'Reintentos máximos',
    attemptsHelp: 'Cuántas veces insistimos antes de marcar «sin entregar».',
    submit: 'Crear integración',
    errorName: 'Poné un nombre para reconocerla.',
    errorDestination: 'La URL de destino no es válida (tiene que ser http o https).',
  },
  sendEvent: {
    title: 'Enviar un evento',
    intro:
      'Para probar la integración o encolar un aviso a mano. El evento entra a la misma cola que los reales: se entrega, se reintenta si hace falta y queda en el registro.',
    payloadLabel: 'Payload (JSON)',
    payloadHelp: 'El cuerpo que va a recibir el destino.',
    errorJson: 'Eso no es JSON válido.',
    whenLabel: 'Programar para (opcional)',
    whenHelp: 'Vacío = se envía ya. Con fecha y hora, espera en cola hasta ese momento (hora del servidor).',
    errorDate: 'Esa fecha no se entiende.',
    submit: 'Encolar evento',
    queued: 'encolado',
  },
  endpoint: {
    ingestLabel: 'Le pasás esta URL al que manda el webhook',
    deliverLabel: 'Y nosotros entregamos acá',
    secretLabel: 'Secreto de firma',
    secretHelp:
      'Con esto el destino verifica que cada entrega salió de acá (firma Standard Webhooks). Compartilo solo con quien recibe.',
    pauseHelp: 'Pausar no rechaza nada: los eventos siguen llegando y guardándose, solo se frena la entrega.',
    pausedHelp: 'En pausa: los eventos siguen llegando y guardándose. Se entregan todos al reanudar.',
    retrySentence: (max: number, schedule: string) =>
      `Si el destino no contesta, reintentamos ${max} veces separando cada intento: ${schedule}. Después queda marcado como sin entregar y esperando a una persona.`,
    received: 'Recibidos',
    delivered: 'Entregados',
    rescued: 'Rescatados',
    dead: 'Sin entregar',
    eventsTitle: 'Eventos de esta integración',
    empty: 'Todavía no llegó ningún evento acá.',
    attemptsShort: (n: number) => `${n} int.`,
  },
  tour: {
    button: 'Recorrido',
    next: 'Siguiente',
    back: 'Atrás',
    done: 'Listo',
    skip: 'Saltar',
    stepOf: (i: number, n: number) => `${i} de ${n}`,
    steps: [
      {
        title: 'El número que importa',
        body: 'Cuántas entregas rescató Acuse: fallaron en el primer intento y terminaron llegando gracias a los reintentos. Sin esto en el medio, se perdían en silencio.',
      },
      {
        title: 'Los totales',
        body: 'Recibidos, entregados, en reintento y sin entregar. El número grande solo es creíble con estos al lado.',
      },
      {
        title: 'Creá una integración',
        body: 'Un nombre y la URL de destino. Acuse te devuelve una URL de ingreso: esa la pegás en el sistema que emite los webhooks, en lugar del destino directo.',
      },
      {
        title: 'Forzá la cola',
        body: 'El worker corre solo cada 30 segundos. Cuando estás mirando una caída en vivo, este botón entrega todo lo pendiente ya mismo.',
      },
      {
        title: 'Hacelo tuyo',
        body: 'Tres estilos, claro u oscuro, español o inglés. Se acuerda de lo que elijas. Volvé a abrir este recorrido cuando quieras.',
      },
    ],
  },
  landing: {
    nav: {
      how: 'Cómo funciona',
      features: 'Qué resuelve',
      run: 'Instalarlo',
      console: 'Abrir consola',
      github: 'GitHub',
    },
    hero: {
      eyebrow: 'Registro de entregas · acuse de recibo',
      title: 'Ningún webhook se pierde en silencio.',
      subtitle:
        'Cuando una integración se cae, los avisos que se perdió no desaparecen. Acuse los asienta apenas llegan, reintenta hasta que el destino vuelve, y te muestra cuántos rescató.',
      ctaPrimary: 'Abrir la consola',
      ctaSecondary: 'Ver en GitHub',
      note: 'Código abierto · corre en tu propio servidor · sin telemetría',
    },
    trust: [
      'Se instala con un comando',
      'Nada se borra nunca',
      'Entregas firmadas',
      'En español y en inglés',
    ],
    problem: {
      eyebrow: 'El problema',
      title: 'Una integración caída dos minutos te cuesta ventas que nadie ve caer.',
      body: 'Tu tienda le avisa al ERP, el formulario carga el CRM, la facturación habla con contabilidad. Cada conexión es una URL que recibe webhooks. Cuando el destino está caído dos minutos —un reinicio, un deploy, un hipo del proveedor— esos avisos no vuelven: el que los manda reintenta un par de veces, se rinde y los tira.',
      body2:
        'La falla es silenciosa. La venta nunca se factura, el lead nunca llega al CRM, y nadie se entera hasta que un cliente reclama días después.',
    },
    how: {
      eyebrow: 'Cómo funciona',
      title: 'Acuse se pone en el medio y no suelta nada.',
      steps: [
        {
          title: 'Recibe y asienta',
          body: 'Cada evento se escribe en disco antes de contestarle al que lo manda. Desde ese instante solo puede entregarse o quedar en espera; nunca perderse.',
        },
        {
          title: 'Reintenta con paciencia',
          body: 'Esperas que crecen entre intento e intento (5s, 15s, 45s… hasta 1h), cada una con un poco de azar para no tumbar de nuevo a un destino que recién volvió.',
        },
        {
          title: 'Rescata y avisa',
          body: 'Lo que estaba perdido termina llegando, y el número de rescatados sube. Si algo dejó de responder, lo marca antes de que se pierda nada.',
        },
      ],
    },
    features: {
      eyebrow: 'Qué resuelve',
      title: 'Todo lo que hace falta para que ningún aviso se caiga.',
      items: [
        {
          title: 'Nada se pierde después de llegar',
          body: 'Los eventos se asientan antes de responder. Desde ahí solo se entregan o quedan en espera, aunque el destino esté caído un día entero.',
        },
        {
          title: 'Un botón que de verdad funciona',
          body: 'Lo que agotó sus intentos se reenvía con un clic, porque el original quedó guardado. Después de una caída, un botón reenvía todo junto.',
        },
        {
          title: 'Te enterás antes de que cueste',
          body: 'Una integración que dejó de contestar queda marcada mientras sus eventos todavía se reintentan, antes de perder nada.',
        },
        {
          title: 'El registro completo',
          body: 'Cada intento con su hora, su respuesta y cuánto tardó. Eso es lo que hace creíbles los números del panel.',
        },
        {
          title: 'Entregas firmadas',
          body: 'Cada pedido que Acuse manda va firmado (Standard Webhooks), así el destino verifica que salió de vos y rechaza lo repetido.',
        },
        {
          title: 'Enviá y programá a mano',
          body: 'Probá una integración desde la consola, o dejá un evento agendado para más tarde («esto sale a las 2am y yo quiero dormir»).',
        },
      ],
    },
    showcase: {
      eyebrow: 'La consola',
      title: 'Un panel que muestra el número que importa.',
      body: 'Tres estilos —consola de operaciones, plano de ingeniería o libro de acuses—, en claro y oscuro, en español o inglés. Se acuerda de lo que elegiste.',
      caption:
        'La consola de Acuse: eventos rescatados, salud de cada integración y el registro completo de entregas.',
    },
    learn: {
      eyebrow: 'Aprender a usarlo',
      title: 'Aprendé en dos minutos, adentro de la consola.',
      body: 'Abrí la consola y arrancá el recorrido guiado: te va señalando cada parte —el número de rescatados, los totales, cómo crear una integración y cómo forzar la cola— paso a paso, sin salir de la app.',
      cta: 'Abrir la consola y hacer el recorrido',
      guideCta: 'Leer la guía completa',
      hint: 'Prefiere leerlo de corrido? Está todo en la guía.',
    },
    run: {
      eyebrow: 'Instalarlo',
      title: 'De cero a un webhook rescatado en cinco minutos.',
      body: 'Todo pasa en tu máquina; lo único que hace falta es Docker. Cloná, levantá los contenedores y abrí la consola.',
      command: 'git clone https://github.com/malenitaa/acuse.git\ncd acuse\ndocker compose up -d',
      after: 'La consola queda en',
    },
    faq: {
      eyebrow: 'Preguntas',
      title: 'Lo que casi todos preguntan.',
      items: [
        {
          q: '¿Manda mis datos a algún lado?',
          a: 'No. Corre en tu propio servidor y no tiene telemetría. Solo entrega a los destinos que vos configurás.',
        },
        {
          q: '¿Qué pasa si el destino está caído mucho rato?',
          a: 'Los eventos quedan guardados y se reintentan con esperas que crecen. Cuando el destino vuelve, se entregan; los que agoten intentos los reenviás con un clic.',
        },
        {
          q: '¿Necesito saber programar?',
          a: 'Para usarlo, no: creás la integración desde la consola y pegás la URL de ingreso donde hoy va el destino. Para instalarlo alcanza con un comando de Docker.',
        },
        {
          q: '¿Es gratis?',
          a: 'Es código abierto con licencia MIT. Lo corrés donde quieras.',
        },
      ],
    },
    footer: {
      tagline: 'Ningún evento se pierde.',
      meaning: '«Acuse» viene de acuse de recibo.',
      console: 'Abrir consola',
      github: 'GitHub',
    },
  },
  guide: {
    link: 'Guía',
    eyebrow: 'Guía',
    title: 'Aprender a usar Acuse',
    intro:
      'De cero a un webhook rescatado, paso a paso. Todo pasa en tu máquina: lo único que necesitás es Docker. Cada bloque de código se copia con un clic.',
    tocTitle: 'En esta guía',
    toc: {
      req: 'Antes de empezar',
      install: 'Instalarlo',
      create: 'Crear una integración',
      send: 'Enviar un webhook',
      rescue: 'Ver un rescate',
      verify: 'Verificar las firmas',
    },
    req: {
      title: 'Antes de empezar',
      body: 'Necesitás Docker instalado. No hace falta ninguna cuenta ni configurar nada más: Acuse corre en tu servidor y no manda datos a ningún lado. Antes de correrlo podés leer docker-compose.yml, Dockerfile y db/schema.sql: son todo lo que se ejecuta.',
      safety:
        'Dos cosas que nunca deberían pasar: Acuse nunca te pide una contraseña, y nunca te pide desactivar una protección de tu computadora o tu navegador. Si una copia te pide alguna de las dos, algo anda mal con esa copia.',
    },
    install: {
      title: 'Instalarlo',
      body: 'Cloná el repo, levantá los contenedores y abrí la consola. La primera vez tarda unos minutos armando la imagen; después arranca en segundos.',
      after: 'La landing queda en la raíz y la consola en /app. Vas a ver la consola vacía con los tres pasos.',
    },
    create: {
      title: 'Crear una integración',
      body: 'En la consola, entrá a «Nueva integración» y completá un nombre y la URL de destino adonde hay que entregar cada aviso. Para probar sin depender de otro servicio, usá como destino el receptor de demostración que viene incluido:',
      after: 'Al crearla, la página te muestra tu URL de ingreso (algo como /api/i/ik_xxxxxxxx). Esa es la que pegás en el sistema que emite los webhooks, en lugar del destino directo.',
    },
    send: {
      title: 'Enviar un webhook',
      body: 'Mandale un evento a tu URL de ingreso. Te responde «received: true» al instante: el evento ya está en disco antes de que nadie intente entregarlo. En unos 30 segundos el worker lo entrega y lo vas a ver «entregado» en el panel, con el intento registrado.',
      alt: 'Si no querés usar la terminal, cada página de integración tiene un formulario «Enviar un evento», con opción de programarlo para más tarde.',
    },
    rescue: {
      title: 'Ver un rescate (el punto de todo)',
      body: 'Creá una segunda integración con este destino, que falla dos veces y después funciona —un destino teniendo un mal minuto:',
      after: 'Enviale un evento como en el paso anterior y mirá el panel: el evento falla, espera (5s, 15s, con algo de azar), reintenta… y llega. El número grande, eventos rescatados, sube en uno. Sin Acuse en el medio, ese webhook se perdía.',
    },
    verify: {
      title: 'Verificar las firmas (recomendado)',
      body: 'Cada entrega que manda Acuse va firmada (Standard Webhooks). En el destino, verificá la firma con cualquier librería de Standard Webhooks usando el secreto que aparece en la página de cada integración. Así el destino confirma que el pedido salió de vos y rechaza lo repetido.',
    },
    themes: {
      title: 'Hacelo tuyo',
      body: 'La consola viene en tres estilos —instrumento, plano y libro—, en claro y oscuro, en español o inglés. Los controles están abajo a la izquierda y se acuerdan de lo que elijas.',
    },
    cta: {
      title: '¿Listo para probarlo?',
      body: 'Abrí la consola y, si querés que te vaya señalando cada parte, arrancá el recorrido guiado.',
      tour: 'Abrir la consola con el recorrido',
      console: 'Abrir la consola',
    },
  },
}

const en: typeof es = {
  meta: {
    title: 'Acuse: no event gets lost',
    description:
      'Receives your integrations’ webhooks, retries the failed ones and shows you how many it rescued.',
  },
  shell: {
    tagline: 'delivery ledger · no event gets lost',
    demoNote: 'Demo instance · traffic is generated by',
    themeNames: { instrumento: 'instrument', plano: 'blueprint', libro: 'ledger' },
    navDashboard: 'Dashboard',
    navEvents: 'Events',
    navNew: 'New integration',
    backToSite: '← Back to site',
  },
  status: {
    delivered: 'delivered',
    pending: 'retrying',
    dead: 'undelivered',
    queued: 'queued',
  } as Record<EventStatus | 'queued', string>,
  health: {
    healthy: 'healthy',
    degraded: 'flaky',
    down: 'down',
    idle: 'no traffic',
  } as Record<EndpointHealth['health'], string>,
  actions: {
    processQueue: 'Process queue now',
    processing: 'processing…',
    recorded: 'recorded',
    redeliver: 'Redeliver now',
    redelivered: 'redelivered',
    pause: 'Pause deliveries',
    resume: 'Resume deliveries',
    done: 'done',
    copy: 'Copy',
    copied: 'copied',
    reveal: 'Reveal',
    hide: 'Hide',
  },
  dashboard: {
    headline: 'Events rescued',
    headlineDesc: (n: string) =>
      `Deliveries that failed on the first attempt and still made it, thanks to the retries. Without Acuse in the middle, these ${n} were silently lost.`,
    barFirstTry: 'first attempt',
    barRescued: 'rescued',
    barRetrying: 'retrying',
    barDead: 'undelivered',
    noteOne: (name: string) => `“${name}” stopped responding.`,
    noteMany: (count: number, names: string) =>
      `${count} integrations stopped responding: ${names}.`,
    noteTail:
      'Their events are safely stored and retrying on their own; this note appears before anything is lost.',
    received: 'Events received',
    delivered: 'Delivered',
    ofTotal: (pct: string) => `${pct} of total`,
    retrying: 'Retrying',
    nextRetry: (when: string) => `next ${when}`,
    queueEmpty: 'queue empty',
    dead: 'Undelivered',
    needHuman: 'need a human',
    none: 'none',
    integrations: 'Integrations',
    colName: 'Name',
    colStatus: 'Status',
    colReceived: 'Received',
    colRescued: 'Rescued',
    colDead: 'Undelivered',
    colLastDelivery: 'Last delivery',
    paused: '(paused)',
    customize: 'Customize',
    sectionNumber: 'The number',
    sectionTotals: 'Totals',
    latestEvents: 'Latest events',
    viewAll: 'view all →',
    emptyIntegrations: 'No integrations yet. Run',
    emptyEvents: 'No events yet. Run',
    attempts: (n: number) =>
      n === 0 ? 'no attempts' : `${n} ${n === 1 ? 'attempt' : 'attempts'}`,
  },
  events: {
    back: 'back to dashboard',
    title: 'Events',
    filterAll: 'All',
    filterPending: 'Retrying',
    filterDead: 'Undelivered',
    filterDelivered: 'Delivered',
    filterArchived: 'Archive',
    restore: 'Restore',
    restored: 'restored',
    archive: 'Archive',
    archivedNote: 'This event is archived: it stays out of the operational lists, but nothing is ever deleted.',
    colEvent: 'Event',
    colIntegration: 'Integration',
    colStatus: 'Status',
    colAttempts: 'Attempts',
    colReceived: 'Received',
    empty: 'No events with that status.',
    replayAll: (n: number) => (n === 1 ? 'Redeliver the event' : `Redeliver all ${n}`),
    replayAllNote: 'They all rejoin the queue and start delivering right away.',
    showingLatest: (shown: number, total: number) =>
      `Showing the latest ${shown} of ${total} events.`,
  },
  event: {
    received: 'Received',
    delivered: 'Delivered',
    attempts: 'Attempts',
    nextAttempt: 'Next attempt',
    lastError: 'Last error',
    postponeLabel: 'Postpone the next attempt until',
    postpone: 'Postpone',
    postponed: 'postponed',
    attemptsTitle: 'Delivery attempts',
    noAttempts: 'No delivery attempted yet. The event is already stored.',
    payloadTitle: 'Received payload',
    noResponse: 'no response',
  },
  onboarding: {
    title: 'How do I start?',
    step1: 'Create an integration: a name and the destination URL where each event must be delivered.',
    step2:
      'Acuse hands you an ingest URL. Paste it into the system that emits the webhooks (your online store, your CRM, your automation platform, a form backend…) in place of the direct destination.',
    step3:
      'Done: every incoming event is stored before answering, delivered with retries, and this dashboard warns you when something breaks, before anything is lost.',
    cta: 'Create the first integration',
    demoHint: 'To fill the dashboard with sample data, in a terminal:',
  },
  newEndpoint: {
    title: 'New integration',
    dashboardLink: '+ new integration',
    intro:
      'An integration is a pipe with a guarantee: Acuse receives one system’s webhooks and makes sure they reach their destination. When you create it, Acuse gives you an ingest URL: that is what you paste into the emitting system (your online store, your CRM, your automation platform, a form backend…) instead of the direct destination.',
    nameLabel: 'Name',
    namePlaceholder: 'App → CRM',
    nameHelp: 'How you will recognize it on the dashboard.',
    destinationLabel: 'Destination URL',
    destinationPlaceholder: 'https://your-system.com/webhook',
    destinationHelp: 'Where we deliver each incoming event.',
    attemptsLabel: 'Max attempts',
    attemptsHelp: 'How many times we insist before marking it undelivered.',
    submit: 'Create integration',
    errorName: 'Give it a name you will recognize.',
    errorDestination: 'The destination URL is not valid (must be http or https).',
  },
  sendEvent: {
    title: 'Send an event',
    intro:
      'To test the integration or queue a message by hand. The event joins the same queue as real ones: it gets delivered, retried if needed, and recorded.',
    payloadLabel: 'Payload (JSON)',
    payloadHelp: 'The body the destination will receive.',
    errorJson: 'That is not valid JSON.',
    whenLabel: 'Schedule for (optional)',
    whenHelp: 'Empty = sends now. With a date and time, it waits in the queue until then (server time).',
    errorDate: 'That date does not parse.',
    submit: 'Queue event',
    queued: 'queued',
  },
  endpoint: {
    ingestLabel: 'Give this URL to whatever sends the webhook',
    deliverLabel: 'And we deliver here',
    secretLabel: 'Signing secret',
    secretHelp:
      'The destination uses this to verify that each delivery really came from here (Standard Webhooks signature). Share it only with the receiving side.',
    pauseHelp: 'Pausing rejects nothing: events keep arriving and being stored, only delivery stops.',
    pausedHelp: 'Paused: events keep arriving and being stored. They are all delivered when you resume.',
    retrySentence: (max: number, schedule: string) =>
      `If the destination does not answer, we retry ${max} times, spacing the attempts: ${schedule}. After that the event is marked undelivered, waiting for a human.`,
    received: 'Received',
    delivered: 'Delivered',
    rescued: 'Rescued',
    dead: 'Undelivered',
    eventsTitle: 'Events of this integration',
    empty: 'No events here yet.',
    attemptsShort: (n: number) => `${n} att.`,
  },
  tour: {
    button: 'Take the tour',
    next: 'Next',
    back: 'Back',
    done: 'Done',
    skip: 'Skip',
    stepOf: (i: number, n: number) => `${i} of ${n}`,
    steps: [
      {
        title: 'The number that matters',
        body: 'How many deliveries Acuse rescued: they failed on the first attempt and still made it, thanks to the retries. Without this in the middle, they were silently lost.',
      },
      {
        title: 'The totals',
        body: 'Received, delivered, retrying and undelivered. The big number is only believable with these next to it.',
      },
      {
        title: 'Create an integration',
        body: 'A name and a destination URL. Acuse hands you an ingest URL: paste that into the system that emits the webhooks, in place of the direct destination.',
      },
      {
        title: 'Force the queue',
        body: 'The worker runs on its own every 30 seconds. When you are watching an outage live, this button delivers everything pending right now.',
      },
      {
        title: 'Make it yours',
        body: 'Three looks, light or dark, Spanish or English. It remembers what you pick. Reopen this tour whenever you want.',
      },
    ],
  },
  landing: {
    nav: {
      how: 'How it works',
      features: 'What it solves',
      run: 'Install it',
      console: 'Open console',
      github: 'GitHub',
    },
    hero: {
      eyebrow: 'Delivery ledger · acknowledgment of receipt',
      title: 'No webhook is lost in silence.',
      subtitle:
        'When an integration breaks, the events it missed are not gone. Acuse writes them down the moment they arrive, retries until the destination is back, and shows you how many it rescued.',
      ctaPrimary: 'Open the console',
      ctaSecondary: 'View on GitHub',
      note: 'Open source · runs on your own server · no telemetry',
    },
    trust: [
      'Installs with one command',
      'Nothing is ever deleted',
      'Signed deliveries',
      'In English and Spanish',
    ],
    problem: {
      eyebrow: 'The problem',
      title: 'An integration down for two minutes costs you sales nobody sees fall.',
      body: 'Your store tells the ERP, the form loads the CRM, billing talks to accounting. Each connection is a URL receiving webhooks. When a destination is down for two minutes —a restart, a deploy, a provider hiccup— those events do not come back: the sender retries a few times, gives up, and discards them.',
      body2:
        'The failure is silent. The sale never gets invoiced, the lead never reaches the CRM, and nobody notices until a customer complains days later.',
    },
    how: {
      eyebrow: 'How it works',
      title: 'Acuse sits in the middle and lets nothing drop.',
      steps: [
        {
          title: 'Receives and records',
          body: 'Every event is written to disk before the sender is answered. From that moment it can only be delivered or parked; never dropped.',
        },
        {
          title: 'Retries with patience',
          body: 'Growing waits between attempts (5s, 15s, 45s… up to 1h), each nudged at random so a destination that just came back is not knocked down again.',
        },
        {
          title: 'Rescues and warns',
          body: 'What was lost ends up arriving, and the rescued count goes up. If something stops responding, it is flagged before anything is lost.',
        },
      ],
    },
    features: {
      eyebrow: 'What it solves',
      title: 'Everything you need so no event ever drops.',
      items: [
        {
          title: 'Nothing is lost after it arrives',
          body: 'Events are recorded before the sender is answered. From there they can only be delivered or parked, even if the destination stays down for a day.',
        },
        {
          title: 'A button that actually works',
          body: 'Anything that ran out of attempts is redelivered with one click, because the original was kept. After an outage, one button redelivers everything at once.',
        },
        {
          title: 'You find out before it costs you',
          body: 'An integration that stopped answering is flagged while its events are still being retried, before anything is lost.',
        },
        {
          title: 'The full record',
          body: 'Every attempt, with its timestamp, its response and how long it took. That is what makes the numbers on the dashboard believable.',
        },
        {
          title: 'Signed deliveries',
          body: 'Every request Acuse sends is signed (Standard Webhooks), so your destination can verify it really came from you and refuse anything replayed.',
        },
        {
          title: 'Send and schedule by hand',
          body: 'Test an integration from the console, or queue an event for later («this has to go out at 2am, and I want to sleep»).',
        },
      ],
    },
    showcase: {
      eyebrow: 'The console',
      title: 'A dashboard that shows the number that matters.',
      body: 'Three looks —an ops console, an engineering blueprint, or a book of receipts—, in light and dark, in English or Spanish. It remembers what you chose.',
      caption:
        'The Acuse console: events rescued, the health of each integration, and the full delivery record.',
    },
    learn: {
      eyebrow: 'Learn to use it',
      title: 'Learn in two minutes, inside the console.',
      body: 'Open the console and start the guided tour: it points out each part —the rescued number, the totals, how to create an integration and how to force the queue— step by step, without leaving the app.',
      cta: 'Open the console and take the tour',
      guideCta: 'Read the full guide',
      hint: 'Rather read it straight through? It is all in the guide.',
    },
    run: {
      eyebrow: 'Install it',
      title: 'From zero to a rescued webhook in five minutes.',
      body: 'Everything happens on your machine; the only requirement is Docker. Clone, bring up the containers and open the console.',
      command: 'git clone https://github.com/malenitaa/acuse.git\ncd acuse\ndocker compose up -d',
      after: 'The console is at',
    },
    faq: {
      eyebrow: 'Questions',
      title: 'What almost everyone asks.',
      items: [
        {
          q: 'Does it send my data anywhere?',
          a: 'No. It runs on your own server and has no telemetry. It only delivers to the destinations you configure.',
        },
        {
          q: 'What if the destination is down for a long time?',
          a: 'Events stay stored and retry with growing waits. When the destination comes back, they are delivered; anything that runs out of attempts you redeliver with one click.',
        },
        {
          q: 'Do I need to know how to code?',
          a: 'To use it, no: you create the integration from the console and paste the ingest URL where the destination goes today. Installing it takes one Docker command.',
        },
        {
          q: 'Is it free?',
          a: 'It is open source under the MIT license. Run it wherever you want.',
        },
      ],
    },
    footer: {
      tagline: 'No event gets lost.',
      meaning: '«Acuse» is short for acuse de recibo — acknowledgment of receipt.',
      console: 'Open console',
      github: 'GitHub',
    },
  },
  guide: {
    link: 'Guide',
    eyebrow: 'Guide',
    title: 'Learn to use Acuse',
    intro:
      'From zero to a rescued webhook, step by step. Everything happens on your machine: the only requirement is Docker. Every code block copies with one click.',
    tocTitle: 'In this guide',
    toc: {
      req: 'Before you start',
      install: 'Install it',
      create: 'Create an integration',
      send: 'Send a webhook',
      rescue: 'Watch a rescue',
      verify: 'Verify signatures',
    },
    req: {
      title: 'Before you start',
      body: 'You need Docker installed. No account and nothing else to configure: Acuse runs on your own server and sends data nowhere. Before running it you can read docker-compose.yml, Dockerfile and db/schema.sql: they are the whole story of what runs.',
      safety:
        'Two things that should never happen: Acuse never asks for a password, and it never asks you to turn off a protection your computer or your browser puts up. If a copy asks for either, something is wrong with that copy.',
    },
    install: {
      title: 'Install it',
      body: 'Clone the repo, bring up the containers and open the console. The first boot takes a few minutes building the image; after that it starts in seconds.',
      after: 'The landing is at the root and the console is at /app. You will see the empty console with the three steps.',
    },
    create: {
      title: 'Create an integration',
      body: 'In the console, open «New integration» and fill in a name and the destination URL where each event must be delivered. To try it without depending on another service, use the demo receiver Acuse ships with as the destination:',
      after: 'When you create it, the page shows your ingest URL (something like /api/i/ik_xxxxxxxx). That is what you paste into the system that emits the webhooks, in place of the direct destination.',
    },
    send: {
      title: 'Send a webhook',
      body: 'Send an event to your ingest URL. You get «received: true» back instantly: the event is on disk before anyone tries to deliver it. Within about 30 seconds the worker delivers it and you will see it «delivered» on the dashboard, with the attempt recorded.',
      alt: 'If you would rather not use the terminal, every integration page has a «Send an event» form, with the option to schedule it for later.',
    },
    rescue: {
      title: 'Watch a rescue (the whole point)',
      body: 'Create a second integration with this destination, which fails twice and then works —a destination having a bad minute:',
      after: 'Send it an event like in the previous step and watch the dashboard: the event fails, waits (5s, 15s, with some jitter), retries… and lands. The big number, events rescued, goes up by one. Without Acuse in the middle, that webhook was gone.',
    },
    verify: {
      title: 'Verify signatures (recommended)',
      body: 'Every delivery Acuse sends is signed (Standard Webhooks). At your destination, verify the signature with any Standard Webhooks library using the secret shown on each integration page. That way the destination confirms the request really came from you and refuses anything replayed.',
    },
    themes: {
      title: 'Make it yours',
      body: 'The console comes in three looks —instrument, blueprint and ledger—, in light and dark, in English or Spanish. The controls are at the bottom left and remember what you pick.',
    },
    cta: {
      title: 'Ready to try it?',
      body: 'Open the console and, if you want it to point out each part, start the guided tour.',
      tour: 'Open the console with the tour',
      console: 'Open the console',
    },
  },
}

export const dict: Record<Lang, typeof es> = { es, en }
