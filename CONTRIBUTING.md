# How to contribute

## Bugs & Questions

**Before posting, do a search to make sure your issue or questions hasn't already been reported or discussed.** If no matching issue exists, go ahead and create one. Please be sure to include all of the following:

1. A clear, descriptive title (ie. "A bug" is not a good title).
2. [A reduced test case.](https://css-tricks.com/reduced-test-cases/)
	- Clearly demonstrate the bug or issue.
	- Include the bare minimum HTML, CSS, and JavaScript required to demonstrate the bug.
	- A link to your production site is not a reduced test case.
3. The browser and OS that you're using.

Duplicates and issues without a reduced test case may be closed without comment.



## Feature Requests

Please create a separate issue for each request and clearly mark it as a feature request. Provide as much detail as you can.

If there's a feature listed there already that you'd like to see incorporated into the plugin, add your support.



## Submitting a Pull Request

Please make sure your code meets the following code standards:

- Camel case for JavaScript variables.
- [Object-Oriented CSS](http://www.slideshare.net/stubbornella/object-oriented-css) for CSS selectors.
- Favor readable code over brevity. The build process will reduce size, so opt for readability. (ex. `var navigation` is better than `var n`)
- Order CSS properties alphabetically.
- Hard tabs.

Before submitting, make sure that you've:

- Updated the version number using semantic versioning.
- Made your changes in the `src` folder.
- Run the Gulp build to compile, minify, and update version numbers into the `dist` folder. If you cannot do this, please note this in the Pull Request.