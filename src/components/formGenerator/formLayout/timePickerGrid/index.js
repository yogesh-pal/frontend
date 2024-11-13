import Grid from '@mui/material/Grid';
import { TimePickerComponent } from '../../../formFields';
import { CustomFormControl } from '../../../styledComponents/formGenerator';

const TimePickerInputGrid = ({
  alignment, input, register, errors, setValue, variant, getValues
}) => {
  const {
    xs, sm, md, lg, xl
  } = alignment;
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
      <CustomFormControl variant={variant}>
        <TimePickerComponent
          register={register}
          errors={errors}
          input={input}
          setValue={setValue}
          variant={variant}
          getValues={getValues}
        />
      </CustomFormControl>
    </Grid>
  );
};

export default TimePickerInputGrid;
