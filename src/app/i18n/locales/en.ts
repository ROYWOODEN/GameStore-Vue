import type { ru } from './ru'

export const en = {
  common: {
    loading: 'Loading',
  },
  game: {
    addToCart: 'Add',
    addToFavorites: 'Add to favorites',
    coverPlaceholder: 'Game cover is missing',
    platforms: 'Platforms',
  },
  mainPage: {
    emptyDescription: 'Try again later: the catalog will appear soon.',
    emptyTitle: 'No games yet',
    loadErrorTitle: 'Failed to load games',
    retry: 'Retry',
  },
  errors: {
    title: 'Error',
    internal: 'Internal server error',
    network: 'Could not connect to the server. Check your connection and try again.',
    common: {
      not_found: 'Requested resource was not found',
    },
    auth: {
      already_authorized: 'You are already signed in',
      expired: 'Your session has expired. Sign in again.',
      forbidden: 'You do not have permission to perform this action',
      invalid_credentials: 'Invalid email or password',
      oauth_failed: 'Could not sign in with the external provider',
      oauth_not_configured: 'External provider sign-in is not configured',
      refresh_failed: 'Could not refresh the session. Sign in again.',
      unauthorized: 'Authorization is required',
      validation: 'Check your authorization data',
    },
    basket: {
      already_exists: 'This game is already in the cart',
    },
    checkout: {
      already_owned: 'This game is already in your library',
      empty: 'Your cart is empty',
      not_in_basket: 'This game is not in the cart',
    },
    favorites: {
      already_exists: 'This game is already in favorites',
    },
    games: {
      title_taken: 'A game with this title already exists',
    },
    payments: {
      create_failed: 'Could not create the payment',
      provider_not_configured: 'Payment provider is not configured',
      webhook_invalid: 'Invalid payment webhook',
    },
    users: {
      email_taken: 'A user with this email already exists',
    },
    validation: {
      failed: 'Check the submitted fields',
      files_required: 'Add the required files',
      invalid_file_type: 'Unsupported file type',
      no_fields_to_update: 'No data to update',
      no_valid_fields_to_update: 'No valid data to update',
    },
    upload: {
      failed: 'Could not upload the file',
      file_too_large: 'The file is too large',
      too_many_files: 'Too many files',
      unexpected_upload_error: 'An error occurred during upload',
      unknown_type: 'Unknown file type',
    },
    db: {
      unavailable: 'The database is temporarily unavailable. Try again later.',
    },
  },
  header: {
    cart: 'Cart',
    language: 'RU',
    login: 'Log in',
    notifications: 'Notifications',
    searchLabel: 'Search games',
    switchLanguage: 'Switch language',
    themeDark: 'Dark',
    themeLight: 'Light',
  },
  sidebar: {
    catalog: 'Catalog',
    exit: 'Exit',
    favorites: 'Favorites',
    library: 'Library',
    main: 'Main',
    settings: 'Settings',
  },
  settings: {
    admin: {
      panel: 'Control panel',
      title: 'Admin panel',
    },
    language: {
      en: 'English',
      ru: 'Русский',
      title: 'Language settings',
    },
    security: {
      password: 'Password and sign-in',
      sessions: 'Active sessions',
      title: 'Security settings',
    },
    tabs: {
      admin: 'Admin panel',
      language: 'Language',
      security: 'Security',
      theme: 'Theme',
    },
    theme: {
      dark: 'Dark',
      light: 'Light',
      title: 'Theme settings',
    },
    title: 'Settings',
  },
} satisfies typeof ru
