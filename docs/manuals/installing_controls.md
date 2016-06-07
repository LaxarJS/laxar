# Installing Controls

[« return to the manuals](index.md)

You can use third party controls or the LaxarJS controls which are available via Bower.
Alternatively you can clone them using git.
We published our controls on [github](https://github.com/LaxarJS?utf8=%E2%9C%93&query=control).


## Usage

To use a control in a widget, configure the path to the control in the RequireJS configuration of the application.
The expected path has to be relative to the RequireJS `baseUrl` configured for the application.

For example, assuming that your `baseUrl` is `'bower_components'` and the directory `includes` has the same root as the `bower_components`, add the following to the `paths` section of your `require_config.js` to use the `'myControl'`:

```js
'my-control': '../includes/controls/my-control'
```

Now reference the control from the `widget.json` of the widget:

```json
"controls": [ "my-control" ]
```

Use it as a custom attribute in the HTML template of the widget:

```html
<div my-control></div>
```
