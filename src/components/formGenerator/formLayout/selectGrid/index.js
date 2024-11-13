import Grid from '@mui/material/Grid';
import { SelectInput } from '../../../formFields';
import { CustomFormControl } from '../../../styledComponents/formGenerator';

const SelectInputGrid = ({
  alignment, input, register, errors, defaultValue, variant, setValue, getValues, updateJsonHandler
}) => {
  const {
    xs, sm, md, lg, xl
  } = alignment;
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
      <CustomFormControl variant={variant}>
        <SelectInput
          register={register}
          errors={errors}
          input={input}
          defaultValue={defaultValue}
          updateJsonHandler={updateJsonHandler}
          variant={variant}
          setValue={setValue}
          getValues={getValues}
        />
      </CustomFormControl>
    </Grid>
  );
};

export default SelectInputGrid;
