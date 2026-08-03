export type SkillCard = {
  name: string;
  badge: string;
  description: string;
  useCases: string[];
  prompt: string;
  terminalCmd?: string;
  githubUrl: string;
};

export type SkillSection = {
  key: string;
  title: string;
  description: string;
  cards: SkillCard[];
};

export const SKILLS_LIBRARY: SkillSection[] = [
  {
    key: "content",
    title: "01 · Контент и соцсети",
    description: "Скачать, исследовать, написать, разобрать конкурентов.",
    cards: [
      {
        name: "video-downloader",
        badge: "69k⭐",
        description: "Скачивает видео с Instagram, TikTok, YouTube и десятков других площадок.",
        useCases: ["Скачать Reels конкурента для разбора", "Собрать папку референсов", "Достать ролик под монтаж"],
        prompt:
          "Установи скилл video-downloader из репозитория https://github.com/ComposioHQ/awesome-claude-skills/tree/master/video-downloader — скопируй папку скилла в мою папку скиллов и активируй.",
        githubUrl: "https://github.com/ComposioHQ/awesome-claude-skills/tree/master/video-downloader",
      },
      {
        name: "content-research-writer",
        badge: "69k⭐",
        description: "Исследует тему в интернете и пишет готовый контент на основе фактов, а не выдумок.",
        useCases: ["Собрать материал по теме", "Написать пост или статью", "Подготовить сценарий на фактах"],
        prompt:
          "Установи скилл content-research-writer из репозитория https://github.com/ComposioHQ/awesome-claude-skills/tree/master/content-research-writer — скопируй папку скилла в мою папку скиллов и активируй.",
        githubUrl: "https://github.com/ComposioHQ/awesome-claude-skills/tree/master/content-research-writer",
      },
      {
        name: "competitive-ads-extractor",
        badge: "69k⭐",
        description: "Вытаскивает рекламные объявления конкурентов, чтобы разобрать их офферы и креативы.",
        useCases: ["Посмотреть офферы конкурентов", "Разобрать их креативы", "Найти идеи для своей рекламы"],
        prompt:
          "Установи скилл competitive-ads-extractor из репозитория https://github.com/ComposioHQ/awesome-claude-skills/tree/master/competitive-ads-extractor — скопируй папку скилла в мою папку скиллов и активируй.",
        githubUrl: "https://github.com/ComposioHQ/awesome-claude-skills/tree/master/competitive-ads-extractor",
      },
    ],
  },
  {
    key: "video",
    title: "02 · Видео: разбор и монтаж",
    description: "Понять чужой ролик, получить транскрипт, нарезать своё.",
    cards: [
      {
        name: "claude-video",
        badge: "9.7k⭐",
        description:
          "Команда /watch: ассистент сам скачивает видео, вытаскивает кадры, транскрибирует и объясняет, о чём ролик.",
        useCases: ["Понять, о чём чужой ролик", "Получить транскрипт видео", "Разобрать, почему видео залетело"],
        prompt:
          "Установи плагин claude-video из репозитория https://github.com/bradautomates/claude-video — подключи его и активируй команду /watch.",
        githubUrl: "https://github.com/bradautomates/claude-video",
      },
      {
        name: "video-editing-skill",
        badge: "новый",
        description: "Монтаж голосом на базе FFmpeg и Whisper: нарезка, удаление пауз, субтитры в стиле Hormozi.",
        useCases: ["Нарезать длинное видео на клипы", "Убрать паузы автоматически", "Вшить субтитры в кадр"],
        prompt:
          "Установи скилл из репозитория https://github.com/6missedcalls/video-editing-skill в мою папку скиллов и активируй. Для работы нужны FFmpeg и Whisper.",
        githubUrl: "https://github.com/6missedcalls/video-editing-skill",
      },
      {
        name: "claude-youtube",
        badge: "новый",
        description: "Помощник для YouTube: аудит канала, SEO видео, сценарии на удержание, идеи для Shorts.",
        useCases: ["Проверить свой канал", "Оптимизировать заголовки и описания", "Написать сценарий на удержание"],
        prompt: "Установи скилл claude-youtube из репозитория https://github.com/AgriciDaniel/claude-youtube — подключи и активируй.",
        githubUrl: "https://github.com/AgriciDaniel/claude-youtube",
      },
    ],
  },
  {
    key: "engines",
    title: "03 · Движки — фундамент, на котором всё работает",
    description: "Проверены годами. Ассистент ставит их сам, когда скилл этого требует.",
    cards: [
      {
        name: "yt-dlp",
        badge: "179k⭐",
        description: "Главный инструмент скачивания видео и аудио с 1000+ сайтов, включая Instagram, TikTok, YouTube.",
        useCases: ["Скачать любой ролик", "Достать только звук из видео", "Выгрузить целый плейлист"],
        prompt: "Установи yt-dlp — инструмент для скачивания видео с Instagram, TikTok и YouTube. Проверь, что команда работает.",
        terminalCmd: "pip install -U yt-dlp",
        githubUrl: "https://github.com/yt-dlp/yt-dlp",
      },
      {
        name: "OpenAI Whisper",
        badge: "105k⭐",
        description: "Превращает речь из видео и аудио в текст. Основа для разбора роликов и субтитров.",
        useCases: ["Сделать транскрипт ролика", "Получить субтитры", "Разобрать смысл видео текстом"],
        prompt: "Установи OpenAI Whisper — он переводит речь из видео в текст. Проверь установку.",
        terminalCmd: "pip install -U openai-whisper",
        githubUrl: "https://github.com/openai/whisper",
      },
      {
        name: "FFmpeg",
        badge: "62k⭐",
        description: "Швейцарский нож для видео: конвертация, нарезка, сжатие, извлечение звука.",
        useCases: ["Конвертировать формат", "Обрезать по времени", "Вытащить аудиодорожку"],
        prompt: "Установи FFmpeg под мою систему — он нужен для нарезки и конвертации видео. Проверь установку.",
        githubUrl: "https://github.com/FFmpeg/FFmpeg",
      },
    ],
  },
  {
    key: "build-your-own",
    title: "04 · Собери свой скилл + большие библиотеки",
    description: "Когда готового мало — сделай своё или бери из проверенных подборок.",
    cards: [
      {
        name: "skill-creator",
        badge: "163k⭐",
        description:
          "Официальный скилл от Anthropic, который проводит за руку и помогает собрать ВАШ собственный скилл под любую задачу.",
        useCases: ["Создать свой навык с нуля", "Оформить SKILL.md правильно", "Упаковать и переиспользовать"],
        prompt:
          "Установи официальный скилл skill-creator от Anthropic из https://github.com/anthropics/skills — он помогает создавать свои скиллы. Подключи и активируй.",
        terminalCmd: "/plugin marketplace add anthropics/skills",
        githubUrl: "https://github.com/anthropics/skills",
      },
      {
        name: "awesome-claude-skills",
        badge: "69k⭐",
        description: "Большая проверенная библиотека готовых скиллов: контент, данные, соцсети, бизнес.",
        useCases: ["Найти скилл под свою задачу", "Взять сразу несколько", "Посмотреть, как устроены скиллы"],
        prompt: "Открой репозиторий https://github.com/ComposioHQ/awesome-claude-skills и покажи список доступных скиллов — я выберу, что установить.",
        githubUrl: "https://github.com/ComposioHQ/awesome-claude-skills",
      },
      {
        name: "awesome-claude-code",
        badge: "50k⭐",
        description: "Огромная кураторская подборка всего для Claude Code: скиллы, агенты, инструменты, статуслайны.",
        useCases: ["Изучить экосистему целиком", "Найти неочевидные инструменты", "Держать под рукой как справочник"],
        prompt: "Открой репозиторий https://github.com/hesreallyhim/awesome-claude-code и покажи, что полезного есть для контента и видео.",
        githubUrl: "https://github.com/hesreallyhim/awesome-claude-code",
      },
    ],
  },
];
