import { StylesConfig } from 'react-select';

export const candidateSelectStyles: StylesConfig<any, false> = {
  control: (base, state) => ({
    ...base,
    paddingLeft: '2.5rem',
    minHeight: '42px',
    backgroundColor: '#ffffff',
    borderColor: state.isFocused ? '#0F47F2' : '#E5E7EB',
    borderRadius: '0.75rem',
    borderWidth: '1px',
    boxShadow: state.isFocused
      ? '0 0 0 3px rgba(15, 71, 242, 0.1)'
      : 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: state.isFocused ? '#0F47F2' : '#D1D5DB',
    },
  }),

  input: (base) => ({
    ...base,
    color: '#1F2937',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  }),

  placeholder: (base) => ({
    ...base,
    color: '#9CA3AF',
    fontSize: '0.875rem',
  }),

  singleValue: (base) => ({
    ...base,
    color: '#1F2937',
    fontSize: '0.875rem',
  }),

  menu: (base) => ({
    ...base,
    borderRadius: '0.75rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    marginTop: '0.375rem',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  }),

  menuList: (base) => ({
    ...base,
    paddingTop: 0,
    paddingBottom: 0,
    maxHeight: '208px',
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#EEF2FF'
      : state.isFocused
      ? '#F9FAFB'
      : '#ffffff',

    color: state.isSelected ? '#0F47F2' : '#374151',
    fontWeight: state.isSelected ? '500' : '400',
    fontSize: '0.875rem',
    cursor: 'pointer',
    padding: '0.625rem 0.875rem',

    '&:hover': {
      backgroundColor: state.isSelected
        ? '#EEF2FF'
        : '#F9FAFB',
    },
  }),

  noOptionsMessage: (base) => ({
    ...base,
    color: '#9CA3AF',
    fontSize: '0.875rem',
    padding: '0.625rem 0.875rem',
  }),
};

export const generateTimeOnlyOptions = () => {
  const options = [];
  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  for (const h of hours) {
    for (const m of [0, 30]) {
      const formattedHour = String(h).padStart(2, '0');
      const formattedMinute = String(m).padStart(2, '0');
      const val = `${formattedHour}:${formattedMinute}`;
      options.push({ value: val, label: val });
    }
  }
  return options;
};
