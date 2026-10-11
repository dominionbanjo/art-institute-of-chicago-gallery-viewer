'use client';

import { ArrowLeft2, ArrowRight2 } from 'iconsax-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  };

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Centered window of `size` page numbers around the current page,
  // pulled back to the start/end so the window never sits flush against
  // the first or last page without showing the opposite edge.
  const getPageWindow = (size: number): number[] => {
    const pages: number[] = [];
    if (totalPages <= size) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    let start = Math.max(1, currentPage - Math.floor((size - 1) / 2));
    const end = Math.min(totalPages, start + size - 1);

    if (end === totalPages) {
      start = Math.max(1, end - size + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  // First page + ellipsis around the window, then window, then
  // ellipsis + last page — the curated set users can jump between.
  const renderPageNumbers = (pages: number[]) => (
    <>
      {pages[0] > 1 && (
        <>
          <button
            onClick={() => handlePageChange(1)}
            className="pagination-item pagination-item-compact"
            aria-label="First Page"
          >
            1
          </button>
          {pages[0] > 2 && (
            <span className="text-muted-foreground px-0.5 sm:px-1" aria-hidden="true">
              …
            </span>
          )}
        </>
      )}

      {pages.map(page => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`pagination-item pagination-item-compact ${
            currentPage === page ? 'pagination-item-active' : ''
          }`}
          aria-label={`Page ${page}`}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="text-muted-foreground px-0.5 sm:px-1" aria-hidden="true">
              …
            </span>
          )}
          <button
            onClick={() => handlePageChange(totalPages)}
            className="pagination-item pagination-item-compact"
            aria-label="Last Page"
          >
            {totalPages}
          </button>
        </>
      )}
    </>
  );

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center gap-3 mt-12 mb-8 sm:flex-row sm:justify-center sm:gap-2">
      <div className="flex items-center justify-center gap-1 sm:gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!hasPrev}
          className="pagination-item pagination-item-compact disabled:opacity-30 sm:mr-2"
          aria-label="Previous Page"
        >
          <ArrowLeft2 size="16" color="currentColor" variant="Outline" />
        </button>

        {/* Mobile: compact curated window so users can jump multiple pages */}
        <div className="flex flex-wrap items-center justify-center gap-1 sm:hidden">
          {renderPageNumbers(getPageWindow(3))}
        </div>

        {/* Desktop: wider window */}
        <div className="hidden sm:flex items-center gap-2">
          {renderPageNumbers(getPageWindow(5))}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNext}
          className="pagination-item pagination-item-compact disabled:opacity-30 sm:ml-2"
          aria-label="Next Page"
        >
          <ArrowRight2 size="16" color="currentColor" variant="Outline" />
        </button>
      </div>

      <div className="sm:hidden text-xs text-muted-foreground font-medium">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}
