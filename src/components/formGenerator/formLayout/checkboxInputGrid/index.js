import Grid from '@mui/material/Grid';
import { CheckboxInput } from '../../../formFields';
import { CustomFormControl } from '../../../styledComponents/formGenerator';

const CheckboxInputGrid = ({
  alignment, input, register, errors, defaultValue, variant
}) => {
  const {
    xs, sm, md, lg, xl
  } = alignment;

  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
      <CustomFormControl variant={variant}>
        <CheckboxInput
          register={register}
          errors={errors}
          input={input}
          defaultValue={defaultValue}
          variant={variant}
        />
      </CustomFormControl>
    </Grid>
  );
};

export default CheckboxInputGrid;
