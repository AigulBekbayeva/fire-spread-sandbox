# Публикация на GitHub

## 1. Заменить плейсхолдеры

```bash
grep -rl USERNAME README.md README.ru.md | xargs sed -i 's/USERNAME/ваш-логин/g'
sed -i 's/<ВАШЕ ИМЯ>/Ваше Имя/' LICENSE
```

На macOS: `sed -i '' 's/.../.../'`.

## 2. Создать репозиторий

```bash
git init
git add .
git commit -m "Interactive grass fire spread forecast, client-side"
git branch -M main
git remote add origin git@github.com:ваш-логин/fire-spread-sandbox.git
git push -u origin main
```

## 3. Включить GitHub Pages

Settings → Pages → Source: **Deploy from a branch** → ветка `main`,
папка `/ (root)`.

Инструмент откроется по адресу `https://ваш-логин.github.io/fire-spread-sandbox/`.
Это и есть ссылка для поста.

## 4. Заполнить About

- **Description:** `Click a map, get an animated grass fire spread forecast from live hourly wind`
- **Website:** ссылка на GitHub Pages
- **Topics:** `wildfire`, `fire-behaviour`, `leaflet`, `open-meteo`,
  `visualization`, `javascript`, `no-build`, `gis`

## 5. Связать с парным проектом

В README уже стоит ссылка на `steppe-fire-era5`. Проверьте, что обратная
ссылка там тоже ведёт сюда — так посетитель одного проекта находит второй.
