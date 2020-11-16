var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');
var glob = require('glob');
var path = require('path');

var suites = {
    // The tests on Travis are run individually to parallelize
    // them. Therefore, we mention the complete directory
    // in 'full'.
    full: [
      'protractor/*.js',
      'protractor_desktop/*.js'
    ],

    // Unfortunately, adding more than one file to a test suite results in
    // severe instability as of Chromedriver 2.38 (Chrome 66).
    accessibility: [
      'protractor/accessibility.js'
    ],

    additionalEditorFeatures: [
      'protractor_desktop/additionalEditorFeatures.js'
    ],

    additionalPlayerFeatures: [
      'protractor_desktop/additionalPlayerFeatures.js'
    ],

    adminPage: [
      'protractor_desktop/adminTabFeatures.js'
    ],

    classroomPage: [
      'protractor_desktop/classroomPage.js'
    ],

    classroomPageFileUploadFeatures: [
      'protractor_desktop/classroomPageFileUploadFeatures.js'
    ],

    collections: [
      'protractor_desktop/collections.js'
    ],

    contributorDashboard: [
      'protractor_desktop/contributorDashboard.js'
    ],

    coreEditorAndPlayerFeatures: [
      'protractor_desktop/coreEditorAndPlayerFeatures.js'
    ],

    creatorDashboard: [
      'protractor_desktop/creatorDashboard.js'
    ],

    embedding: [
      'protractor_desktop/embedding.js'
    ],

    explorationImprovementsTab: [
      'protractor_desktop/explorationImprovementsTab.js'
    ],

    explorationFeedbackTab: [
      'protractor_desktop/explorationFeedbackTab.js'
    ],

    explorationHistoryTab: [
      'protractor_desktop/explorationHistoryTab.js'
    ],

    explorationStatisticsTab: [
      'protractor_desktop/explorationStatisticsTab.js'
    ],

    explorationTranslationTab: [
      'protractor_desktop/explorationTranslationTab.js'
    ],

    extensions: [
      'protractor_desktop/extensions.js'
    ],

    featureGating: [
      'protractor/featureGatingFlow.js'
    ],

    fileUploadFeatures: [
      'protractor_desktop/voiceoverUploadFeatures.js'
    ],

    fileUploadExtensions: [
      'protractor_desktop/fileUploadExtensions.js'
    ],

    learnerDashboard: [
      'protractor_desktop/learnerDashboard.js'
    ],

    learner: [
      'protractor/learnerFlow.js'
    ],

    library: [
      'protractor/libraryFlow.js'
    ],

    navigation: [
      'protractor_desktop/navigation.js'
    ],

    playVoiceovers: [
      'protractor_desktop/playVoiceovers.js'
    ],

    preferences: [
      'protractor_desktop/preferences.js'
    ],

    profileFeatures: [
      'protractor_desktop/profileFeatures.js'
    ],

    profileMenu: [
      'protractor/profileMenuFlow.js'
    ],

    publication: [
      'protractor_desktop/publicationAndLibrary.js'
    ],

    subscriptions: [
      'protractor/subscriptionsFlow.js'
    ],

    topicAndStoryEditor: [
      'protractor_desktop/topicAndStoryEditor.js'
    ],

    topicAndStoryEditorFileUploadFeatures: [
      'protractor_desktop/topicAndStoryEditorFileUploadFeatures.js'
    ],

    topicsAndSkillsDashboard: [
      'protractor_desktop/topicsAndSkillsDashboard.js'
    ],

    skillEditor: [
      'protractor_desktop/skillEditor.js'
    ],

    topicAndStoryViewer: [
      'protractor_desktop/topicAndStoryViewer.js'
    ],

    users: [
      'protractor_desktop/userJourneys.js',
    ],

    wipeout: [
      'protractor_desktop/wipeout.js',
    ]
  };

