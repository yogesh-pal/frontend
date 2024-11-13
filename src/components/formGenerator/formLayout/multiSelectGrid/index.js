import Grid from '@mui/material/Grid';
import { MultiSelect } from '../../../formFields';
import { CustomFormControl } from '../../../styledComponents/formGenerator';

const MultiSelectInputGrid = ({
  alignment, input, register, errors, setValue, defaultValue, variant
}) => {
  const {
    xs, sm, md, lg, xl
  } = alignment;
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
      <CustomFormControl variant={variant}>
        <MultiSelect
          register={register}
          errors={errors}
          input={input}
          setValue={setValue}
          variant={variant}
          defaultValue={defaultValue}
        />
      </CustomFormControl>
    </Grid>
  );
};

export default MultiSelectInputGrid;
