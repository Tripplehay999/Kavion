'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type BlockType = 'text' | 'h1' | 'h2' | 'todo' | 'bullet' | 'numbered' | 'code' | 'divider' | 'callout' | 'quote'
export type BlockLanguage = 'javascript' | 'html'

export interface Block {
  id: string
  user_id: string
  type: BlockType
  content: string
  checked: boolean
  language: BlockLanguage
  sort_order: number
  color: string
  created_at: string
  updated_at: string
}

const VALID_TYPES: BlockType[] = ['text', 'h1', 'h2', 'todo', 'bullet', 'numbered', 'code', 'divider', 'callout', 'quote']
const VALID_LANGS: BlockLanguage[] = ['javascript', 'html']

const MOCK_BLOCKS: Block[] = [
  { id: 'mock-1', user_id: '', type: 'h2',    content: 'Getting Started',                               checked: false, language: 'javascript', sort_order: 0, color: '#8B5CF6', created_at: '', updated_at: '' },
  { id: 'mock-2', user_id: '', type: 'todo',  content: 'Configure Supabase to start tracking tasks',   checked: false, language: 'javascript', sort_order: 1, color: '#8B5CF6', created_at: '', updated_at: '' },
  { id: 'mock-3', user_id: '', type: 'todo',  content: 'Add your first real block',                     checked: true,  language: 'javascript', sort_order: 2, color: '#8B5CF6', created_at: '', updated_at: '' },
  { id: 'mock-4', user_id: '', type: 'text',  content: 'Type / to change block type. Drag ⠿ to reorder. Press Enter to add a new block.', checked: false, language: 'javascript', sort_order: 3, color: '#8B5CF6', created_at: '', updated_at: '' },
  { id: 'mock-5', user_id: '', type: 'code',  content: "// Try running this!\nconst greet = (name) => `Hello, ${name}!`\nconsole.log(greet('Kavion'))", checked: false, language: 'javascript', sort_order: 4, color: '#8B5CF6', created_at: '', updated_at: '' },
]

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.length > 0 && !url.includes('your-project-id')
}

function validateBlockPatch(patch: {
  type?: string; content?: string; language?: string; checked?: boolean; color?: string
}) {
  if (patch.type !== undefined && !VALID_TYPES.includes(patch.type as BlockType))
    throw new Error('Invalid block type')
  if (patch.content !== undefined && patch.content.length > 50_000)
    throw new Error('Content must be 50,000 characters or fewer')
  if (patch.language !== undefined && !VALID_LANGS.includes(patch.language as BlockLanguage))
    throw new Error('Invalid language')
  if (patch.color !== undefined && !/^#[0-9a-fA-F]{6}$/.test(patch.color))
    throw new Error('Invalid color format')
}

export async function getBlocks(): Promise<Block[]> {
  if (!isConfigured()) return MOCK_BLOCKS
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('workspace_blocks')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })
  return (data ?? []) as Block[]
}

export async function addBlock(
  type: BlockType = 'text',
  initialContent = '',
): Promise<Block> {
  if (!isConfigured()) throw new Error('Supabase not configured')
  if (!VALID_TYPES.includes(type)) throw new Error('Invalid block type')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Always append at end; client reorders with reorderBlocks if needed
  const { count } = await supabase
    .from('workspace_blocks')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const sort_order = count ?? 0

  const { data, error } = await supabase
    .from('workspace_blocks')
    .insert({ user_id: user.id, type, content: initialContent, sort_order })
    .select('*')
    .single()

  if (error || !data) throw new Error('Failed to add block')
  revalidatePath('/tasks')
  return data as Block
}

export async function updateBlock(
  id: string,
  patch: { type?: BlockType; content?: string; checked?: boolean; language?: BlockLanguage; color?: string },
) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  if (!id || typeof id !== 'string') throw new Error('Invalid ID')
  validateBlockPatch(patch)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('workspace_blocks')
    .update(patch)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error('Failed to update block')
  // Don't revalidate on every keystroke — client handles optimistic updates
}

export async function deleteBlock(id: string) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  if (!id || typeof id !== 'string') throw new Error('Invalid ID')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('workspace_blocks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error('Failed to delete block')
  revalidatePath('/tasks')
}

export async function reorderBlocks(orderedIds: string[]) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) return
  if (orderedIds.length > 500) throw new Error('Too many blocks')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Batch update sort_order = index for each block
  await Promise.all(
    orderedIds.map((blockId, index) =>
      supabase
        .from('workspace_blocks')
        .update({ sort_order: index })
        .eq('id', blockId)
        .eq('user_id', user.id)
    )
  )
}
