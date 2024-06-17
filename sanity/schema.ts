import { artType } from '@/schema/artType'
import { authorType } from '@/schema/authorType'
import { type SchemaTypeDefinition } from 'sanity'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [artType, authorType],
}
