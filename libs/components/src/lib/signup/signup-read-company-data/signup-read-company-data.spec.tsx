import { render } from "@testing-library/react";

import SignupReadCompanyData from "./signup-read-company-data";

describe("SignupReadCompanyData", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<SignupReadCompanyData />);
    expect(baseElement).toBeTruthy();
  });
});
