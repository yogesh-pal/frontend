/* eslint-disable react/no-array-index-key */
import Grid from '@mui/material/Grid';
import './CAM.css';

const BoxFormat = ({ header, data }) => (
  <Grid container>
    {header && (
      <Grid item className='border-div heading'>
        {header}
      </Grid>
    )}
    <Grid container>
      {
        data.map((ele, index) => (
          <Grid key={index} item md={ele?.style?.md} xs={ele?.style?.xs} className='border-div text-style'>
            {ele?.label}
            {' '}
            {ele?.label ? ':' : null }
            {' '}
            {ele?.isAmount && <span>&#8377;</span>}
            {ele?.value && Array.isArray(ele.value)
              ? (
                <Grid container display='flex'>
                  {
                    ele.value.length > 0 ? ele.value.map((v) => ele.func(v)) : <p className='na'>NA</p>
                  }
                </Grid>
              )
              : ele?.value }
          </Grid>
        ))
        }
    </Grid>
  </Grid>
);

export default BoxFormat;
