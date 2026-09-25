import { ChevronLeft, ChevronRight } from 'lucide-react';

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40">
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default Pagination;