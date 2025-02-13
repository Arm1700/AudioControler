# Запуск проекта

## Требования

Убедитесь, что у вас установлены Node.js и npm. Вы можете скачать их с [официального сайта Node.js](https://nodejs.org/).

## Установка зависимостей

Перед запуском проекта установите необходимые зависимости. Откройте терминал в корневой папке проекта и выполните следующую команду:
```bash
yarn install
```

## Запуск сервера

Для запуска основного сервера Express, который обрабатывает загрузку файлов, используйте команду:

```bash
yarn start
```

Это запустит сервер на порту, указанном в вашем файле `server.js` (по умолчанию 5001).

## Запуск JSON-server

Для запуска JSON-server, который предоставляет REST API для работы с данными в файле `db.json`, выполните команду:

```bash
yarn run start-json-server
```

Это запустит JSON-server на порту 3000 и будет отслеживать изменения в файле `db.json`.

## Проверка работоспособности

После запуска серверов вы можете перейти по адресу `http://localhost:5001` для доступа к основному серверу Express и `http://localhost:3000` для доступа к JSON-server.

## Дополнительная информация

- Все загруженные файлы будут сохраняться в папке `public/audio`.
- Для загрузки файлов используйте endpoint `/upload` с методом POST, отправляя файл в формате `multipart/form-data`.
