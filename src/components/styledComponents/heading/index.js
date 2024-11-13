import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

const HeadingMaster = styled(Typography)(({ theme }) => ({
  fontSize: '25px',
  color: theme.text.primary,
  fontWeight: 900,
}));

const HeadingSearch = styled(Typography)(({ theme }) => ({
  fontSize: '25px',
  color: theme.text.primary,
  fontWeight: 900
}));

export {
  HeadingMaster,
  HeadingSearch
};
