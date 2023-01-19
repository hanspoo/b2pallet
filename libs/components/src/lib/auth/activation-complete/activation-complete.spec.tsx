import { render } from '@testing-library/react';

import ActivationComplete from './activation-complete';

describe('ActivationComplete', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ActivationComplete />);
    expect(baseElement).toBeTruthy();
  });
});
