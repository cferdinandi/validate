# Validate.js [![Build Status](https://travis-ci.org/cferdinandi/validate.svg)](https://travis-ci.org/cferdinandi/validate)
A lightweight form validation script that augments native HTML5 form validation elements and attributes, providing a better user experience and giving you more control.

When a visitor leaves a field, Validate.js immediately validates the field and displays an error if applicable. It also validates the entire form on submit, and provides support for custom `onSubmit()` functions (for example, Ajax form submission).

[Download Validate](https://github.com/cferdinandi/validate/archive/master.zip) / [View the demo](http://cferdinandi.github.io/validate/)


<hr>

### Want to learn how to write your own vanilla JS plugins? Get my free [daily developer tips](https://gomakethings.com/newsletter/) and level-up as a web developer. 🚀

<hr>



## Getting Started

Compiled and production-ready code can be found in the `dist` directory. The `src` directory contains development code.

### 1. Include Validate.js on your site.

```html
<script src="dist/js/validate.js"></script>
```

### 2. Use HTML5 semantic input types and validation-related attributes on your form fields.

Add the `required` attribute to required fields. Use `type="email"` and `type="url"` for email addresses and URLs, respectively. Include `pattern` attributes, `min` and `max`, and so on to set validation criteria for your form fields. View a [full list of types and attributes on MDN](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation#Intrinsic_and_basic_constraints).

```html
<div>
	<label for="email">Email</label>
	<input type="email" id="email" required>
</div>

<div>
	<label for="url">URL</label>
	<input type="url" id="url" required>
</div>
```

If you're using validation patterns, you can also include a `title` with a custom validation message. This will display in the error message.

```html
<div>
	<label for="password">Password (At least 1 uppercase character, 1 lowercase character, and 1 number)</label>
	<input type="password" id="password" value="" title="Please choose a password that includes at least 1 uppercase character, 1 lowercase character, and 1 number." pattern="^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$" required>
</div>
```

### 3. Flag your form for validation.

Add the `[data-validate]` attribute to any forms you want validated.

```html
<form data-validate>
	...
</form>
```

### 4. Initialize Validate.js.

In the footer of your page, after the content, initialize Validate.js. And that's it, you're done. Nice work!

```html
<script>
	validate.init();
</script>
```



## Styling Errors

Validate.js does not come pre-packaged with any styles for fields with errors or error messages. Use the `.error` class to style fields, and the `.error-message` class to style error messages.

Need a starting point? Here's some really lightweight CSS you can use.

```css
/**
 * Form Validation Errors
 */
.error {
	border-color: red;
}

.error-message {
	color: red;
	font-style: italic;
	margin-bottom: 1em;
}
```



## Installing with Package Managers

You can install Validate.js with your favorite package manager directly from GitHub (it's not available on NPM).

* **[NPM](https://www.npmjs.org/):** `npm install cferdinandi/validate`
* **[Bower](http://bower.io/):** `bower install https://github.com/cferdinandi/validate.git`



## Working with the Source Files

If you would prefer, you can work with the development code in the `src` directory using the included [Gulp build system](http://gulpjs.com/). This compiles, lints, and minifies code.

### Dependencies
Make sure these are installed first.

* [Node.js](http://nodejs.org)
* [Gulp](http://gulpjs.com) `sudo npm install -g gulp`

### Quick Start

1. In bash/terminal/command line, `cd` into your project directory.
2. Run `npm install` to install required files.
3. When it's done installing, run one of the task runners to get going:
	* `gulp` manually compiles files.
	* `gulp watch` automatically compiles files when changes are made and applies changes using [LiveReload](http://livereload.com/).



## Options and Settings

Validate.js includes smart defaults and works right out of the box. But if you want to customize things, it also has a robust API that provides multiple ways for you to adjust the default options and settings.

### Global Settings

You can pass options and callbacks into Validate through the `init()` function:

```javascript
validate.init({

	// Classes and Selectors
	selector: '[data-validate]', // The selector for forms to validate
	fieldClass: 'error', // The class to apply to fields with errors
	errorClass: 'error-message', // The class to apply to error messages

	// Messages
	messageValueMissing: 'Please fill out this field.', // Displayed when a required field is left empty
	messageTypeMismatchEmail: 'Please enter an email address.', // Displayed when a `type="email"` field isn't a valid email
	messageTypeMismatchURL: 'Please enter a URL.', // Displayed when a `type="url"` field isn't a valid URL
	messageTooShort: 'Please lengthen this text to {minLength} characters or more. You are currently using {length} characters.', // Displayed with the `minLength` attribute is used and the input value is too short
	messageTooLong: 'Please shorten this text to no more than {maxLength} characters. You are currently using {length} characters.', // Displayed with the `maxLength` attribute is used and the input value is too long
	messagePatternMismatch: 'Please match the requested format.', // Displayed with the `pattern` attribute is used and the pattern doesn't match (if a `title` attribute is used, that's displayed instead)
	messageBadInput: 'Please enter a number.', // Displayed when the field is numeric (ex. `type="number"`) but the value is not a number
	messageStepMismatch: 'Please select a valid value.', // Displayed when the `step` attribute is used and the value doesn't adhere to it
	messageRangeOverflow: 'Please select a value that is no more than {max}.', // Displayed with the `max` attribute is used and the input value is too hight
	messageRangeUnderflow: 'Please select a value that is no less than {min}.', // Displayed with the `mind` attribute is used and the input value is too low
	messageGeneric: 'The value you entered for this field is invalid.', // A catchall error, displayed when the field fails validation and none of the other conditions apply

	// Form Submission
	disableSubmit: false, // If true, don't submit the form to the server (for Ajax for submission)
	onSubmit: function () {}, // Function to run if the form successfully validates

	// Callbacks
	beforeShowError: function () {}, // Function to run before an error is display
	afterShowError: function () {}, // Function to run after an error is display
	beforeRemoveError: function () {}, // Function to run before an error is removed
	afterRemoveError: function () {}, // Function to run after an error is removed

});
```

### Use Validate.js events in your own scripts

You can also call Validate.js's public methods in your own scripts.

#### hasError()
Check if a field has a validation error.

```javascript
validate.hasError(
	field, // The field to validate
	options // User settings, same as the ones passed in during validate.init() [optional]
);
```

**Example**

```javascript
var field = document.querySelector('[name="email"]');
var error = validate.hasError(field);

if (error) {
	// Do something...
}
```

#### showError()
Show an error message on a field.

```javascript
validate.showError(
	field, // The field to show an error message for
	error, // The error message to show
	options // User settings, same as the ones passed in during validate.init() [optional]
);
```

**Example 1: Write your own error**

```javascript
var field = document.querySelector('[name="email"]');
var error = 'This field is wrong, dude!';
validate.showError(field, error);
```

**Example 2: Using `hasError()`**

```javascript
var field = document.querySelector('[name="url"]');
var error = validate.hasError(field);
validate.showError(field, error);
```

#### removeError()
Remove the error message from a field.

```javascript
/**
 * Remove an error message from a field
 * @public
 * @param  {Node}   field   The field to remove the error from
 * @param  {Object} options User options
 */
validate.removeError(
	field, // The field to remove the error from
	options // User settings, same as the ones passed in during validate.init() [optional]
);
```

**Example**

```javascript
var field = document.querySelector('[name="email"]');
validate.removeError(field);
```

#### destroy()
Destroy the current `validate.init()`. Removes all errors and resets the DOM. This is called automatically during the `init` function to remove any existing initializations.

```javascript
validate.destroy();
```


## Browser Compatibility

Validate.js works in all modern browsers, and (mostly) IE 10 and above.

Unfortunately, not all validation types are supported by all versions of IE and Edge consistently. For example, IE10 and IE11 will check if a form input is too long (using the `maxLength` attribute), but Edge will not. And no version of IE or Edge will check if it's too short (using the `minLength` attribute).

### A Polyfill

Validate.js includes an optional polyfill (`validityState-polyfill.js`) that you can include to push support back to IE10, and add missing features to partially supported browsers.

If you also include [Eli Grey's classList.js polyfill](https://github.com/eligrey/classList.js/), you can push support even further, back to IE9.



## How to Contribute

Please review the [contributing guidelines](CONTRIBUTING.md).



## License

The code is available under the [MIT License](LICENSE.md).