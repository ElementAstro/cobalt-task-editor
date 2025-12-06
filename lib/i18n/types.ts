// i18n Types

export type Locale = "en" | "zh";

export interface Translations {
  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    duplicate: string;
    edit: string;
    add: string;
    remove: string;
    enable: string;
    disable: string;
    enabled: string;
    disabled: string;
    search: string;
    close: string;
    confirm: string;
    yes: string;
    no: string;
    ok: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    name: string;
    description: string;
    type: string;
    status: string;
    actions: string;
    settings: string;
    help: string;
    about: string;
    language: string;
    theme: string;
    dark: string;
    light: string;
    system: string;
    seconds: string;
    minutes: string;
    hours: string;
    days: string;
    degrees: string;
    arcminutes: string;
    back: string;
  };

  // Editor
  editor: {
    title: string;
    newSequence: string;
    import: string;
    export: string;
    undo: string;
    redo: string;
    unsavedChanges: string;
    confirmNew: string;
    confirmDelete: string;
    importSuccess: string;
    importError: string;
    exportSuccess: string;
    sequenceTitle: string;
    startInstructions: string;
    targetInstructions: string;
    endInstructions: string;
    noInstructions: string;
    dragHint: string;
    expandAll: string;
    collapseAll: string;
    moveUp: string;
    moveDown: string;
    copyItem: string;
    pasteItem: string;
    cutItem: string;
    insertBefore: string;
    insertAfter: string;
    insertInside: string;
    selectParent: string;
    copyType: string;
    itemActions: string;
    addCondition: string;
    addTrigger: string;
    // Editor mode
    normalMode: string;
    advancedMode: string;
    switchToNormal: string;
    switchToAdvanced: string;
    modeDescription: string;
    normalModeDesc: string;
    advancedModeDesc: string;
  };

  // Toolbox
  toolbox: {
    title: string;
    searchPlaceholder: string;
    items: string;
    conditions: string;
    triggers: string;
    noResults: string;
    doubleClickToAdd: string;
    dragToAdd: string;
    tapToAdd: string;
    done: string;
    itemAdded: string;
    conditionAdded: string;
    triggerAdded: string;
    selectContainerFirst: string;
    addCondition: string;
    addTrigger: string;
  };

  // Properties
  properties: {
    title: string;
    noSelection: string;
    selectItem: string;
    general: string;
    advanced: string;
    itemName: string;
    itemType: string;
    exposure: string;
    exposureTime: string;
    duration: string;
    gain: string;
    offset: string;
    binning: string;
    binningX: string;
    binningY: string;
    filter: string;
    imageType: string;
    count: string;
    totalCount: string;
    target: string;
    targetName: string;
    coordinates: string;
    ra: string;
    dec: string;
    rotation: string;
    positionAngle: string;
    altitude: string;
    targetAltitude: string;
    azimuth: string;
    errorBehavior: string;
    attempts: string;
    timeout: string;
    delay: string;
    enabled: string;
    annotation: string;
    text: string;
    script: string;
    temperature: string;
    targetTemperature: string;
    position: string;
    absolutePosition: string;
    relativePosition: string;
    mechanicalPosition: string;
    brightness: string;
    onOff: string;
    forceCalibration: string;
    iterations: string;
    completed: string;
    hours: string;
    minutes: string;
    seconds: string;
    comparator: string;
    waitDuration: string;
    afterExposures: string;
    amount: string;
    sampleSize: string;
    distanceArcMinutes: string;
    trackingMode: string;
    usbLimit: string;
    slope: string;
    intercept: string;
    switchIndex: string;
    switchValue: string;
    defaultValue: string;
    // Additional property labels
    onError: string;
    retryAttempts: string;
    rightAscension: string;
    declination: string;
    raHours: string;
    raMinutes: string;
    raSeconds: string;
    decDegrees: string;
    decMinutes: string;
    decSeconds: string;
    decSign: string;
    condition: string;
    trigger: string;
    item: string;
    category: string;
    readoutMode: string;
    mode: string;
    filePath: string;
    targetIllumination: string;
    offsetValue: string;
    inherited: string;
    // Execution and container properties
    executionStrategy: string;
    sequential: string;
    parallel: string;
    isExpanded: string;
    // Additional exposure properties
    exposureCount: string;
    totalExposureCount: string;
    // Horizon offset
    horizonOffset: string;
  };

  // Categories
  categories: {
    containers: string;
    camera: string;
    telescope: string;
    focuser: string;
    filterWheel: string;
    guider: string;
    rotator: string;
    dome: string;
    flatDevice: string;
    safety: string;
    switch: string;
    utility: string;
    autofocus: string;
    platesolving: string;
    imaging: string;
    connect: string;
  };

  // Conditions
  conditionTypes: {
    loop: string;
    loopWhile: string;
    loopUntil: string;
    loopFor: string;
    timeCondition: string;
    altitudeCondition: string;
    moonCondition: string;
    sunCondition: string;
    safetyCondition: string;
  };

  // Triggers
  triggerTypes: {
    afterEach: string;
    beforeEach: string;
    onError: string;
    onStart: string;
    onFinish: string;
    meridianFlip: string;
    autofocusTrigger: string;
    ditherTrigger: string;
  };

  // Status
  status: {
    created: string;
    running: string;
    finished: string;
    failed: string;
    skipped: string;
    disabled: string;
  };

  // Shortcuts
  shortcuts: {
    title: string;
    undo: string;
    redo: string;
    save: string;
    open: string;
    delete: string;
    duplicate: string;
    escape: string;
    copy: string;
    cut: string;
    paste: string;
    selectAll: string;
    expandAll: string;
    collapseAll: string;
  };

  // Messages
  messages: {
    deleteConfirm: string;
    unsavedWarning: string;
    importFailed: string;
    exportFailed: string;
    invalidFile: string;
    noItemSelected: string;
    operationSuccess: string;
    operationFailed: string;
  };

  // NINA Items (sequence instructions)
  ninaItems: {
    // Containers
    sequentialContainer: string;
    parallelContainer: string;
    deepSkyObject: string;
    // Camera
    coolCamera: string;
    warmCamera: string;
    setReadoutMode: string;
    dewHeater: string;
    setUSBLimit: string;
    // Imaging
    takeExposure: string;
    takeManyExposures: string;
    smartExposure: string;
    // Telescope
    slewToRaDec: string;
    slewToAltAz: string;
    parkScope: string;
    unparkScope: string;
    findHome: string;
    setTracking: string;
    // Focuser
    moveFocuserAbsolute: string;
    moveFocuserRelative: string;
    moveFocuserByTemperature: string;
    // Filter Wheel
    switchFilter: string;
    // Guider
    startGuiding: string;
    stopGuiding: string;
    dither: string;
    // Autofocus
    runAutofocus: string;
    // Platesolving
    center: string;
    centerAndRotate: string;
    // Rotator
    moveRotatorAbsolute: string;
    moveRotatorRelative: string;
    moveRotatorMechanical: string;
    // Dome
    openDomeShutter: string;
    closeDomeShutter: string;
    parkDome: string;
    synchronizeDome: string;
    enableDomeSync: string;
    disableDomeSync: string;
    slewDome: string;
    // Flat Device
    setBrightness: string;
    toggleLight: string;
    openCover: string;
    closeCover: string;
    // Safety Monitor
    waitUntilSafe: string;
    // Switch
    setSwitchValue: string;
    // Utility
    annotation: string;
    messageBox: string;
    externalScript: string;
    waitForTime: string;
    waitForDuration: string;
    waitForAltitude: string;
    waitForMoonAltitude: string;
    waitForSunAltitude: string;
    waitUntilAboveHorizon: string;
    saveSequence: string;
    // Connect
    connectEquipment: string;
    disconnectEquipment: string;
  };

  // NINA Conditions
  ninaConditions: {
    loop: string;
    loopUntilTime: string;
    loopForDuration: string;
    loopWhileAltitude: string;
    loopWhileAboveHorizon: string;
    loopWhileMoonAltitude: string;
    loopWhileSunAltitude: string;
    loopWhileMoonIllumination: string;
    loopWhileSafe: string;
  };

  // NINA Triggers
  ninaTriggers: {
    meridianFlip: string;
    ditherAfterExposures: string;
    restoreGuiding: string;
    autofocusAfterExposures: string;
    autofocusAfterFilterChange: string;
    autofocusAfterHFRIncrease: string;
    autofocusAfterTemperatureChange: string;
    autofocusAfterTime: string;
    centerAfterDrift: string;
  };

  // Image Types
  imageTypes: {
    light: string;
    dark: string;
    bias: string;
    flat: string;
    snapshot: string;
  };

  // Error Behaviors
  errorBehaviors: {
    continueOnError: string;
    abortOnError: string;
    skipInstructionSet: string;
    skipToEnd: string;
  };

  // Comparators
  comparators: {
    greaterOrEqual: string;
    lessOrEqual: string;
    greater: string;
    less: string;
    equal: string;
  };

  // Tracking Modes
  trackingModes: {
    sidereal: string;
    lunar: string;
    solar: string;
    king: string;
  };

  // Onboarding / Tour
  onboarding: {
    welcome: string;
    welcomeDesc: string;
    toolboxTitle: string;
    toolboxDesc: string;
    sequenceAreaTitle: string;
    sequenceAreaDesc: string;
    propertiesTitle: string;
    propertiesDesc: string;
    tabsTitle: string;
    tabsDesc: string;
    dragDropTitle: string;
    dragDropDesc: string;
    next: string;
    prev: string;
    skip: string;
    finish: string;
    stepOf: string;
    dontShowAgain: string;
    startTour: string;
  };

  // Accessibility
  a11y: {
    expandSection: string;
    collapseSection: string;
    dragHandle: string;
    openMenu: string;
    closePanel: string;
    selectedItem: string;
    requiredField: string;
  };

  // Sequence Management
  sequences: {
    title: string;
    newSequence: string;
    openSequence: string;
    closeSequence: string;
    duplicateSequence: string;
    deleteSequence: string;
    renameSequence: string;
    saveSequence: string;
    saveAs: string;
    noSequences: string;
    unsavedChanges: string;
    confirmClose: string;
    confirmDelete: string;
    activeSequence: string;
    modified: string;
    switchTo: string;
    closeOthers: string;
    closeAll: string;
  };

  // Templates
  templates: {
    title: string;
    useTemplate: string;
    saveAsTemplate: string;
    manageTemplates: string;
    templateName: string;
    templateDescription: string;
    createTemplate: string;
    deleteTemplate: string;
    editTemplate: string;
    noTemplates: string;
    defaultTemplates: string;
    customTemplates: string;
    importTemplate: string;
    exportTemplate: string;
    templateSaved: string;
    templateDeleted: string;
    templateApplied: string;
    // Default template names
    basicImaging: string;
    basicImagingDesc: string;
    multiTarget: string;
    multiTargetDesc: string;
    flatCapture: string;
    flatCaptureDesc: string;
    darkCapture: string;
    darkCaptureDesc: string;
    meridianMonitor: string;
    meridianMonitorDesc: string;
    autofocusDither: string;
    autofocusDitherDesc: string;
    calibrationSuite: string;
    calibrationSuiteDesc: string;
    planetarySession: string;
    planetarySessionDesc: string;
    mosaicSession: string;
    mosaicSessionDesc: string;
    startupRoutine: string;
    startupRoutineDesc: string;
    shutdownRoutine: string;
    shutdownRoutineDesc: string;
  };

  // Theme
  theme: {
    toggle: string;
    light: string;
    dark: string;
    system: string;
  };

  // Item Descriptions (for toolbox tooltips)
  itemDescriptions: {
    // Containers
    sequentialContainer: string;
    parallelContainer: string;
    deepSkyObject: string;
    // Camera
    coolCamera: string;
    warmCamera: string;
    setReadoutMode: string;
    dewHeater: string;
    setUSBLimit: string;
    // Imaging
    takeExposure: string;
    takeManyExposures: string;
    smartExposure: string;
    // Telescope
    slewToRaDec: string;
    slewToAltAz: string;
    parkScope: string;
    unparkScope: string;
    findHome: string;
    setTracking: string;
    // Focuser
    moveFocuserAbsolute: string;
    moveFocuserRelative: string;
    moveFocuserByTemperature: string;
    // Filter Wheel
    switchFilter: string;
    // Guider
    startGuiding: string;
    stopGuiding: string;
    dither: string;
    // Autofocus
    runAutofocus: string;
    // Platesolving
    center: string;
    centerAndRotate: string;
    // Rotator
    moveRotatorAbsolute: string;
    moveRotatorRelative: string;
    moveRotatorMechanical: string;
    // Dome
    openDomeShutter: string;
    closeDomeShutter: string;
    parkDome: string;
    synchronizeDome: string;
    enableDomeSync: string;
    disableDomeSync: string;
    slewDome: string;
    // Flat Device
    setBrightness: string;
    toggleLight: string;
    openCover: string;
    closeCover: string;
    // Safety Monitor
    waitUntilSafe: string;
    // Switch
    setSwitchValue: string;
    // Utility
    annotation: string;
    messageBox: string;
    externalScript: string;
    waitForTime: string;
    waitForDuration: string;
    waitForAltitude: string;
    waitForMoonAltitude: string;
    waitForSunAltitude: string;
    waitUntilAboveHorizon: string;
    saveSequence: string;
    // Connect
    connectEquipment: string;
    disconnectEquipment: string;
  };

  // Condition Descriptions
  conditionDescriptions: {
    loop: string;
    loopUntilTime: string;
    loopForDuration: string;
    loopWhileAltitude: string;
    loopWhileAboveHorizon: string;
    loopWhileMoonAltitude: string;
    loopWhileSunAltitude: string;
    loopWhileMoonIllumination: string;
    loopWhileSafe: string;
  };

  // Trigger Descriptions
  triggerDescriptions: {
    meridianFlip: string;
    ditherAfterExposures: string;
    restoreGuiding: string;
    autofocusAfterExposures: string;
    autofocusAfterFilterChange: string;
    autofocusAfterHFRIncrease: string;
    autofocusAfterTemperatureChange: string;
    autofocusAfterTime: string;
    centerAfterDrift: string;
  };

  // Workflow View
  workflow: {
    title: string;
    listView: string;
    workflowView: string;
    zoomIn: string;
    zoomOut: string;
    fitView: string;
    resetView: string;
    autoLayout: string;
    layoutSmart: string;
    layoutStandard: string;
    layoutCompact: string;
    layoutSpread: string;
    layoutHorizontal: string;
    autoRefresh: string;
    dragHint: string;
    emptyState: string;
    // New workflow keys
    align: string;
    alignLeft: string;
    alignCenter: string;
    alignRight: string;
    alignTop: string;
    alignMiddle: string;
    alignBottom: string;
    distribute: string;
    distributeH: string;
    distributeV: string;
    viewSettings: string;
    gridSnap: string;
    showMinimap: string;
    areaBackgrounds: string;
    shortcuts: string;
    selected: string;
    toggleEnabled: string;
    moveToStart: string;
    moveToTarget: string;
    moveToEnd: string;
  };

  // Simple Sequence Editor
  simple: {
    title: string;
    targets: string;
    exposures: string;
    addTarget: string;
    addExposure: string;
    noTargets: string;
    noExposures: string;
    selectTarget: string;
    targetOptions: string;
    autofocusOptions: string;
    startOptions: string;
    endOptions: string;
    progress: string;
    dither: string;
    ditherEvery: string;
    noFilter: string;
    reset: string;
    resetProgress: string;
    resetAll: string;
    resetAllProgress: string;
    // Target options
    slewToTarget: string;
    centerTarget: string;
    rotateTarget: string;
    startGuiding: string;
    // Autofocus options
    autoFocusOnStart: string;
    autoFocusOnFilterChange: string;
    autoFocusAfterTime: string;
    autoFocusAfterExposures: string;
    autoFocusAfterTempChange: string;
    autoFocusAfterHFRChange: string;
    // Start/End options
    coolCamera: string;
    warmCamera: string;
    unparkMount: string;
    parkMount: string;
    meridianFlip: string;
    downloadTime: string;
    // ETA
    totalDuration: string;
    estimatedEnd: string;
    totalExposures: string;
    remaining: string;
    exposureCount: string;
    // Import/Export
    importJSON: string;
    importCSV: string;
    exportJSON: string;
    exportCSV: string;
    exportXML: string;
    copyExposuresToAll: string;
    unsaved: string;
    // Mobile
    options: string;
    sequenceOptions: string;
  };
}

export interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}
