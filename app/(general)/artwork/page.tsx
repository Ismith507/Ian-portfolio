import { Art } from '@/sanity.types';
import { sanityFetch } from '@/sanity/lib/fetch';
import { urlForImage } from '@/sanity/lib/image';
import { groq } from 'next-sanity';
import Image from 'next/image';
import Link from 'next/link';
import {useRouter} from 'next/router'

const artworkQuery = groq`*[_type == "art"]`;

export default async function ArtworkGallery() {
	const artwork = await sanityFetch<Art[]>({
		query: artworkQuery,
	});

	return (
		<div className="flex flex-col place-items-center text-black">
			<h1>Gallery</h1>
			<div className="grid grid-flow-col gap-4">
				{artwork.map((artwork) => (
					<Link key={artwork._id} href={`/artwork/[slug]`} as={`/artwork/${artwork.slug!.current}`} className="h-96 w-96 max-w-sm relative transition ease-in-out duration-500 hover:scale-125 hover:z-10">
						<Image
							src={urlForImage(artwork.content!.asset!).url()}
							alt={artwork.caption!}
							fill
							className="object-contain"
						/>
					</Link>
				))}
			</div>
		</div>
	);
}
