/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import { styled } from '@mui/material/styles';

const TogglerButtonGroupStyled = styled(ToggleButton)(({ theme }) => ({
  '&.Mui-selected': {
    '&:hover': {
      color: `${theme?.button?.primary} !important`,
      background: 'rgb(227 220 233)'
    },
    color: `${theme?.button?.primary} !important`,
    background: 'rgb(227 220 233)'
  }
}));

const MultiToggleButton = ({ details, seletedValueHandler, orientation }) => {
  const [alignment, setAlignment] = useState(details?.defaultValue);

  const handleChange = (event, newAlignment) => {
    try {
      if (newAlignment) {
        setAlignment(newAlignment);
        seletedValueHandler(newAlignment);
      }
    } catch (e) {
      console.log('Error', e);
    }
  };

  return (
    <ToggleButtonGroup
      orientation={orientation}
      color='primary'
      value={alignment}
      exclusive
      onChange={handleChange}
      aria-label='Platform'
      fullWidth={orientation === 'vertical'}
    >
      {
        details?.values
          .map((item) => (
            <TogglerButtonGroupStyled key={item.value} value={item?.value}>
              {item?.name}
            </TogglerButtonGroupStyled>
          ))
      }
    </ToggleButtonGroup>
  );
};

export default React.memo(MultiToggleButton);
