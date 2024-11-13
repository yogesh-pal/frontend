import Grid from '@mui/material/Grid';
import EndUseOfGold from '../../../formFields/endUseOfGold';
import { CustomFormControl } from '../../../styledComponents/formGenerator';

const EndUseOfGoldGrid = ({
  alignment, variant, input, register, errors, defaultValue, setValue, getValues,
  unregister, clearErrors, trigger
}) => {
  const {
    xs, sm, md, lg, xl
  } = alignment;
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
      <CustomFormControl variant={variant}>
        <EndUseOfGold
          input={input}
          register={register}
          errors={errors}
          defaultValue={defaultValue}
          setValue={setValue}
          getValues={getValues}
          unregister={unregister}
          trigger={trigger}
          clearErrors={clearErrors}
        />
      </CustomFormControl>
    </Grid>
  );
};

export default EndUseOfGoldGrid;
