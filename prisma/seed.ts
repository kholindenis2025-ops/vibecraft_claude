import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { ACHIEVEMENTS } from "../src/lib/achievements-data";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

type QuizDef = {
  title: string;
  passScore: number;
  questions: {
    text: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
};

type HomeworkDef = {
  title: string;
  description: string;
};

type LessonDef = {
  slug: string;
  title: string;
  summary: string;
  content: string;
  durationMin?: number;
  format?: string;
  availableFrom?: string;
  quiz?: QuizDef;
  homework?: HomeworkDef;
};

type ModuleCategory = "INTRO" | "MODULE" | "TOOL" | "BONUS" | "MATERIAL";

type ModuleDef = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: ModuleCategory;
  externalUrl?: string;
  toolKey?: string;
  lessons: LessonDef[];
};

const placeholderContent = (topic: string) =>
  `## ${topic}\n\nЗдесь появится текстовый разбор темы, видеоурок и презентация — материалы добавляются по мере готовности.\n\n**Что будет в этом уроке:**\n- Разбор темы простым языком, с примерами\n- Видео с пошаговой демонстрацией\n- Слайды/презентация для повторения\n\n*Материалы скоро будут добавлены преподавателем.*`;

function homeworkFor(title: string, description: string): HomeworkDef {
  return { title, description };
}

const feedbackHomework = homeworkFor(
  "Обратная связь по пройденному модулю",
  "Поделись впечатлениями от модуля: что было полезно, что осталось непонятным, какой результат получил(а). Текстом и/или ссылкой на выполненную работу."
);

function lesson(opts: {
  slug: string;
  title: string;
  summary: string;
  content?: string;
  format?: string;
  availableFrom?: string;
  durationMin?: number;
  quiz?: QuizDef;
  homework?: HomeworkDef;
}): LessonDef {
  return {
    slug: opts.slug,
    title: opts.title,
    summary: opts.summary,
    content: opts.content ?? placeholderContent(opts.title),
    format: opts.format,
    availableFrom: opts.availableFrom,
    durationMin: opts.durationMin,
    quiz: opts.quiz,
    homework: opts.homework,
  };
}

