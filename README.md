# CSV Analyzer Frontend

Angular приложение для анализа CSV файлов с реальным отслеживанием прогресса через WebSocket.

## Запуск

### Docker запуск
```bash
# Сборка и запуск
docker-compose up --build

# Остановка
docker-compose down
```
Приложение доступно по url: `http://localhost`

## Основные функции

- **Загрузка CSV файлов** (макс. 50 МБ)
- **Real-time прогресс** через WebSocket
- **История анализов** с пагинацией
- **Детальная статистика** по каждому анализу
- **Отмена обработки** файлов

## Требования

- Backend сервис должен быть запущен (https://github.com/brokenjesus/CsvAnalyzerBackend.git)
- Docker (для контейнерного запуска)

## Используемые технологии

- Angular 17 + TypeScript
- NgRx для управления состоянием
- Bootstrap 5 для UI
- WebSocket для real-time обновлений
