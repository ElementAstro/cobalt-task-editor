'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, startTransition } from 'react';
import type { Locale, Translations, I18nContextValue } from './types';
import { en } from './locales/en';
import { zh } from './locales/zh';

// Translation map
const translations: Record<Locale, Translations> = {
  en,
  zh,
};

// Default context value
const defaultContext: I18nContextValue = {
  locale: 'en',
  setLocale: () => {},
  t: en,
};

// Create context
const I18nContext = createContext<I18nContextValue>(defaultContext);

// Storage key
const LOCALE_STORAGE_KEY = 'nina-editor-locale';

// Detect browser locale
function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('zh')) return 'zh';
  return 'en';
}

// Provider component
interface I18nProviderProps {
  children: React.ReactNode;
  defaultLocale?: Locale;
}

export function I18nProvider({ children, defaultLocale }: I18nProviderProps) {
  const initialLocale: Locale = defaultLocale && translations[defaultLocale] ? defaultLocale : 'en';
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    const resolvedDefault = defaultLocale && translations[defaultLocale] ? defaultLocale : detectBrowserLocale();
    const nextLocale = stored && translations[stored] ? stored : resolvedDefault;

    startTransition(() => {
      setLocaleState((prev) => (prev === nextLocale ? prev : nextLocale));
    });
  }, [defaultLocale]);

  const value: I18nContextValue = {
    locale,
    setLocale,
    t: translations[locale],
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook to use i18n
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Hook to get just translations
export function useTranslations(): Translations {
  return useI18n().t;
}

// Hook to get locale
export function useLocale(): [Locale, (locale: Locale) => void] {
  const { locale, setLocale } = useI18n();
  return [locale, setLocale];
}

// Available locales
export const availableLocales: { code: Locale; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '简体中文' },
];

// Utility function to interpolate variables in translation strings
export function interpolate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => variables[key] || `{${key}}`);
}