const modules: ModuleDef[] = [
  {
    slug: "top-30-oshibok",
    category: "TOOL",
    title: "Топ-30 ошибок вайб-кодинга",
    description:
      "Чек-лист главных ошибок новичков в вайб-кодинге — чтобы не наступать на грабли, на которых уже все обожглись.",
    icon: "shield-alert",
    externalUrl: "https://platform.aibasis.ru/top-30-oshibok-vibe-coding#checklist",
    toolKey: "checklist-30",
    lessons: [
      lesson({
        slug: "checklist",
        title: "Чек-лист «30 ошибок вайб-кодинга»",
        summary:
          "Интерактивный чек-лист: отмечай пункты, фильтруй по категориям, ищи по ошибкам. Прогресс сохраняется в браузере.",
        durationMin: 20,
        homework: homeworkFor(
          "Пройди чек-лист по своему проекту",
          "Возьми свою текущую идею продукта (или задумай новую) и пройдись по чек-листу «30 ошибок». Отметь минимум 5 пунктов, которые были или могли быть у тебя, и опиши, как ты их исправишь. Пришли ссылку на документ/заметку с разбором."
        ),
      }),
    ],
  },
  {
    slug: "podgotovka-motivaciya",
    category: "INTRO",
    title: "Подготовка к обучению и мотивация",
    description: "Настраиваемся на курс, разбираемся с инструментами и формулируем свою личную цель.",
    icon: "compass",
    lessons: [
      lesson({
        slug: "dobro-pozhalovat-na-programmu",
        title: "Добро пожаловать на программу",
        summary: "Как будет проходить обучение",
        format: "Статья",
      }),
      lesson({
        slug: "kak-idet-process-dostizheniya-celi",
        title: "Как идёт процесс достижения любой цели",
        summary: "Разбираем механику движения к цели, чтобы осознанно проходить курс.",
        format: "Урок в записи",
      }),
      lesson({
        slug: "motivaciya-kak-s-ney-rabotat",
        title: "Мотивация: как с ней работать и как не потерять мотивацию во время обучения",
        summary: "Практики поддержания мотивации на всём протяжении курса.",
        format: "Урок в записи",
      }),
      lesson({
        slug: "kak-nayti-vremya-na-uchebu",
        title: "Как найти время на учёбу, даже если кажется, что его совсем нет",
        summary: "Приёмы для встраивания обучения в плотный график.",
        format: "Урок в записи",
      }),
      lesson({
        slug: "pochemu-nelzya-borot-strah",
        title: "Почему нельзя «бороть» свой страх и что тогда делать, чтобы он не мешал",
        summary: "Как работать со страхом вместо борьбы с ним.",
        format: "Урок в записи",
      }),
      lesson({
        slug: "neyrofishki-dlya-dostizheniya-celey",
        title: "Нейрофишки, помогающие в достижении целей",
        summary: "Практические приёмы для более уверенного движения к цели.",
        format: "Урок в записи",
      }),
      lesson({
        slug: "neyrofishki-dlya-resursnogo-sostoyaniya",
        title: "Нейрофишки, помогающие в поддержании ресурсного состояния",
        summary: "Как поддерживать энергию и не выгорать во время обучения.",
        format: "Урок в записи",
      }),
      lesson({
        slug: "obratnaya-svyaz-po-modulyu",
        title: "Обратная связь по пройденному модулю",
        summary: "Стоп-урок: нужно выполнить задание, чтобы двигаться дальше.",
        homework: feedbackHomework,
      }),
    ],
  },
  {
    slug: "modul-1-s-chego-nachat",
    category: "MODULE",
    title: "Модуль 1. С чего начать: твоя идея и первый продукт",
    description: "От идеи до первого работающего прототипа продукта.",
    icon: "lightbulb",
    lessons: [
      lesson({
        slug: "urok-1-vvedenie-v-vibecoding",
        title: "Урок 1. Введение в вайбкодинг",
        summary: "С чего начинается путь и что тебя ждёт в этом модуле.",
        format: "Урок в записи",
        availableFrom: "2026-08-03T11:00:00",
      }),
      lesson({
        slug: "urok-2-1-nastraivaem-claude-code",
        title: "Урок 2.1. Настраиваем рабочее место Claude Code",
        summary: "Пошаговая настройка Claude Code для работы над проектом.",
        format: "Урок в записи",
        availableFrom: "2026-08-04T11:00:00",
      }),
      lesson({
        slug: "urok-2-2-nastraivaem-codex",
        title: "Урок 2.2. Настраиваем рабочее место Codex",
        summary: "Пошаговая настройка Codex для работы над проектом.",
        format: "Урок в записи",
        availableFrom: "2026-08-04T11:00:00",
      }),
      lesson({
        slug: "urok-3-pervyi-produkt-svoimi-rukami",
        title: "Урок 3. Первый продукт своими руками",
        summary: "Собираем первый рабочий результат руками, шаг за шагом.",
        format: "Урок в записи",
        availableFrom: "2026-08-05T11:00:00",
      }),
      lesson({
        slug: "urok-4-vybor-idei",
        title: "Урок 4. Выбор идеи (распаковка)",
        summary: "Как распаковать и выбрать идею для своего первого продукта.",
        format: "Урок в записи",
        availableFrom: "2026-08-06T11:00:00",
      }),
      lesson({
        slug: "razbory-s-vladislavom-kostenko-m1",
        title: "Разборы с техническим специалистом Владиславом Костенко",
        summary: "Живой разбор вопросов и решений по модулю.",
        format: "Эфир",
        availableFrom: "2026-08-06T14:30:00",
      }),
      lesson({
        slug: "urok-5-kak-opisat-ideyu",
        title: "Урок 5. Как описать свою идею, чтобы помощник её понял с первого раза",
        summary: "Формулируем идею так, чтобы ИИ-агент сразу понял задачу.",
        format: "Урок в записи",
        availableFrom: "2026-08-07T11:00:00",
      }),
      lesson({
        slug: "obratnaya-svyaz-po-modulyu",
        title: "Обратная связь по пройденному модулю",
        summary: "Стоп-урок: нужно выполнить задание, чтобы двигаться дальше.",
        availableFrom: "2026-08-07T11:00:00",
        homework: feedbackHomework,
      }),
    ],
  },
  {
    slug: "modul-2-trend-radar",
    category: "MODULE",
    title: "Модуль 2. Тренд-радар: собираешь на самом свежем",
    description: "Учимся находить свежие идеи и тренды и превращать их в продукты.",
    icon: "radar",
    lessons: [
      lesson({
        slug: "razbor-platformy-i-vybor-trendov",
        title: "Урок 1. Разбор платформы (как в ней работать) + выбор актуальных трендов",
        summary: "Знакомимся с платформой и учимся выбирать актуальные тренды.",
        format: "Урок в записи",
        availableFrom: "2026-08-10T11:00:00",
      }),
      lesson({
        slug: "chto-takoe-skilly",
        title: "Урок 2. Что такое скиллы и как с ними работать",
        summary: "Разбираемся, что такое скиллы и как их применять в проектах.",
        format: "Урок в записи",
        availableFrom: "2026-08-11T11:00:00",
      }),
      lesson({
        slug: "startovyi-nabor-skillov-m2",
        title: "Урок 3. Ставим стартовый набор скиллов",
        summary: "Устанавливаем базовый набор скиллов для работы.",
        format: "Урок в записи",
        availableFrom: "2026-08-12T11:00:00",
      }),
      lesson({
        slug: "kak-sozdat-svoy-skill",
        title: "Урок 4. Как создать свой скилл",
        summary: "Пошагово создаём собственный скилл с нуля.",
        format: "Урок в записи",
        availableFrom: "2026-08-13T11:00:00",
      }),
      lesson({
        slug: "razbory-s-vladislavom-kostenko-m2",
        title: "Разборы с техническим специалистом Владиславом Костенко",
        summary: "Живой разбор вопросов и решений по модулю.",
        format: "Эфир",
        availableFrom: "2026-08-13T14:30:00",
      }),
      lesson({
        slug: "vip-razbory-s-dmitriem-ledovskim-m2",
        title: "ВИП-разборы с Дмитрием Ледовских",
        summary: "Разбор проектов участников с экспертом курса.",
        format: "Эфир",
        availableFrom: "2026-08-14T13:00:00",
      }),
      lesson({
        slug: "obratnaya-svyaz-po-modulyu",
        title: "Обратная связь по пройденному модулю",
        summary: "Стоп-урок: нужно выполнить задание, чтобы двигаться дальше.",
        availableFrom: "2026-08-14T13:00:00",
        homework: feedbackHomework,
      }),
    ],
  },
  {
    slug: "modul-3-pervye-produkty",
    category: "MODULE",
    title: "Модуль 3. Твои первые продукты: от А до Я",
    description: "Полный цикл создания продукта — от технического задания до готового результата.",
    icon: "layout-grid",
    lessons: [
      lesson({
        slug: "sozdaem-sayty-landing",
        title: "Урок 1. Создаём сайты — посадочная страница с формой заявки",
        summary: "Собираем лендинг с формой заявки с нуля.",
        format: "Урок в записи",
        availableFrom: "2026-08-17T11:00:00",
      }),
      lesson({
        slug: "sozdaem-chatbota-chast-1",
        title: "Урок 2. Создаём чат-бота — Telegram-бот, который отвечает за тебя. Часть 1",
        summary: "Начинаем собирать Telegram-бота, отвечающего вместо тебя.",
        format: "Урок в записи",
        availableFrom: "2026-08-18T11:00:00",
      }),
      lesson({
        slug: "sozdaem-chatbota-chast-2",
        title: "Урок 2. Создаём чат-бота — Telegram-бот, который отвечает за тебя. Часть 2",
        summary: "Продолжаем сборку Telegram-бота.",
        format: "Урок в записи",
        availableFrom: "2026-08-19T11:00:00",
      }),
      lesson({
        slug: "sozdaem-chatbota-chast-3",
        title: "Урок 2. Создаём чат-бота — Telegram-бот, который отвечает за тебя. Часть 3",
        summary: "Завершаем и запускаем Telegram-бота.",
        format: "Урок в записи",
        availableFrom: "2026-08-20T11:00:00",
      }),
      lesson({
        slug: "razbory-s-vladislavom-kostenko-m3",
        title: "Разборы с техническим специалистом Владиславом Костенко",
        summary: "Живой разбор вопросов и решений по модулю.",
        format: "Эфир",
        availableFrom: "2026-08-20T14:30:00",
      }),
      lesson({
        slug: "sozdaem-ai-pomoshnika",
        title: "Урок 3. Создаём AI-помощника — маленький сотрудник на каждый день",
        summary: "Собираем личного AI-помощника для повседневных задач.",
        format: "Урок в записи",
        availableFrom: "2026-08-21T11:00:00",
      }),
      lesson({
        slug: "sozdaem-prilozheniya",
        title: "Урок 4. Создаём приложения — открывается на телефоне как настоящее",
        summary: "Собираем приложение, которое запускается на телефоне.",
        format: "Урок в записи",
        availableFrom: "2026-08-22T11:00:00",
      }),
      lesson({
        slug: "dop-material-sozdaem-prilozheniya",
        title: "Дополнительный материал к уроку «Создаём приложения»",
        summary: "Дополнительные материалы в помощь по уроку.",
        format: "Материалы",
        availableFrom: "2026-08-22T11:00:00",
      }),
      lesson({
        slug: "vybiraem-put-dlya-glavnogo-proekta",
        title: "Урок 5. Выбираем свой путь для главного проекта",
        summary: "Определяем направление для основного проекта курса.",
        format: "Урок в записи",
        availableFrom: "2026-08-23T11:00:00",
      }),
      lesson({
        slug: "obratnaya-svyaz-po-modulyu",
        title: "Обратная связь по пройденному модулю",
        summary: "Стоп-урок: нужно выполнить задание, чтобы двигаться дальше.",
        availableFrom: "2026-08-23T11:00:00",
        homework: feedbackHomework,
      }),
    ],
  },
  {
    slug: "modul-4-ot-chernovika-do-produkta",
    category: "MODULE",
    title: "Модуль 4. От черновика до продукта в интернете",
    description: "Публикуем продукт в интернете: хостинг, домен, безопасность, аналитика и мониторинг.",
    icon: "globe",
    lessons: [
      lesson({
        slug: "etap-1-prototip",
        title: "Этап 1. Прототип — собираем первую рабочую версию",
        summary: "Собираем первую рабочую версию проекта.",
        format: "Урок в записи",
        availableFrom: "2026-08-24T11:00:00",
      }),
      lesson({
        slug: "dokumentaciya-proekta",
        title: "Документация проекта",
        summary: "Оформляем документацию по проекту.",
        format: "Статья",
        availableFrom: "2026-08-25T11:00:00",
      }),
      lesson({
        slug: "etap-2-vnutrennosti-i-oplata",
        title: "Этап 2. Внутренности и оплата — данные, вход, платежи. Кнопка «купить» работает",
        summary: "Подключаем данные, вход и оплату — кнопка «купить» начинает работать.",
        format: "Урок в записи",
        availableFrom: "2026-08-26T11:00:00",
      }),
      lesson({
        slug: "podklyuchenie-neyroseti-cherez-api",
        title: "Подключение к проекту нейросети через API",
        summary: "Подключаем нейросеть к проекту через API.",
        format: "Урок в записи",
        availableFrom: "2026-08-27T11:00:00",
      }),
      lesson({
        slug: "razbory-m4-1",
        title: "Разборы",
        summary: "Живой разбор вопросов и решений по модулю.",
        format: "Эфир",
        availableFrom: "2026-08-27T14:30:00",
      }),
      lesson({
        slug: "etap-3-vneshniy-vid",
        title: "Этап 3. Внешний вид — цвета, шрифты, адаптация под телефон без дизайнера",
        summary: "Приводим продукт в порядок визуально своими силами.",
        format: "Урок в записи",
        availableFrom: "2026-08-28T11:00:00",
      }),
      lesson({
        slug: "vip-razbory-s-dmitriem-ledovskim-m4",
        title: "ВИП-разборы с Дмитрием Ледовских",
        summary: "Разбор проектов участников с экспертом курса.",
        format: "Эфир",
        availableFrom: "2026-08-28T13:00:00",
      }),
      lesson({
        slug: "dorabotka-dizayna-proekta",
        title: "Доработка дизайна проекта",
        summary: "Дорабатываем визуал проекта по итогам разборов.",
        format: "Урок в записи",
        availableFrom: "2026-08-29T11:00:00",
      }),
      lesson({
        slug: "etap-4-proverki",
        title: "Этап 4. Проверки — тестировщик, ревизор, охранник. Продукт защищается",
        summary: "Проверяем продукт на прочность перед запуском.",
        format: "Урок в записи",
        availableFrom: "2026-08-31T11:00:00",
      }),
      lesson({
        slug: "zashita-dannyh-proekta",
        title: "Защита данных проекта",
        summary: "Базовые меры защиты данных проекта.",
        format: "Урок в записи",
        availableFrom: "2026-09-01T11:00:00",
      }),
      lesson({
        slug: "etap-5-zapusk-chast-1",
        title: "Этап 5. Запуск — домен, публикация, юридическая база. Часть 1",
        summary: "Начинаем запуск: домен и публикация.",
        format: "Урок в записи",
        availableFrom: "2026-09-02T11:00:00",
      }),
      lesson({
        slug: "etap-5-zapusk-chast-2",
        title: "Этап 5. Запуск — домен, публикация, юридическая база. Часть 2",
        summary: "Завершаем запуск: юридическая база проекта.",
        format: "Урок в записи",
        availableFrom: "2026-09-03T11:00:00",
      }),
      lesson({
        slug: "razbory-m4-2",
        title: "Разборы",
        summary: "Живой разбор вопросов и решений по модулю.",
        format: "Эфир",
        availableFrom: "2026-09-03T16:30:00",
      }),
      lesson({
        slug: "vybor-domena-pod-raznye-proekty",
        title: "Выбор домена под разные типы проектов",
        summary: "Как выбрать домен в зависимости от типа проекта.",
        format: "Урок в записи",
        availableFrom: "2026-09-05T11:00:00",
      }),
      lesson({
        slug: "obratnaya-svyaz-po-modulyu",
        title: "Обратная связь по пройденному модулю",
        summary: "Стоп-урок: нужно выполнить задание, чтобы двигаться дальше.",
        availableFrom: "2026-09-05T11:00:00",
        homework: feedbackHomework,
      }),
    ],
  },
  {
    slug: "modul-5-pervye-klienty-dengi",
    category: "MODULE",
    title: "Модуль 5. Первые клиенты и деньги",
    description: "От первого продукта — к первым деньгам: поиск клиентов, продажи, оплата.",
    icon: "handshake",
    lessons: [
      lesson({
        slug: "urok-1-kak-pravilno-okazyvat-uslugi",
        title: "Урок 1. Как правильно оказывать услуги",
        summary: "Базовые принципы качественного оказания услуг клиентам.",
        format: "Урок в записи",
        availableFrom: "2026-09-07T11:00:00",
      }),
      lesson({
        slug: "urok-2-kak-upakovat-produkt",
        title: "Урок 2. Как упаковать свой продукт для продажи",
        summary: "Упаковываем продукт так, чтобы его было легко продавать.",
        format: "Урок в записи",
        availableFrom: "2026-09-08T11:00:00",
      }),
      lesson({
        slug: "urok-3-gde-brat-klientov",
        title: "Урок 3. Где брать клиентов",
        summary: "Источники первых клиентов для твоего продукта.",
        format: "Урок в записи",
        availableFrom: "2026-09-09T11:00:00",
      }),
      lesson({
        slug: "urok-4-kak-dogovoritsya-o-prodazhe",
        title: "Урок 4. Как договориться о продаже",
        summary: "Доводим разговор с клиентом до сделки.",
        format: "Урок в записи",
        availableFrom: "2026-09-10T11:00:00",
      }),
      lesson({
        slug: "razbory-s-vladislavom-kostenko-m5",
        title: "Разборы с техническим специалистом Владиславом Костенко",
        summary: "Живой разбор вопросов и решений по модулю.",
        format: "Эфир",
        availableFrom: "2026-09-10T14:30:00",
      }),
      lesson({
        slug: "vip-razbory-s-dmitriem-ledovskim-m5",
        title: "ВИП-разборы с Дмитрием Ледовских",
        summary: "Разбор проектов участников с экспертом курса.",
        format: "Эфир",
        availableFrom: "2026-09-11T13:00:00",
      }),
      lesson({
        slug: "obratnaya-svyaz-po-modulyu",
        title: "Обратная связь по пройденному модулю",
        summary: "Стоп-урок: нужно выполнить задание, чтобы двигаться дальше.",
        availableFrom: "2026-09-11T13:00:00",
        homework: feedbackHomework,
      }),
    ],
  },
  {
    slug: "modul-6-sprint-10-dney",
    category: "MODULE",
    title: "Модуль 6. Спринт: 10 дней до первого клиента",
    description: "Интенсивный практический спринт: за 10 дней проходим путь от идеи до первой сделки.",
    icon: "flag",
    lessons: [
      lesson({
        slug: "dmitriy-ledovskih-postanovka-celey",
        title: "Дмитрий Ледовских «Постановка целей и декомпозиция»",
        summary: "Учимся ставить цели спринта и раскладывать их на понятные шаги.",
        format: "Эфир",
        availableFrom: "2026-09-14T11:00:00",
      }),
      lesson({
        slug: "upakovka-uslug-i-produktov",
        title: "Упаковка своих услуг и продуктов",
        summary: "Приводим услуги и продукты в продаваемый вид.",
        format: "Эфир",
        availableFrom: "2026-09-15T11:00:00",
      }),
      lesson({
        slug: "privlechenie-klientov-1",
        title: "Привлечение клиентов",
        summary: "Разбираем способы привлечения первых клиентов.",
        format: "Эфир",
        availableFrom: "2026-09-16T11:00:00",
      }),
      lesson({
        slug: "privlechenie-klientov-2",
        title: "Привлечение клиентов",
        summary: "Продолжаем разбор способов привлечения клиентов.",
        format: "Эфир",
        availableFrom: "2026-09-17T11:00:00",
      }),
      lesson({
        slug: "razbory-m6-1",
        title: "Разборы",
        summary: "Живой разбор вопросов и решений по модулю.",
        format: "Эфир",
        availableFrom: "2026-09-18T11:00:00",
      }),
      lesson({
        slug: "trenazher-privlechenie-chast-1",
        title: "Тренажёр по привлечению клиентов и офферам. Часть 1",
        summary: "Отрабатываем привлечение клиентов и составление офферов на практике.",
        format: "Урок в записи",
        availableFrom: "2026-09-19T11:00:00",
      }),
      lesson({
        slug: "trenazher-privlechenie-chast-2",
        title: "Тренажёр по привлечению клиентов ч.2",
        summary: "Тренируемся искать клиентов вокруг.",
        format: "Урок в записи",
        availableFrom: "2026-09-20T11:00:00",
      }),
      lesson({
        slug: "prodazhi-1",
        title: "Продажи",
        summary: "Разбираем практику продаж своих услуг и продуктов.",
        format: "Эфир",
        availableFrom: "2026-09-21T11:00:00",
      }),
      lesson({
        slug: "prodazhi-2",
        title: "Продажи",
        summary: "Продолжаем разбор практики продаж.",
        format: "Эфир",
        availableFrom: "2026-09-22T11:00:00",
      }),
      lesson({
        slug: "razbory-m6-2",
        title: "Разборы",
        summary: "Живой разбор вопросов и решений по модулю.",
        format: "Эфир",
        availableFrom: "2026-09-23T11:00:00",
      }),
      lesson({
        slug: "dozhim-po-zadacham",
        title: "Дожим по задачам",
        summary: "Материалы на платформе для дожима текущих задач спринта.",
        format: "Материалы",
        availableFrom: "2026-09-24T11:00:00",
      }),
      lesson({
        slug: "podvedenie-itogov",
        title: "Подведение итогов",
        summary: "Подводим итоги пройденного спринта.",
        format: "Урок в записи",
        availableFrom: "2026-09-24T11:00:00",
      }),
      lesson({
        slug: "zashita-proekta-i-plan",
        title: "Защита проекта и план на ближайшие 60 дней",
        summary: "Защищаем результат спринта и составляем план на 60 дней вперёд.",
        format: "Урок в записи",
        availableFrom: "2026-09-25T11:00:00",
      }),
      lesson({
        slug: "obratnaya-svyaz-po-modulyu",
        title: "Обратная связь по пройденному модулю",
        summary: "Стоп-урок: нужно выполнить задание, чтобы двигаться дальше.",
        availableFrom: "2026-09-25T11:00:00",
        homework: feedbackHomework,
      }),
    ],
  },
  {
    slug: "codex-skills-map",
    category: "TOOL",
    title: "Карта скиллов для Codex",
    description: "Разбираемся, какие навыки (скиллы) можно прокачать у Codex и как ими пользоваться.",
    icon: "map",
    externalUrl: "https://platform.aibasis.ru/codex_skills_map",
    toolKey: "skill-map",
    lessons: [
      lesson({
        slug: "map",
        title: "Карта скиллов для Codex",
        summary:
          "Маршрут проекта из 5 этапов и 30 скиллов: понять, собрать, подключить, проверить, развить.",
        durationMin: 15,
        homework: homeworkFor(
          "Собери свой первый скилл для Codex",
          "Выбери одну повторяющуюся рабочую задачу, определи, на каком этапе маршрута она находится, и подключи или собери под неё скилл для Codex. Пришли описание задачи и ссылку на скилл/конфигурацию."
        ),
      }),
    ],
  },
  {
    slug: "skills-starter-kit",
    category: "TOOL",
    title: "Скиллы для Claude Code и Codex",
    description: "Стартовый набор готовых скиллов для Claude Code и Codex — устанавливаем и адаптируем под себя.",
    icon: "wrench",
    externalUrl: "https://platform.aibasis.ru/skills-starter-kit",
    toolKey: "skills-library",
    lessons: [
      lesson({
        slug: "library",
        title: "Скиллы для Claude Code и Codex",
        summary:
          "Готовые проверенные навыки — скачать видео, написать контент, разобрать конкурентов. Копируешь промпт, вставляешь агенту.",
        durationMin: 15,
        homework: homeworkFor(
          "Установи и адаптируй скилл под свою задачу",
          "Возьми один скилл из стартового набора, установи его в свой проект и адаптируй под конкретную задачу. Пришли краткое описание того, что изменил и как это помогло."
        ),
      }),
    ],
  },
  {
    slug: "claude-codex-deshevle",
    category: "TOOL",
    title: "Claude и Codex на 80% дешевле",
    description: "Разбираемся, как экономить на работе с ИИ-агентами без потери качества.",
    icon: "piggy-bank",
    externalUrl: "https://platform.aibasis.ru/ClaudeCodex_deshevle",
    toolKey: "rtk-guide",
    lessons: [
      lesson({
        slug: "guide",
        title: "Claude и Codex на 80% дешевле",
        summary: "Гайд по rtk — утилите, которая сжимает вывод команд и экономит токены. Ставится за 3 минуты.",
        durationMin: 15,
        homework: homeworkFor(
          "Посчитай и оптимизируй свои расходы на ИИ",
          "Поставь rtk по инструкции, поработай 10+ минут как обычно и запроси `rtk gain --graph`. Пришли скриншот графика экономии и короткий вывод — стоит ли использовать rtk дальше в твоих проектах."
        ),
      }),
    ],
  },
  {
    slug: "skills-dlya-agenta",
    category: "TOOL",
    title: "Скиллы для твоего агента",
    description: "Проектируем и подключаем собственные скиллы под рутинные задачи твоего агента.",
    icon: "bot",
    externalUrl: "https://platform.aibasis.ru/skills-start",
    toolKey: "agent-skills",
    lessons: [
      lesson({
        slug: "team",
        title: "Скиллы для твоего агента",
        summary: "6 готовых специалистов, которые подключаются к Claude Code одной фразой.",
        durationMin: 15,
        homework: homeworkFor(
          "Собери свою команду скиллов",
          "Установи минимум 2 скилла из этого модуля под свои реальные задачи, зафиксируй их в CLAUDE.md и проверь командой «Покажи какие скиллы и плагины у тебя сейчас установлены». Пришли скриншот результата."
        ),
      }),
    ],
  },
  {
    slug: "bonus-vibecoding-s-telefona",
    category: "BONUS",
    title: "Бонус: Вайбкодинг с телефона",
    description: "Помощник прямо в Telegram: правишь свой продукт удалённо, без компьютера, с пляжа или кафе.",
    icon: "smartphone",
    lessons: [
      lesson({
        slug: "zachem-tebe-ai-agent-v-telefone",
        title: "Зачем тебе AI-агент в телефоне",
        summary:
          "Ноутбук не всегда рядом — а задачи не ждут. Разбираем как работать с проектами прямо с телефона: голосом диктуешь задачу, агент делает. Живые сценарии — из такси, из кафе, с пляжа.",
        format: "Урок в записи",
        availableFrom: "2026-09-26T11:00:00",
      }),
      lesson({
        slug: "zapuskaem-agenta-za-odin-vecher",
        title: "Запускаем агента за один вечер",
        summary:
          "Никакого программирования. Пошагово поднимаем личного AI-агента в Telegram — он работает круглосуточно, помнит твои проекты и выполняет задачи, пока ты занят другим.",
        format: "Урок в записи",
        availableFrom: "2026-09-26T11:00:00",
      }),
      lesson({
        slug: "nastraivaem-agenta-pod-tebya",
        title: "Настраиваем агента под тебя",
        summary:
          "Агент учит твой стиль, запоминает проекты и предпочтения. Выбираешь из 24 готовых навыков — контент, дизайн, код, мониторинг. Подключаешь календарь и почту. Теперь он знает тебя.",
        format: "Урок в записи",
        availableFrom: "2026-09-26T11:00:00",
      }),
      lesson({
        slug: "sistema-bezopasnosti-agenta",
        title: "Система безопасности агента",
        summary: "Самый мощный урок.",
        format: "Урок в записи",
        availableFrom: "2026-09-26T11:00:00",
      }),
      lesson({
        slug: "vibecoding-s-telefona-v-realnoy-zhizni",
        title: "Вайбкодинг с телефона в реальной жизни",
        summary:
          "Финальный челлендж — берёшь реальную задачу из своего проекта и решаешь её с телефона из кафе. Снимаешь видео процесса. Уходишь с пониманием, что делать с телефона, а что лучше за столом.",
        format: "Урок в записи",
        availableFrom: "2026-09-26T11:00:00",
        homework: homeworkFor(
          "Внеси правку в продукт с телефона",
          "Не используя компьютер, внеси любую небольшую правку в свой продукт с помощью телефона и опубликуй изменение. Пришли скриншот процесса и ссылку на обновлённый продукт."
        ),
      }),
    ],
  },
  {
    slug: "shpargalki-k-modulyam",
    category: "MATERIAL",
    title: "Шпаргалки к модулям",
    description:
      "Короткие справочники-опоры по каждому модулю программы — шаги, таблицы и готовые промпты, чтобы держать под рукой во время работы.",
    icon: "notebook-pen",
    toolKey: "cheatsheets",
    lessons: [
      lesson({
        slug: "library",
        title: "Шпаргалки к модулям",
        summary:
          "Шесть шпаргалок — по одной на каждый модуль программы. Быстро вспомнить шаги, скопировать промпт, свериться с чек-листом.",
        durationMin: 15,
        homework: homeworkFor(
          "Пройди по шпаргалке своего текущего модуля",
          "Открой шпаргалку модуля, в котором сейчас находишься, и выполни её блок «Потренируйся». Пришли, что получилось, текстом и/или ссылкой."
        ),
      }),
    ],
  },
  {
    slug: "poleznye-materialy-i-stati",
    category: "MATERIAL",
    title: "Полезные доп. материалы и статьи",
    description: "Подборка статей, промптов и источников вдохновения для дальнейшего развития.",
    icon: "library",
    lessons: [
      lesson({
        slug: "oshibka-403",
        title: "Ошибка 403",
        summary:
          "Claude Code требует авторизации, вы её проходите — и получаете 403. В браузере всё работает. Разбираем, что происходит и как починить.",
        format: "Статья",
      }),
      lesson({
        slug: "skill-dizayner",
        title: "Скилл-дизайнер: чтобы заказчик не сказал «это же ИИ собирал»",
        summary: "Инструкция по установке и работе со скиллом.",
        format: "Статья",
      }),
      lesson({
        slug: "skilly-i-shablony-instrukciya-odin-raz",
        title: "Скиллы и шаблоны: инструкция один раз — польза навсегда",
        summary:
          "Как надиктовать задачу агенту, получить готовый файл-инструкцию и использовать его в любом новом проекте без лишних слов.",
        format: "Статья",
      }),
    ],
  },
];

