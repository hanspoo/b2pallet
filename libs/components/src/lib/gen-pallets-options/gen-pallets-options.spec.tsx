import { render } from '@testing-library/react';

import GenPalletsOptions from './gen-pallets-options';

describe('GenPalletsOptions', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<GenPalletsOptions />);
    expect(baseElement).toBeTruthy();
  });
});
