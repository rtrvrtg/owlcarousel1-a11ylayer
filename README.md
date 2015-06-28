# Owl Carousel v1 Accessibility Layer

Accessibility layer for [Owl Carousel v1](https://github.com/OwlFonk/OwlCarousel).

## Authorship

Written by [Geoffrey Roberts](mailto:g.roberts@blackicemedia.com)

## License

MIT

@TODO: Set up a LICENSE file

## Features

* Keyboard control (arrow keys)
* Focusable controls & panes
* ARIA attributes for visibility
* Text description of behaviour and changes

## Requirements

* jQuery
* Owl Carousel
* [jquery-throttle-debounce](http://benalman.com/projects/jquery-throttle-debounce-plugin/)
* [Owl Carousel v1 Pseudo-Plugins](https://github.com/rtrvrtg/owlcarousel1-pseudoplugins/commits?author=rtrvrtg)

## Installation

In the `<head>` of your page, after you set up your jQuery, Owl Carousel and jquery-throttle-debounce `<script>` items, add the following:

```html
<script type="text/javascript" src="owlcarousel-a11ylayer.js"></script>
```

## Usage

Since this accessibility layer uses the Owl Carousel v1 Pseudo-Plugin architecture, you can apply it to some Owl Carousel settings by using the following:

```javascript
var settings = {};
OwlA11y.Plugin.applyTo(settings);
$(".owl-carousel").owlCarousel(settings);
```

## Changelog

### v0.1

Initial commit