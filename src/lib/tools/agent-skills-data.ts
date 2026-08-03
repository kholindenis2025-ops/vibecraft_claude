export type AgentSpecialist = {
  emoji: string;
  name: string;
  codeName: string;
  badge: string;
  whatItDoes: string;
  whenComes: string[];
  prompt?: string;
  note?: string;
};

export const AGENT_SPECIALISTS: AgentSpecialist[] = [
  {
    emoji: "🔍",
    name: "Разведчик",
    codeName: "встроен в Claude Code",
    badge: "ВСТРОЕН",
    whatItDoes:
      "Глаза и руки агента в интернете. Идёт в Google по вашему запросу, открывает сайты, читает их и возвращается с таблицей фактов.",
    whenComes: ["«найди», «поищи»", "«что у конкурентов»", "«посмотри на сайте»", "«свежие данные»"],
    note: "Разведчик уже встроен в Claude Code — ничего устанавливать не нужно. Он придёт сам, как только вы попросите что-то найти.",
  },
  {
    emoji: "❓",
    name: "Интервьюер",
    codeName: "discovery-interview",
    badge: "СКИЛЛ",
    whatItDoes:
      "Превращает туманную идею в чёткое ТЗ. Проводит 7-фазное интервью с вариантами ответов. На выходе — файл-спецификация на 5 страниц.",
    whenComes: ["«помоги сформулировать заказ»", "«собери ТЗ»", "«опиши техзадание»", "«нужна спецификация»"],
    prompt:
      "Поставь мне скилл в папку этого проекта. Скилл лежит по этой ссылке: https://github.com/parcadei/Continuous-Claude-v3/tree/main/.claude/skills/discovery-interview",
  },
  {
    emoji: "✍",
    name: "Писатель",
    codeName: "content-creator",
    badge: "СКИЛЛ",
    whatItDoes:
      "Пишет в вашем стиле по правильным формулам: посты для соцсетей, email-рассылки, блог-статьи, описания услуг. Берёт голос из вашего SOUL.md.",
    whenComes: ["«напиши пост», «нужна статья»", "«сделай рассылку»", "«опиши продукт»", "«крючок для соцсетей»"],
    prompt:
      "Поставь мне два скилла из github.com/Shubhamsaboo/awesome-llm-apps: content-creator и fullstack-developer. Положи их в .claude/skills моего проекта.",
    note: "Устанавливается вместе с Разработчиком — одной фразой.",
  },
  {
    emoji: "💻",
    name: "Разработчик",
    codeName: "fullstack-developer",
    badge: "СКИЛЛ",
    whatItDoes:
      "Пишет код — вы проверяете глазами. Лендинги, формы, Telegram-боты, скрипты автоматизации. Технологию выбирает сам, разбираться не нужно.",
    whenComes: ["«сделай сайт», «добавь форму»", "«нужна страница»", "«напиши скрипт»", "«поправь код»"],
    prompt:
      "Поставь мне два скилла из github.com/Shubhamsaboo/awesome-llm-apps: content-creator и fullstack-developer. Положи их в .claude/skills моего проекта.",
    note: "Устанавливается вместе с Писателем — одной фразой выше.",
  },
  {
    emoji: "🎯",
    name: "Superpowers",
    codeName: "плагин-методолог",
    badge: "ПЛАГИН",
    whatItDoes:
      "Не один скилл — целый плагин с методологией. Заставляет агента идти по этапам: сначала разобраться, потом спланировать, потом сделать и проверить.",
    whenComes: [
      "Без него агент торопится: сразу пишет код, не задав вопросов",
      "С плагином ни одна сложная задача не пройдёт мимо этапа «разобраться»",
    ],
    prompt:
      "Поставь мне плагин Superpowers из репозитория на GitHub: https://github.com/obra/superpowers. Скачай и установи глобально, чтобы команды /brainstorm, /write-plan и /execute-plan были доступны во всех проектах.",
    note: "Способ 1 — через менеджер плагинов: введите /plugins в окне Claude Code, найдите superpowers в поиске и установите. Ставится глобально.",
  },
  {
    emoji: "🎨",
    name: "Дизайнер",
    codeName: "frontend-design",
    badge: "БОНУС",
    whatItDoes:
      "Превращает агента из «кое-как соберёт страницу» в дизайнера-разработчика с характером. Лендинги, интерфейсы, КП — не выглядит «как сделано на ИИ».",
    whenComes: ["Делаете лендинги для заказчиков", "Нужны интерфейсы продуктов «под ключ»", "Хотите коммерческие предложения с дизайном"],
    prompt:
      "Поставь мне скилл frontend-design, лежит по ссылке https://skillsmp.com/skills/anthropics-claude-code-plugins-frontend-design-skills-frontend-design-skill-md. Положи в .claude/skills моего проекта.",
  },
];

export const SUPERPOWERS_COMMANDS = [
  { command: "/brainstorm", when: "Когда: идея есть, ясности нет", desc: "Задаёт сократические вопросы. Разбивает идею на части. Результат: документ концепции." },
  { command: "/write-plan", when: "Когда: идея ясна, непонятно с чего начать", desc: "Разбивает проект на микрозадачи по 25 минут. Для каждой — файл, код, как проверить." },
  { command: "/execute-plan", when: "Когда: план одобрен", desc: "Идёт по плану шаг за шагом. Ошибка — сам возвращается и переделывает." },
];

export const FINAL_STEP_PROMPT =
  "Допиши в CLAUDE.md блок «Моя команда» со списком установленных скиллов и плагина Superpowers. И в MEMORY.md добавь запись об установке с сегодняшней датой.";