// Helper function to translate NINA item names based on type
export function getItemNameKey(type: string): keyof Translations['ninaItems'] | null {
  const typeMap: Record<string, keyof Translations['ninaItems']> = {
    'NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer': 'sequentialContainer',
    'NINA.Sequencer.Container.ParallelContainer, NINA.Sequencer': 'parallelContainer',
    'NINA.Sequencer.Container.DeepSkyObjectContainer, NINA.Sequencer': 'deepSkyObject',
    'NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer': 'coolCamera',
    'NINA.Sequencer.SequenceItem.Camera.WarmCamera, NINA.Sequencer': 'warmCamera',
    'NINA.Sequencer.SequenceItem.Camera.SetReadoutMode, NINA.Sequencer': 'setReadoutMode',
    'NINA.Sequencer.SequenceItem.Camera.DewHeater, NINA.Sequencer': 'dewHeater',
    'NINA.Sequencer.SequenceItem.Camera.SetUSBLimit, NINA.Sequencer': 'setUSBLimit',
    'NINA.Sequencer.SequenceItem.Imaging.TakeExposure, NINA.Sequencer': 'takeExposure',
    'NINA.Sequencer.SequenceItem.Imaging.TakeManyExposures, NINA.Sequencer': 'takeManyExposures',
    'NINA.Sequencer.SequenceItem.Imaging.SmartExposure, NINA.Sequencer': 'smartExposure',
    'NINA.Sequencer.SequenceItem.Telescope.SlewScopeToRaDec, NINA.Sequencer': 'slewToRaDec',
    'NINA.Sequencer.SequenceItem.Telescope.SlewScopeToAltAz, NINA.Sequencer': 'slewToAltAz',
    'NINA.Sequencer.SequenceItem.Telescope.ParkScope, NINA.Sequencer': 'parkScope',
    'NINA.Sequencer.SequenceItem.Telescope.UnparkScope, NINA.Sequencer': 'unparkScope',
    'NINA.Sequencer.SequenceItem.Telescope.FindHome, NINA.Sequencer': 'findHome',
    'NINA.Sequencer.SequenceItem.Telescope.SetTracking, NINA.Sequencer': 'setTracking',
    'NINA.Sequencer.SequenceItem.Focuser.MoveFocuserAbsolute, NINA.Sequencer': 'moveFocuserAbsolute',
    'NINA.Sequencer.SequenceItem.Focuser.MoveFocuserRelative, NINA.Sequencer': 'moveFocuserRelative',
    'NINA.Sequencer.SequenceItem.Focuser.MoveFocuserByTemperature, NINA.Sequencer': 'moveFocuserByTemperature',
    'NINA.Sequencer.SequenceItem.FilterWheel.SwitchFilter, NINA.Sequencer': 'switchFilter',
    'NINA.Sequencer.SequenceItem.Guider.StartGuiding, NINA.Sequencer': 'startGuiding',
    'NINA.Sequencer.SequenceItem.Guider.StopGuiding, NINA.Sequencer': 'stopGuiding',
    'NINA.Sequencer.SequenceItem.Guider.Dither, NINA.Sequencer': 'dither',
    'NINA.Sequencer.SequenceItem.Autofocus.RunAutofocus, NINA.Sequencer': 'runAutofocus',
    'NINA.Sequencer.SequenceItem.Platesolving.Center, NINA.Sequencer': 'center',
    'NINA.Sequencer.SequenceItem.Platesolving.CenterAndRotate, NINA.Sequencer': 'centerAndRotate',
    'NINA.Sequencer.SequenceItem.Rotator.MoveRotatorAbsolute, NINA.Sequencer': 'moveRotatorAbsolute',
    'NINA.Sequencer.SequenceItem.Rotator.MoveRotatorRelative, NINA.Sequencer': 'moveRotatorRelative',
    'NINA.Sequencer.SequenceItem.Rotator.MoveRotatorMechanical, NINA.Sequencer': 'moveRotatorMechanical',
    'NINA.Sequencer.SequenceItem.Dome.OpenDomeShutter, NINA.Sequencer': 'openDomeShutter',
    'NINA.Sequencer.SequenceItem.Dome.CloseDomeShutter, NINA.Sequencer': 'closeDomeShutter',
    'NINA.Sequencer.SequenceItem.Dome.ParkDome, NINA.Sequencer': 'parkDome',
    'NINA.Sequencer.SequenceItem.Dome.SynchronizeDome, NINA.Sequencer': 'synchronizeDome',
    'NINA.Sequencer.SequenceItem.Dome.EnableDomeSynchronization, NINA.Sequencer': 'enableDomeSync',
    'NINA.Sequencer.SequenceItem.Dome.DisableDomeSynchronization, NINA.Sequencer': 'disableDomeSync',
    'NINA.Sequencer.SequenceItem.Dome.SlewDomeAbsolute, NINA.Sequencer': 'slewDome',
    'NINA.Sequencer.SequenceItem.FlatDevice.SetBrightness, NINA.Sequencer': 'setBrightness',
    'NINA.Sequencer.SequenceItem.FlatDevice.ToggleLight, NINA.Sequencer': 'toggleLight',
    'NINA.Sequencer.SequenceItem.FlatDevice.OpenCover, NINA.Sequencer': 'openCover',
    'NINA.Sequencer.SequenceItem.FlatDevice.CloseCover, NINA.Sequencer': 'closeCover',
    'NINA.Sequencer.SequenceItem.SafetyMonitor.WaitUntilSafe, NINA.Sequencer': 'waitUntilSafe',
    'NINA.Sequencer.SequenceItem.Switch.SetSwitchValue, NINA.Sequencer': 'setSwitchValue',
    'NINA.Sequencer.SequenceItem.Utility.Annotation, NINA.Sequencer': 'annotation',
    'NINA.Sequencer.SequenceItem.Utility.MessageBox, NINA.Sequencer': 'messageBox',
    'NINA.Sequencer.SequenceItem.Utility.ExternalScript, NINA.Sequencer': 'externalScript',
    'NINA.Sequencer.SequenceItem.Utility.WaitForTime, NINA.Sequencer': 'waitForTime',
    'NINA.Sequencer.SequenceItem.Utility.WaitForTimeSpan, NINA.Sequencer': 'waitForDuration',
    'NINA.Sequencer.SequenceItem.Utility.WaitForAltitude, NINA.Sequencer': 'waitForAltitude',
    'NINA.Sequencer.SequenceItem.Utility.WaitForMoonAltitude, NINA.Sequencer': 'waitForMoonAltitude',
    'NINA.Sequencer.SequenceItem.Utility.WaitForSunAltitude, NINA.Sequencer': 'waitForSunAltitude',
    'NINA.Sequencer.SequenceItem.Utility.WaitUntilAboveHorizon, NINA.Sequencer': 'waitUntilAboveHorizon',
    'NINA.Sequencer.SequenceItem.Utility.SaveSequence, NINA.Sequencer': 'saveSequence',
    'NINA.Sequencer.SequenceItem.Connect.ConnectEquipment, NINA.Sequencer': 'connectEquipment',
    'NINA.Sequencer.SequenceItem.Connect.DisconnectEquipment, NINA.Sequencer': 'disconnectEquipment',
  };
  return typeMap[type] || null;
}

