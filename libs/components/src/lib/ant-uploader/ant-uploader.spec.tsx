import { render } from '@testing-library/react';

import { AntUploader } from './ant-uploader';

describe('AntUploader', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <AntUploader onFileSelected={() => console.log('selected')} />
    );
    expect(baseElement).toBeTruthy();
  });
});
