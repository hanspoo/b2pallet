import { render } from '@testing-library/react';

import SelectorEstado from './selector-estado';

describe('SelectorEstado', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SelectorEstado />);
    expect(baseElement).toBeTruthy();
  });
});
