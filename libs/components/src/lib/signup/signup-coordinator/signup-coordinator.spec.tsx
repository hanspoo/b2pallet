import { render } from "@testing-library/react";

import SignupCoordinator from "./signup-coordinator";

describe("SignupCoordinator", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<SignupCoordinator />);
    expect(baseElement).toBeTruthy();
  });
});
