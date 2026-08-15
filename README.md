# Hebcalender — לוח החגים

לוח שנה עברי לישראל: רשת קומפקטית עם פאנל פרטים, כניסת/יציאת שבת וחג, ואפשרות מינוי ליומן Google.

- חישוב תאריכים, חגים וזמני כניסה/יציאה מבוסס [`@hebcal/core`](https://github.com/hebcal/hebcal-es6) (כללי ישראל), ללא שרת — הכול רץ בדפדפן.
- ברירת מחדל: ירושלים (הדלקת נרות 40 דקות לפני השקיעה).

## פיתוח

```bash
npm install
npm run dev       # שרת פיתוח
npm test          # vitest
npm run build     # מייצר את קובץ ה-ICS ואז בונה את public/dist
```

## פריסה

נפרס אוטומטית ל-GitHub Pages דרך `.github/workflows/deploy.yml` בכל push ל-`main`, ומתעדכן מחדש כל שבוע כדי שחלון האירועים בפיד ה-ICS יישאר עדכני.
