import Grid from '@mui/material/Grid';
import { TextInput2 } from '../../../formFields';
import { CustomFormControl } from '../../../styledComponents/formGenerator';

const TextInputGrid = ({
  alignment, input, register, errors, defaultValue, variant, setValue, getValues, updateJsonHandler
}) => {
  const {
    xs, sm, md, lg, xl
  } = alignment;
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
      <CustomFormControl variant={variant}>
        <TextInput2
          register={register}
          errors={errors}
          input={input}
          defaultValue={defaultValue}
          variant={variant}
          setValue={setValue}
          getValues={getValues}
          updateJsonHandler={updateJsonHandler}
        />
      </CustomFormControl>
    </Grid>
  );
};

export default TextInputGrid;
