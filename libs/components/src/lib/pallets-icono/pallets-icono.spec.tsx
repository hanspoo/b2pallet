import { render } from '@testing-library/react';

import PalletsIcono from './pallets-icono';
import { palletsData } from './pallets-data';

describe('PalletsIcono', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PalletsIcono pallets={palletsData} />);
    expect(baseElement).toBeTruthy();
  });
});
