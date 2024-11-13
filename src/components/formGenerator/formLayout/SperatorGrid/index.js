/* eslint-disable jsx-a11y/label-has-associated-control */
import Grid from '@mui/material/Grid';

const SperatorGrid = ({
  input
}) => (
  <Grid item xs={12}>
    {input?.label && <label style={input?.style}>{input?.label}</label>}
  </Grid>
);

export default SperatorGrid;
