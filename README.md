# ♟️ Lichess Statistics

Веб-приложение для просмотра статистики и истории партий с платформы [Lichess](https://lichess.org).

![React](https://img.shields.io/badge/React-19-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)

## ✨ Возможности

- 🔐 **OAuth2 авторизация** через Lichess
- 📊 **Рейтинги** по режимам: Blitz, Rapid, Classical и др.
- 🎮 **История партий** с фильтрацией и пагинацией
- 📱 **Адаптивный дизайн** для мобильных устройств
- ⚡ **Синхронизация** партий с Lichess API

## 🛠️ Технологии

| Backend | Frontend |
|---------|----------|
| FastAPI | React 19 |
| PostgreSQL | TypeScript |
| SQLAlchemy | Tailwind CSS |
| Redis | Zustand |
| Celery | React Router |
| Alembic | Axios |

## 🚀 Быстрый старт

### Требования

- [Docker](https://docs.docker.com/get-docker/) и Docker Compose
- [Git](https://git-scm.com/)

### 1. Клонировать репозиторий

```bash
git clone https://github.com/YesAndBack/lichess.git
cd lichess
```

### 2. Создать файл .env

Создайте файл `.env` в корне проекта:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=lichess_stats
POSTGRES_PORT=5433

# Redis
REDIS_PORT=6379

# Lichess OAuth2
LICHESS_CLIENT_ID=lichess-stats-app
LICHESS_CLIENT_SECRET=
LICHESS_REDIRECT_URI=http://localhost:5173/callback

# Security (смените для production!)
SECRET_KEY=your-secret-key-change-me
JWT_SECRET_KEY=your-jwt-secret-key-change-me

# Application
DEBUG=true
BACKEND_PORT=8000
FRONTEND_PORT=5173
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
```

### 3. Запустить приложение

```bash
docker-compose up -d
```

### 4. Открыть в браузере

Перейдите на http://localhost:5173

## 📋 Команды Docker

```bash
# Запуск всех сервисов
docker-compose up -d

# Остановка
docker-compose down

# Просмотр логов
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend

# Пересборка после изменений
docker-compose up -d --build

# Полная очистка (включая данные)
docker-compose down -v
```

## 🔧 Структура проекта

```
lichess/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/routes/     # API эндпоинты
│   │   ├── models/         # SQLAlchemy модели
│   │   ├── schemas/        # Pydantic схемы
│   │   ├── services/       # Бизнес-логика
│   │   └── tasks/          # Celery задачи
│   ├── alembic/            # Миграции БД
│   └── Dockerfile
├── frontend/               # React frontend
│   ├── src/
│   │   ├── api/           # API клиент
│   │   ├── components/    # React компоненты
│   │   ├── pages/         # Страницы
│   │   ├── stores/        # Zustand хранилища
│   │   └── types/         # TypeScript типы
│   └── Dockerfile
├── docker-compose.yml      # Docker конфигурация
└── .env                    # Переменные окружения
```

## 🌐 Сервисы

| Сервис | Порт | Описание |
|--------|------|----------|
| Frontend | 5173 | React приложение |
| Backend | 8000 | FastAPI сервер |
| PostgreSQL | 5433 | База данных |
| Redis | 6379 | Кэш и очереди |

## 🔐 Настройка Lichess OAuth2

1. Перейдите на https://lichess.org/account/oauth/app
2. Создайте новое приложение:
   - **App name**: Lichess Stats
   - **Redirect URI**: `http://localhost:5173/callback`
3. Скопируйте **Client ID** в файл `.env`

> ℹ️ Lichess использует PKCE flow, client secret не требуется.

## 📖 API Документация

После запуска доступна по адресу: http://localhost:8000/docs

## 🐛 Решение проблем

### Порт 5432 занят локальным PostgreSQL

Измените `POSTGRES_PORT` в `.env`:
```env
POSTGRES_PORT=5433
```

### Ошибка авторизации Lichess

Проверьте, что `LICHESS_REDIRECT_URI` в `.env` совпадает с настройками вашего OAuth приложения на Lichess.

### Контейнеры не запускаются

```bash
# Проверить статус
docker-compose ps

# Посмотреть логи
docker-compose logs

# Перезапустить
docker-compose down
docker-compose up -d
```

## 📄 Лицензия

MIT License

## 👤 Автор

[YesAndBack](https://github.com/YesAndBack)
