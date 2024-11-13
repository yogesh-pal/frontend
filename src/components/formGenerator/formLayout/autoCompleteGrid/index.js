import Grid from '@mui/material/Grid';
import { AutoComplete } from '../../../formFields';
import { CustomFormControl } from '../../../styledComponents/formGenerator';

const AutoCompleteGrid = ({
  alignment, input, register, setValue, errors, defaultValue, variant, getValues
}) => {
  const {
    xs, sm, md, lg, xl
  } = alignment;
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
      <CustomFormControl variant={variant}>
        <AutoComplete
          register={register}
          errors={errors}
          input={input}
          setValue={setValue}
          getValues={getValues}
          defaultValue={defaultValue}
          variant={variant}
        />
      </CustomFormControl>
    </Grid>
  );
};

export default AutoCompleteGrid;
