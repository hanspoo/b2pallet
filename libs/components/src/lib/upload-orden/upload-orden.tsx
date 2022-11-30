import React, { useState } from 'react';
import axios from 'axios';
import { Button, Select, Spin } from 'antd';
import {
  IArchivo,
  IOrdenCompra,
  IUnidadNegocio,
  SubirOrdenBody,
} from '@flash-ws/api-interfaces';
import { OrdenesResponseInvalid } from '@flash-ws/api-interfaces';
import { MostrarErrores } from './MostrarErrores';
import { AntUploader } from '../ant-uploader/ant-uploader';
import { useDispatch } from 'react-redux';

import Title from 'antd/lib/typography/Title';

const { Option } = Select;

const UploadOrden = () => {
  const [unidades, setunidades] = React.useState<IUnidadNegocio[]>();
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    axios
      .get<IUnidadNegocio[]>(`${process.env['NX_SERVER_URL']}/api/unidades`)
      .then((response) => {
        setunidades(response.data);
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
  if (!unidades) return <p>Estado inválido no hay unidades</p>;

  return <UploadOrdenReally unidades={unidades} />;
};
type UploadOrdenReallyArgs = {
  unidades: IUnidadNegocio[];
};

const labelStyle = {
  fontWeight: 'bold',
  display: 'block',
  marginBottom: '0.5em',
};
const UploadOrdenReally = ({ unidades }: UploadOrdenReallyArgs) => {
  const [archivo, setArchivo] = useState<IArchivo>();
  const [loading, setLoading] = useState(false);
  const [limpiando, setLimpiando] = useState(false);
  const [error, setError] = useState<OrdenesResponseInvalid>();
  const [ordenes, setOrdenes] = useState<number[]>();
  const [unidad, setUnidad] = useState<number>();

  const handleSubmit = async (event: any) => {
    if (!unidad) throw Error('No está definida la unidad de negocio');
    if (!archivo) throw Error('No está definido el archivo');

    setLoading(true);
    event.preventDefault();
    const params: SubirOrdenBody = {
      idUnidad: unidad,
      idArchivo: archivo.id,
    };
    axios
      .post<IOrdenCompra>(
        `${process.env['NX_SERVER_URL']}/api/ordenes/subir`,
        params
      )
      .then((response) => {
        const ordenes = response.data as any as Array<number>;
        setOrdenes(ordenes);
        setLoading(false);
      })
      .catch((error) => {
        const errorPayload = error.response.data as OrdenesResponseInvalid;
        setError(errorPayload);
        setLoading(false);
      });
  };

  const limpiar = () => {
    setArchivo(undefined);
    setOrdenes(undefined);
    setLimpiando(true);
    setTimeout(() => setLimpiando(false), 1000);
    setUnidad(undefined);
  };
  if (loading) return <Spin />;
  if (error) {
    const { msg, ordenesDuplicadas, productosNoEncontrados } = error;

    return (
      <>
        <p>{msg}</p>
        <MostrarErrores
          title="Productos no encontrados"
          list={productosNoEncontrados || []}
        />
        <MostrarErrores
          title="Ordenes de compra duplicadas"
          list={ordenesDuplicadas || []}
        />
        <Button
          onClick={() => {
            limpiar();
            setError(undefined);
          }}
        >
          Continuar
        </Button>
      </>
    );
  }
  if (ordenes) {
    return (
      <>
        {ordenes.length === 1 ? (
          <p>Se agregó una orden de compra</p>
        ) : (
          <p>Se agregaron {ordenes.length} ordenes de compra.</p>
        )}
        <Button onClick={limpiar}>Continuar</Button>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Title level={3}>Subir ordenes de compra</Title>
      <div style={{ marginBottom: '1.5em' }}>
        <label style={labelStyle}>Unidad de negocio</label>

        <Select
          style={{ width: 240 }}
          value={unidad}
          onChange={setUnidad}
          showSearch
          placeholder="Seleccione la unidad de negocio"
        >
          {unidades.map((IUnidadNegocio) => (
            <Option value={IUnidadNegocio.id}>{IUnidadNegocio.nombre}</Option>
          ))}
        </Select>
      </div>

      <div style={{ marginBottom: '2em' }}>
        <label style={labelStyle}>Planilla excel del b2b</label>

        {!limpiando && <AntUploader onFileSelected={setArchivo} />}
      </div>

      <Button
        type="primary"
        htmlType="submit"
        disabled={!(unidad && archivo)}
        style={{ marginRight: '0.25em' }}
      >
        Enviar
      </Button>
      <Button onClick={limpiar}>Cancelar</Button>
    </form>
  );
};

export { UploadOrden };
