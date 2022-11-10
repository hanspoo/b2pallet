import { CiCircleFilled } from '@ant-design/icons';
import { IPalletConsolidado } from '@flash-ws/api-interfaces';
import styles from './pallets-icono.module.css';

/* eslint-disable-next-line */
export interface PalletsIconoProps {
  pallets: IPalletConsolidado[];
}

export function PalletsIcono({ pallets }: PalletsIconoProps) {
  return (
    <ul className={styles['anticons-list']}>
      {pallets.map((p) => (
        <li>
          <CiCircleFilled style={{ fontSize: '48px', color: '#08c' }} />
          <div>{p.nombrelocal}</div>
        </li>
      ))}
    </ul>
  );
}

export default PalletsIcono;
