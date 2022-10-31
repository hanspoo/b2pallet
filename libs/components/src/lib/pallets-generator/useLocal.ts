import { ILineaDetalle, ILocal } from '@flash-ws/api-interfaces';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

type UseLocalReturn = [boolean, ILineaDetalle[] | undefined];

export function useLocal(lineas: ILineaDetalle[]): UseLocalReturn {
  const [data, setData] = useState<ILineaDetalle[]>();
  const [loading, setLoading] = useState(true);

  const queryClient = useQueryClient();

  useEffect(() => {
    const locales = queryClient.getQueryData<Array<ILocal>>(['locales']) as any;

    function findLocal(id: number): ILocal | undefined {
      return locales.find((p: ILocal) => p.id === id);
    }

    const hidratadas = lineas.map((linea) => {
      const local = linea.localId ? findLocal(linea.localId) : undefined;
      if (!local) throw Error(`producto o local no encontrado`);
      return {
        ...linea,
        local,
      };
    });

    setData(
      hidratadas.sort((a, b) => a.local.nombre.localeCompare(b.local.nombre))
    );
    setLoading(false);
  }, [lineas, queryClient]);

  if (loading) return [true, undefined];

  return [false, data];
}
