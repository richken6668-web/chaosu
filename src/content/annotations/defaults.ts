import type { Annotation, AnnotationsData } from '@tools/lib/annotations'
import { DEFAULT_ANNOTATION_CATEGORIES } from './categories'

export { DEFAULT_ANNOTATION_CATEGORIES }

export const DEFAULT_ANNOTATIONS: Annotation[] = []

export const DEFAULT_ANNOTATIONS_DATA: AnnotationsData = {
  annotations: DEFAULT_ANNOTATIONS,
  categories: DEFAULT_ANNOTATION_CATEGORIES,
}
