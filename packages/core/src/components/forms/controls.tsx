/*
 * Copyright 2016 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the terms of the LICENSE file distributed with this project.
 */

// we need some empty interfaces to show up in docs
// HACKHACK: these components should go in separate files
// tslint:disable max-classes-per-file no-empty-interface

import classNames from "classnames";
import * as React from "react";

import { Alignment } from "../../common/alignment";
import * as Classes from "../../common/classes";
import { HTMLInputProps, IProps } from "../../common/props";
import { safeInvoke } from "../../common/utils";

export interface IControlProps extends IProps, HTMLInputProps {
    // NOTE: HTML props are duplicated here to provide control-specific documentation

    /**
     * Alignment of the indicator within container.
     * @default Alignment.LEFT
     */
    alignIndicator?: Alignment;

    /** Whether the control is checked. */
    checked?: boolean;

    /** JSX label for the control. */
    children?: React.ReactNode;

    /** Whether the control is initially checked (uncontrolled mode). */
    defaultChecked?: boolean;

    /** Whether the control is non-interactive. */
    disabled?: boolean;

    /** Ref handler that receives HTML `<input>` element backing this component. */
    inputRef?: (ref: HTMLInputElement | null) => any;

    /** Whether the control should appear as an inline element. */
    inline?: boolean;

    /**
     * Text label for the control.
     *
     * Use `children` or `labelElement` to supply JSX content. This prop actually supports JSX elements,
     * but TypeScript will throw an error because `HTMLAttributes` only allows strings.
     */
    label?: string;

    /**
     * JSX Element label for the control.
     *
     * This prop is a workaround for TypeScript consumers as the type definition for `label` only
     * accepts strings. JavaScript consumers can provide a JSX element directly to `label`.
     */
    labelElement?: React.ReactNode;

    /** Whether this control should use large styles. */
    large?: boolean;

    /** Event handler invoked when input value is changed. */
    onChange?: React.FormEventHandler<HTMLInputElement>;

    /**
     * Name of the HTML tag that wraps the checkbox.
     *
     * By default a `<label>` is used, which effectively enlarges the click
     * target to include all of its children. Supply a different tag name if
     * this behavior is undesirable or you're listening to click events from a
     * parent element (as the label can register duplicate clicks).
     *
     * @default "label"
     */
    tagName?: keyof JSX.IntrinsicElements;
}

/** Internal props for Checkbox/Radio/Switch to render correctly. */
interface IControlInternalProps extends IControlProps {
    type: "checkbox" | "radio";
    typeClassName: string;
}

/**
 * Renders common control elements, with additional props to customize appearance.
 * This component is not exported and is only used in this file for `Checkbox`, `Radio`, and `Switch` below.
 */
const Control: React.SFC<IControlInternalProps> = ({
    alignIndicator,
    children,
    className,
    inline,
    inputRef,
    label,
    labelElement,
    large,
    style,
    type,
    typeClassName,
    tagName: TagName = "label",
    ...htmlProps
}) => {
    const classes = classNames(
        Classes.CONTROL,
        typeClassName,
        {
            [Classes.DISABLED]: htmlProps.disabled,
            [Classes.INLINE]: inline,
            [Classes.LARGE]: large,
        },
        Classes.alignmentClass(alignIndicator),
        className,
    );
    return (
        <TagName className={classes} style={style}>
            <input {...htmlProps} ref={inputRef} type={type} />
            <span className={Classes.CONTROL_INDICATOR} />
            {label}
            {labelElement}
            {children}
        </TagName>
    );
};

//
// Switch
//

export interface ISwitchProps extends IControlProps {}

export class Switch extends React.PureComponent<ISwitchProps> {
    public static displayName = "Blueprint2.Switch";

    public render() {
        return <Control {...this.props} type="checkbox" typeClassName={Classes.SWITCH} />;
    }
}

//
// Radio
//

export interface IRadioProps extends IControlProps {}

export class Radio extends React.PureComponent<IRadioProps> {
    public static displayName = "Blueprint2.Radio";

    public render() {
        return <Control {...this.props} type="radio" typeClassName={Classes.RADIO} />;
    }
}

//
// Checkbox
//

export interface ICheckboxProps extends IControlProps {
    /** Whether this checkbox is initially indeterminate (uncontrolled mode). */
    defaultIndeterminate?: boolean;

    /**
     * Whether this checkbox is indeterminate, or "partially checked."
     * The checkbox will appear with a small dash instead of a tick to indicate that the value
     * is not exactly true or false.
     *
     * Note that this prop takes precendence over `checked`: if a checkbox is marked both
     * `checked` and `indeterminate` via props, it will appear as indeterminate in the DOM.
     */
    indeterminate?: boolean;
}

export interface ICheckboxState {
    // Checkbox adds support for uncontrolled indeterminate state
    indeterminate: boolean;
}

export class Checkbox extends React.PureComponent<ICheckboxProps, ICheckboxState> {
    public static displayName = "Blueprint2.Checkbox";

    public state: ICheckboxState = {
        indeterminate: this.props.indeterminate || this.props.defaultIndeterminate || false,
    };

    // must maintain internal reference for `indeterminate` support
    private input: HTMLInputElement;

    public render() {
        const { defaultIndeterminate, indeterminate, ...controlProps } = this.props;
        return (
            <Control
                {...controlProps}
                inputRef={this.handleInputRef}
                onChange={this.handleChange}
                type="checkbox"
                typeClassName={Classes.CHECKBOX}
            />
        );
    }

    public componentWillReceiveProps({ indeterminate }: ICheckboxProps) {
        // put props into state if controlled by props
        if (indeterminate != null) {
            this.setState({ indeterminate });
        }
    }

    public componentDidMount() {
        this.updateIndeterminate();
    }

    public componentDidUpdate() {
        this.updateIndeterminate();
    }

    private updateIndeterminate() {
        if (this.state.indeterminate != null) {
            this.input.indeterminate = this.state.indeterminate;
        }
    }

    private handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        const { indeterminate } = evt.target;
        // update state immediately only if uncontrolled
        if (this.props.indeterminate == null) {
            this.setState({ indeterminate });
        }
        // otherwise wait for props change. always invoke handler.
        safeInvoke(this.props.onChange, evt);
    };

    private handleInputRef = (ref: HTMLInputElement) => {
        this.input = ref;
        safeInvoke(this.props.inputRef, ref);
    };
}
