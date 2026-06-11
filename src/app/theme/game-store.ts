import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

const primary = {
  50: '#fbe8ff',
  100: '#f5c7ff',
  200: '#eb8fff',
  300: '#e057ff',
  400: '#d426ff',
  500: '#bd00ff',
  600: '#9700cd',
  700: '#74009f',
  800: '#500066',
  900: '#320047',
  950: '#18001f',
}

export const GameStorePreset = definePreset(Aura, {
  primitive: {
    borderRadius: {
      none: '0',
      xs: '0.25rem',
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
  },
  semantic: {
    primary,
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#faf9fe',
          100: '#f4f3f8',
          200: '#eeedf3',
          300: '#e9e7ed',
          400: '#e3e2e7',
          500: '#dad9df',
          600: '#837186',
          700: '#514255',
          800: '#2f3034',
          900: '#1a1b1f',
          950: '#131313',
        },
        primary: {
          color: '#bd00ff',
          contrastColor: '#ffffff',
          hoverColor: '#9700cd',
          activeColor: '#74009f',
        },
        highlight: {
          background: '#f8d8ff',
          focusBackground: '#ecb2ff',
          color: '#320047',
          focusColor: '#320047',
        },
        formField: {
          background: '#ffffff',
          borderColor: '#d7d4df',
          hoverBorderColor: '#a9a3b3',
          focusBorderColor: '#bd00ff',
          color: '#1a1b1f',
          placeholderColor: '#7a7282',
        },
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '#f2f3f5',
          100: '#e2e4e8',
          200: '#c6c8d0',
          300: '#a6aab4',
          400: '#777a84',
          500: '#5d606a',
          600: '#484b54',
          700: '#3a3d45',
          800: '#2a2c31',
          900: '#18191d',
          950: '#101114',
        },
        primary: {
          color: '#bd00ff',
          contrastColor: '#ffffff',
          hoverColor: '#d426ff',
          activeColor: '#9700cd',
        },
        highlight: {
          background: '#500066',
          focusBackground: '#74009f',
          color: '#ffffff',
          focusColor: '#ffffff',
        },
        formField: {
          background: '#15161a',
          borderColor: '#3a3d45',
          hoverBorderColor: '#5d606a',
          focusBorderColor: '#bd00ff',
          color: '#f2f3f5',
          placeholderColor: '#a6aab4',
        },
      },
    },
  },
  components: {
    button: {
      root: {
        borderRadius: '0.5rem',
        paddingX: '1rem',
        paddingY: '0.625rem',
      },
    },
    card: {
      root: {
        borderRadius: '0.5rem',
      },
    },
    inputtext: {
      root: {
        borderRadius: '1rem',
      },
    },
  },
})
