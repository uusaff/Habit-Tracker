# Firestore Schema

## Document-Based (single doc per user)

```
/users/{userId}
  ├── profileData{}
  │     ├── name: string
  │     ├── age: string
  │     └── weight: string
  │
  ├── trackerData.habits[]            ← array of habit objects
  │     └── {habit}
  │           ├── id: string           "h1234567890"
  │           ├── name: string         "Read 10 pages"
  │           ├── icon: string         "BookOpen"
  │           ├── color: string        "teal"
  │           ├── category: string     "Morning" | "Anytime" | "Evening"
  │           ├── type: string         "binary" | "quantitative" | "negative"
  │           ├── target: number       (for quantitative: e.g. 2000)
  │           ├── unit: string         (for quantitative: e.g. "ml")
  │           ├── sortOrder: number
  │           ├── createdAt: string    ISO date
  │           └── archived: boolean
  │
  └── trackerData.checkins{}          ← object keyed by date
        └── {dateKey}                 "2026-07-19"
              └── {habitId}
                    ├── status: "checked" | "skipped" | "unchecked" | "relapse"
                    ├── note: string
                    ├── value: number     (for quantitative)
                    └── updatedAt: string ISO date
```

## Why Document-Based

The existing Firestore security rules only grant access to the `users/{userId}` document (not subcollections). Using subcollections would require rule changes. The document-based approach reads/writes via a single `onSnapshot` listener on `users/{userId}` with `setDoc` + `merge` for mutations.

## Read Efficiency

| View | Document reads |
|------|----------------|
| Any view | 1 doc (full user document) |

## Key Decisions

1. **`trackerData.checkins` as nested object** — eliminates per-document reads for each date (1 read for all checkins)

2. **`trackerData.habits` as array** — enables real-time listener on the full habit list without a subcollection query

3. **All mutations via `setDoc` + `merge`** — atomic writes without overwriting unrelated fields

4. **Client-side streak computation** — since all checkins are already in memory from the single doc listener

5. **`type` field** — enables binary/quantitative/negative habit types in a single array
