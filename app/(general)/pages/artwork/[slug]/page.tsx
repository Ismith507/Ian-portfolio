import { groq } from 'next-sanity';
import { sanityFetch } from '@/sanity/lib/fetch';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { urlForImage } from '@/sanity/lib/image';
import { Art } from '@/sanity.types';

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
		<div className="text-black">
			<h1>{artwork.title}</h1>
			{artwork.content?.asset ? (
				<div className="h-96 w-full max-w-64 relative">
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

			<p>{artwork.caption}</p>
			<p>{artwork.author}</p>
		</div>
	);
}
