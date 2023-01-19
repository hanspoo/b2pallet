import { render } from '@testing-library/react';

import LoginSection from './login-section';

describe('LoginSection', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<LoginSection />);
    expect(baseElement).toBeTruthy();
  });
});
