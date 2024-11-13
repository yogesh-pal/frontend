import { Slider, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const PrettoSlider = styled(Slider)(({ theme }) => ({
  color: theme?.background?.ternary,
  height: 8,
  '& .MuiSlider-track': {
    border: 'none',
  },
  '& .MuiSlider-thumb': {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: 'inherit',
    },
    '&:before': {
      display: 'none',
    },
  },
  '& .MuiSlider-valueLabel': {
    lineHeight: 1.2,
    fontSize: 12,
    background: 'unset',
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: '50% 50% 50% 0',
    backgroundColor: theme?.background?.primary,
    transformOrigin: 'bottom left',
    transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
    '&:before': { display: 'none' },
    '&.MuiSlider-valueLabelOpen': {
      transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
    },
    '& > *': {
      transform: 'rotate(45deg)',
    },
  },
}));

const PrettoSliderHeading = styled(Typography)(({ theme, fontWeight }) => ({
  color: theme?.text?.primary,
  fontWeight
}));

const RangeSlider = (props) => {
  const {
    defaultValue, min, max, step, title, name, rangeHandler, fontWeight
  } = props;

  return (
    <>
      <PrettoSliderHeading gutterBottom fontWeight={fontWeight}>{title}</PrettoSliderHeading>
      <PrettoSlider
        valueLabelDisplay='auto'
        aria-label='pretto slider'
        defaultValue={defaultValue}
        name={name}
        min={min}
        step={step}
        max={max}
        onChange={rangeHandler}
      />
    </>
  );
};

export default RangeSlider;
