/*!
 * validate v2.2.0: A lightweight form validation script that augments native HTML5 form validation elements and attributes.
 * (c) 2018 Chris Ferdinandi
 * MIT License
 * http://github.com/cferdinandi/validate
 */

;(function (window, document, undefined) {

	'use strict';

	// Make sure that ValidityState is supported in full (all features)
	var supported = function () {
		var input = document.createElement('input');
		return ('validity' in input && 'badInput' in input.validity && 'patternMismatch' in input.validity && 'rangeOverflow' in input.validity && 'rangeUnderflow' in input.validity && 'stepMismatch' in input.validity && 'tooLong' in input.validity && 'tooShort' in input.validity && 'typeMismatch' in input.validity && 'valid' in input.validity && 'valueMissing' in input.validity);
	};

	// Save browser's own implementation if available
	var browserValidityFunctions = (function() {
		var inputValidity = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'validity');
		var buttonValidity = Object.getOwnPropertyDescriptor(HTMLButtonElement.prototype, 'validity');
		var selectValidity = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'validity');
		var textareaValidity = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'validity');

		var functions = {};
		if (inputValidity) {
			functions.input = inputValidity.get;
		}
		if (buttonValidity) {
			functions.button = buttonValidity.get;
		}
		if (selectValidity) {
			functions.select = selectValidity.get;
		}
		if (textareaValidity) {
			functions.textarea = textareaValidity.get;
		}

		return functions;
	})();

	/**
	 * Generate the field validity object
	 * @param  {Node]} field The field to validate
	 * @return {Object}      The validity object
	 */
	var getValidityState = function (field) {

		// Variables
		var type = field.getAttribute('type') || field.nodeName.toLowerCase();
		var isNum = type === 'number' || type === 'range';
		var length = field.value.length;
		var valid = true;

		// If radio group, get selected field
		if (field.type === 'radio' && field.name) {
			var group = document.getElementsByName(field.name);
			if (group.length > 0) {
				for (var i = 0; i < group.length; i++) {
					if (group[i].form === field.form && field.checked) {
						field = group[i];
						break;
					}
				}
			}
		}

		// Run validity checks
		var checkValidity = {
			badInput: (isNum && length > 0 && !/^[-+]?(?:\d+|\d*[.,]\d+)$/.test(field.value)), // value of a number field is not a number
			patternMismatch: (field.hasAttribute('pattern') && length > 0 && new RegExp(field.getAttribute('pattern')).test(field.value) === false), // value does not conform to the pattern
			rangeOverflow: (field.hasAttribute('max') && isNum && field.value > 0 && Number(field.value) > Number(field.getAttribute('max'))), // value of a number field is higher than the max attribute
			rangeUnderflow: (field.hasAttribute('min') && isNum && field.value > 0 && Number(field.value) < Number(field.getAttribute('min'))), // value of a number field is lower than the min attribute
			stepMismatch: (isNum && ((field.hasAttribute('step') && field.getAttribute('step') !== 'any' && Number(field.value) % Number(field.getAttribute('step')) !== 0) || (!field.hasAttribute('step') && Number(field.value) % 1 !== 0))), // value of a number field does not conform to the stepattribute
			tooLong: (field.hasAttribute('maxLength') && field.getAttribute('maxLength') > 0 && length > parseInt(field.getAttribute('maxLength'), 10)), // the user has edited a too-long value in a field with maxlength
			tooShort: (field.hasAttribute('minLength') && field.getAttribute('minLength') > 0 && length > 0 && length < parseInt(field.getAttribute('minLength'), 10)), // the user has edited a too-short value in a field with minlength
			typeMismatch: (length > 0 && ((type === 'email' && !/^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/.test(field.value)) || (type === 'url' && !/^(?:(?:https?|HTTPS?|ftp|FTP):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-zA-Z\u00a1-\uffff0-9]-*)*[a-zA-Z\u00a1-\uffff0-9]+)(?:\.(?:[a-zA-Z\u00a1-\uffff0-9]-*)*[a-zA-Z\u00a1-\uffff0-9]+)*)(?::\d{2,5})?(?:[\/?#]\S*)?$/.test(field.value)))), // value of a email or URL field is not an email address or URL
			valueMissing: (field.hasAttribute('required') && (((type === 'checkbox' || type === 'radio') && !field.hasAttribute('checked')) || (type === 'select' && (field.selectedIndex === -1 || field.options[field.selectedIndex].value.length < 1)) || (type !== 'checkbox' && type !== 'radio' && type !=='select' && length < 1))) // required field without a value
		};

		// Run browser's own validation if available
		var fieldTagName = field.tagName.toLowerCase();
		var browserValidity = fieldTagName in browserValidityFunctions ? browserValidityFunctions[fieldTagName].call(field) : {};

		// Check if any errors
		for (var key in checkValidity) {
			if (checkValidity.hasOwnProperty(key)) {
				// If browser has detected an error, adopt it to our validity object
				if (key in browserValidity && browserValidity[key]) {
					checkValidity[key] = true;
				}

				// If there's an error, change valid value
				if (checkValidity[key]) {
					valid = false;
				}
			}
		}

		// Add valid property to validity object
		checkValidity.valid = valid;

		// Return object
		return checkValidity;

	};

	// If the full set of ValidityState features aren't supported, polyfill
	if (!supported()) {
		Object.defineProperty(HTMLInputElement.prototype, 'validity', {
			get: function ValidityState() {
				return getValidityState(this);
			},
			configurable: true,
		});
		Object.defineProperty(HTMLButtonElement.prototype, 'validity', {
			get: function ValidityState() {
				return getValidityState(this);
			},
			configurable: true,
		});
		Object.defineProperty(HTMLSelectElement.prototype, 'validity', {
			get: function ValidityState() {
				return getValidityState(this);
			},
			configurable: true,
		});
		Object.defineProperty(HTMLTextAreaElement.prototype, 'validity', {
			get: function ValidityState() {
				return getValidityState(this);
			},
			configurable: true,
		});
	}

})(window, document);
(function (root, factory) {
	if ( typeof define === 'function' && define.amd ) {
		define([], factory(root));
	} else if ( typeof exports === 'object' ) {
		module.exports = factory(root);
	} else {
		root.validate = factory(root);
	}
})(typeof global !== 'undefined' ? global : this.window || this.global, (function (root) {

	'use strict';

	//
	// Variables
	//

	var validate = {}; // Object for public APIs
	var settings;

	// Default settings
	var defaults = {

		// Classes and Selectors
		selector: '[data-validate]',
		fieldClass: 'error',
		errorClass: 'error-message',

		// Messages
		messageValueMissing: 'Please fill out this field.',
		messageValueMissingCheckbox: 'This field is required.',
		messageValueMissingRadio: 'Please select a value.',
		messageValueMissingSelect: 'Please select a value.',
		messageValueMissingSelectMulti: 'Please select at least one value.',
		messageTypeMismatchEmail: 'Please enter an email address.',
		messageTypeMismatchURL: 'Please enter a URL.',
		messageTooShort: 'Please lengthen this text to {minLength} characters or more. You are currently using {length} characters.',
		messageTooLong: 'Please shorten this text to no more than {maxLength} characters. You are currently using {length} characters.',
		messagePatternMismatch: 'Please match the requested format.',
		messageBadInput: 'Please enter a number.',
		messageStepMismatch: 'Please select a valid value.',
		messageRangeOverflow: 'Please select a value that is no more than {max}.',
		messageRangeUnderflow: 'Please select a value that is no less than {min}.',
		messageGeneric: 'The value you entered for this field is invalid.',

		// Form Submission
		disableSubmit: false,
		onSubmit: function () {},

		// Callbacks
		beforeShowError: function () {},
		afterShowError: function () {},
		beforeRemoveError: function () {},
		afterRemoveError: function () {}

	};


	//
	// Methods
	//

	/**
	 * Element.matches() polyfill (simple version)
	 * https://developer.mozilla.org/en-US/docs/Web/API/Element/matches#Polyfill
	 */
	if (!Element.prototype.matches) {
		Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
	}

	/**
	 * Feature test
	 * @return {Boolean} Returns true if required methods and APIs are supported by the browser
	 */
	var supports = function () {
		return 'querySelector' in document && 'addEventListener' in root;
	};

	/**
	 * Merge two or more objects. Returns a new object.
	 * @private
	 * @param {Boolean}  deep     If true, do a deep (or recursive) merge [optional]
	 * @param {Object}   objects  The objects to merge together
	 * @returns {Object}          Merged values of defaults and options
	 */
	var extend = function () {

		// Variables
		var extended = {};
		var deep = false;
		var i = 0;
		var length = arguments.length;

		// Check if a deep merge
		if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
			deep = arguments[0];
			i++;
		}

		// Merge the object into the extended object
		var merge = function (obj) {
			for ( var prop in obj ) {
				if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
					// If deep merge and property is an object, merge properties
					if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
						extended[prop] = extend( true, extended[prop], obj[prop] );
					} else {
						extended[prop] = obj[prop];
					}
				}
			}
		};

		// Loop through each object and conduct a merge
		for ( ; i < length; i++ ) {
			var obj = arguments[i];
			merge(obj);
		}

		return extended;

	};

	/**
	 * Get the closest matching element up the DOM tree.
	 * @private
	 * @param  {Element} elem     Starting element
	 * @param  {String}  selector Selector to match against
	 * @return {Boolean|Element}  Returns null if not match found
	 */
	var getClosest = function ( elem, selector ) {
		for ( ; elem && elem !== document; elem = elem.parentNode ) {
			if ( elem.matches( selector ) ) return elem;
		}
		return null;
	};

	/**
	 * Validate a form field
	 * @public
	 * @param  {Node}    field   The field to validate
	 * @param  {Object}  options User options
	 * @return {String}          The error message
	 */
	validate.hasError = function (field, options) {

		// Merge user options with existing settings or defaults
		var localSettings = extend(settings || defaults, options || {});

		// Don't validate submits, buttons, file and reset inputs, and disabled fields
		if (field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') return;

		// Get validity
		var validity = field.validity;

		// If valid, return null
		if (validity.valid) return;

		// If field is required and empty
		if (validity.valueMissing) {

			if (field.type === 'checkbox') return localSettings.messageValueMissingCheckbox;

			if (field.type === 'radio') return localSettings.messageValueMissingRadio;

			if (field.type === 'select-multiple') return localSettings.messageValueMissingSelectMulti;

			if (field.type === 'select-one') return localSettings.messageValueMissingSelect;

			return localSettings.messageValueMissing;
		}

		// If not the right type
		if (validity.typeMismatch) {

			// Email
			if (field.type === 'email') return localSettings.messageTypeMismatchEmail;

			// URL
			if (field.type === 'url') return localSettings.messageTypeMismatchURL;

		}

		// If too short
		if (validity.tooShort) return localSettings.messageTooShort.replace('{minLength}', field.getAttribute('minLength')).replace('{length}', field.value.length);

		// If too long
		if (validity.tooLong) return localSettings.messageTooLong.replace('{minLength}', field.getAttribute('maxLength')).replace('{length}', field.value.length);

		// If number input isn't a number
		if (validity.badInput) return localSettings.messageBadInput;

		// If a number value doesn't match the step interval
		if (validity.stepMismatch) return localSettings.messageStepMismatch;

		// If a number field is over the max
		if (validity.rangeOverflow) return localSettings.messageRangeOverflow.replace('{max}', field.getAttribute('max'));

		// If a number field is below the min
		if (validity.rangeUnderflow) return localSettings.messageRangeUnderflow.replace('{min}', field.getAttribute('min'));

		// If pattern doesn't match
		if (validity.patternMismatch) {

			// If pattern info is included, return custom error
			if (field.hasAttribute('title')) return field.getAttribute('title');

			// Otherwise, generic error
			return localSettings.messagePatternMismatch;

		}

		// If all else fails, return a generic catchall error
		return localSettings.messageGeneric;

	};

	/**
	 * Show an error message on a field
	 * @public
	 * @param  {Node}   field   The field to show an error message for
	 * @param  {String} error   The error message to show
	 * @param  {Object} options User options
	 */
	validate.showError = function (field, error, options) {

		// Merge user options with existing settings or defaults
		var localSettings = extend(settings || defaults, options || {});

		// Before show error callback
		localSettings.beforeShowError(field, error);

		// Add error class to field
		field.classList.add(localSettings.fieldClass);

		// If the field is a radio button and part of a group, error all and get the last item in the group
		if (field.type === 'radio' && field.name) {
			var group = document.getElementsByName(field.name);
			if (group.length > 0) {
				for (var i = 0; i < group.length; i++) {
					if (group[i].form !== field.form) continue; // Only check fields in current form
					group[i].classList.add(localSettings.fieldClass);
				}
				field = group[group.length - 1];
			}
		}

		// Get field id or name
		var id = field.id || field.name;
		if (!id) return;

		// Check if error message field already exists
		// If not, create one
		var message = field.form.querySelector('.' + localSettings.errorClass + '#error-for-' + id );
		if (!message) {
			message = document.createElement('div');
			message.className = localSettings.errorClass;
			message.id = 'error-for-' + id;

			// If the field is a radio button or checkbox, insert error after the label
			var label;
			if (field.type === 'radio' || field.type ==='checkbox') {
				label = field.form.querySelector('label[for="' + id + '"]') || getClosest(field, 'label');
				if (label) {
					label.parentNode.insertBefore( message, label.nextSibling );
				}
			}

			// Otherwise, insert it after the field
			if (!label) {
				field.parentNode.insertBefore( message, field.nextSibling );
			}
		}

		// Add ARIA role to the field
		field.setAttribute('aria-describedby', 'error-for-' + id);

		// Update error message
		message.innerHTML = error;

		// Remove any existing styles hiding the error message
		message.style.display = '';
		message.style.visibility = '';

		// After show error callback
		localSettings.afterShowError(field, error);

	};

	/**
	 * Remove an error message from a field
	 * @public
	 * @param  {Node}   field   The field to remove the error from
	 * @param  {Object} options User options
	 */
	validate.removeError = function (field, options) {

		// Merge user options with existing settings or defaults
		var localSettings = extend(settings || defaults, options || {});

		// Before remove error callback
		localSettings.beforeRemoveError(field);

		// Remove ARIA role from the field
		field.removeAttribute('aria-describedby');

		// Remove error class to field
		field.classList.remove(localSettings.fieldClass);

		// If the field is a radio button and part of a group, remove error from all and get the last item in the group
		if (field.type === 'radio' && field.name) {
			var group = document.getElementsByName(field.name);
			if (group.length > 0) {
				for (var i = 0; i < group.length; i++) {
					if (group[i].form !== field.form) continue; // Only check fields in current form
					group[i].classList.remove(localSettings.fieldClass);
				}
				field = group[group.length - 1];
			}
		}

		// Get field id or name
		var id = field.id || field.name;
		if (!id) return;

		// Check if an error message is in the DOM
		var message = field.form.querySelector('.' + localSettings.errorClass + '#error-for-' + id + '');
		if (!message) return;

		// If so, hide it
		message.innerHTML = '';
		message.style.display = 'none';
		message.style.visibility = 'hidden';

		// After remove error callback
		localSettings.afterRemoveError(field);

	};

	/**
	 * Add the `novalidate` attribute to all forms
	 * @private
	 * @param {Boolean} remove  If true, remove the `novalidate` attribute
	 */
	var addNoValidate = function (remove) {
		var forms = document.querySelectorAll(settings.selector);
		for (var i = 0; i < forms.length; i++) {
			if (remove) {
				forms[i].removeAttribute('novalidate');
				continue;
			}
			forms[i].setAttribute('novalidate', true);
		}
	};

	/**
	 * Check field validity when it loses focus
	 * @private
	 * @param  {Event} event The blur event
	 */
	var blurHandler = function (event) {

		// Only run if the field is in a form to be validated
		if (!event.target.form || !event.target.form.matches(settings.selector)) return;

		// Validate the field
		var error = validate.hasError(event.target);

		// If there's an error, show it
		if (error) {
			validate.showError(event.target, error);
			return;
		}

		// Otherwise, remove any errors that exist
		validate.removeError(event.target);

	};

	/**
	 * Check radio and checkbox field validity when clicked
	 * @private
	 * @param  {Event} event The click event
	 */
	var clickHandler = function (event) {

		// Only run if the field is in a form to be validated
		if (!event.target.form || !event.target.form.matches(settings.selector)) return;

		// Only run if the field is a checkbox or radio
		var type = event.target.getAttribute('type');
		if (!(type === 'checkbox' || type === 'radio')) return;

		// Validate the field
		var error = validate.hasError(event.target);

		// If there's an error, show it
		if (error) {
			validate.showError(event.target, error);
			return;
		}

		// Otherwise, remove any errors that exist
		validate.removeError(event.target);

	};

	/**
	 * Check all fields on submit
	 * @private
	 * @param  {Event} event  The submit event
	 */
	var submitHandler = function (event) {

		// Only run on forms flagged for validation
		if (!event.target.matches(settings.selector)) return;

		// Get all of the form elements
		var fields = event.target.elements;

		// Validate each field
		// Store the first field with an error to a variable so we can bring it into focus later
		var hasErrors;
		for (var i = 0; i < fields.length; i++) {
			var error = validate.hasError(fields[i]);
			if (error) {
				validate.showError(fields[i], error);
				if (!hasErrors) {
					hasErrors = fields[i];
				}
			}
		}

		// Prevent form from submitting if there are errors or submission is disabled
		if (hasErrors || settings.disableSubmit) {
			event.preventDefault();
		}

		// If there are errrors, focus on first element with error
		if (hasErrors) {
			hasErrors.focus();
			return;
		}

		// Otherwise, submit the form
		settings.onSubmit(event.target, fields);

	};

	/**
	 * Destroy the current initialization.
	 * @public
	 */
	validate.destroy = function () {

		// If plugin isn't already initialized, stop
		if ( !settings ) return;

		// Remove event listeners
		document.removeEventListener('blur', blurHandler, true);
		document.removeEventListener('click', clickHandler, false);
		document.removeEventListener('submit', submitHandler, false);

		// Remove all errors
		var fields = document.querySelectorAll(settings.errorClass);
		for (var i = 0; i < fields.length; i++) {
			validate.removeError(fields[i]);
		}

		// Remove `novalidate` from forms
		addNoValidate(true);

		// Reset variables
		settings = null;

	};

	/**
	 * Initialize Validate
	 * @public
	 * @param {Object} options User settings
	 */
	validate.init = function (options) {

		// feature test
		if (!supports()) return;

		// Destroy any existing initializations
		validate.destroy();

		// Merge user options with defaults
		settings = extend(defaults, options || {});

		// Add the `novalidate` attribute to all forms
		addNoValidate();

		// Event listeners
		document.addEventListener('blur', blurHandler, true);
		document.addEventListener('click', clickHandler, true);
		document.addEventListener('submit', submitHandler, false);

	};


	//
	// Public APIs
	//

	return validate;

}));