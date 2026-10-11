import Link from 'next/link';
import { Artwork } from '@/types';
import { getImageUrl } from '@/lib/api';
import ArtworkImage from '@/components/shared/ArtworkImage';

interface ArtworkCardProps {
  artwork: Artwork;
}

export default function ArtworkCard({ artwork }: ArtworkCardProps) {
  return (
    <Link 
      href={`/artworks/${artwork.id}`} 
      className="card card-hoverable group flex flex-col h-full bg-background border border-border overflow-hidden rounded-sm"
    >
      <div className="relative aspect-[3/4] bg-surface overflow-hidden">
        {artwork.image_id ? (
          <ArtworkImage
            src={getImageUrl(artwork.image_id, 400)}
            lqip={artwork.thumbnail?.lqip}
            alt={artwork.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
            placeholder={artwork.thumbnail?.lqip ? 'blur' : 'empty'}
            blurDataURL={artwork.thumbnail?.lqip}
            unoptimized={true}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-surface border-b border-border">
            <span className="text-muted-foreground text-xs italic">No display</span>
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-base leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
          {artwork.title}
        </h3>
        <div className="mt-auto pt-3 flex flex-col gap-1">
          <p className="text-muted-foreground text-sm font-medium line-clamp-1">
            {artwork.artist_title || 'Unknown Artist'}
          </p>
          <p className="text-muted-foreground/60 text-[10px] uppercase tracking-widest font-bold">
            {artwork.date_display || 'n.d.'}
          </p>
        </div>
      </div>
    </Link>
  );
}
