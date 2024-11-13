/* eslint-disable max-len */
import Grid from '@mui/material/Grid';
import './CAM.css';

const TableFormat = ({
  topHeader, headers, values, styles
}) => (
  <Grid container className='border-div'>
    {topHeader && (
      <Grid item className='border-div heading'>
        {topHeader}
      </Grid>
    )}

    <Grid container>
      {
        headers.map((heading, index) => (
          <Grid key={heading} item xs={styles[index]?.xs} md={styles[index]?.md} className='border-div text-style'>
            {heading}
          </Grid>
        ))
        }
    </Grid>
    <Grid container>
      {
        values.map((entries) => entries.map((ele, index) => (
          <Grid item xs={styles[index]?.xs} md={styles[index]?.md} className='border-div text-style' style={{ whiteSpace: 'pre-line' }}>
            {ele}
          </Grid>
        )))
          }
    </Grid>
  </Grid>
);

export default TableFormat;
