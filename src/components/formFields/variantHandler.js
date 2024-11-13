export function outlinedStyles(theme) {
  return {
    '&.MuiPaper-root': {
      backgroundColor: theme.input.primary,
      '&.MuiButtonBase-root': {
        backgroundColor: theme.input.primary,
      }
    },
    '.MuiInputBase-input': {
      color: `${theme.input.primary} !important`,
    },
    '.MuiInputLabel-root': {
      color: `${theme.input.primary} !important`
    },
    '.Mui-focused .MuiInputLabel-root': {
      borderColor: `${theme.input.primary} !important`
    },
    '.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: `${theme.input.primary} !important`
    },
    '.Mui-focused .MuiFilledInput-underline': {
      backgroundColor: theme.input.secondary,
    },
    '.Mui-focused .MuiInput-underline': {
      backgroundColor: theme.input.secondary,
    },
    '.MuiFilledInput-underline': {
      backgroundColor: theme.input.secondary,
      '&:hover': {
        backgroundColor: theme.input.secondary,
      },
      '&:before': {
        borderColor: `${theme.input.primary} !important`
      },
      '&:after': {
        borderColor: `${theme.input.primary} !important`,
      }
    },
    '.MuiInput-underline': {
      '&:before': {
        borderColor: `${theme.input.primary} !important`
      },
      '&:after': {
        borderColor: `${theme.input.primary} !important`,
      }
    },
    '.MuiOutlinedInput-notchedOutline': {
      borderColor: `${theme.input.primary} !important`
    },
    '&:hover': {
      '.MuiOutlinedInput-notchedOutline': {
        borderColor: `${theme.input.primary} !important`
      },
    },
    svg: {
      color: theme.timepicker.primary
    },
    '& label.Mui-focused': {
      color: theme.timepicker.primary,
    },

    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderColor: theme.timepicker.primary
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.timepicker.primary,
      }
    }
  };
}

export function filledStyles(theme) {
  return {
    '.MuiInputBase-input': {
      color: `${theme.input.primary} !important`,
    },
    '.MuiInputLabel-root': {
      color: `${theme.input.primary} !important`
    },
    '.Mui-focused .MuiInputLabel-root': {
      borderColor: `${theme.input.primary} !important`
    },
    '.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: `${theme.input.primary} !important`
    },
    '.Mui-focused .MuiFilledInput-underline': {
      backgroundColor: theme.input.secondary,
    },
    '.Mui-focused .MuiInput-underline': {
      backgroundColor: theme.input.secondary,
    },
    '.MuiFilledInput-underline': {
      backgroundColor: theme.input.secondary,
      '&:hover': {
        backgroundColor: theme.input.secondary,
      },
      '&:before': {
        borderColor: `${theme.input.primary} !important`
      },
      '&:after': {
        borderColor: `${theme.input.primary} !important`,
      }
    },
    '.MuiInput-underline': {
      '&:before': {
        borderColor: `${theme.input.primary} !important`
      },
      '&:after': {
        borderColor: `${theme.input.primary} !important`,
      }
    },
    '.MuiOutlinedInput-notchedOutline': {
      borderColor: `${theme.input.primary} !important`
    },
    '&:hover': {
      '.MuiOutlinedInput-notchedOutline': {
        borderColor: `${theme.input.primary} !important`
      },
    },
    svg: {
      color: theme.timepicker.primary
    },
    '& label.Mui-focused': {
      color: theme.timepicker.primary,
    },
    '& .MuiInputLabel-root': { color: theme.timepicker.primary, },
    '& .MuiFilledInput-root': {
      backgroundColor: theme.timepicker.secondary
    }
  };
}

export function standardStyles(theme) {
  return {
    '.MuiInputBase-input': {
      color: `${theme.input.primary} !important`,
    },
    '.MuiInputLabel-root': {
      color: `${theme.input.primary} !important`
    },
    '.Mui-focused .MuiInputLabel-root': {
      borderColor: `${theme.input.primary} !important`
    },
    '.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: `${theme.input.primary} !important`
    },
    '.Mui-focused .MuiFilledInput-underline': {
      backgroundColor: theme.input.secondary,
    },
    '.Mui-focused .MuiInput-underline': {
      backgroundColor: theme.input.secondary,
    },
    '.MuiFilledInput-underline': {
      backgroundColor: theme.input.secondary,
      '&:hover': {
        backgroundColor: theme.input.secondary,
      },
      '&:before': {
        borderColor: `${theme.input.primary} !important`
      },
      '&:after': {
        borderColor: `${theme.input.primary} !important`,
      }
    },
    '.MuiInput-underline': {
      '&:before': {
        borderColor: `${theme.input.primary} !important`
      },
      '&:after': {
        borderColor: `${theme.input.primary} !important`,
      }
    },
    '.MuiOutlinedInput-notchedOutline': {
      borderColor: `${theme.input.primary} !important`
    },
    '&:hover': {
      '.MuiOutlinedInput-notchedOutline': {
        borderColor: `${theme.input.primary} !important`
      },
    },
    svg: {
      color: theme.timepicker.primary
    },
    '& label.Mui-focused': {
      color: theme.timepicker.primary,
    },
    '& .MuiInputLabel-root': { color: theme.timepicker.primary },
    borderBottom: `4px solid ${theme.timepicker.primary}`,
  };
}