async function main() {
  console.log("Сидируем ачивки...");
  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { code: a.code },
      update: { title: a.title, description: a.description, icon: a.icon },
      create: a,
    });
  }

  console.log("Сидируем модули и уроки...");
  for (let i = 0; i < modules.length; i++) {
    const m = modules[i];
    const moduleRow = await prisma.module.upsert({
      where: { slug: m.slug },
      update: {
        order: i + 1,
        category: m.category,
        title: m.title,
        description: m.description,
        icon: m.icon,
        externalUrl: m.externalUrl,
        toolKey: m.toolKey ?? null,
      },
      create: {
        slug: m.slug,
        order: i + 1,
        category: m.category,
        title: m.title,
        description: m.description,
        icon: m.icon,
        externalUrl: m.externalUrl,
        toolKey: m.toolKey ?? null,
      },
    });

    const validLessonSlugs = m.lessons.map((l) => l.slug);
    await prisma.lesson.deleteMany({
      where: { moduleId: moduleRow.id, slug: { notIn: validLessonSlugs } },
    });

    for (let j = 0; j < m.lessons.length; j++) {
      const l = m.lessons[j];
      const availableFrom = l.availableFrom ? new Date(l.availableFrom) : null;
      const lesson = await prisma.lesson.upsert({
        where: { moduleId_slug: { moduleId: moduleRow.id, slug: l.slug } },
        update: {
          order: j + 1,
          title: l.title,
          summary: l.summary,
          content: l.content,
          durationMin: l.durationMin ?? 10,
          format: l.format ?? null,
          availableFrom,
        },
        create: {
          moduleId: moduleRow.id,
          slug: l.slug,
          order: j + 1,
          title: l.title,
          summary: l.summary,
          content: l.content,
          durationMin: l.durationMin ?? 10,
          format: l.format ?? null,
          availableFrom,
        },
      });

      if (l.quiz) {
        const quiz = await prisma.quiz.upsert({
          where: { lessonId: lesson.id },
          update: { title: l.quiz.title, passScore: l.quiz.passScore },
          create: { lessonId: lesson.id, title: l.quiz.title, passScore: l.quiz.passScore },
        });
        await prisma.quizQuestion.deleteMany({ where: { quizId: quiz.id } });
        for (let k = 0; k < l.quiz.questions.length; k++) {
          const q = l.quiz.questions[k];
          await prisma.quizQuestion.create({
            data: {
              quizId: quiz.id,
              order: k + 1,
              text: q.text,
              options: JSON.stringify(q.options),
              correctIndex: q.correctIndex,
              explanation: q.explanation,
            },
          });
        }
      } else {
        await prisma.quiz.deleteMany({ where: { lessonId: lesson.id } });
      }

      if (l.homework) {
        await prisma.homework.upsert({
          where: { lessonId: lesson.id },
          update: { title: l.homework.title, description: l.homework.description },
          create: { lessonId: lesson.id, title: l.homework.title, description: l.homework.description },
        });
      } else {
        await prisma.homework.deleteMany({ where: { lessonId: lesson.id } });
      }
    }
  }

  console.log("Создаём администратора...");
  const adminEmail = "admin@vibecraft.local";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("admin12345", 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: "Куратор курса",
        role: "ADMIN",
      },
    });
    console.log(`Админ создан: ${adminEmail} / admin12345 (смените пароль в проде)`);
  }

  console.log("Готово!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
