import { render } from '@testing-library/react';

import ActivationForm from './activation-form';

describe('ActivationForm', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ActivationForm cancel={function (): void {
      throw new Error('Function not implemented.');
    }} />);
    expect(baseElement).toBeTruthy();
  });
});
