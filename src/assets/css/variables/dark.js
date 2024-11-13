const color = {
  primary: '#502a741a',
  secondary: '#502A74',
  ternary: '#72588b',
  quaternary: '#ffffff',
  quinary: '#927ca7',
  senary: '#00000033',
  septenary: '#0000001a',
  octonary: '#4c2372a6'
};

export const dark = {
  components: {
    MuiClockPicker: {
      styleOverrides: {
        root: {
          backgroundColor: color.primary,
        },
      },
    },
    MuiCalendarPicker: {
      styleOverrides: {
        root: {
          backgroundColor: color.primary,
          '& .Mui-selected': {
            backgroundColor: `${color.ternary} !important`,
            fontWeight: '800'
          },
        }
      }
    },
    MuiPickersDay: {
      styleOverrides: {
        root: {
          backgroundColor: color.primary,
          color: color.quaternary,
        },
        today: {
          backgroundColor: `${color.secondary} !important`,
          fontWeight: '800',
          color: `${color.quaternary} !important`,
        },
      }
    }
  },
  background: {
    primary: color.secondary,
    secondary: color.primary,
    ternary: color.quinary
  },
  boxShadow: {
    primary: color.senary,
    secondary: color.septenary
  },
  button: {
    primary: color.secondary,
    secondary: color.primary,
    ternary: color.quaternary
  },
  text: {
    primary: color.secondary,
    secondary: color.primary,
    ternary: color.quaternary
  },
  checkbox: {
    primary: color.secondary,
  },
  radio: {
    primary: color.secondary,
  },
  select: {
    primary: color.secondary
  },
  datepicker: {
    primary: color.secondary
  },
  timepicker: {
    primary: color.secondary,
    secondary: color.primary
  },
  input: {
    primary: color.secondary,
    secondary: color.primary,
  },
  menu: {
    primary: color.secondary,
    secondary: color.primary
  },
  calender: {},
  popover: {
    primary: color.secondary,
    secondary: color.primary,
  },
  stepper: {
    primary: 'linear-gradient( 90deg, #2C106A 20%, #E75480 100%)',
  },
  stepConnector: {
    primary: 'linear-gradient( 90deg, #2C106A 20%, #FFC0CB 100%)',
  },
};
