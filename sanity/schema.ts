import { type SchemaTypeDefinition } from 'sanity'
import {defineType} from 'sanity'
import {defineField} from 'sanity'
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    defineType({
      name: 'art',
      title: 'Art',
      type: 'document',

      fields: [
        defineField({
          name: 'title',
          title: 'Title',
          type: 'string'
      }),
        defineField({
          title: 'Content',
          name: 'content',
          type: 'image',
          options: {
            hotspot: true
          }
        }),
        defineField({
          name: 'caption',
          type: 'string',
          title: 'Caption',
        }),
         defineField({
          name: 'author',
          type: 'string',
          title: 'Author',
        })
      ],
    }),

    defineType({
      name: 'author',
      title: 'Author',
      type: 'document',
      
      fields: [
        defineField({
          name: 'name',
          title: 'Name',
          type: 'string',
        }),
        defineField({
          name: 'slug',
          title: 'Slug',
          type: 'slug'
        })
      ]
    }),

    defineType({
      name: 'post',
      title: 'Post',
      type: 'document',
      
      fields: [
        defineField({
          name: 'content',
          title: 'Content',
          type: 'string',
        }),
        defineField({
          name: 'slug',
          title: 'Slug',
          type: 'slug'
        })
      ]
    })

  ],
}
