import { render } from '@testing-library/react';

import PalletBarcode from './pallet-barcode';

describe('PalletBarcode', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PalletBarcode />);
    expect(baseElement).toBeTruthy();
  });
});
