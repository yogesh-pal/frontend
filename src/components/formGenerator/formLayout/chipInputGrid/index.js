import Grid from '@mui/material/Grid';
import { ChipInput } from '../../../formFields';
import { CustomFormControl } from '../../../styledComponents/formGenerator';

const ChipInputGrid = ({
  alignment, input, register, errors, defaultValue, variant, setValue
}) => {
  const {
    xs, sm, md, lg, xl
  } = alignment;
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
      <CustomFormControl variant={variant}>
        <ChipInput
          register={register}
          errors={errors}
          input={input}
          defaultValue={defaultValue}
          variant={variant}
          setValue={setValue}
        />
      </CustomFormControl>
    </Grid>
  );
};

export default ChipInputGrid;
