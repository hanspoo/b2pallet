import { useState } from 'react';
import ActivationComplete from '../auth/activation-complete/activation-complete';
import ActivationForm from '../auth/activation-form/activation-form';
import { LoginForm } from '../auth/login-form/login-form';
import { RecoverPassword } from '../auth/recover-password/recover-password';
import { SignupForm } from '../auth/signup-form/signup-form';

/* eslint-disable-next-line */
export interface LoginSectionProps { }

enum View {
  LOGIN,
  SIGNUP,
  ACTIVATION,
  ACTIVATION_COMPLETE,
  RECOVER_PASSWORD,
}
export function LoginSection(props: LoginSectionProps) {
  const [email, setEmail] = useState("")
  const [vista, setView] = useState(View.LOGIN)

  if (vista === View.SIGNUP)
    return <SignupForm cancel={() => setView(View.LOGIN)}
      goActivation={(email: string) => { setView(View.ACTIVATION); setEmail(email) }} />
  if (vista === View.RECOVER_PASSWORD)
    return <RecoverPassword cancel={() => setView(View.LOGIN)} />

  if (vista === View.ACTIVATION)
    return <ActivationForm email={email} cancel={() => setView(View.LOGIN)} bingo={() => setView(View.ACTIVATION_COMPLETE)} />

  if (vista === View.ACTIVATION_COMPLETE)
    return <ActivationComplete goLogin={() => setView(View.LOGIN)} />

  return <LoginForm goSignup={() => setView(View.SIGNUP)} recoverPassword={() => setView(View.RECOVER_PASSWORD)} />

}

export default LoginSection;
