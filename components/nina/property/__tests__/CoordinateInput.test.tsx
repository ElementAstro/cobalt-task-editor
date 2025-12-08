/**
 * Unit tests for CoordinateInput component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CoordinateInput } from "../CoordinateInput";

const defaultTranslations = {
  rightAscension: "Right Ascension",
  declination: "Declination",
  raHours: "Hours",
  raMinutes: "Minutes",
  raSeconds: "Seconds",
  decDegrees: "Degrees",
  decMinutes: "Minutes",
  decSeconds: "Seconds",
};

const defaultRa = { hours: 12, minutes: 30, seconds: 45.5 };
const defaultDec = { degrees: 45, minutes: 30, seconds: 15.5, negative: false };

describe("CoordinateInput", () => {
  describe("Rendering", () => {
    it("should render label", () => {
      const onChange = jest.fn();

      render(
        <CoordinateInput
          label="Coordinates"
          ra={defaultRa}
          dec={defaultDec}
          onChange={onChange}
          translations={defaultTranslations}
        />,
      );

      expect(screen.getByText("Coordinates")).toBeInTheDocument();
    });

    it("should render Right Ascension section", () => {
      const onChange = jest.fn();

      render(
        <CoordinateInput
          label="Coordinates"
          ra={defaultRa}
          dec={defaultDec}
          onChange={onChange}
          translations={defaultTranslations}
        />,
      );

      expect(screen.getByText("Right Ascension")).toBeInTheDocument();
    });

    it("should render Declination section", () => {
      const onChange = jest.fn();

      render(
        <CoordinateInput
          label="Coordinates"
          ra={defaultRa}
          dec={defaultDec}
          onChange={onChange}
          translations={defaultTranslations}
        />,
      );

      expect(screen.getByText("Declination")).toBeInTheDocument();
    });

    it("should display RA values", () => {
      const onChange = jest.fn();

      render(
        <CoordinateInput
          label="Coordinates"
          ra={{ hours: 5, minutes: 20, seconds: 33 }}
          dec={{ degrees: 70, minutes: 40, seconds: 50, negative: false }}
          onChange={onChange}
          translations={defaultTranslations}
        />,
      );

      expect(screen.getByDisplayValue("5")).toBeInTheDocument();
      expect(screen.getByDisplayValue("20")).toBeInTheDocument();
      expect(screen.getByDisplayValue("33")).toBeInTheDocument();
    });

    it("should display Dec values", () => {
      const onChange = jest.fn();

      render(
        <CoordinateInput
          label="Coordinates"
          ra={{ hours: 1, minutes: 2, seconds: 3 }}
          dec={{ degrees: 80, minutes: 25, seconds: 55, negative: false }}
          onChange={onChange}
          translations={defaultTranslations}
        />,
      );

      // Use getAllByDisplayValue for values that might appear multiple times
      expect(screen.getByDisplayValue("80")).toBeInTheDocument();
      expect(screen.getByDisplayValue("25")).toBeInTheDocument();
      expect(screen.getByDisplayValue("55")).toBeInTheDocument();
    });

    it("should show positive sign for positive declination", () => {
      const onChange = jest.fn();

      render(
        <CoordinateInput
          label="Coordinates"
          ra={defaultRa}
          dec={{ ...defaultDec, negative: false }}
          onChange={onChange}
          translations={defaultTranslations}
        />,
      );

      const select = screen.getByDisplayValue("+");
      expect(select).toBeInTheDocument();
    });

    it("should show negative sign for negative declination", () => {
      const onChange = jest.fn();

      render(
        <CoordinateInput
          label="Coordinates"
          ra={defaultRa}
          dec={{ ...defaultDec, negative: true }}
          onChange={onChange}
          translations={defaultTranslations}
        />,
      );

      const select = screen.getByDisplayValue("-");
      expect(select).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onChange when RA hours changes", async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <CoordinateInput
          label="Coordinates"
          ra={defaultRa}
          dec={defaultDec}
          onChange={onChange}
          translations={defaultTranslations}
        />,
      );

      const inputs = screen.getAllByRole("spinbutton");
      const hoursInput = inputs[0]; // First input is RA hours
      await user.clear(hoursInput);
      await user.type(hoursInput, "10");

      expect(onChange).toHaveBeenCalled();
    });

    it("should call onChange when Dec degrees changes", async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <CoordinateInput
          label="Coordinates"
          ra={defaultRa}
          dec={defaultDec}
          onChange={onChange}
          translations={defaultTranslations}
        />,
      );

      const inputs = screen.getAllByRole("spinbutton");
      const degreesInput = inputs[3]; // Fourth input is Dec degrees
      await user.clear(degreesInput);
      await user.type(degreesInput, "60");

      expect(onChange).toHaveBeenCalled();
    });

    it("should call onChange when sign changes", async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <CoordinateInput
          label="Coordinates"
          ra={defaultRa}
          dec={{ ...defaultDec, negative: false }}
          onChange={onChange}
          translations={defaultTranslations}
        />,
      );

      const signSelect = screen.getByDisplayValue("+");
      await user.selectOptions(signSelect, "-");

      expect(onChange).toHaveBeenCalledWith(
        defaultRa,
        expect.objectContaining({ negative: true }),
      );
    });
  });

  describe("Input Constraints", () => {
    it("should have max 23 for RA hours", () => {
      const onChange = jest.fn();

      render(
        <CoordinateInput
          label="Coordinates"
          ra={defaultRa}
          dec={defaultDec}
          onChange={onChange}
          translations={defaultTranslations}
        />,
      );

      const inputs = screen.getAllByRole("spinbutton");
      expect(inputs[0]).toHaveAttribute("max", "23");
    });

    it("should have max 59 for RA minutes", () => {
      const onChange = jest.fn();

      render(
        <CoordinateInput
          label="Coordinates"
          ra={defaultRa}
          dec={defaultDec}
          onChange={onChange}
          translations={defaultTranslations}
        />,
      );

      const inputs = screen.getAllByRole("spinbutton");
      expect(inputs[1]).toHaveAttribute("max", "59");
    });

    it("should have max 90 for Dec degrees", () => {
      const onChange = jest.fn();

      render(
        <CoordinateInput
          label="Coordinates"
          ra={defaultRa}
          dec={defaultDec}
          onChange={onChange}
          translations={defaultTranslations}
        />,
      );

      const inputs = screen.getAllByRole("spinbutton");
      expect(inputs[3]).toHaveAttribute("max", "90");
    });
  });
});
