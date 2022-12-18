import React from 'react';
import axios from 'axios';
import { Spin } from 'antd';
import {
  IProtoPallet,
} from '@flash-ws/api-interfaces';

import { UploadOrdenReally } from './UploadOrdenReally';
import { useHttpClient } from '../useHttpClient';


const UploadOrden = () => {
  const httpClient = useHttpClient();
  const [protoPallets, setprotoPallets] = React.useState<IProtoPallet[]>();
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    httpClient
      .get<IProtoPallet[]>(`${process.env['NX_SERVER_URL']}/api/proto-pallets`)
      .then((response) => {
        setprotoPallets(response.data);
        setLoading(false);
      })
      .catch((ex) => {
        const error = axios.isCancel(ex)
          ? 'Request Cancelled'
          : ex.code === 'ECONNABORTED'
            ? 'A timeout has occurred'
            : ex.response.status === 404
              ? 'Resource Not Found'
              : 'An unexpected error has occurred';

        setError(error);
        setLoading(false);
      });
  }, []);

  if (loading) return <Spin />;
  if (error) return <p>Error: {error}</p>;
  if (!protoPallets) return <p>Estado inválido no hay protoPallets</p>;

  return <UploadOrdenReally protoPallets={protoPallets} />;
};


export { UploadOrden };
