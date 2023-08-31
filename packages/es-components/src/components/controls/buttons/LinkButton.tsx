import React from 'react';
import PropTypes, { ValidationMap } from 'prop-types';
import styled from 'styled-components';
import { useTheme } from '../../util/useTheme';
import { darken } from '../../util/colors';
import ButtonBase, {
  propTypes as basePropTypes,
  defaultProps as baseDefaultProps,
  ButtonDefaultProps,
  ButtonBaseProps
} from './ButtonBase';
import { TextColorButtonVariant } from 'es-components-shared-types';
import {
  ButtonProps,
  propTypes as buttonPropTypes,
  defaultProps as buttonDefaultProps
} from './Button';

const StyledButton = styled(ButtonBase)<{ variant: TextColorButtonVariant }>`
  background-color: transparent;
  border: none;
  box-shadow: none;
  cursor: pointer;
  color: ${props => props.variant.textColor};
  font-size: inherit;
  line-height: ${props => props.theme.font.baseLineHeight};
  padding: 0;
  text-decoration: underline;

  &:hover,
  &:focus,
  &:active {
    color: ${props => darken(props.variant.textColor, 10)};
    text-decoration: none;
  }

  &:active {
    box-shadow: none;
  }

  &[disabled],
  &[data-waiting],
  &[data-waiting]:active {
    color: ${props => props.variant.textColor};
    text-decoration: underline;
  }
`;

export type LinkButtonProps = Override<
  ButtonBaseProps,
  {
    styleType?: ButtonProps['styleType'];
    children: NonNullable<React.ReactNode>;
  }
>;

const LinkButton = React.forwardRef<HTMLButtonElement, LinkButtonProps>(
  function LinkButton(props, ref) {
    const { children, styleType = 'default', ...other } = props;
    const theme = useTheme();
    const variant = theme.buttonStyles.linkButton.variant[styleType];

    return (
      <StyledButton ref={ref} variant={variant} type="button" {...other}>
        {children}
      </StyledButton>
    );
  }
);

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export const propTypes: PropTypesOf<LinkButtonProps> = {
  ...basePropTypes,
  children: PropTypes.node.isRequired,
  /** Select the color style of the button, types come from theme buttonStyles.linkButton */
  styleType: buttonPropTypes.styleType
};

const unchildrenDefaults = { ...baseDefaultProps };
delete unchildrenDefaults['children'];

export const defaultProps = {
  ...(unchildrenDefaults as Omit<ButtonDefaultProps, 'children'>),
  styleType: buttonDefaultProps.styleType
};
/* eslint-enable @typescript-eslint/no-non-null-assertion */

LinkButton.defaultProps = defaultProps;
LinkButton.propTypes = propTypes as ValidationMap<LinkButtonProps>;

export default LinkButton;
