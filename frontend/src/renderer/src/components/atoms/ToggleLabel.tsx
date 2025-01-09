import type { ToggleButtonProps } from "react-aria-components";
import { LabelContext, useContextProps } from "react-aria-components";
import { useToggleState } from "react-stately";
import {
  mergeProps,
  useToggleButton,
  useHover,
  usePress,
  useFocusRing,
  AriaFocusRingProps,
  PressHookProps,
  HoverProps,
} from "react-aria";
import React from "react";

export const ToggleLabel = React.forwardRef(function ToggleLabel(
  props: ToggleButtonProps &
    AriaFocusRingProps &
    PressHookProps &
    HoverProps & {
      children: React.ReactNode;
      id?: string;
      htmlFor?: string;
    },
  ref: React.ForwardedRef<HTMLLabelElement>,
) {
  [props, ref] = useContextProps(props, ref, LabelContext);

  const state = useToggleState(props);
  const { hoverProps, isHovered } = useHover(props);
  const { pressProps, isPressed } = usePress(props);
  const { focusProps, isFocusVisible, isFocused } = useFocusRing(props);

  const toggleButton = useToggleButton(
    mergeProps(
      props,
      {
        state,
        isHovered,
        isPressed,
        isFocusVisible,
        isFocused,
        isSelected: props.isSelected || false,
        isDisabled: props.isDisabled || false,
        defaultClassName: "",
      },
      hoverProps,
      pressProps,
      focusProps,
    ),
    state,
    ref,
  );
  return (
    <label
      {...toggleButton.buttonProps}
      ref={ref}
      htmlFor={props.htmlFor}
      className={
        typeof props.className === "function"
          ? props.className(
              mergeProps(props, {
                state,
                isHovered,
                isPressed,
                isFocusVisible,
                isFocused,
                isSelected: props.isSelected || false,
                isDisabled: props.isDisabled || false,
                defaultClassName: "",
              }),
            )
          : props.className
      }
    >
      {props.children}
    </label>
  );
});
