import { Chip, Stack, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';

const StackContainer = styled(Stack)(() => ({
  position: 'fixed',
  bottom: '10px',
  right: '10px',
}));

const screenSizeDisplay = () => (
  <Tooltip title='Added only for development purpose' arrow>
    <StackContainer direction='row' spacing={1}>
      <Chip label='20' color='secondary' />
    </StackContainer>
  </Tooltip>
);

export default screenSizeDisplay;
