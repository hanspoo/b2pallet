import { render } from "@testing-library/react";

import SignupReadPassword from "./signup-read-password";

describe("SignupReadPassword", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<SignupReadPassword />);
    expect(baseElement).toBeTruthy();
  });
});
