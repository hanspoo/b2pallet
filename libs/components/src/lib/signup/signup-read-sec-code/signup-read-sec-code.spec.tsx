import { render } from "@testing-library/react";

import SignupReadSecCode from "./signup-read-sec-code";

describe("SignupReadSecCode", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<SignupReadSecCode />);
    expect(baseElement).toBeTruthy();
  });
});
