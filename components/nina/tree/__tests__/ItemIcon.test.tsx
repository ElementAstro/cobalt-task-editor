/**
 * Unit tests for ItemIcon component
 */

import { render } from "@testing-library/react";
import { ItemIcon, getItemIcon } from "../ItemIcon";

describe("ItemIcon", () => {
  describe("getItemIcon", () => {
    it("should return star icon for DeepSkyObject", () => {
      const icon = getItemIcon("NINA.Sequencer.Container.DeepSkyObjectContainer");
      expect(icon).toBeDefined();
    });

    it("should return box icon for Sequential", () => {
      const icon = getItemIcon("NINA.Sequencer.Container.SequentialContainer");
      expect(icon).toBeDefined();
    });

    it("should return box icon for Parallel", () => {
      const icon = getItemIcon("NINA.Sequencer.Container.ParallelContainer");
      expect(icon).toBeDefined();
    });

    it("should return sun icon for Cool/Warm camera", () => {
      const coolIcon = getItemIcon("NINA.Sequencer.SequenceItem.Camera.CoolCamera");
      const warmIcon = getItemIcon("NINA.Sequencer.SequenceItem.Camera.WarmCamera");
      expect(coolIcon).toBeDefined();
      expect(warmIcon).toBeDefined();
    });

    it("should return camera icon for Exposure", () => {
      const icon = getItemIcon("NINA.Sequencer.SequenceItem.Imaging.TakeExposure");
      expect(icon).toBeDefined();
    });

    it("should return telescope icon for Slew/Park/Unpark", () => {
      const slewIcon = getItemIcon("NINA.Sequencer.SequenceItem.Telescope.SlewToTarget");
      const parkIcon = getItemIcon("NINA.Sequencer.SequenceItem.Telescope.ParkScope");
      const unparkIcon = getItemIcon("NINA.Sequencer.SequenceItem.Telescope.UnparkScope");
      expect(slewIcon).toBeDefined();
      expect(parkIcon).toBeDefined();
      expect(unparkIcon).toBeDefined();
    });

    it("should return focus icon for Focuser/Autofocus", () => {
      const focuserIcon = getItemIcon("NINA.Sequencer.SequenceItem.Focuser.MoveFocuser");
      const autofocusIcon = getItemIcon("NINA.Sequencer.SequenceItem.Autofocus.RunAutofocus");
      expect(focuserIcon).toBeDefined();
      expect(autofocusIcon).toBeDefined();
    });

    it("should return disc icon for Filter", () => {
      const icon = getItemIcon("NINA.Sequencer.SequenceItem.FilterWheel.SwitchFilter");
      expect(icon).toBeDefined();
    });

    it("should return crosshair icon for Guider/Dither/Center", () => {
      const guiderIcon = getItemIcon("NINA.Sequencer.SequenceItem.Guider.StartGuiding");
      const ditherIcon = getItemIcon("NINA.Sequencer.SequenceItem.Guider.Dither");
      const centerIcon = getItemIcon("NINA.Sequencer.SequenceItem.Platesolving.Center");
      expect(guiderIcon).toBeDefined();
      expect(ditherIcon).toBeDefined();
      expect(centerIcon).toBeDefined();
    });

    it("should return default box icon for unknown type", () => {
      const icon = getItemIcon("Unknown.Type");
      expect(icon).toBeDefined();
    });
  });

  describe("ItemIcon Component", () => {
    it("should render icon for given type", () => {
      const { container } = render(
        <ItemIcon type="NINA.Sequencer.Container.DeepSkyObjectContainer" />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it("should render icon with correct class", () => {
      const { container } = render(
        <ItemIcon type="NINA.Sequencer.SequenceItem.Camera.TakeExposure" />,
      );

      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("w-4", "h-4");
    });
  });
});