// A reference configuration file.
exports.config = {
  // ----- How to setup Selenium -----
  //
  // There are three ways to specify how to use Selenium. Specify one of the
  // following:
  //
  // 1. seleniumServerJar - to start Selenium Standalone locally.
  // 2. seleniumAddress - to connect to a Selenium server which is already
  //    running.
  // 3. sauceUser/sauceKey - to use remote Selenium servers via SauceLabs.
  //
  // If the chromeOnly option is specified, no Selenium server will be started,
  // and chromeDriver will be used directly (from the location specified in
  // chromeDriver).

  // The location of the selenium standalone server .jar file, relative
  // to the location of this config. If no other method of starting selenium
  // is found, this will default to
  // node_modules/protractor/selenium/selenium-server...
  seleniumServerJar: null,
  // The port to start the selenium server on, or null if the server should
  // find its own unused port.
  seleniumPort: null,
  // Chromedriver location is used to help the selenium standalone server
  // find chromedriver. This will be passed to the selenium jar as
  // the system property webdriver.chrome.driver. If null, selenium will
  // attempt to find chromedriver using PATH.
  chromeDriver: './selenium/chromedriver',
  // If true, only chromedriver will be started, not a standalone selenium.
  // Tests for browsers other than chrome will not run.
  chromeOnly: false,
  // Additional command line options to pass to selenium. For example,
  // if you need to change the browser timeout, use
  // seleniumArgs: ['-browserTimeout=60'],
  seleniumArgs: [],
  beforeLaunch: function() {
    Object.keys(suites).forEach(function(key) {
      var patterns = suites[key];
      for (var pattern of patterns) {
        var fullPattern = path.resolve(__dirname, pattern);
        var files = glob.sync(fullPattern);
        if (files.length == 0) {
          var errorMessage = '';
          if (glob.hasMagic(pattern)) {
            errorMessage = 'There are no files with the following pattern: ' + (
              pattern);
          } else {
            errorMessage = pattern + ' does not exist.';
          }
          throw new Error(errorMessage)
        }
      }
    });
  },
  // If sauceUser and sauceKey are specified, seleniumServerJar will be ignored.
  // The tests will be run remotely using SauceLabs.
  sauceUser: null,
  sauceKey: null,

  // The address of a running selenium server. If specified, Protractor will
  // connect to an already running instance of selenium. This usually looks like
  // seleniumAddress: 'http://localhost:4444/wd/hub'
  seleniumAddress: 'http://localhost:4444/wd/hub',

  // The timeout for each script run on the browser. This should be longer
  // than the maximum time your application needs to stabilize between tasks.
  // (Note that the hint tooltip has a 60-second timeout).
  allScriptsTimeout: 180000,


  // How long to wait for a page to load.
  getPageTimeout: 60000,

  // ----- What tests to run -----
  //
  // When run without a command line parameter, all suites will run. If run
  // with --suite=smoke, only the patterns matched by that suite will run.
  suites: suites,

  // ----- Capabilities to be passed to the webdriver instance ----
  //
  // For a full list of available capabilities, see
  // https://code.google.com/p/selenium/wiki/DesiredCapabilities
  // and
  // https://code.google.com/p/selenium/source/browse/javascript/webdriver/capabilities.js
  capabilities: {
    browserName: 'chrome',
    'goog:chromeOptions': {
      // Chromedriver versions 75+ sets w3c mode to true by default.
      // see https://chromedriver.storage.googleapis.com/75.0.3770.8/notes.txt
      // This causes certain legacy APIs to fail eg. sendKeysToActiveElement.
      // The workaround is to set this property to false per discussion on
      // this thread: https://github.com/angular/protractor/issues/5274
      w3c: false,
      args: [
        '--lang=en-EN',
        '--window-size=1285x1000',
        // These arguments let us simulate recording from a microphone.
        '--use-fake-device-for-media-stream',
        '--use-fake-ui-for-media-stream',
        '--use-file-for-fake-audio-capture=data/cafe.mp3',
        // These arguments are required to run the tests on GitHub
        // Actions.
        '--no-sandbox',
        '--disable-dev-shm-usage',
      ]
    },
    prefs: {
      intl: {
        accept_languages: 'en-EN'
      }
    },
    loggingPrefs: {
      driver: 'INFO',
      browser: 'INFO'
    }
  },

  // If you would like to run more than one instance of webdriver on the same
  // tests, use multiCapabilities, which takes an array of capabilities.
  // If this is specified, capabilities will be ignored.
  multiCapabilities: [],

  // ----- More information for your tests ----
  //
  // A base URL for your application under test. Calls to protractor.get()
  // with relative paths will be prepended with this.
  baseUrl: 'http://localhost:9001',

  // Selector for the element housing the angular app - this defaults to
  // body, but is necessary if ng-app is on a descendant of <body>.
  rootElement: 'body',

  // A callback function called once protractor is ready and available, and
  // before the specs are executed
  // You can specify a file containing code to run by setting onPrepare to
  // the filename string.
  onPrepare: function() {
    browser.isMobile = false;
    // At this point, global 'protractor' object will be set up, and jasmine
    // will be available. For example, you can add a Jasmine reporter with:
    //     jasmine.getEnv().addReporter(new jasmine.JUnitXmlReporter(
    //         'outputdir/', true, true));

    // This is currently pulled out into a flag because it sometimes obscures
    // the actual protractor error logs and does not close the browser after
    // a failed run.
    // TODO(sll): Switch this option on by default, once the above issues are
    // fixed.
    var _ADD_SCREENSHOT_REPORTER = false;

    if (_ADD_SCREENSHOT_REPORTER) {
      // This takes screenshots of failed tests. For more information see
      // https://www.npmjs.com/package/protractor-jasmine2-screenshot-reporter
      jasmine.getEnv().addReporter(new HtmlScreenshotReporter({
        // Directory for screenshots.
        dest: '../protractor-screenshots',
        // Function to build filenames of screenshots.
        pathBuilder: function(currentSpec) {
          return currentSpec.fullName;
        },
        captureOnlyFailedSpecs: true
      }));
    }

    var SpecReporter = require('jasmine-spec-reporter').SpecReporter;
    jasmine.getEnv().addReporter(new SpecReporter({
      displayStacktrace: 'pretty',
      displaySpecDuration: true
    }));

    // Set a wide enough window size for the navbar in the library pages to
    // display fully.
    browser.driver.manage().window().setSize(1285, 1000);
  },

  // The params object will be passed directly to the protractor instance,
  // and can be accessed from your test. It is an arbitrary object and can
  // contain anything you may need in your test.
  // This can be changed via the command line as:
  //   --params.login.user 'Joe'
  params: {
    login: {
      user: 'Jane',
      password: '1234'
    }
  },

  // ----- The test framework -----
  //
  // Jasmine and Cucumber are fully supported as a test and assertion framework.
  // Mocha has limited beta support. You will need to include your own
  // assertion framework if working with mocha.
  framework: 'jasmine2',

  // ----- Options to be passed to minijasminenode -----
  //
  // See the full list at https://github.com/juliemr/minijasminenode
  jasmineNodeOpts: {
    // The onComplete method will be called just before the driver quits.
    onComplete: null,
    // If true, display spec names.
    isVerbose: false,
    // If true, print colors to the terminal.
    showColors: true,
    // If true, include stack traces in failures.
    includeStackTrace: true,
    // Default time to wait in ms before a test fails.
    defaultTimeoutInterval: 1200000
  },

  // ----- Options to be passed to mocha -----
  //
  // See the full list at http://visionmedia.github.io/mocha/
  mochaOpts: {
    ui: 'bdd',
    reporter: 'list'
  },

  // ----- Options to be passed to cucumber -----
  cucumberOpts: {
    // Require files before executing the features.
    require: 'cucumber/stepDefinitions.js',
    // Only execute the features or scenarios with tags matching @dev.
    // This may be an array of strings to specify multiple tags to include.
    tags: '@dev',
    // How to format features (default: progress).
    format: 'summary'
  },

  SELENIUM_PROMISE_MANAGER: false,

  // ----- The cleanup step -----
  //
  // A callback function called once the tests have finished running and
  // the webdriver instance has been shut down. It is passed the exit code
  // (0 if the tests passed or 1 if not).
  onCleanUp: function() {}
};
