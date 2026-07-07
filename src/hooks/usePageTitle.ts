import { useEffect } from 'react';

const BASE_TITLE = 'NEXIA — Campus virtual';

/**
 * Define el título de la pestaña del navegador para la página actual.
 * Restaura el título base al desmontar.
 */
export function usePageTitle(titulo?: string): void {
  useEffect(() => {
    document.title = titulo ? `${titulo} · NEXIA` : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [titulo]);
}
