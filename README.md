
## Проектная работа 14


Версия: 0.0.1

**Автор:** Альтухова Валентина

## Цели:
Реализация аутентификации и авторизации в проекте Mesto

## Задачи:

- создайть репозиторий на GitHub
- настроить линтер
- подключиться к серверу MongoDB
- добавить email и password к схеме пользователя
- переработать контроллер createUser
- создать контроллер login
- создать роут для логина и регистрации
- сделать мидлвэр для авторизации
- защитить API авторизацией
- залить проект на GitHub

## Функциональность:

- запрос POST localhost:3000/signup создаёт пользователя
- запрос POST localhost:3000/signin авторизация пользователя
- запрос GET localhost:3000/users возвращает всех пользователей из базы
- запрос GET localhost:3000/users/id возвращает пользователя по _id
- запрос POST localhost:3000/users создаёт пользователя с переданными в теле запроса name, about и avatar
- запрос GET localhost:3000/cards возвращает все карточки из базы
- запрос POST localhost:3000/cards создаёт карточку с переданными в теле запроса name и link
- запрос DELETE localhost:3000/cards/:cardId удаляет карточку по _id
- запрос PATCH localhost:3000/users/me обновляет профиль
- запрос PATCH localhost:3000/users/me/avatar обновляет аватар
- запрос PUT localhost:3000/cards/:cardId/likes поставить лайк карточке
- запрос DELETE localhost:3000/cards/:cardId/likes убрать лайк с карточки

## Стек технологий:

- JavaScript ES6
- Git
- Eslint
- Nodemon
- Editorconfig
- NPM
- Node.js
- Express.js
- MongoDB



## Пакеты которые используются в сборках:

- [Editorconfig](https://editorconfig.org/)
- [Eslint](https://www.npmjs.com/package/eslint)
- [Nodemon](https://www.npmjs.com/package/nodemon)
- [Mongoose](https://mongoosejs.com/)
- [body-parser](https://www.npmjs.com/package/body-parser)

## Инструкции по запуску:
- Скачать или склонировать репозиторий
- `npm i`- установка зависимостей при помощи пакетного менеджера npm
- `npm run dev`- запустить сервер на localhost:3000 с хот релоудом  
- `npm run start`- запустить сервер на localhost:3000 
 
