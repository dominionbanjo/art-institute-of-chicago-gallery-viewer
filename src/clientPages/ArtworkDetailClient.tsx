'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft2 } from 'iconsax-react';
import { getImageUrl } from '@/lib/api';
import ArtworkImage from '@/components/shared/ArtworkImage';
import { Artwork } from '@/types';

interface ArtworkDetailClientProps {
  artwork: Artwork;
}

export default function ArtworkDetailClient({ artwork }: ArtworkDetailClientProps) {
  const router = useRouter();

  return (
    <main className="page-container">
      <nav className="mb-8">
        <button 
          onClick={() => router.back()}
          className="btn btn-secondary h-10 px-4"
        >
          <ArrowLeft2 size="16" color="currentColor" variant="Outline" className="mr-2" />
          Back to Gallery
        </button>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="w-full lg:w-3/5 rounded-sm overflow-hidden bg-surface border border-border shadow-sm relative">
          <div className="relative pt-[100%] md:pt-[75%] lg:pt-[100%] xl:pt-[80%]">
            <ArtworkImage
              src={getImageUrl(artwork.image_id, 843)}
              lqip={artwork.thumbnail?.lqip}
              alt={artwork.thumbnail?.alt_text || artwork.title || 'Detailed Artwork Image'}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-contain"
              priority
              unoptimized={true}
            />
          </div>
        </div>

        <div className="w-full lg:w-2/5 flex flex-col gap-8 sticky top-24">
          <header>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4 leading-tight">
              {artwork.title}
            </h1>
            <div className="text-xl font-medium text-muted-foreground whitespace-pre-wrap">
              {artwork.artist_title || artwork.artist_display || 'Unknown Artist'}
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 py-8 border-y border-border/40">
            {artwork.date_display && (
              <div>
                <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Date</span>
                <span className="text-foreground text-lg md:text-xl font-medium">{artwork.date_display}</span>
              </div>
            )}
            {artwork.place_of_origin && (
              <div>
                <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Origin</span>
                <span className="text-foreground text-lg md:text-xl font-medium">{artwork.place_of_origin}</span>
              </div>
            )}
            {artwork.medium_display && (
              <div className="md:col-span-2">
                <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Medium</span>
                <span className="text-foreground text-lg md:text-xl font-medium leading-relaxed">{artwork.medium_display}</span>
              </div>
            )}
            {artwork.dimensions && (
              <div className="md:col-span-2">
                <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Dimensions</span>
                <span className="text-foreground text-base md:text-lg font-medium">{artwork.dimensions}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between py-1">
              <div>
                <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Status</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2 text-base">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {artwork.is_public_domain ? 'Public Domain' : 'Copyright Protected'}
                </span>
              </div>
            </div>

            {artwork.credit_line && (
              <div className="p-4 bg-muted/30 rounded-sm border-l-4 border-muted">
                <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2 opacity-60">Credit Line</span>
                <p className="text-foreground/80 text-xs italic leading-tight">{artwork.credit_line}</p>
              </div>
            )}
          </div>

          {artwork.description && (
             <div className="text-muted-foreground text-sm leading-relaxed prose dark:prose-invert max-w-none">
                <h3 className="text-lg font-semibold text-foreground mb-2">About this artwork</h3>
                <div dangerouslySetInnerHTML={{ __html: artwork.description }} />
             </div>
          )}
        </div>
      </div>
    </main>
  );
}
