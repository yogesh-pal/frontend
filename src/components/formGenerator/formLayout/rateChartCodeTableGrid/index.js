import Grid from '@mui/material/Grid';
import RateChartCodeTable from '../../../formFields/rateChartCodeTable';
import { CustomFormControl } from '../../../styledComponents/formGenerator';

const RateChartCodeTableGrid = ({
  alignment, variant, defaultValue, getValues
}) => {
  const {
    xs, sm, md, lg, xl
  } = alignment;
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
      <CustomFormControl variant={variant}>
        <RateChartCodeTable
          defaultValue={defaultValue}
          getValues={getValues}
        />
      </CustomFormControl>
    </Grid>
  );
};

export default RateChartCodeTableGrid;
