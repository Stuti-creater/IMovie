import { useEffect } from 'react';
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | IMovies` : 'IMovies | Book your seat';
  }, [title]);
}