// Helper function to translate NINA condition names
export function getConditionNameKey(type: string): keyof Translations['ninaConditions'] | null {
  const typeMap: Record<string, keyof Translations['ninaConditions']> = {
    'NINA.Sequencer.Conditions.LoopCondition, NINA.Sequencer': 'loop',
    'NINA.Sequencer.Conditions.TimeCondition, NINA.Sequencer': 'loopUntilTime',
    'NINA.Sequencer.Conditions.TimeSpanCondition, NINA.Sequencer': 'loopForDuration',
    'NINA.Sequencer.Conditions.AltitudeCondition, NINA.Sequencer': 'loopWhileAltitude',
    'NINA.Sequencer.Conditions.AboveHorizonCondition, NINA.Sequencer': 'loopWhileAboveHorizon',
    'NINA.Sequencer.Conditions.MoonAltitudeCondition, NINA.Sequencer': 'loopWhileMoonAltitude',
    'NINA.Sequencer.Conditions.SunAltitudeCondition, NINA.Sequencer': 'loopWhileSunAltitude',
    'NINA.Sequencer.Conditions.MoonIlluminationCondition, NINA.Sequencer': 'loopWhileMoonIllumination',
    'NINA.Sequencer.Conditions.SafetyMonitorCondition, NINA.Sequencer': 'loopWhileSafe',
  };
  return typeMap[type] || null;
}

// Helper function to translate NINA trigger names
export function getTriggerNameKey(type: string): keyof Translations['ninaTriggers'] | null {
  const typeMap: Record<string, keyof Translations['ninaTriggers']> = {
    'NINA.Sequencer.Trigger.MeridianFlip.MeridianFlipTrigger, NINA.Sequencer': 'meridianFlip',
    'NINA.Sequencer.Trigger.Guider.DitherAfterExposures, NINA.Sequencer': 'ditherAfterExposures',
    'NINA.Sequencer.Trigger.Guider.RestoreGuiding, NINA.Sequencer': 'restoreGuiding',
    'NINA.Sequencer.Trigger.Autofocus.AutofocusAfterExposures, NINA.Sequencer': 'autofocusAfterExposures',
    'NINA.Sequencer.Trigger.Autofocus.AutofocusAfterFilterChange, NINA.Sequencer': 'autofocusAfterFilterChange',
    'NINA.Sequencer.Trigger.Autofocus.AutofocusAfterHFRIncreaseTrigger, NINA.Sequencer': 'autofocusAfterHFRIncrease',
    'NINA.Sequencer.Trigger.Autofocus.AutofocusAfterTemperatureChangeTrigger, NINA.Sequencer': 'autofocusAfterTemperatureChange',
    'NINA.Sequencer.Trigger.Autofocus.AutofocusAfterTimeTrigger, NINA.Sequencer': 'autofocusAfterTime',
    'NINA.Sequencer.Trigger.Platesolving.CenterAfterDriftTrigger, NINA.Sequencer': 'centerAfterDrift',
  };
  return typeMap[type] || null;
}

