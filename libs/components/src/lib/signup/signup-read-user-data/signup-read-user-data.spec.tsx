import { render } from "@testing-library/react";

import SignupReadUserData from "./signup-read-user-data";

describe("SignupReadUserData", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<SignupReadUserData />);
    expect(baseElement).toBeTruthy();
  });
});
