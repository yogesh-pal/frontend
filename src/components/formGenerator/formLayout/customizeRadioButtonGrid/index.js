import Grid from '@mui/material/Grid';
import { CustomizeRadioButton } from '../../../formFields';
import { CustomFormControl } from '../../../styledComponents/formGenerator';

const CustomizeRadioInputGrid = ({
  alignment,
  input,
  register,
  errors,
  defaultValue,
  variant,
  getValues,
  setValue
}) => {
  const {
    xs, sm, md, lg, xl
  } = alignment;
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
      <CustomFormControl variant={variant}>
        <CustomizeRadioButton
          register={register}
          errors={errors}
          input={input}
          defaultValue={defaultValue}
          variant={variant}
          getValues={getValues}
          setValue={setValue}
        />
      </CustomFormControl>
    </Grid>
  );
};

export default CustomizeRadioInputGrid;