// Helper function to translate category names
export function getCategoryKey(category: string): keyof Translations['categories'] | null {
  const categoryMap: Record<string, keyof Translations['categories']> = {
    'Container': 'containers',
    'Camera': 'camera',
    'Telescope': 'telescope',
    'Focuser': 'focuser',
    'Filter Wheel': 'filterWheel',
    'Guider': 'guider',
    'Rotator': 'rotator',
    'Dome': 'dome',
    'Flat Device': 'flatDevice',
    'Safety Monitor': 'safety',
    'Switch': 'switch',
    'Utility': 'utility',
    'Autofocus': 'autofocus',
    'Platesolving': 'platesolving',
    'Imaging': 'imaging',
    'Connect': 'connect',
  };
  return categoryMap[category] || null;
}

// Helper function to get item description key
export function getItemDescriptionKey(type: string): keyof Translations['itemDescriptions'] | null {
  const typeMap: Record<string, keyof Translations['itemDescriptions']> = {
    'NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer': 'sequentialContainer',
    'NINA.Sequencer.Container.ParallelContainer, NINA.Sequencer': 'parallelContainer',
    'NINA.Sequencer.Container.DeepSkyObjectContainer, NINA.Sequencer': 'deepSkyObject',
    'NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer': 'coolCamera',
    'NINA.Sequencer.SequenceItem.Camera.WarmCamera, NINA.Sequencer': 'warmCamera',
    'NINA.Sequencer.SequenceItem.Camera.SetReadoutMode, NINA.Sequencer': 'setReadoutMode',
    'NINA.Sequencer.SequenceItem.Camera.DewHeater, NINA.Sequencer': 'dewHeater',
    'NINA.Sequencer.SequenceItem.Camera.SetUSBLimit, NINA.Sequencer': 'setUSBLimit',
    'NINA.Sequencer.SequenceItem.Imaging.TakeExposure, NINA.Sequencer': 'takeExposure',
    'NINA.Sequencer.SequenceItem.Imaging.TakeManyExposures, NINA.Sequencer': 'takeManyExposures',
    'NINA.Sequencer.SequenceItem.Imaging.SmartExposure, NINA.Sequencer': 'smartExposure',
    'NINA.Sequencer.SequenceItem.Telescope.SlewScopeToRaDec, NINA.Sequencer': 'slewToRaDec',
    'NINA.Sequencer.SequenceItem.Telescope.SlewScopeToAltAz, NINA.Sequencer': 'slewToAltAz',
    'NINA.Sequencer.SequenceItem.Telescope.ParkScope, NINA.Sequencer': 'parkScope',
    'NINA.Sequencer.SequenceItem.Telescope.UnparkScope, NINA.Sequencer': 'unparkScope',
    'NINA.Sequencer.SequenceItem.Telescope.FindHome, NINA.Sequencer': 'findHome',
    'NINA.Sequencer.SequenceItem.Telescope.SetTracking, NINA.Sequencer': 'setTracking',
    'NINA.Sequencer.SequenceItem.Focuser.MoveFocuserAbsolute, NINA.Sequencer': 'moveFocuserAbsolute',
    'NINA.Sequencer.SequenceItem.Focuser.MoveFocuserRelative, NINA.Sequencer': 'moveFocuserRelative',
    'NINA.Sequencer.SequenceItem.Focuser.MoveFocuserByTemperature, NINA.Sequencer': 'moveFocuserByTemperature',
    'NINA.Sequencer.SequenceItem.FilterWheel.SwitchFilter, NINA.Sequencer': 'switchFilter',
    'NINA.Sequencer.SequenceItem.Guider.StartGuiding, NINA.Sequencer': 'startGuiding',
    'NINA.Sequencer.SequenceItem.Guider.StopGuiding, NINA.Sequencer': 'stopGuiding',
    'NINA.Sequencer.SequenceItem.Guider.Dither, NINA.Sequencer': 'dither',
    'NINA.Sequencer.SequenceItem.Autofocus.RunAutofocus, NINA.Sequencer': 'runAutofocus',
    'NINA.Sequencer.SequenceItem.Platesolving.Center, NINA.Sequencer': 'center',
    'NINA.Sequencer.SequenceItem.Platesolving.CenterAndRotate, NINA.Sequencer': 'centerAndRotate',
    'NINA.Sequencer.SequenceItem.Rotator.MoveRotatorAbsolute, NINA.Sequencer': 'moveRotatorAbsolute',
    'NINA.Sequencer.SequenceItem.Rotator.MoveRotatorRelative, NINA.Sequencer': 'moveRotatorRelative',
    'NINA.Sequencer.SequenceItem.Rotator.MoveRotatorMechanical, NINA.Sequencer': 'moveRotatorMechanical',
    'NINA.Sequencer.SequenceItem.Dome.OpenDomeShutter, NINA.Sequencer': 'openDomeShutter',
    'NINA.Sequencer.SequenceItem.Dome.CloseDomeShutter, NINA.Sequencer': 'closeDomeShutter',
    'NINA.Sequencer.SequenceItem.Dome.ParkDome, NINA.Sequencer': 'parkDome',
    'NINA.Sequencer.SequenceItem.Dome.SynchronizeDome, NINA.Sequencer': 'synchronizeDome',
    'NINA.Sequencer.SequenceItem.Dome.EnableDomeSynchronization, NINA.Sequencer': 'enableDomeSync',
    'NINA.Sequencer.SequenceItem.Dome.DisableDomeSynchronization, NINA.Sequencer': 'disableDomeSync',
    'NINA.Sequencer.SequenceItem.Dome.SlewDomeAbsolute, NINA.Sequencer': 'slewDome',
    'NINA.Sequencer.SequenceItem.FlatDevice.SetBrightness, NINA.Sequencer': 'setBrightness',
    'NINA.Sequencer.SequenceItem.FlatDevice.ToggleLight, NINA.Sequencer': 'toggleLight',
    'NINA.Sequencer.SequenceItem.FlatDevice.OpenCover, NINA.Sequencer': 'openCover',
    'NINA.Sequencer.SequenceItem.FlatDevice.CloseCover, NINA.Sequencer': 'closeCover',
    'NINA.Sequencer.SequenceItem.SafetyMonitor.WaitUntilSafe, NINA.Sequencer': 'waitUntilSafe',
    'NINA.Sequencer.SequenceItem.Switch.SetSwitchValue, NINA.Sequencer': 'setSwitchValue',
    'NINA.Sequencer.SequenceItem.Utility.Annotation, NINA.Sequencer': 'annotation',
    'NINA.Sequencer.SequenceItem.Utility.MessageBox, NINA.Sequencer': 'messageBox',
    'NINA.Sequencer.SequenceItem.Utility.ExternalScript, NINA.Sequencer': 'externalScript',
    'NINA.Sequencer.SequenceItem.Utility.WaitForTime, NINA.Sequencer': 'waitForTime',
    'NINA.Sequencer.SequenceItem.Utility.WaitForTimeSpan, NINA.Sequencer': 'waitForDuration',
    'NINA.Sequencer.SequenceItem.Utility.WaitForAltitude, NINA.Sequencer': 'waitForAltitude',
    'NINA.Sequencer.SequenceItem.Utility.WaitForMoonAltitude, NINA.Sequencer': 'waitForMoonAltitude',
    'NINA.Sequencer.SequenceItem.Utility.WaitForSunAltitude, NINA.Sequencer': 'waitForSunAltitude',
    'NINA.Sequencer.SequenceItem.Utility.WaitUntilAboveHorizon, NINA.Sequencer': 'waitUntilAboveHorizon',
    'NINA.Sequencer.SequenceItem.Utility.SaveSequence, NINA.Sequencer': 'saveSequence',
    'NINA.Sequencer.SequenceItem.Connect.ConnectEquipment, NINA.Sequencer': 'connectEquipment',
    'NINA.Sequencer.SequenceItem.Connect.DisconnectEquipment, NINA.Sequencer': 'disconnectEquipment',
  };
  return typeMap[type] || null;
}

