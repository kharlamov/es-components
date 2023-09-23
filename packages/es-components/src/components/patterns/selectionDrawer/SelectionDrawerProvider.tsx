import React, {
  createContext,
  useCallback,
  useContext,
  useEffect
} from 'react';
import PropTypes from 'prop-types';
import {
  useMonitoringCallback,
  useMonitoringEffect
} from '../../../hooks/useMonitoringHooks';
import { arraysEqual } from '../../util/equality';
import { useCheckboxGroupActions } from '../../controls/checkbox/CheckboxGroup';
import noop from '../../util/noop';
import RadioGroup, {
  RadioGroupProps
} from '../../controls/radio-buttons/RadioGroup';

export type DrawerType = 'radio' | 'checkbox';

export const SelectionDrawerContext = createContext<{
  selectedItems: string[];
  setSelectedItems: (dispatch: (items: string[]) => string[]) => void;
  drawerType: DrawerType;
  handleCheckboxChange: React.ChangeEventHandler<HTMLInputElement>;
}>({
  selectedItems: [],
  setSelectedItems: noop,
  drawerType: 'checkbox',
  handleCheckboxChange: noop
});

export type SelectionDrawerProviderProps<T extends DrawerType> =
  React.PropsWithChildren<
    {
      selectedItems?: string[];
      onSelectionChange: (selectedItems: string[]) => void;
      type?: T;
    } & (T extends 'radio' ? RadioGroupProps : { name?: string })
  >;

const isRadioDrawer = (
  props: SelectionDrawerProviderProps<DrawerType>
): props is SelectionDrawerProviderProps<'radio'> => props.type === 'radio';

function SelectionDrawerProvider<T extends DrawerType>(
  props: SelectionDrawerProviderProps<T>
) {
  const {
    children,
    selectedItems: selectedItemsProp,
    onSelectionChange,
    type = 'checkbox' as DrawerType,
    name
  } = props;
  const isRadio = isRadioDrawer(props);
  const guaranteedName = isRadio ? props.name : name || '';
  const { selectedValues, setSelectedValues, handleCheckboxChange } =
    useCheckboxGroupActions({
      originalSelectedValues: selectedItemsProp || [],
      onChange: onSelectionChange
    });

  const onRadioChange = useMonitoringCallback(
    (currentSetSelected, ev: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = ev.target;
      currentSetSelected([value]);
    },
    setSelectedValues
  );

  useMonitoringEffect(
    currentOnChange => {
      if (arraysEqual(selectedValues || [], selectedItemsProp || [])) return;

      currentOnChange(selectedValues);
    },
    [selectedValues, selectedItemsProp],
    onSelectionChange
  );

  useEffect(() => {
    setSelectedValues(selectedItemsProp || []);
  }, [selectedItemsProp, setSelectedValues]);

  return (
    <SelectionDrawerContext.Provider
      value={{
        selectedItems: selectedValues,
        setSelectedItems: setSelectedValues,
        drawerType: type || 'checkbox',
        handleCheckboxChange
      }}
    >
      {isRadio ? (
        <RadioGroup
          name={guaranteedName}
          onChange={onRadioChange}
          selectedValue={selectedValues[0]}
        >
          {children || ''}
        </RadioGroup>
      ) : (
        children
      )}
    </SelectionDrawerContext.Provider>
  );
}

export const propTypes = {
  children: PropTypes.node,
  /** The currently selected items */
  selectedItems: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  /** Function when selected items changes */
  onSelectionChange: PropTypes.func.isRequired,
  /** Type of drawer */
  type: PropTypes.oneOf(['radio', 'checkbox'])
};

export const defaultProps = {};

SelectionDrawerProvider.propTypes = propTypes;
SelectionDrawerProvider.defaultProps = defaultProps;

export default SelectionDrawerProvider;

export const useSelectionDrawerContext = () =>
  useContext(SelectionDrawerContext);
