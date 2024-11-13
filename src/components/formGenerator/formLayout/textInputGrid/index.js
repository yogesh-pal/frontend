import Grid from '@mui/material/Grid';
import { TextInput } from '../../../formFields';
import { CustomFormControl } from '../../../styledComponents/formGenerator';

const TextInputGrid = ({
  alignment, input, register, errors, defaultValue, variant, setValue, getValues, updateJsonHandler
}) => {
  const {
    xs, sm, md, lg, xl
  } = alignment;
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl} style={input?.gridStyle}>
      <CustomFormControl variant={variant} style={input?.textGroupCss}>
        <TextInput
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
