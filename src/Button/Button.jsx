import React from 'react';
import PropTypes from 'prop-types';
import { css, keyframes } from 'styled-components';
import { space } from 'styled-system';
import { darken } from 'polished';
import { getComponentVariant, createComponent } from '../utils';

const spinKeyframes = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
}`;

const loadingCss = ({ height, fontColor }) => css`
  color: transparent !important;
  pointer-events: none;
  position: relative;
  text-index: -9999px;
  opacity: 0.75;

  &::after {
    display: block;
    content: '';
    border-color: ${fontColor};
    animation: ${spinKeyframes} 820ms infinite linear;
    border-width: ${height / 12}px;
    border-style: solid;
    border-radius: 100%;
    border-right-color: transparent;
    border-top-color: transparent;
    height: ${height / 2}px;
    left: 50%;
    margin-left: -${height / 4}px;
    margin-top: -${height / 4}px;
    position: absolute;
    top: 48%;
    width: ${height / 2}px;
  }
`;

const StyledButton = createComponent({
  name: 'Button',
  tag: 'button',
}).extend`
  ${({
    variant,
    size,
    theme,
    outline = false,
    block = false,
    disabled = false,
    loading = false,
    transparent = false,
    height = theme.heights[size],
    fontSize = theme.fontSizes[size],
    borderRadius = theme.radius || 2,
  }) => {
    const { backgroundColor, fontColor } = getComponentVariant(theme, 'Button', variant);

    return css`
      font-family: inherit;
      display: inline-block;
      text-align: center;
      cursor: pointer;
      text-transform: capitalize;
      font-weight: bold;
      text-decoration: none;
      appearance: none;
      border-radius: ${borderRadius}px;
      pointer-events: ${disabled ? 'none' : 'auto'};
      opacity: ${disabled ? '0.65' : '1'};
      color: ${fontColor};
      height: ${height}px;
      padding: 0 ${height / 2}px;
      font-size: ${fontSize}px;
      width: ${block ? '100%' : 'auto'};
      background: ${outline || transparent ? 'transparent' : backgroundColor};
      border: ${transparent ? 'none' : `1px solid ${outline ? fontColor : darken(0.05, backgroundColor)}`};
      transition: 175ms;

      ${loading ? loadingCss({ height, fontColor }) : ''};
      ${space};

      &:hover {
        background: ${darken(0.05, backgroundColor)};
        border-color: ${darken(0.05, backgroundColor)};
      }

      &:active {
        background: ${darken(0.075, backgroundColor)};
        border-color: ${darken(0.075, backgroundColor)};
      }
    `;
  }};
`;

const Button = props => <StyledButton {...props} />;

Button.propTypes = {
  variant: PropTypes.string,
  size: PropTypes.string,
  outline: PropTypes.bool,
  block: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  transparent: PropTypes.bool,
};

Button.defaultProps = {
  variant: 'primary',
  size: 'md',
  outline: false,
  block: false,
  disabled: false,
  loading: false,
  transparent: false,
};

Button.Group = createComponent({ name: 'ButtonGroup' }).extend`
  & > *:not(:first-child) {
    margin-left: 1rem;
  }
`;

export default Button;