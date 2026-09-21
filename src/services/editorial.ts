import type { RecordModel } from 'pocketbase'
import pb from '@/lib/pocketbase/client'

export type EditorialStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED'

export type EditorialSource = {
  label: string
  url: string
}

export type ContentRecord = RecordModel & {
  slug: string
  title: string
  summary: string
  body: string
  cluster: string
  author_id: string
  reviewer_id: string
  status: EditorialStatus
  sources: EditorialSource[] | null
  source_count: number
  reviewed_at: string
  published_at: string
  version: number
}

export type ContentVersionRecord = RecordModel & {
  content_id: string
  version: number
  status: EditorialStatus
  transition: string
  changed_by: string
  snapshot: Record<string, unknown>
}

export type EditorialUser = RecordModel & {
  email: string
  name: string
  role: 'operator' | 'reviewer' | 'publisher' | 'admin'
  verified: boolean
}

const contents = () => pb.collection<ContentRecord>('contents')
const versions = () => pb.collection<ContentVersionRecord>('content_versions')
const users = () => pb.collection<EditorialUser>('users')

export async function getEditorialContents() {
  const result = await contents().getList(1, 50, {
    sort: '-updated,title',
    expand: 'author_id,reviewer_id',
  })
  return result.items
}

export async function getPublishedContents() {
  const result = await contents().getList(1, 20, {
    filter: pb.filter('status = {:status}', { status: 'PUBLISHED' }),
    sort: '-published_at,title',
  })
  return result.items
}

export async function createEditorialDraft(data: {
  slug: string
  title: string
  summary: string
  body: string
  cluster: string
  author_id: string
  sources: EditorialSource[]
}) {
  return contents().create({
    ...data,
    status: 'DRAFT',
    source_count: data.sources.length,
    version: 1,
  })
}

export async function updateEditorialContent(
  id: string,
  data: Partial<
    Pick<
      ContentRecord,
      | 'slug'
      | 'title'
      | 'summary'
      | 'body'
      | 'cluster'
      | 'reviewer_id'
      | 'status'
      | 'sources'
      | 'source_count'
    >
  >,
) {
  return contents().update(id, data)
}

export async function getEditorialHistory(contentId: string) {
  return versions().getFullList({
    sort: '-version',
    filter: pb.filter('content_id = {:contentId}', { contentId }),
  })
}

export async function getEditorialUsers() {
  return users().getFullList({ sort: 'role,email' })
}

export async function updateEditorialUserRole(id: string, role: EditorialUser['role']) {
  return users().update(id, { role })
}
