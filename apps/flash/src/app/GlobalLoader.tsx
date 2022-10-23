import { useQuery } from '@tanstack/react-query';

import axios from 'axios';

function requestProductos() {
  return axios
    .get(`${process.env['NX_SERVER_URL']}/api/productos`)
    .then((response) => response.data);
}

function requestOrdenes() {
  return axios
    .get(`${process.env['NX_SERVER_URL']}/api/ordenes`)
    .then((response) => response.data);
}

function requestLocales() {
  return axios
    .get(`${process.env['NX_SERVER_URL']}/api/locales`)
    .then((response) => response.data);
}

type GlobalLoaderProps = {
  children: React.ReactNode;
};

export function GlobalLoader({ children }: GlobalLoaderProps) {
  const p = useQuery(['productos'], requestProductos);
  const l = useQuery(['locales'], requestLocales);
  const q = useQuery(['ordenes'], requestOrdenes);

  if (p.isLoading || l.isLoading || q.isLoading) {
    return <span>Loading...</span>;
  }

  if (p.error || l.error) {
    return <span>{JSON.stringify(p.error)}</span>;
  }

  return <>{children}</>;
}
