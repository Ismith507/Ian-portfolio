import { groq } from 'next-sanity';
import { sanityFetch } from '@/sanity/lib/fetch';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { urlForImage } from '@/sanity/lib/image';
import { Art } from '@/sanity.types';
import { useNextSanityImage } from 'next-sanity-image';
import { createClient } from '@sanity/client';

const artworkQuery = groq`*[_type == "art" && slug.current == $slug][0]`;

export default async function ArtworkItemPage(props: {
	params: {
		slug: string;
	};
}) {
	const { slug } = props.params;
	const artwork = await sanityFetch<Art | null>({
		query: artworkQuery,
		params: {
			slug,
		},
	});

	if (!artwork) {
		notFound();
	}


	return (
		<div className="flex flex-row text-black justify-center space-x-10 m-24">
			{artwork.content?.asset ? (
				<div className="h-auto w-auto relative">
					<Image
						src={urlForImage(artwork.content.asset).url()}
						alt={artwork.caption!}
						fill
						className="object-contain"
					/>
				</div>
			) : (
				<p>No image</p>
			)}
			<div className="flex flex-col justify-start">
				<h1>{artwork.title}</h1>
				<p>{artwork.caption}</p>
				<p>{artwork.author}</p>
			</div>
		</div>
	);
}
