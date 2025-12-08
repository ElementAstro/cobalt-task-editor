/**
 * Unit tests for PropertyInputs components
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  TextInput,
  NumberInput,
  SelectInput,
  BooleanInput,
} from "../PropertyInputs";
import { TooltipProvider } from "@/components/ui/tooltip";

// Helper to wrap component with required providers
const renderWithProviders = (component: React.ReactNode) => {
  return render(<TooltipProvider>{component}</TooltipProvider>);
};

describe("TextInput", () => {
  it("should render with label", () => {
    const onChange = jest.fn();
    renderWithProviders(
      <TextInput label="Test Label" value="" onChange={onChange} />,
    );

    expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
  });

  it("should display current value", () => {
    const onChange = jest.fn();
    renderWithProviders(
      <TextInput label="Test" value="Current Value" onChange={onChange} />,
    );

    expect(screen.getByDisplayValue("Current Value")).toBeInTheDocument();
  });

  it("should call onChange when typing", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderWithProviders(
      <TextInput label="Test" value="" onChange={onChange} />,
    );

    const input = screen.getByLabelText("Test");
    await user.type(input, "a");

    expect(onChange).toHaveBeenCalled();
  });

  it("should render as textarea when multiline is true", () => {
    const onChange = jest.fn();
    renderWithProviders(
      <TextInput label="Test" value="" onChange={onChange} multiline />,
    );

    expect(screen.getByRole("textbox")).toHaveAttribute("rows");
  });

  it("should show placeholder when provided", () => {
    const onChange = jest.fn();
    renderWithProviders(
      <TextInput
        label="Test"
        value=""
        onChange={onChange}
        placeholder="Enter text"
      />,
    );

    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });
});

describe("NumberInput", () => {
  it("should render with label", () => {
    const onChange = jest.fn();
    renderWithProviders(
      <NumberInput label="Number Label" value={0} onChange={onChange} />,
    );

    expect(screen.getByLabelText("Number Label")).toBeInTheDocument();
  });

  it("should display current value", () => {
    const onChange = jest.fn();
    renderWithProviders(
      <NumberInput label="Test" value={42} onChange={onChange} />,
    );

    expect(screen.getByDisplayValue("42")).toBeInTheDocument();
  });

  it("should call onChange when value changes", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderWithProviders(
      <NumberInput label="Test" value={0} onChange={onChange} />,
    );

    const input = screen.getByLabelText("Test");
    await user.clear(input);
    await user.type(input, "5");

    expect(onChange).toHaveBeenCalled();
  });

  it("should respect min value", () => {
    const onChange = jest.fn();
    renderWithProviders(
      <NumberInput label="Test" value={0} onChange={onChange} min={0} />,
    );

    const input = screen.getByLabelText("Test");
    expect(input).toHaveAttribute("min", "0");
  });

  it("should respect max value", () => {
    const onChange = jest.fn();
    renderWithProviders(
      <NumberInput label="Test" value={0} onChange={onChange} max={100} />,
    );

    const input = screen.getByLabelText("Test");
    expect(input).toHaveAttribute("max", "100");
  });

  it("should display unit when provided", () => {
    const onChange = jest.fn();
    renderWithProviders(
      <NumberInput label="Test" value={0} onChange={onChange} unit="seconds" />,
    );

    expect(screen.getByText("seconds")).toBeInTheDocument();
  });
});

describe("SelectInput", () => {
  const options = [
    { value: "opt1", label: "Option 1" },
    { value: "opt2", label: "Option 2" },
    { value: "opt3", label: "Option 3" },
  ];

  it("should render with label", () => {
    const onChange = jest.fn();
    renderWithProviders(
      <SelectInput
        label="Select Label"
        value="opt1"
        onChange={onChange}
        options={options}
      />,
    );

    expect(screen.getByText("Select Label")).toBeInTheDocument();
  });

  it("should display selected value", () => {
    const onChange = jest.fn();
    renderWithProviders(
      <SelectInput
        label="Test"
        value="opt1"
        onChange={onChange}
        options={options}
      />,
    );

    expect(screen.getByText("Option 1")).toBeInTheDocument();
  });

  it("should have combobox role", () => {
    const onChange = jest.fn();
    renderWithProviders(
      <SelectInput
        label="Test"
        value="opt1"
        onChange={onChange}
        options={options}
      />,
    );

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});

describe("BooleanInput", () => {
  it("should render with label", () => {
    const onChange = jest.fn();
    renderWithProviders(
      <BooleanInput label="Boolean Label" value={false} onChange={onChange} />,
    );

    expect(screen.getByText("Boolean Label")).toBeInTheDocument();
  });

  it("should have switch role", () => {
    const onChange = jest.fn();
    renderWithProviders(
      <BooleanInput label="Test" value={false} onChange={onChange} />,
    );

    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("should reflect current value", () => {
    const onChange = jest.fn();
    renderWithProviders(
      <BooleanInput label="Test" value={true} onChange={onChange} />,
    );

    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("should call onChange when clicked", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderWithProviders(
      <BooleanInput label="Test" value={false} onChange={onChange} />,
    );

    await user.click(screen.getByRole("switch"));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("should toggle value correctly", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderWithProviders(
      <BooleanInput label="Test" value={true} onChange={onChange} />,
    );

    await user.click(screen.getByRole("switch"));

    expect(onChange).toHaveBeenCalledWith(false);
  });
});