// Helper function to get condition description key
export function getConditionDescriptionKey(type: string): keyof Translations['conditionDescriptions'] | null {
  const typeMap: Record<string, keyof Translations['conditionDescriptions']> = {
    'NINA.Sequencer.Conditions.LoopCondition, NINA.Sequencer': 'loop',
    'NINA.Sequencer.Conditions.TimeCondition, NINA.Sequencer': 'loopUntilTime',
    'NINA.Sequencer.Conditions.TimeSpanCondition, NINA.Sequencer': 'loopForDuration',
    'NINA.Sequencer.Conditions.AltitudeCondition, NINA.Sequencer': 'loopWhileAltitude',
    'NINA.Sequencer.Conditions.AboveHorizonCondition, NINA.Sequencer': 'loopWhileAboveHorizon',
    'NINA.Sequencer.Conditions.MoonAltitudeCondition, NINA.Sequencer': 'loopWhileMoonAltitude',
    'NINA.Sequencer.Conditions.SunAltitudeCondition, NINA.Sequencer': 'loopWhileSunAltitude',
    'NINA.Sequencer.Conditions.MoonIlluminationCondition, NINA.Sequencer': 'loopWhileMoonIllumination',
    'NINA.Sequencer.Conditions.SafetyMonitorCondition, NINA.Sequencer': 'loopWhileSafe',
  };
  return typeMap[type] || null;
}

