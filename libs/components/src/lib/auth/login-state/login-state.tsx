import { RootState } from '@flash-ws/reductor';
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@flash-ws/reductor';
import styles from './login-state.module.css';

/* eslint-disable-next-line */
export interface LoginStateProps { }

export function LoginState(props: LoginStateProps) {
  const token = useSelector((state: RootState) => state.counter.token)
  const dispatch = useDispatch();

  const loggedIn = useSelector((state: RootState) => state.counter.loggedIn)
  if (!loggedIn)
    return <p>Desconectado</p>

  const onLogout = () => {
    dispatch(logout())
  }

  return (
    <div className={styles['container']}>
      <small style={{ position: "absolute", right: "2em", top: "2em", textAlign: "right" }}>SessionID:<br /> {token}
        <br /> <Button size='small' type="link" onClick={onLogout}><small>Logout</small></Button></small>
    </div>
  );
}

export default LoginState;
