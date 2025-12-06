/**
 * Unit tests for i18n context
 * Tests locale management, translation functions, and NINA type mappings
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  I18nProvider, 
  useI18n, 
  getItemNameKey, 
  getConditionNameKey, 
  getTriggerNameKey,
  getCategoryKey,
  getItemDescriptionKey,
  getConditionDescriptionKey,
  getTriggerDescriptionKey,
} from '../context';

// Test component to access i18n context
function TestComponent() {
  const { locale, setLocale, t } = useI18n();
  
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="common-save">{t.common.save}</span>
      <span data-testid="editor-title">{t.editor.title}</span>
      <span data-testid="editor-normal-mode">{t.editor.normalMode}</span>
      <span data-testid="editor-advanced-mode">{t.editor.advancedMode}</span>
      <button onClick={() => setLocale('en')}>English</button>
      <button onClick={() => setLocale('zh')}>Chinese</button>
    </div>
  );
}

describe('I18nProvider', () => {
  describe('Default Locale', () => {
    it('should default to English locale', () => {
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
      
      expect(screen.getByTestId('locale').textContent).toBe('en');
    });

    it('should provide English translations by default', () => {
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
      
      expect(screen.getByTestId('common-save').textContent).toBe('Save');
      expect(screen.getByTestId('editor-title').textContent).toBe('NINA Sequence Editor');
    });
  });

  describe('Locale Switching', () => {
    it('should switch to Chinese locale', async () => {
      const user = userEvent.setup();
      
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
      
      await user.click(screen.getByText('Chinese'));
      
      expect(screen.getByTestId('locale').textContent).toBe('zh');
      expect(screen.getByTestId('common-save').textContent).toBe('保存');
    });

    it('should switch back to English locale', async () => {
      const user = userEvent.setup();
      
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
      
      // Switch to Chinese first
      await user.click(screen.getByText('Chinese'));
      expect(screen.getByTestId('locale').textContent).toBe('zh');
      
      // Switch back to English
      await user.click(screen.getByText('English'));
      expect(screen.getByTestId('locale').textContent).toBe('en');
      expect(screen.getByTestId('common-save').textContent).toBe('Save');
    });
  });

  describe('Editor Mode Translations', () => {
    it('should have normalMode translation in English', () => {
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
      
      expect(screen.getByTestId('editor-normal-mode').textContent).toBe('Normal');
    });

    it('should have advancedMode translation in English', () => {
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
      
      expect(screen.getByTestId('editor-advanced-mode').textContent).toBe('Advanced');
    });

    it('should have normalMode translation in Chinese', async () => {
      const user = userEvent.setup();
      
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
      
      await user.click(screen.getByText('Chinese'));
      
      expect(screen.getByTestId('editor-normal-mode').textContent).toBe('普通');
    });

    it('should have advancedMode translation in Chinese', async () => {
      const user = userEvent.setup();
      
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
      
      await user.click(screen.getByText('Chinese'));
      
      expect(screen.getByTestId('editor-advanced-mode').textContent).toBe('高级');
    });
  });
});

describe('NINA Type Key Mappings', () => {
  describe('getItemNameKey', () => {
    it('should return correct key for Sequential Container', () => {
      const key = getItemNameKey('NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer');
      expect(key).toBe('sequentialContainer');
    });

    it('should return correct key for Parallel Container', () => {
      const key = getItemNameKey('NINA.Sequencer.Container.ParallelContainer, NINA.Sequencer');
      expect(key).toBe('parallelContainer');
    });

    it('should return correct key for Deep Sky Object Container', () => {
      const key = getItemNameKey('NINA.Sequencer.Container.DeepSkyObjectContainer, NINA.Sequencer');
      expect(key).toBe('deepSkyObject');
    });

    it('should return correct key for Cool Camera', () => {
      const key = getItemNameKey('NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer');
      expect(key).toBe('coolCamera');
    });

    it('should return correct key for Take Exposure', () => {
      const key = getItemNameKey('NINA.Sequencer.SequenceItem.Imaging.TakeExposure, NINA.Sequencer');
      expect(key).toBe('takeExposure');
    });

    it('should return correct key for Take Many Exposures', () => {
      const key = getItemNameKey('NINA.Sequencer.SequenceItem.Imaging.TakeManyExposures, NINA.Sequencer');
      expect(key).toBe('takeManyExposures');
    });

    it('should return correct key for Start Guiding', () => {
      const key = getItemNameKey('NINA.Sequencer.SequenceItem.Guider.StartGuiding, NINA.Sequencer');
      expect(key).toBe('startGuiding');
    });

    it('should return correct key for Park Scope', () => {
      const key = getItemNameKey('NINA.Sequencer.SequenceItem.Telescope.ParkScope, NINA.Sequencer');
      expect(key).toBe('parkScope');
    });

    it('should return null for unknown type', () => {
      const key = getItemNameKey('Unknown.Type');
      expect(key).toBeNull();
    });
  });

  describe('getConditionNameKey', () => {
    it('should return correct key for Loop Condition', () => {
      const key = getConditionNameKey('NINA.Sequencer.Conditions.LoopCondition, NINA.Sequencer');
      expect(key).toBe('loop');
    });

    it('should return correct key for Time Condition', () => {
      const key = getConditionNameKey('NINA.Sequencer.Conditions.TimeCondition, NINA.Sequencer');
      expect(key).toBe('loopUntilTime');
    });

    it('should return correct key for Loop While Safe', () => {
      const key = getConditionNameKey('NINA.Sequencer.Conditions.SafetyMonitorCondition, NINA.Sequencer');
      expect(key).toBe('loopWhileSafe');
    });

    it('should return null for unknown condition type', () => {
      const key = getConditionNameKey('Unknown.Condition');
      expect(key).toBeNull();
    });
  });

  describe('getTriggerNameKey', () => {
    it('should return correct key for Meridian Flip Trigger', () => {
      const key = getTriggerNameKey('NINA.Sequencer.Trigger.MeridianFlip.MeridianFlipTrigger, NINA.Sequencer');
      expect(key).toBe('meridianFlip');
    });

    it('should return correct key for Dither After Exposures', () => {
      const key = getTriggerNameKey('NINA.Sequencer.Trigger.Guider.DitherAfterExposures, NINA.Sequencer');
      expect(key).toBe('ditherAfterExposures');
    });

    it('should return correct key for Autofocus After Exposures', () => {
      const key = getTriggerNameKey('NINA.Sequencer.Trigger.Autofocus.AutofocusAfterExposures, NINA.Sequencer');
      expect(key).toBe('autofocusAfterExposures');
    });

    it('should return null for unknown trigger type', () => {
      const key = getTriggerNameKey('Unknown.Trigger');
      expect(key).toBeNull();
    });
  });

  describe('getCategoryKey', () => {
    it('should return correct key for Container category', () => {
      const key = getCategoryKey('Container');
      expect(key).toBe('containers');
    });

    it('should return correct key for Camera category', () => {
      const key = getCategoryKey('Camera');
      expect(key).toBe('camera');
    });

    it('should return correct key for Telescope category', () => {
      const key = getCategoryKey('Telescope');
      expect(key).toBe('telescope');
    });

    it('should return correct key for Guider category', () => {
      const key = getCategoryKey('Guider');
      expect(key).toBe('guider');
    });

    it('should return null for unknown category', () => {
      const key = getCategoryKey('unknown');
      expect(key).toBeNull();
    });
  });

  describe('getItemDescriptionKey', () => {
    it('should return correct key for Cool Camera description', () => {
      const key = getItemDescriptionKey('NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer');
      expect(key).toBe('coolCamera');
    });

    it('should return correct key for Take Exposure description', () => {
      const key = getItemDescriptionKey('NINA.Sequencer.SequenceItem.Imaging.TakeExposure, NINA.Sequencer');
      expect(key).toBe('takeExposure');
    });

    it('should return null for unknown type', () => {
      const key = getItemDescriptionKey('Unknown.Type');
      expect(key).toBeNull();
    });
  });

  describe('getConditionDescriptionKey', () => {
    it('should return correct key for Loop Condition description', () => {
      const key = getConditionDescriptionKey('NINA.Sequencer.Conditions.LoopCondition, NINA.Sequencer');
      expect(key).toBe('loop');
    });

    it('should return null for unknown condition type', () => {
      const key = getConditionDescriptionKey('Unknown.Condition');
      expect(key).toBeNull();
    });
  });

  describe('getTriggerDescriptionKey', () => {
    it('should return correct key for Meridian Flip description', () => {
      const key = getTriggerDescriptionKey('NINA.Sequencer.Trigger.MeridianFlip.MeridianFlipTrigger, NINA.Sequencer');
      expect(key).toBe('meridianFlip');
    });

    it('should return null for unknown trigger type', () => {
      const key = getTriggerDescriptionKey('Unknown.Trigger');
      expect(key).toBeNull();
    });
  });
});

describe('Translation Completeness', () => {
  it('should have all editor mode translations in English', () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );
    
    // These should not be empty or undefined
    expect(screen.getByTestId('editor-normal-mode').textContent).toBeTruthy();
    expect(screen.getByTestId('editor-advanced-mode').textContent).toBeTruthy();
  });

  it('should have all editor mode translations in Chinese', async () => {
    const user = userEvent.setup();
    
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );
    
    await user.click(screen.getByText('Chinese'));
    
    // These should not be empty or undefined
    expect(screen.getByTestId('editor-normal-mode').textContent).toBeTruthy();
    expect(screen.getByTestId('editor-advanced-mode').textContent).toBeTruthy();
  });
});
