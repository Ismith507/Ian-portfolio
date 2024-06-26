import { Art } from '@/sanity.types';
import { sanityFetch } from '@/sanity/lib/fetch';
import { urlForImage } from '@/sanity/lib/image';
import { groq } from 'next-sanity';
import Image from 'next/image';

const artworkQuery = groq`*[_type == "art"]`;

export default async function ArtworkGallery() {
	const artwork = await sanityFetch<Art[]>({
		query: artworkQuery,
	});

	return (
		<div className="text-black">
			<h1>Gallery</h1>
			<div className="grid grid-cols-3 gap-4">
				{artwork.map((artwork) => (
					<div key={artwork._id} className="h-96 w-full max-w-64 relative">
						<Image
							src={urlForImage(artwork.content!.asset!).url()}
							alt={artwork.caption!}
							fill
							className="object-contain"
						/>
					</div>
				))}
			</div>
		</div>
	);
}
