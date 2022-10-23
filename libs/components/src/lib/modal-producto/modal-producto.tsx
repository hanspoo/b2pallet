import styles from './modal-producto.module.css';

/* eslint-disable-next-line */
export interface ModalProductoProps {}

export function ModalProducto(props: ModalProductoProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to ModalProducto!</h1>
    </div>
  );
}

export default ModalProducto;
