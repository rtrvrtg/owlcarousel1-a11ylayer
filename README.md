# Owl Carousel v1 Accessibility Layer

Accessibility layer for [Owl Carousel v1](https://github.com/OwlFonk/OwlCarousel).

## Authorship

Written by [Geoffrey Roberts](mailto:g.roberts@blackicemedia.com)

## License

MIT

## Features

* Keyboard control (arrow keys)
* Focusable controls & panes
* ARIA attributes for visibility
* Text description of behaviour and changes

## Requirements

* jQuery
* Owl Carousel
* [jquery-throttle-debounce](http://benalman.com/projects/jquery-throttle-debounce-plugin/)
* [Owl Carousel v1 Pseudo-Plugins](https://github.com/rtrvrtg/owlcarousel1-pseudoplugins)
* [JustMakeItBig.js](https://github.com/rtrvrtg/justmakeitbig.js) (optional, for full-screen only)

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

### Play/Pause Button

To show the play/pause button, add the `autoPlay` parameter to the settings, with the number of milliseconds as the value.

### Full-Screen Button

The Full-Screen button depends on [JustMakeItBig.js](https://github.com/rtrvrtg/justmakeitbig.js), and requires that you set `enableFullscreen: true` in your Owl Carousel settings.

## Changelog

### v0.2

* Fixed some nasty bugs to do with rapid attribute switching
* Adds play/pause button when autoPlay is enabled
* Adds full screen button

### v0.1

Initial commit