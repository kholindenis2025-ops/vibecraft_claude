export type SkillMapStage = {
  key: string;
  order: string;
  title: string;
  description: string;
};

export const SKILL_MAP_STAGES: SkillMapStage[] = [
  { key: "think", order: "01 / THINK", title: "Понять задачу", description: "Разобрать идею, найти варианты и выбрать направление." },
  { key: "build", order: "02 / BUILD", title: "Собрать решение", description: "Собрать выразительный интерфейс, базу данных и контент." },
  { key: "connect", order: "03 / CONNECT", title: "Подключить возможности", description: "Подключить внешние сервисы, тесты и автоматизации." },
  { key: "check", order: "04 / CHECK", title: "Проверить результат", description: "Найти ошибки, риски и слабые места." },
  { key: "grow", order: "05 / GROW", title: "Развить и передать", description: "Упростить, задокументировать и подготовить к релизу." },
];

export type SkillMapItem = {
  n: number;
  stage: string;
  slug: string;
  description: string;
};

export const SKILL_MAP_ITEMS: SkillMapItem[] = [
  { n: 1, stage: "think", slug: "brainstorming", description: "Разобрать идею, найти варианты и выбрать направление." },
  { n: 2, stage: "think", slug: "requirements-interview", description: "Задать вопросы и превратить идею в понятное ТЗ." },
  { n: 3, stage: "think", slug: "writing-plans", description: "Разделить большую задачу на последовательные шаги." },
  { n: 4, stage: "think", slug: "web-research", description: "Собрать факты, примеры и материалы для решения." },
  { n: 5, stage: "think", slug: "competitor-analysis", description: "Сравнить предложения, подходы и точки роста." },
  { n: 6, stage: "think", slug: "Superpowers", description: "Выстроить полный маршрут от идеи до проверенного результата." },
  { n: 7, stage: "build", slug: "frontend-design", description: "Собрать выразительный интерфейс и визуальную систему." },
  { n: 8, stage: "build", slug: "database-design", description: "Продумать структуру базы и связи между данными." },
  { n: 9, stage: "build", slug: "api-integration", description: "Подключить внешний сервис или API к проекту." },
  { n: 10, stage: "build", slug: "content-system", description: "Превратить контентную задачу в повторяемый процесс." },
  { n: 11, stage: "build", slug: "brand-guidelines", description: "Соблюдать визуальный стиль, цвета и голос бренда." },
  { n: 12, stage: "build", slug: "skill-creator", description: "Создать собственного цифрового специалиста под правила проекта." },
  { n: 13, stage: "connect", slug: "browser-testing", description: "Проверить сайт глазами пользователя в браузере." },
  { n: 14, stage: "connect", slug: "imagegen", description: "Создать изображения и визуальные материалы для проекта." },
  { n: 15, stage: "connect", slug: "github-workflow", description: "Сохранить проект, историю изменений и рабочие ветки." },
  { n: 16, stage: "connect", slug: "supabase-setup", description: "Подключить базу данных и рабочее хранение информации." },
  { n: 17, stage: "connect", slug: "automation-workflow", description: "Связать проект с внешними сервисами и автоматизациями." },
  { n: 18, stage: "connect", slug: "plugin-workflow", description: "Выбрать и подключить инструмент под конкретную задачу." },
  { n: 19, stage: "check", slug: "systematic-debugging", description: "Найти причину ошибки, а не замаскировать последствия." },
  { n: 20, stage: "check", slug: "test-driven-development", description: "Определить проверку до написания решения." },
  { n: 21, stage: "check", slug: "verification", description: "Проверить, действительно ли задачу можно считать готовой." },
  { n: 22, stage: "check", slug: "code-review", description: "Найти риски, слабые места и пропущенные сценарии." },
  { n: 23, stage: "check", slug: "security-review", description: "Проверить доступы, секреты и уязвимые места." },
  { n: 24, stage: "check", slug: "accessibility-review", description: "Понять, удобно ли продуктом пользоваться разным людям." },
  { n: 25, stage: "grow", slug: "performance-review", description: "Найти причины медленной загрузки и лишней сложности." },
  { n: 26, stage: "grow", slug: "deployment-check", description: "Подготовить проект к публикации и релизу." },
  { n: 27, stage: "grow", slug: "code-simplifier", description: "Упростить код, сохранив его поведение и смысл." },
  { n: 28, stage: "grow", slug: "documentation", description: "Объяснить проект, правила запуска и дальнейшую работу." },
  { n: 29, stage: "grow", slug: "skill-installer", description: "Найти и подключить готовый скилл из каталога или репозитория." },
  { n: 30, stage: "grow", slug: "personal-rules", description: "Закрепить собственные правила, стиль и критерии результата." },
];

export const SKILL_MAP_QUICKSTART = [
  { question: "Есть идея, не понимаю с чего начать", skill: "brainstorming" },
  { question: "Есть проект, хочу его доработать", skill: "writing-plans" },
  { question: "Что-то сломалось, нужно найти причину", skill: "systematic-debugging" },
  { question: "Пора выпускать, хочу проверить и опубликовать", skill: "deployment-check" },
];
