import { IPalletConsolidado } from '@flash-ws/api-interfaces';
import { Typography } from 'antd';
import Barcode from 'react-barcode';
const { Title } = Typography


export function EtiquetaPallet({ pallet }: { pallet: IPalletConsolidado; }) {

    const value = "76531540" + String(pallet.hu).padStart(8, '0');
    return <div style={{ display: 'flex', flexDirection: "column", alignItems: "center" }}>
        <Barcode format="CODE128" value={value} height={64} />
        <Title level={4} style={{ marginBottom: '0.25em' }}>CHILEAN TRADING LTDA</Title>

        <div style={{ fontWeight: 'bold', fontSize: '1.2em', margin: 0 }}>{pallet.nombrelocal}</div>
        <div style={{ fontWeight: 'bold', fontSize: '2.5em', margin: 0 }}>JS501</div>



    </div>;
}
