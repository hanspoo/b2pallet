import { render } from '@testing-library/react';

import PalletsGenerator from './pallets-generator';

describe('PalletsGenerator', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PalletsGenerator />);
    expect(baseElement).toBeTruthy();
  });
});
