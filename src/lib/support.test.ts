import test from "node:test";
import assert from "node:assert/strict";
import { buildSupportEmail, parseSupportRequest } from "./support";

test("гость должен указать имя, почту, тему и текст", () => {
  const result = parseSupportRequest(
    {
      name: "Анна",
      email: "anna@example.com",
      subject: "Не приходит код",
      message: "Запросила код два раза, письма нет.",
    },
    null
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.data.name, "Анна");
  assert.equal(result.data.email, "anna@example.com");
  assert.equal(result.data.subject, "Не приходит код");
  assert.equal(result.data.message, "Запросила код два раза, письма нет.");
});

test("гость без почты получает ошибку", () => {
  const result = parseSupportRequest(
    {
      name: "Анна",
      email: "",
      subject: "Не приходит код",
      message: "Запросила код два раза, письма нет.",
    },
    null
  );

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.error, /email|почт/i);
});

test("гость с неверной почтой получает ошибку", () => {
  const result = parseSupportRequest(
    {
      name: "Анна",
      email: "не-почта",
      subject: "Не приходит код",
      message: "Запросила код два раза, письма нет.",
    },
    null
  );

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.error, /email|почт/i);
});

test("гость без имени получает ошибку", () => {
  const result = parseSupportRequest(
    {
      name: " ",
      email: "anna@example.com",
      subject: "Не приходит код",
      message: "Запросила код два раза, письма нет.",
    },
    null
  );

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.error, /имя/i);
});

test("пустая тема не принимается", () => {
  const result = parseSupportRequest(
    {
      name: "Анна",
      email: "anna@example.com",
      subject: "   ",
      message: "Запросила код два раза, письма нет.",
    },
    null
  );

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.error, /тем/i);
});

test("короткий текст не принимается", () => {
  const result = parseSupportRequest(
    {
      name: "Анна",
      email: "anna@example.com",
      subject: "Не приходит код",
      message: "привет",
    },
    null
  );

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.error, /текст|сообщен/i);
});

test("вошедший ученик: имя и почта берутся из профиля, а не из формы", () => {
  const result = parseSupportRequest(
    {
      name: "Поддельное имя",
      email: "fake@evil.test",
      subject: "Не открывается урок",
      message: "Нажимаю на модуль, вижу пустой экран.",
    },
    { name: "Сергей", email: "sergey@vibe-craft.ru" }
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.data.name, "Сергей");
  assert.equal(result.data.email, "sergey@vibe-craft.ru");
});

test("письмо уходит в поддержку с Reply-To ученика и понятной темой", () => {
  const email = buildSupportEmail({
    name: "Анна",
    email: "anna@example.com",
    subject: "Не приходит код",
    message: "Запросила код два раза, письма нет.",
  });

  assert.equal(email.to, "support@vibe-craft.ru");
  assert.equal(email.replyTo, "anna@example.com");
  assert.equal(email.subject, "[Поддержка VIBECRAFT] Не приходит код");
  assert.match(email.text, /Анна/);
  assert.match(email.text, /anna@example.com/);
  assert.match(email.text, /Запросила код два раза/);
});

test("текст письма экранирует HTML, чтобы не ломать ящик поддержки", () => {
  const email = buildSupportEmail({
    name: "Анна",
    email: "anna@example.com",
    subject: "Тег <script>",
    message: "Смотри <b>вот это</b>",
  });

  assert.doesNotMatch(email.html, /<script>/);
  assert.match(email.html, /&lt;script&gt;/);
  assert.match(email.html, /&lt;b&gt;вот это&lt;\/b&gt;/);
});
