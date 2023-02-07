import { render } from "@testing-library/react";

import SignupReadEmail from "./signup-read-email";

describe("SignupReadEmail", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<SignupReadEmail />);
    expect(baseElement).toBeTruthy();
  });
});
