import { defineField, defineType } from "sanity";

export const artType = defineType({
    name: 'art',
    title: 'Art',
    type: 'image',

    fields: [
        defineField({
            name: 'caption',
            title: 'Caption',
            type: 'string',
        }),
        defineField({
            name: 'attribution',
            title: 'Attribution',
            type: 'string'
        })
    ]
})