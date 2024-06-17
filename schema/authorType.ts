import { defineField, defineType } from "sanity";

export const authorType = defineType({
    name: 'Author',
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
            type: 'slug',
            options: {
                source: 'name',
                maxLength: 96,
            }
        })
    ]
})