import Grid from '@mui/material/Grid';
import { Toggler } from '../../../formFields';
import { CustomFormControl } from '../../../styledComponents/formGenerator';

const ToggleGrid = ({
  input, errors, setValue, alignment, variant, register
}) => {
  const {
    xs, sm, md, lg, xl
  } = alignment;
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
      <CustomFormControl variant={variant}>
        <Toggler
          errors={errors}
          setValue={setValue}
          input={input}
          variant={variant}
          register={register}
        />
      </CustomFormControl>
    </Grid>
  );
};

export default ToggleGrid;
