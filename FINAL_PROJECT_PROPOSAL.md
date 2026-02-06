# NeRuaD — Final Project (Web Technologies: Backend)

## 1. Project Proposal

**Project title:** NeRuaD  

**Topic:** Музыкальная платформа в стиле Spotify с поддержкой видеоклипов и персональных плейлистов. Пользователь может слушать музыку, смотреть клипы и получать рекомендации.

**Why did you choose it?**  
Мне нравится слушать музыку, и хотелось сделать учебный проект с понятной практической ценностью.

**Main features:**
- Персональная подборка музыки (простая логика рекомендаций).
- Создание и редактирование плейлистов.
- Избранные треки.
- Профиль пользователя и настройки.
- Ежемесячная подписка на расширенные функции (без рекламы, бесконечный поток, weekly подборки).
- Страница с клипами песен (видео к трекам).
- Уникальная фишка: **Share Capsule** — можно создать короткую “капсулу” из 5–10 треков с кодом/ссылкой и сроком жизни, чтобы быстро делиться подборкой.

**Team members and responsibilities:**
- Lead dev
- Full stack web dev
- QA & documentation

---

## 2. Database Design (Schemas)

**User**
- _id (ObjectId)
- username (string)
- email (string, unique)
- passwordHash (string)
- role (string: user / premium / admin)
- createdAt, updatedAt (date)

**Profile**
- _id
- userId (ref User)
- avatarColor (string)
- bio (string, optional)
- settings (object: notifications, autoplay, privacy)
- stats (object: favoritesCount, playlistsCount, listenMinutes, avgRating)

**Track**
- _id
- externalId (string) — id из внешнего API (например, Deezer)
- title (string)
- artist (string)
- album (string)
- previewUrl (string)
- duration (number)
- genre (string)
- source (string: deezer / local)

**Playlist**
- _id
- userId (ref User)
- title (string)
- description (string)
- isPublic (boolean)
- trackIds (array of Track refs)
- createdAt, updatedAt

**Favorite**
- _id
- userId (ref User)
- trackId (ref Track)
- createdAt

**Subscription**
- _id
- userId (ref User)
- status (string: active / inactive)
- plan (string: monthly)
- startedAt, expiresAt

**VideoClip**
- _id
- trackId (ref Track)
- title (string)
- videoUrl (string)
- source (string: youtube / local)

**ShareCapsule** (уникальная фишка)
- _id
- userId (ref User)
- title (string)
- trackIds (array of Track refs)
- shareCode (string, unique)
- expiresAt (date)
- createdAt

---

## 3. API Endpoint List

**Auth**
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/logout`

**User / Profile**
- GET `/api/users/me`
- PUT `/api/users/me`
- GET `/api/users/me/profile`
- PUT `/api/users/me/profile`

**Playlists**
- POST `/api/playlists`
- GET `/api/playlists`
- GET `/api/playlists/:id`
- PUT `/api/playlists/:id`
- DELETE `/api/playlists/:id`
- POST `/api/playlists/:id/tracks`
- DELETE `/api/playlists/:id/tracks/:trackId`

**Favorites**
- GET `/api/favorites`
- POST `/api/favorites`
- DELETE `/api/favorites/:trackId`

**Tracks**
- POST `/api/tracks` (создание/кэш трека из внешнего API)
- GET `/api/tracks/:id`

**Video Clips**
- GET `/api/tracks/:id/clips`
- POST `/api/tracks/:id/clips`

**Subscriptions**
- GET `/api/subscription`
- PUT `/api/subscription`

**Share Capsule (уникальная фишка)**
- POST `/api/share-capsules`
- GET `/api/share-capsules/:shareCode`

---

## 4. Folder Structure (planned)

Планируем стандартную структуру для Node.js + Express + MongoDB:
- `backend/`
  - `src/`
    - `config/`
    - `controllers/`
    - `models/`
    - `routes/`
    - `middlewares/`
    - `services/`
    - `utils/`
  - `app.js` / `server.js`
