import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState
} from 'react';
import PropTypes from 'prop-types';
import AnimateHeight from 'react-animate-height';
import { DrawerContext } from './DrawerContext';
import useUniqueId from '../../util/useUniqueId';

export const DrawerItemContext = createContext({
  open: false,
  itemId: undefined,
  toggleOpen: () => {
    /* noop */
  }
});

export const useDrawerItemContext = () => useContext(DrawerItemContext);

export const DrawerItem = ({ id, panelKey, open: openProp, ...props }) => {
  const {
    activeKeys,
    toggleActiveKey,
    setActiveKey,
    unsetActiveKey
  } = useContext(DrawerContext);
  const itemId = useUniqueId(id);
  const itemKey = useUniqueId(panelKey);
  const toggleOpen = useCallback(() => toggleActiveKey(itemKey), [
    itemKey,
    toggleActiveKey
  ]);
  const [open, setOpen] = useState(activeKeys.includes(itemKey));
  const [itemContext, setItemContext] = useState({ open, itemKey, toggleOpen });

  useEffect(
    function setOpenFromActiveKeys() {
      const newOpen = activeKeys.includes(itemKey);
      setOpen(newOpen);
    },
    [activeKeys]
  );

  useEffect(
    function setOpenFromOpenProp() {
      if (openProp === undefined) return;

      (openProp ? setActiveKey : unsetActiveKey)(itemKey);
    },
    [openProp]
  );

  useEffect(
    function setChangedContext() {
      setItemContext({ open, itemId, toggleOpen });
    },
    [open, itemId, toggleOpen]
  );

  return <DrawerItemContext.Provider {...props} value={itemContext} />;
};

DrawerItem.propTypes = {
  /** Set the drawer to open or closed (true/false) */
  open: PropTypes.bool,

  /** Respond when the item opens or closes */

  // INTERNAL PROPS
  /** @ignore@ */
  id: PropTypes.string,
  /** @ignore */
  panelKey: PropTypes.string
};

DrawerItem.defaultProps = {
  open: undefined,
  id: undefined,
  panelKey: undefined
};

export const DrawerItemBody = props => {
  const { open, itemId } = useDrawerItemContext();
  const height = open ? 'auto' : 0;
  return (
    <AnimateHeight
      height={height}
      duration={300}
      id={`${itemId}-region`}
      role="region"
      {...props}
    />
  );
};

const noop = () => {
  // noop
};

export const DrawerItemOpener = ({ children }) => {
  try {
    const child = React.Children.only(children);
    const childClick = child?.props?.onClick || noop; // do not recreate noop every render
    const { open, toggleOpen, itemId } = useContext(DrawerItemContext);
    const onClick = useCallback(
      ev => {
        childClick(ev);
        toggleOpen();
      },
      [toggleOpen, childClick]
    );
    const clickChild = React.cloneElement(child, {
      ...child.props,
      onClick,
      'aria-expanded': open,
      'aria-controls': `${itemId}-region`
    });

    return clickChild;
  } catch {
    // eslint-disable-next-line no-console
    console.error(
      'Drawer.ItemOpener could not set onClick. Please ensure it has only one root child component.'
    );
    return children;
  }
};

DrawerItemOpener.propTypes = {
  children: PropTypes.element.isRequired
};
