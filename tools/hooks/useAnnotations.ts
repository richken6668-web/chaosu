import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Annotation, AnnotationCategory, AnnotationDraft, AnnotationsData } from '../lib/annotations'
import {
  getNextNumber,
  renumberAnnotations,
  DEFAULT_ANNOTATIONS_DATA,
  EMPTY_DRAFT,
  applyDraft,
  loadDraft,
  saveDraft,
  clearDraft,
} from '../lib/annotations'

interface UseAnnotationsReturn {
  annotations: Annotation[]
  categories: AnnotationCategory[]
  persisted: AnnotationsData
  draft: AnnotationDraft
  loading: boolean
  error: string | null
  hasDraft: boolean
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  currentAnnotations: Annotation[]
  prepareAnnotation: (selector: string) => Annotation
  addAnnotation: (annotation: Annotation) => void
  updateAnnotation: (updated: Annotation) => void
  deleteAnnotation: (id: string) => void
  addCategory: (category: AnnotationCategory) => void
  deleteCategory: (key: string) => void
  saveDraftToFile: () => Promise<void>
  clearLocalDraft: () => void
}

const API_URL = '/api/annotations'

async function fetchAnnotations(): Promise<AnnotationsData> {
  const res = await fetch(API_URL)
  if (!res.ok) {
    throw new Error(`Failed to fetch annotations: ${res.status}`)
  }
  return res.json()
}

async function saveAnnotations(data: AnnotationsData): Promise<void> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    throw new Error(`Failed to save annotations: ${res.status}`)
  }
}