// Helper function to get trigger description key
export function getTriggerDescriptionKey(type: string): keyof Translations['triggerDescriptions'] | null {
  const typeMap: Record<string, keyof Translations['triggerDescriptions']> = {
    'NINA.Sequencer.Trigger.MeridianFlip.MeridianFlipTrigger, NINA.Sequencer': 'meridianFlip',
    'NINA.Sequencer.Trigger.Guider.DitherAfterExposures, NINA.Sequencer': 'ditherAfterExposures',
    'NINA.Sequencer.Trigger.Guider.RestoreGuiding, NINA.Sequencer': 'restoreGuiding',
    'NINA.Sequencer.Trigger.Autofocus.AutofocusAfterExposures, NINA.Sequencer': 'autofocusAfterExposures',
    'NINA.Sequencer.Trigger.Autofocus.AutofocusAfterFilterChange, NINA.Sequencer': 'autofocusAfterFilterChange',
    'NINA.Sequencer.Trigger.Autofocus.AutofocusAfterHFRIncreaseTrigger, NINA.Sequencer': 'autofocusAfterHFRIncrease',
    'NINA.Sequencer.Trigger.Autofocus.AutofocusAfterTemperatureChangeTrigger, NINA.Sequencer': 'autofocusAfterTemperatureChange',
    'NINA.Sequencer.Trigger.Autofocus.AutofocusAfterTimeTrigger, NINA.Sequencer': 'autofocusAfterTime',
    'NINA.Sequencer.Trigger.Platesolving.CenterAfterDriftTrigger, NINA.Sequencer': 'centerAfterDrift',
  };
  return typeMap[type] || null;
}
