import React from 'react';
import PropTypes from 'prop-types';

const VALIDATIONS = {
  required: val => {
    if (!val || (typeof val === 'string' && val === '')) {
      throw new Error('This field is required.');
    }
  },
  minLength: (val, minLength) => {
    if (!val || `${val}`.length < minLength) {
      throw new Error(`This field must be longer than ${minLength} characters.`);
    }
  },
  maxLength: (val, maxLength) => {
    if (val && `${val}`.length > maxLength) {
      throw new Error(`This field cannot be less than ${maxLength} characters.`);
    }
  },
};

export default class Formbot extends React.Component {
  static propTypes = {
    initialValues: PropTypes.shape(),
    validations: PropTypes.shape({
      fieldName: PropTypes.oneOfType([PropTypes.func, PropTypes.shape()]),
    }),
    onFocus: PropTypes.func,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    onSubmit: PropTypes.func,
  };

  static defaultProps = {
    initialValues: {},
    validations: {},
    onFocus() {},
    onChange() {},
    onBlur() {},
    onSubmit() {},
  };

  state = {
    values: this.props.initialValues || {},
    fields: {},
    errors: {},
  };

  get validatable() {
    return Object.keys(this.props.validations);
  }

  get isValid() {
    return Object.values(this.state.errors).every(val => !val);
  }

  get values() {
    return this.state.values;
  }

  updateField(field, updates = {}) {
    return new Promise(promise => {
      const fieldState = this.state.fields[field] || {};

      this.setState(
        {
          fields: {
            ...this.state.fields,
            [field]: {
              ...fieldState,
              ...updates,
            },
          },
        },
        promise
      );
    });
  }

  reset = () => {
    this.setState({
      values: {},
      fields: {},
      errors: {},
    });
  };

  makeValidation = (validation, value) => {
    if (!validation.validator(value)) {
      throw new Error(validation.message || 'This field is required');
    }
  };

  validateField(field) {
    return new Promise(async resolve => {
      const validation = this.props.validations[field];

      if (!validation) return;

      const fieldValue = this.state.values[field];
      let errorMsg;

      try {
        if (typeof validation === 'function') {
          validation(fieldValue);
        } else {
          for (const method of Object.keys(validation)) {
            const validator = VALIDATIONS[method];

            if (!validator) {
              throw new Error(`Formbot: "${method}" is not a built-in validator.`);
            }

            validator(fieldValue, validation[method]);
          }
        }
      } catch (err) {
        errorMsg = err.message;
      } finally {
        await this.updateField(field, { validated: true });
        this.setState(
          {
            errors: {
              ...this.state.errors,
              [field]: errorMsg,
            },
          },
          resolve
        );
      }
    });
  }

  async validateAllFields() {
    for (const field of this.validatable) {
      await this.updateField(field, {});
      await this.validateField(field);
    }
  }

  onFocus = async field => {
    await this.updateField(field, { focused: true });
    this.props.onFocus(field);
  };

  onChange = async (field, value) => {
    await this.updateField(field, { validated: false });

    this.setState(
      {
        values: {
          ...this.state.values,
          [field]: value,
        },
      },
      () => {
        this.validateField(field);
      }
    );
  };

  onBlur = async field => {
    await this.updateField(field, { blurred: true });
    await this.validateField(field);

    this.props.onBlur(field);
  };

  onSubmit = async event => {
    event.preventDefault();

    await this.validateAllFields();

    this.props.onSubmit({
      isValid: this.isValid,
      values: this.state.values,
      errors: this.state.errors,
    });
  };

  render() {
    return this.props.children({
      ...this.props,
      values: this.state.values,
      errors: this.state.errors,
      onChange: this.onChange,
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      onSubmit: this.onSubmit,
      reset: this.reset,
    });
  }
}
