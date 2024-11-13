import Grid from '@mui/material/Grid';
import { MultipleLivePhoto } from '../../../formFields';
import { CustomFormControl } from '../../../styledComponents/formGenerator';

const MultiplePhotoGrid = ({
  alignment,
  input,
  register,
  errors,
  defaultValue,
  setValue,
  getValues,
  variant,
  unregister,
  setError
}) => {
  const {
    xs, sm, md, lg, xl
  } = alignment;
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
      <CustomFormControl variant={variant}>
        <MultipleLivePhoto
          register={register}
          errors={errors}
          input={input}
          defaultValue={defaultValue}
          setValue={setValue}
          getValues={getValues}
          variant={variant}
          unregister={unregister}
          setError={setError}
        />
      </CustomFormControl>
    </Grid>
  );
};

export default MultiplePhotoGrid;
