# VIBECRAFT — Vibe Coding от нуля до про

Обучающая платформа: 14 модулей, уроки (текст + видео + презентации), тесты, домашние задания с проверкой куратором, прогресс и достижения.

Стек: Next.js 16 (App Router, Turbopack) · Prisma 7 · PostgreSQL (Neon) · собственная JWT-авторизация (email/пароль).

## Локальная разработка

1. Скопируйте `.env.example` в `.env` и заполните `DATABASE_URL`, `DIRECT_URL` (обе строки — из Neon) и `AUTH_SECRET`.
2. Установите зависимости и примените миграции:

   ```bash
   npm install
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

3. Запустите dev-сервер:

   ```bash
   npm run dev
   ```

   Откройте [http://localhost:3000](http://localhost:3000).

Тестовый админ-аккаунт (создаётся сидом): `admin@vibecraft.local` / `admin12345` — смените пароль перед продакшеном.

## Деплой на Vercel

См. пошаговую инструкцию, которую даёт ассистент, либо кратко:

1. Создайте Postgres-базу в Vercel (Storage → Postgres, на базе Neon).
2. В Project Settings → Environment Variables добавьте `DATABASE_URL` (pooled), `DIRECT_URL` (direct) и `AUTH_SECRET`.
3. Импортируйте GitHub-репозиторий в Vercel — сборка автоматически выполнит `prisma generate && prisma migrate deploy && next build`.
4. После первого деплоя выполните `npx prisma db seed` с продакшен-`DATABASE_URL`, чтобы наполнить курс модулями.

## Структура контента

Модули и уроки заданы в `prisma/seed.ts`. Поля `videoUrl`, `slidesUrl`, `driveUrl` и `content` у уроков можно донаполнять по мере готовности материалов (ссылки с Google Диска, видео, презентации).
