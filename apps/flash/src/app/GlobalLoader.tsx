import { setOrdenes } from '@flash-ws/reductor';
import { useQuery } from '@tanstack/react-query';

import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

function requestIProductos() {
  return axios
    .get(`${process.env['NX_SERVER_URL']}/api/productos`)
    .then((response) => response.data);
}

// export function requestOrdenes() {
//   return axios
//     .get(`${process.env['NX_SERVER_URL']}/api/ordenes`)
//     .then((response) => response.data);
// }

function requestLocales() {
  return axios
    .get(`${process.env['NX_SERVER_URL']}/api/locales`)
    .then((response) => response.data);
}

type GlobalLoaderProps = {
  children: React.ReactNode;
};

export function GlobalLoader({ children }: GlobalLoaderProps) {
  const dispatch = useDispatch();
  const p = useQuery(['productos'], requestIProductos, { cacheTime: 120000 });
  const l = useQuery(['locales'], requestLocales, { cacheTime: 120000 });

  useEffect(() => {
    axios
      .get(`${process.env['NX_SERVER_URL']}/api/ordenes`)
      .then((response) => dispatch(setOrdenes(response.data)));
  }, []);

  // const q = useQuery(['ordenes'], requestOrdenes);

  if (p.isLoading || l.isLoading) {
    return <span>Loading...</span>;
  }

  if (p.error || l.error) {
    return <span>{JSON.stringify(p.error)}</span>;
  }

  return <>{children}</>;
}
