import { TourDefinition } from "./TourTypes";

// Current application version
export const CURRENT_APP_VERSION = "1.5.0";

export const tours: TourDefinition[] = [
  {
    id: "onboarding",
    version: "1.0.0",
    name: {
      en: "Welcome Onboarding Tour",
      es: "Recorrido de Bienvenida"
    },
    description: {
      en: "Get familiar with the core layout and interactive panels.",
      es: "Familiarízate con el diseño principal y los paneles interactivos."
    },
    isOnboarding: true,
    steps: [
      {
        id: "welcome",
        selector: "#app-root", // Highlight the whole screen first
        title: {
          en: "Welcome to EGW Devotionals",
          es: "Bienvenido a Devocionales EGW"
        },
        explanation: {
          en: "This app brings historic devotional libraries into a highly polished, interactive dashboard. Let's take a 60-second guided tour of our modern reading experience!",
          es: "Esta aplicación reúne bibliotecas históricas de devocionales en un panel interactivo refinado. ¡Hagamos un recorrido guiado de 60 segundos por nuestra experiencia de lectura moderna!"
        },
        placement: "auto",
        allowInteraction: false
      },
      {
        id: "carousel",
        selector: "#carousel-viewport",
        title: {
          en: "Interactive Devotional Library",
          es: "Biblioteca Devocional Interactiva"
        },
        explanation: {
          en: "Scroll through beautiful, high-contrast book covers. Clicking any cover automatically fetches today's devotional reading directly from the estate database.",
          es: "Desplázate por hermosas portadas de libros de alta fidelidad. Al hacer clic en cualquier portada se descarga automáticamente la lectura de hoy desde la base de datos."
        },
        placement: "bottom",
        allowInteraction: true
      },
      {
        id: "profile-switcher",
        selector: "#header-profile-switcher",
        title: {
          en: "AI Reader Profile Translation",
          es: "Traducción de Perfil AI"
        },
        explanation: {
          en: "Toggle between the original 19th-century text, a simplified clear and modern prose, a relatable conversational podcast-style, or even concrete story-driven kids' analogies.",
          es: "Cambia entre el texto original, una prosa clara y moderna, un tono conversacional estilo podcast, o incluso analogías concretas para niños."
        },
        placement: "bottom",
        allowInteraction: true
      },
      {
        id: "audio-console",
        selector: "#audio-playback-dock",
        title: {
          en: "Vocal Stream Playback Console",
          es: "Consola de Reproducción de Voz"
        },
        explanation: {
          en: "Listen to the devotional read aloud with high-fidelity speech synthesis. Control playback speed, skip paragraphs, pause, and choose your favorite reading voice.",
          es: "Escucha el devocional leído en voz alta con síntesis de voz de alta fidelidad. Controla la velocidad, salta párrafos, pausa y elige tu voz favorita."
        },
        placement: "top",
        allowInteraction: true
      },
      {
        id: "streak-hud",
        selector: "#header-streak-badge",
        title: {
          en: "Daily Spiritual Reflection Streak",
          es: "Racha de Reflexión Espiritual"
        },
        explanation: {
          en: "Keep track of your consecutive days of spiritual study and character development. Stay accountable with our integrated real-time streak counter.",
          es: "Sigue la cuenta de tus días consecutivos de estudio y crecimiento personal. Mantén el hábito con nuestro contador en tiempo real."
        },
        placement: "bottom",
        allowInteraction: false
      },
      {
        id: "sync-db",
        selector: "#sync-button",
        title: {
          en: "Live Database Sync",
          es: "Sincronización de Base de Datos"
        },
        explanation: {
          en: "Force a refresh and synchronization with the global servers to ensure your local devotionals and content files are perfectly aligned and up to date.",
          es: "Fuerza una actualización con los servidores globales para asegurarte de que tus devocionales locales estén perfectamente actualizados."
        },
        placement: "bottom",
        allowInteraction: true
      },
      {
        id: "theme-toggle-step",
        selector: "#theme-toggle",
        title: {
          en: "Aesthetic Environment Presets",
          es: "Ajustes de Ambiente Estético"
        },
        explanation: {
          en: "Toggle between our responsive, eye-safe 'Twilight Slate' dark mode and our warm, historical 'Cream reading environment' to match your room lighting.",
          es: "Cambia entre nuestro modo oscuro 'Twilight Slate' seguro para la vista y nuestro cálido fondo 'Cream' que evoca pergaminos clásicos."
        },
        placement: "bottom",
        allowInteraction: true
      }
    ]
  },
  {
    id: "whats-new-1.5.0",
    version: "1.5.0",
    name: {
      en: "What's New in Version 1.5.0",
      es: "Novedades en Versión 1.5.0"
    },
    description: {
      en: "Discover the latest premium features added in this release.",
      es: "Descubre las últimas funciones premium añadidas en esta versión."
    },
    isOnboarding: false,
    steps: [
      {
        id: "whats-new-profile",
        selector: "#header-profile-switcher",
        title: {
          en: "New AI Translation Profiles!",
          es: "¡Nuevos Perfiles de Traducción AI!"
        },
        explanation: {
          en: "You can now read in 'Everyday Conversational' (a personal podcast tone) or 'Discovery & Story' (easy-to-understand storytelling style for kids and families)!",
          es: "¡Ahora puedes leer en estilo 'Conversacional Diario' (tono de podcast) o 'Descubrimiento e Historia' (estilo de narración fácil para niños y familias)!"
        },
        placement: "bottom",
        allowInteraction: true
      },
      {
        id: "whats-new-streak",
        selector: "#header-streak-badge",
        title: {
          en: "Integrated Reflection Tracker",
          es: "Seguimiento de Reflexión Integrado"
        },
        explanation: {
          en: "We added a streak completion HUD badge at the top! Mark your reading completed at the bottom of the article to increment your consecutive study counter.",
          es: "¡Añadimos una insignia de racha en la cabecera! Marca tu lectura como completada al final del artículo para aumentar tu contador consecutivo."
        },
        placement: "bottom",
        allowInteraction: false
      }
    ]
  }
];
