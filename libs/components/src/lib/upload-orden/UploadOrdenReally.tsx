import React, { useState } from 'react';
import axios from 'axios';
import { Button, Select, Spin } from 'antd';
import {
    IArchivo,
    IOrdenCompra, IProtoPallet, LoaderPostBody, SubirOrdenBody
} from '@flash-ws/api-interfaces';
import { OrdenesResponseInvalid } from '@flash-ws/api-interfaces';
import { MostrarErrores } from './MostrarErrores';
import { AntUploader } from '../ant-uploader/ant-uploader';
import Title from 'antd/lib/typography/Title';
import { useHttpClient } from '../useHttpClient';

export type UploadOrdenReallyArgs = {
    protoPallets: IProtoPallet[];
};

const labelStyle = {
    fontWeight: 'bold',
    display: 'block',
    marginBottom: '0.5em',
};

export function UploadOrdenReally({ protoPallets }: UploadOrdenReallyArgs) {
    const httpClient = useHttpClient()
    const [archivo, setArchivo] = useState<IArchivo>();
    const [loading, setLoading] = useState(false);
    const [limpiando, setLimpiando] = useState(false);
    const [error, setError] = useState<OrdenesResponseInvalid>();
    const [ordenes, setOrdenes] = useState<number[]>();
    const [protoPallet, setProtoPallet] = useState<number>();

    const handleSubmit = async (event: any) => {
        if (!protoPallet)
            throw Error('No está definida la protoPallet de negocio');
        if (!archivo)
            throw Error('No está definido el archivo');

        setLoading(true);
        event.preventDefault();
        const params: LoaderPostBody = {
            idArchivo: archivo.id,
        };
        httpClient
            .post<IOrdenCompra>(
                `${process.env['NX_SERVER_URL']}/api/loader/subir`,
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
        setProtoPallet(undefined);
    };
    if (loading)
        return <Spin />;
    if (error) {
        const { msg, errores } = error;

        return (
            <>
                <p>{msg}</p>
                <MostrarErrores
                    title="Productos no encontrados"
                    list={errores || []} />
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
                <label style={labelStyle}>Tipo de Pallet</label>

                <Select
                    style={{ width: 240 }}
                    value={protoPallet}
                    onChange={setProtoPallet}
                    showSearch
                    placeholder="Seleccione el tipo de pallet"
                >
                    {protoPallets.map((un) => (
                        <Select.Option value={un.id} key={un.id}>{un.nombre}</Select.Option>
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
                disabled={!(protoPallet && archivo)}
                style={{ marginRight: '0.25em' }}
            >
                Enviar
            </Button>
            <Button onClick={limpiar}>Cancelar</Button>
        </form>
    );
}
