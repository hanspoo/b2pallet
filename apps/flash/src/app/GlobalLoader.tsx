import { useQuery } from '@tanstack/react-query';

import axios from 'axios';

function requestProductos() {
  return axios
    .get(`${process.env['NX_SERVER_URL']}/api/productos`)
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

  if (p.isLoading || l.isLoading) {
    return <span>Loading...</span>;
  }

  if (p.error || l.error) {
    return <span>{JSON.stringify(p.error)}</span>;
  }

  return <>{children}</>;
}
