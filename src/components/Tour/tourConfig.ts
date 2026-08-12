import { TourDefinition } from "./TourTypes";

// Current application version
export const CURRENT_APP_VERSION = "1.5.0";

export const tours: TourDefinition[] = [
  {
    id: "onboarding",
    version: "1.0.0",
    name: "Welcome Onboarding Tour",
    description: "Get familiar with the core layout and interactive panels.",
    isOnboarding: true,
    steps: [
      {
        id: "welcome",
        selector: "#app-root", // Highlight the whole screen first
        title: "Welcome to EGW Devotionals",
        explanation: "Explore a modern devotional reading experience designed to make historic prophetic writings clear, accessible, and personally relevant. This app brings timeless spiritual insights into language that speaks to today’s readers, especially younger generations and those less familiar with 19th-century English. Take a 60-second guided tour to see how the experience works.",
        placement: "auto",
        allowInteraction: false
      },
      {
        id: "carousel",
        selector: "#carousel-viewport",
        title: "Interactive Devotional Library",
        explanation: "Scroll through beautiful, high-contrast book covers. Clicking any cover automatically fetches today's devotional reading directly from the estate database.",
        placement: "bottom",
        allowInteraction: true
      },
      {
        id: "profile-switcher",
        selector: "#header-profile-switcher",
        title: "Reading Style",
        explanation: "Choose a devotional reading style that fits your age, reading preference, and spiritual needs. Select **Classic** for the original 19th-century text, **Clear & Modern** for the same spiritual depth in clearer language, or **Easy Reading** for a simpler, direct version. Younger readers can choose **Kids & Primary** for story-driven examples, **Teens & Youth** for relatable guidance, or **Young Adult** for an authentic, conversational, and intellectually engaging approach to faith in modern life.",
        placement: "bottom",
        allowInteraction: true
      },
      {
        id: "install-pwa",
        selector: "#install-pwa-btn",
        title: "Progressive Web App & Offline Reading",
        explanation: "Install the **Daily Devotionals Reader** directly to your phone or desktop home screen! Enjoy full **Offline Reading** for cached devotionals, instant loading, and a seamless standalone app experience with no app store downloads needed.",
        placement: "bottom",
        allowInteraction: true
      },
      {
        id: "download-book-offline",
        selector: "#download-book-btn",
        title: "Download Book for Offline",
        explanation: "Tap **OFFLINE BOOK** to pre-cache all 365 daily devotionals for your active book in the background! Once downloaded, every single day of the year will be available to read without an internet connection.",
        placement: "bottom",
        allowInteraction: true
      },
      {
        id: "calendar-date-picker",
        selector: "#header-calendar-button",
        title: "Calendar & Pre-cache Full Month",
        explanation: "Select any day of the year to read historical reflections. You can also open the calendar picker and tap **Pre-cache Month for Offline** to download all 28-31 days of that month in a single click!",
        placement: "bottom",
        allowInteraction: true
      },
      {
        id: "audio-console",
        selector: "#audio-playback-dock",
        title: "Vocal Stream Playback Console",
        explanation: "Listen to the devotional read aloud with high-fidelity speech synthesis. Control playback speed, skip paragraphs, pause, and choose your favorite reading voice.",
        placement: "top",
        allowInteraction: true
      },
      {
        id: "streak-hud",
        selector: "#header-streak-badge",
        title: "Daily Spiritual Reflection Streak",
        explanation: "Keep track of your consecutive days of spiritual study and character development. Stay accountable with our integrated real-time streak counter.",
        placement: "bottom",
        allowInteraction: false
      },
      {
        id: "theme-toggle-step",
        selector: "#theme-toggle",
        title: "Aesthetic Environment Presets",
        explanation: "Toggle between our responsive, eye-safe 'Twilight Slate' dark mode and warm 'Cream' reading environment. On mobile or narrow screens, tap the '...' More Options menu to switch themes.",
        placement: "bottom",
        allowInteraction: true
      }
    ]
  },
  {
    id: "whats-new-1.5.0",
    version: "1.5.0",
    name: "What's New in Version 1.5.0",
    description: "Discover the latest premium features added in this release.",
    isOnboarding: false,
    steps: [
      {
        id: "whats-new-profile",
        selector: "#header-profile-switcher",
        title: "Reading Style",
        explanation: "Choose a devotional reading style that fits your age, reading preference, and spiritual needs. Select **Classic** for the original 19th-century text, **Clear & Modern** for the same spiritual depth in clearer language, or **Easy Reading** for a simpler, direct version. Younger readers can choose **Kids & Primary** for story-driven examples, **Teens & Youth** for relatable guidance, or **Young Adult** for an authentic, conversational, and intellectually engaging approach to faith in modern life.",
        placement: "bottom",
        allowInteraction: true
      },
      {
        id: "whats-new-pwa",
        selector: "#install-pwa-btn",
        title: "Progressive Web App Support",
        explanation: "You can now install the application directly as a **Progressive Web App**! Tap **INSTALL APP** to save it to your home screen or desktop with full **Offline Reading** support for previously cached devotionals.",
        placement: "bottom",
        allowInteraction: true
      },
      {
        id: "whats-new-streak",
        selector: "#header-streak-badge",
        title: "Integrated Reflection Tracker",
        explanation: "We added a streak completion HUD badge at the top! Mark your reading completed at the bottom of the article to increment your consecutive study counter.",
        placement: "bottom",
        allowInteraction: false
      }
    ]
  }
];

