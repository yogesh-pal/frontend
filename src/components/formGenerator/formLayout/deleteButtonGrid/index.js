import Grid from '@mui/material/Grid';
import styled from '@emotion/styled';
import DeleteIcon from '@mui/icons-material/Delete';

const WraperDeleteButton = styled.div(() => ({
  display: 'flex',
  justifyContent: 'right',
  paddingBottom: '10px',
  paddingTop: '10px'
}));
const DeleteButtonGrid = ({
  input
}) => (
  <Grid item xs={12}>
    <WraperDeleteButton>
      <DeleteIcon onClick={input?.handleRemoveClick} />
    </WraperDeleteButton>
  </Grid>
);

export default DeleteButtonGrid;