export function useAnnotations(pagePath: string): UseAnnotationsReturn {
  // 持久化数据（来自本地文件）
  const [persisted, setPersisted] = useState<AnnotationsData>({ annotations: [], categories: [] })
  // 草稿数据（来自 localStorage）
  const [draft, setDraft] = useState<AnnotationDraft>(EMPTY_DRAFT)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // 初始加载：从本地文件读取持久化数据，从 localStorage 读取草稿
  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => setLoading(true))
    Promise.all([fetchAnnotations(), Promise.resolve(loadDraft())])
      .then(([data, savedDraft]) => {
        if (cancelled) return
        setPersisted({
          annotations: data.annotations || [],
          categories: data.categories || [],
        })
        setDraft(savedDraft)
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('加载标注失败，使用默认值：', err)
        setPersisted(DEFAULT_ANNOTATIONS_DATA)
        setDraft(EMPTY_DRAFT)
        setError(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // 合并后的数据
  const merged = useMemo(() => applyDraft(persisted, draft), [persisted, draft])

  const currentAnnotations = useMemo(
    () => merged.annotations.filter((a) => a.pagePath === pagePath),
    [merged.annotations, pagePath]
  )

  const hasDraft = useMemo(
    () =>
      draft.annotations.created.length > 0 ||
      draft.annotations.updated.length > 0 ||
      draft.annotations.deleted.length > 0 ||
      draft.categories.created.length > 0 ||
      draft.categories.deleted.length > 0,
    [draft]
  )

  // 同步草稿到 localStorage
  const syncDraft = useCallback((next: AnnotationDraft) => {
    setDraft(next)
    saveDraft(next)
  }, [])

  // 根据选择器生成一条临时批注，但不写入草稿；需要调用 addAnnotation 才会保存
  const prepareAnnotation = useCallback(
    (selector: string): Annotation => {
      const defaultCategory = merged.categories[0]?.key || 'other'
      return {
        id: `anno-${Date.now()}`,
        pagePath,
        number: getNextNumber(merged.annotations, pagePath),
        title: '',
        content: '',
        category: defaultCategory,
        selector,
        position: 'top-left',
        createdAt: Date.now(),
      }
    },
    [merged.categories, merged.annotations, pagePath]
  )

  // 将新批注写入草稿
  const addAnnotation = useCallback(
    (annotation: Annotation) => {
      const next: AnnotationDraft = {
        ...draft,
        annotations: {
          ...draft.annotations,
          created: [...draft.annotations.created, annotation],
        },
      }
      syncDraft(next)
      setSelectedId(annotation.id)
    },
    [draft, syncDraft]
  )

  const updateAnnotation = useCallback(
    (updated: Annotation) => {
      const isCreated = draft.annotations.created.some((a) => a.id === updated.id)
      let nextCreated = draft.annotations.created
      let nextUpdated = draft.annotations.updated

      if (isCreated) {
        nextCreated = draft.annotations.created.map((a) => (a.id === updated.id ? updated : a))
      } else {
        // 如果已经在 updated 中，替换；否则加入
        nextUpdated = draft.annotations.updated.some((a) => a.id === updated.id)
          ? draft.annotations.updated.map((a) => (a.id === updated.id ? updated : a))
          : [...draft.annotations.updated, updated]
      }

      // 分类变更或页面变更时重新按页面编号
      const original = merged.annotations.find((a) => a.id === updated.id)
      if (original && (original.category !== updated.category || original.pagePath !== updated.pagePath)) {
        const nextAnnotations = applyDraft(
          persisted,
          {
            ...draft,
            annotations: { created: nextCreated, updated: nextUpdated, deleted: draft.annotations.deleted },
          }
        ).annotations
        const renumbered = renumberAnnotations(nextAnnotations)
        // 重新计算 created/updated
        const renumberedMap = new Map(renumbered.map((a) => [a.id, a]))
        nextCreated = nextCreated.map((a) => renumberedMap.get(a.id) || a)
        nextUpdated = nextUpdated.map((a) => renumberedMap.get(a.id) || a)
      }

      const next: AnnotationDraft = {
        ...draft,
        annotations: {
          created: nextCreated,
          updated: nextUpdated,
          deleted: draft.annotations.deleted,
        },
      }
      syncDraft(next)
    },
    [draft, merged.annotations, persisted, syncDraft]
  )

  const deleteAnnotation = useCallback(
    (id: string) => {
      const isCreated = draft.annotations.created.some((a) => a.id === id)
      let nextCreated = draft.annotations.created
      let nextUpdated = draft.annotations.updated
      let nextDeleted = draft.annotations.deleted

      if (isCreated) {
        nextCreated = draft.annotations.created.filter((a) => a.id !== id)
      } else {
        nextUpdated = draft.annotations.updated.filter((a) => a.id !== id)
        if (!draft.annotations.deleted.includes(id)) {
          nextDeleted = [...draft.annotations.deleted, id]
        }
      }

      const next: AnnotationDraft = {
        ...draft,
        annotations: {
          created: nextCreated,
          updated: nextUpdated,
          deleted: nextDeleted,
        },
      }
      syncDraft(next)
      if (selectedId === id) setSelectedId(null)
    },
    [draft, selectedId, syncDraft]
  )

  const addCategory = useCallback(
    (category: AnnotationCategory) => {
      const next: AnnotationDraft = {
        ...draft,
        categories: {
          ...draft.categories,
          created: [...draft.categories.created, category],
        },
      }
      syncDraft(next)
    },
    [draft, syncDraft]
  )

  const deleteCategory = useCallback(
    (key: string) => {
      const isCreated = draft.categories.created.some((c) => c.key === key)
      let nextCreated = draft.categories.created
      let nextDeleted = draft.categories.deleted

      if (isCreated) {
        nextCreated = draft.categories.created.filter((c) => c.key !== key)
      } else if (!draft.categories.deleted.includes(key)) {
        nextDeleted = [...draft.categories.deleted, key]
      }

      // 被删除分类下的批注移到默认分类 'other'
      const movedCreated = draft.annotations.created.map((a) =>
        a.category === key ? { ...a, category: 'other' } : a
      )
      const movedUpdated = draft.annotations.updated.map((a) =>
        a.category === key ? { ...a, category: 'other' } : a
      )

      const next: AnnotationDraft = {
        annotations: {
          created: movedCreated,
          updated: movedUpdated,
          deleted: draft.annotations.deleted,
        },
        categories: {
          created: nextCreated,
          deleted: nextDeleted,
        },
      }
      syncDraft(next)
    },
    [draft, syncDraft]
  )

  const saveDraftToFile = useCallback(async () => {
    const nextData = applyDraft(persisted, draft)
    await saveAnnotations(nextData)
    setPersisted(nextData)
    clearDraft()
    setDraft(EMPTY_DRAFT)
  }, [persisted, draft])

  const clearLocalDraft = useCallback(() => {
    clearDraft()
    setDraft(EMPTY_DRAFT)
    setSelectedId(null)
  }, [])

  return {
    annotations: merged.annotations,
    categories: merged.categories,
    persisted,
    draft,
    loading,
    error,
    hasDraft,
    selectedId,
    setSelectedId,
    currentAnnotations,
    prepareAnnotation,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    addCategory,
    deleteCategory,
    saveDraftToFile,
    clearLocalDraft,
  }
}
