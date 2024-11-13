import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import ErrorText from '../errorHandler';
import { TextFieldStyled } from '../../styledComponents';

const ChipInput = (props) => {
  const {
    register, errors, input, variant, defaultValue, setValue
  } = props;
  return (
    <>
      <Autocomplete
        multiple
        id='tags-filled'
        options={[]}
        defaultValue={(!Array.isArray(defaultValue) && defaultValue !== undefined) ? defaultValue.split(',') : defaultValue}
        freeSolo
        renderTags={(value, getTagProps) => value.map((option, index) => (
          <Chip
            variant='outlined'
            label={option}
            {...getTagProps({ index })}
          />
        ))}
        renderInput={(params) => (
          <TextFieldStyled
            {...params}
            variant={variant}
            id={`${input?.id}-basic`}
            label={input?.label}
          />
        )}
        {...register(
          input?.name,
          { required: input?.validation?.isRequired, pattern: input?.validation?.pattern }
        )}
        onChange={(event, value) => setValue(input?.name, value)}
      />

      <ErrorText input={input} errors={errors} />
    </>
  );
};

export default ChipInput;
