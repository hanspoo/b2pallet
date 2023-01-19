import { render } from '@testing-library/react';

import RecoverPassword from './recover-password';

describe('RecoverPassword', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<RecoverPassword />);
    expect(baseElement).toBeTruthy();
  });
});
