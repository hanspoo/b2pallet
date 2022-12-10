import { render } from '@testing-library/react';

import LoginState from './login-state';

describe('LoginState', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<LoginState />);
    expect(baseElement).toBeTruthy();
  });
});
