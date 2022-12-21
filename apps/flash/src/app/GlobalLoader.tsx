import { logout, setOrdenes } from '@flash-ws/reductor';
import { useQuery } from '@tanstack/react-query';
import { Button } from 'antd';


import { useHttpClient } from 'libs/components/src/lib/useHttpClient';
import { useDispatch } from 'react-redux';


type GlobalLoaderProps = {
  children: React.ReactNode;
};

export function GlobalLoader({ children }: GlobalLoaderProps) {
  const dispatch = useDispatch();
  const httpClient = useHttpClient();
  console.log('Rendering GlobalLoader');

  function requestProductos() {
    return httpClient
      .get(`${process.env['NX_SERVER_URL']}/api/productos`)
      .then((response) => response.data);
  }

  function requestLocales() {
    return httpClient
      .get(`${process.env['NX_SERVER_URL']}/api/locales`)
      .then((response) => response.data);
  }
  const p = useQuery(['productos'], requestProductos, { refetchInterval: 1000 * 360 });
  const l = useQuery(['locales'], requestLocales, { refetchInterval: 1000 * 360 });

  if (p.isLoading || l.isLoading) {
    return <span>Loading... wait</span>;
  }

  if (p.error || l.error) {
    return <div>
      <p>Hay problemas al conectar al sistema, <Button onClick={() => dispatch(logout())}>Conectar nuevamente</Button></p>
    </div>

  }

  return <>{children}</>;
}
