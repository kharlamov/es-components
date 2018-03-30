import React from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';
import styled, { ThemeProvider, withTheme } from 'styled-components';
import tinycolor from 'tinycolor2';

import defaultTheme from '../../theme/defaultTheme';
import Icon from '../../base/icons/Icon';
import Button from '../../controls/buttons/Button';
import DismissButton from '../../controls/DismissButton';

function adjustColor(color, level) {
  const colorBase = level > 0 ? '#000' : '#fff';
  return tinycolor.mix(colorBase, color, Math.abs(level)).toRgbString();
}

const DismissNotification = styled(DismissButton)`
  line-height: 80%;
  opacity: 0.2;
  padding: 0;
  margin-left: 15px;
  text-shadow: 0 1px 0 ${props => props.theme.colors.white};

  &:hover {
    opacity: 0.5;
  }
`;

const iconMap = {
  success: 'ok-sign',
  information: 'info-sign',
  warning: 'exclamation-sign',
  danger: 'exclamation-sign',
  advisor: 'agent'
};

const NotificationIcon = styled(Icon)`
  margin-right: 5px;
  margin-top: 2px;

  @media (max-width: 767px) {
    display: none;
  }
`;

function renderIcon(type) {
  const iconName = iconMap[type];
  return <NotificationIcon name={iconName} />;
}

const LeadingHeader = styled.div`
  display: flex;
  flex-grow: 2;
`;

const StrongHeader = styled.h4`
  padding-bottom: 0.25em;
  margin: 0;
`;

function renderLeadingHeader(
  notificationType,
  includeIcon,
  leadingHeader,
  leadingText
) {
  const hasLeadingHeaderText = leadingHeader !== undefined;
  const hasLeadingText = leadingText !== undefined;

  return (
    <LeadingHeader>
      {includeIcon && renderIcon(notificationType)}
      <div>
        {hasLeadingHeaderText && <StrongHeader>{leadingHeader}</StrongHeader>}
        {hasLeadingText && <div>{leadingText}</div>}
      </div>
    </LeadingHeader>
  );
}

const ExtraAlert = styled.aside`
  max-width: 250px;
  text-align: right;
  line-height: 95%;
`;

const ExtraAlertIcon = styled(Icon)`
  margin-right: 7px;
  margin-bottom: 4px;

  @media (max-width: 767px) {
    display: none;
  }
`;

function renderExtraAlert(alert) {
  const { alertText, alertIcon = 'federal' } = alert;

  return (
    <ExtraAlert className="extra__alert">
      <ExtraAlertIcon name={alertIcon} />
      <small>{alertText}</small>
    </ExtraAlert>
  );
}

/**
 * The selector on the buttons is to ensure that the primary button does not
 * get a margin. Because the flex-direction is row-reverse, it has to be a weird looking
 * inverse that kind of goes against normal thinking
 */
const CallsToAction = styled.div`
  align-self: flex-end;
  display: flex;
  flex-direction: row-reverse;
  padding: 0 15px 15px 0;

  & > button:not(:first-of-type) {
    margin-right: 15px;
  }

  @media (max-width: 767px) {
    display: block;
    padding: 15px;

    & > button {
      display: block;
      margin-bottom: 15px;
      width: 100%;

      &:active {
        margin-bottom: 15px;
      }
    }
  }
`;

function renderCallsToAction(callsToAction, theme) {
  return (
    <CallsToAction>
      {callsToAction.map((callToAction, index) => {
        const buttonStyleType = index === 0 ? 'primary' : 'default';

        if (React.isValidElement(callToAction)) {
          return React.cloneElement(callToAction, {
            styleType: buttonStyleType,
            key: index
          });
        }

        return (
          <Button
            styleType={buttonStyleType}
            key={index}
            theme={theme}
            handleOnClick={callToAction.action}
          >
            {callToAction.actionButtonContent}
          </Button>
        );
      })}
    </CallsToAction>
  );
}

const NotificationContainer = styled.div`
  background-color: ${props => adjustColor(props.color, -10)};
  border: 1px solid ${props => adjustColor(props.color, -60)};
  border-radius: 2px;
  color: ${props => adjustColor(props.color, 60)};
  margin-bottom: 25px;
`;

const NotificationContent = styled.div`
  padding: 0 15px 15px;
  margin-left: ${props => (props.hasIcon ? '24px' : '0')};

  @media (max-width: 767px) {
    margin-left: 0;
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 15px;
  margin: 0;
`;

export function Notification({
  type,
  header,
  additionalText,
  callsToAction = [],
  children,
  includeIcon = false,
  dismissable = false,
  isAlert = false,
  onDismiss = noop,
  extraAlert,
  theme,
  ...otherProps
}) {
  const hasCallsToAction = callsToAction.length > 0;
  const hasExtraAlert = extraAlert;
  const hasChildren = React.Children.count(children) > 0;
  const roleType = isAlert ? 'alert' : 'dialog';

  return (
    <ThemeProvider theme={theme}>
      <NotificationContainer
        {...otherProps}
        color={theme.colors[type]}
        role={roleType}
      >
        <NotificationHeader>
          {renderLeadingHeader(type, includeIcon, header, additionalText)}
          {hasExtraAlert && renderExtraAlert(extraAlert)}
          {dismissable && (
            <DismissNotification
              onClick={onDismiss}
              className="notification__dismiss"
            />
          )}
        </NotificationHeader>

        {hasChildren && (
          <NotificationContent hasIcon={includeIcon}>
            {children}
          </NotificationContent>
        )}
        {hasCallsToAction && renderCallsToAction(callsToAction, theme)}
      </NotificationContainer>
    </ThemeProvider>
  );
}

const notificationTypes = ['success', 'info', 'warning', 'danger', 'advisor'];

const callToActionShape = {
  actionButtonContent: PropTypes.node.isRequired,
  /** Function that executes when a button is clicked */
  action: PropTypes.func.isRequired
};

const extraAlertShape = {
  alertText: PropTypes.node.isRequired,
  alertIcon: PropTypes.string
};

Notification.propTypes = {
  type: PropTypes.oneOf(notificationTypes).isRequired,
  /** The bolded text in the leading text */
  header: PropTypes.string,
  /** The non-bolded text in the leading text */
  additionalText: PropTypes.string,
  /** Additional elements rendered after the leading text */
  children: PropTypes.node,
  /** Include the corresponding icon in the notification's leading text */
  includeIcon: PropTypes.bool,
  /** Render a dismiss button */
  dismissable: PropTypes.bool,
  /** Makes the Notification act as an alert for screen-reader accessibility */
  isAlert: PropTypes.bool,
  /** Function to execute when dismiss button is clicked */
  onDismiss: PropTypes.func,
  /** The small text and icon included in the extra notification */
  extraAlert: PropTypes.shape(extraAlertShape),
  /** Display a set of buttons for the user. A custom element or an object describing the button content and action are acceptable. */
  callsToAction: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.shape(callToActionShape), PropTypes.element])
  ),
  /**
   * Theme object used by the ThemeProvider,
   * automatically passed by any parent component using a ThemeProvider
   */
  theme: PropTypes.object
};

Notification.defaultProps = {
  theme: defaultTheme
};

export default withTheme(Notification);
