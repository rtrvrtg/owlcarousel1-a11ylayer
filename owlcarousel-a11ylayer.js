/**
 * Owl Carousel v1 Accessibility Layer
 * v0.2
 */

var OwlA11y = {};

// Owl Accessiblity Internals
OwlA11y.Internals = {
  // Element functions
  element: {
    init: function(e){
      OwlA11y.Internals.element.makeID(e);
      OwlA11y.Internals.visibleItems.mark(e.owl);
      OwlA11y.Internals.element.controls(e.owl.baseElement);
      OwlA11y.Internals.description.setup(e.owl.baseElement);
      e.reload();
      // Delay initialise finalisation by half a second
      // so we don't clobber initial focus
      setTimeout(function() {
        e.owl.baseElement.attr('data-owl-access-initialised', '1');
      }, 500);
    },
    makeID: function(e) {
      if (!e.owl.baseElement.attr('id')) {
        e.owl.baseElement.attr(
          'id',
          OwlPlugins.utils.makeID('owl-carousel')
        );
      }
    },
    busy: function(e){
      e.attr('aria-busy', 'true');
    },
    notBusy: function(e){
      e.attr('aria-busy', 'false');
    },
    controls: function(elem){
      var controlsID = OwlPlugins.utils.makeID('owl-controls');
      elem.find('.owl-controls').attr({
        'id': controlsID,
        'aria-hidden': 'true',
        'aria-controls': controlsID
      });
    },
    markFocused: function(elem){
      $(elem).attr('data-owl-carousel-focused', '1');
    },
    markUnfocused: function(elem){
      $(elem).removeAttr('data-owl-carousel-focused');
    },
    ifFocused: function(elem, fn) {
      if ($(elem).attr('data-owl-carousel-focused') == '1') fn(elem);
    },
    ifUnfocused: function(elem, fn) {
      if ($(elem).attr('data-owl-carousel-focused') !== '1') fn(elem);
    },
    makeHiddenPara: function(message, id, className, additional){
      var newpAttrs = {
        id:             id,
        hidden:         true,
        'aria-hidden':  false
      };
      if (!!additional && $.isPlainObject(additional)) {
        $.extend(newpAttrs, additional);
      }
      var newp = document.createElement('p');
      newp.className = className;
      for (var i in newpAttrs) {
        newp.setAttribute(i, newpAttrs[i]);
      }
      newp.appendChild(document.createTextNode(message));
      return newp;
    },
    focused: function(e){
      var targ = $(e.target);
      if (targ.attr('data-owl-carousel-focusable') == "1") {
        return targ;
      }
      var closest = targ.closest('[data-owl-carousel-focusable="1"]');
      if (closest.length > 0) return closest;
      return null;
    },
    refocus: function(owl) {
      var focused = $(':focus');
      if (!!owl.baseElement.attr('data-owl-access-initialised')) {
        if (focused.length > 0) {
          var e = { target: focused };
          var targ = OwlA11y.Internals.element.focused(e);
          if (!!targ && targ.get(0) != focused.get(0)) {
            targ.focus();
          }
        }
      }
    }
  },
  // Description functions
  description: {
    // Checks if a description exists
    hasDescription: function(elem){
      return $(elem).find('.owl-access-description').length > 0;
    },
    // Set up description
    setup: function(elem) {
      if (!OwlA11y.Internals.description.hasDescription(elem)) {
        OwlA11y.Internals.description.teardown(elem.get(0));
      }
      var descriptionID = OwlPlugins.utils.makeID('owl-description');
      var message = "Pan through this carousel with the left and right arrow keys.";
      if (!!$(elem).attr('data-owl-carousel-accessmessage')) {
        message = $(elem).attr('data-owl-carousel-accessmessage');
      }
      var helper = OwlA11y.Internals.element.makeHiddenPara(
        message,
        descriptionID,
        "owl-access-description element-invisible"
      );
      $(elem).prepend(helper).attr("aria-describedby", descriptionID);
    },
    // Delete description
    teardown: function(elem) {
      var descID = elem.getAttribute("aria-describedby");
      if (!!descID) {
        $('#' + descID).remove();
        elem.removeAttribute("aria-describedby");
      }
    }
  },
  // Blips: Change notifications
  blips: {
    // Set a blip to trigger ARIA change notification
    set: function(owl) {
      var blipID = OwlPlugins.utils.makeID("owl-blip");
      var blip = OwlA11y.Internals.element.makeHiddenPara(
        "The carousel has moved.",
        blipID,
        "owl-access-blip"
      );
      $(owl.baseElement).prepend(blip);
      setTimeout(function(){
        OwlA11y.Internals.blips.clear(owl.baseElement);
      }, 1000);
    },
    // Clear all blips
    clear: function(elem){
      $(elem).find(".owl-access-blip").remove();
    }
  },
  // Visible items
  visibleItems: {
    markSlide: function(slide, isFocusable){
      // Mark aria-hidden and tabindex on slide
      slide.setAttribute('aria-hidden', isFocusable ? 'false' : 'true');
      slide.setAttribute('tabindex', isFocusable ? '0' : '-1');

      if (isFocusable) {
        // Make all tabindexable children tabbable
        var children = slide.querySelectorAll('*[data-tabindex-default]');
        for (var i = 0; i < children.length; i++) {
          var recoveredTabindex = children[i].getAttribute('data-tabindex-default');
          children[i].setAttribute('tabindex', recoveredTabindex);
        }
      }
      else {
        // Make all tabindexable children... un-tabbable.
        var children = slide.querySelectorAll('a, *[tabindex]');
        for (var i = 0; i < children.length; i++) {
          var tabindex = children[i].getAttribute('tabindex');
          if (!tabindex) tabindex = "0";
          if (parseInt(tabindex, 10) >= 0) {
            children[i].setAttribute('data-tabindex-default', tabindex);
            children[i].setAttribute('tabindex', '-1');
          }
        }
      }
    },
    mark: function(owl) {
      for (var i = 0; i < owl.owlItems.length; i++) {
        OwlA11y.Internals.visibleItems.markSlide(
          owl.owlItems[i],
          (owl.visibleItems.indexOf(i) >= 0)
        );
      }
    }
  },
  // Event functions
  events: {
    defaultAfterAction: function(){
      return function(){
        OwlA11y.Internals.visibleItems.mark(this.owl);
        OwlA11y.Internals.events.triggerChanges(this.owl);
        OwlA11y.Internals.element.notBusy(this.owl.baseElement);
        OwlA11y.Internals.element.refocus(this.owl);
      };
    },
    documentKeyUp: function(e) {
      var eventTarg = $(e.target),
      targ = OwlA11y.Internals.element.focused(e),
      action = null;
      if (!!targ) {
        var owl = targ.data('owlCarousel');
        if (e.keyCode == 37 || e.keyCode == 38) action = "prev";
        else if (e.keyCode == 39 || e.keyCode == 40) action = "next";
        else if (e.keyCode == 13) {
          if (eventTarg.hasClass('owl-prev')) action = "prev";
          else if (eventTarg.hasClass('owl-next')) action = "next";
        }
        if (!!action) targ.trigger('owl.' + action);
      }
    },
    focusIn: function(e){
      OwlA11y.Internals.element.ifUnfocused(this, function(e){
        var autoPlay = $(e).data('owlCarousel').options.autoPlay;
        OwlA11y.Internals.element.markFocused(e);
        OwlA11y.Internals.blips.clear(e);
        OwlA11y.Internals.description.setup($(e));
        if (!!autoPlay) {
          $(e).data('owlCarouselAutoPlaySpeed', autoPlay).trigger('owl.stop');
        }
      });
    },
    focusOut: function(e){
      OwlA11y.Internals.element.ifFocused(this, function(e){
        var autoPlay = $(e).data('owlCarouselAutoPlaySpeed');
        OwlA11y.Internals.element.markUnfocused(e);
        OwlA11y.Internals.description.teardown(e);
        if (!!autoPlay) {
          $(e).trigger('owl.play', autoPlay);
        }
      });
    },
    triggerChanges: function(owl) {
      var blipID = OwlPlugins.utils.makeID('owl-blip');
      var blip = OwlA11y.Internals.element.makeHiddenPara(
        "The carousel has moved to slide " + (owl.currentItem + 1) + ".",
        blipID,
        "owl-access-blip"
      );
      $(owl.baseElement).prepend(blip);
      setTimeout(function(){
        OwlA11y.Internals.blips.clear(owl.baseElement);
      }, 1000);
    }
  }
};

// Owl Accessibility Extra Controls
OwlA11y.ExtraControls = {
  // Helpful utilities
  utils: {
    // Apply attributes to a jQuery element
    apply: function(elem, attrs){
      if (!!attrs.text) {
        elem.text(attrs.text);
        delete attrs.text;
      }
      elem.attr(attrs);
    }
  },
  // Play/Pause button
  playpause: {
    // Sets button features depending on whether we are playing or paused
    features: function (playing) {
      return {
        title: playing ? 'Pause autoplay' : 'Start autoplay',
        text: playing ? 'Pause' : 'Play',
        'class': 'owl-playpause ' + (playing ? 'owl-playpause-playing' : 'owl-playpause-paused')
      }
    },
    // Triggers play/pause toggle
    playpauseAction: function(e){
      var button = $(e.target),
      elem = button.closest('.owl-carousel'),
      buttonAttr = {};
      if (elem.length > 0) {
        if (elem.data('owlCarouselIsPlaying') == '1') {
          elem.trigger('owl.stop').data('owlCarouselIsPlaying', '0');
          buttonAttr = OwlA11y.ExtraControls.playpause.features(false);
        }
        else {
          var speed = elem.data('owlCarouselAutoplay');
          elem.trigger('owl.play', speed).data('owlCarouselIsPlaying', '1');
          buttonAttr = OwlA11y.ExtraControls.playpause.features(true);
        }
      }
      OwlA11y.ExtraControls.utils.apply(button, buttonAttr);
    },
    // Button click or enter key on button
    buttonAction: function(e) {
      e.stopPropagation();
      if (e.originalEvent.type == "click") {
        e.preventDefault();
        OwlA11y.ExtraControls.playpause.playpauseAction(e);
      }
      else {
        if (e.which == 13) e.preventDefault();
        if (e.which == 13 || e.which == 32) {
          OwlA11y.ExtraControls.playpause.playpauseAction(e);
        }
      }
    },
    // Show button
    button: function(owl){
      var button = null;
      if (!!owl.options.autoPlay) {
        owl.$elem.data('owlCarouselAutoplay', owl.options.autoPlay);
        owl.$elem.data('owlCarouselIsPlaying', !!owl.options.autoPlay ? '1' : '0');
        var params = $.extend({
          tabindex: '0',
          'aria-controls': owl.$elem.attr('id'),
          id: OwlPlugins.utils.makeID("owl-carousel-control-playpause")
        }, OwlA11y.ExtraControls.playpause.features(owl.options.autoPlay));
        button = $('<button />', params);
        button.bind('click keydown', OwlA11y.ExtraControls.playpause.buttonAction);
      }
      return button;
    }
  },
  // Fullscreen button
  fullscreen: {
    features: function(toggled){
      return {
        title: toggled ? "Disable Full Screen view and show normally" : "Show in Full Screen",
        text: toggled ? "Disable Full Screen" : "Show in Full Screen"
      }
    },
    // Button click or enter key on button
    buttonAction: function(e) {
      e.stopPropagation();
      var carousel = $(e.target).closest('.owl-carousel').get(0),
      fire = false;
      if (e.originalEvent.type == "click") {
        e.preventDefault();
        fire = true;
      }
      else {
        if (e.which == 13) e.preventDefault();
        if (e.which == 13 || e.which == 32) {
          fire = true;
        }
      }
      if (fire && JustMakeItBig.canFullscreen()) {
        JustMakeItBig.toggle(carousel, e.target, function(toggled){
          var attrs = OwlA11y.ExtraControls.fullscreen.features(toggled);
          OwlA11y.ExtraControls.utils.apply($(e.target), attrs);
        });
      }
    },
    // Show button
    button: function(owl){
      var button = null;
      if (!!owl.options.enableFullscreen && !!window.JustMakeItBig) {
        var params = $.extend(
          {
            'class': 'owl-fullscreen',
            tabindex: 0,
            'aria-controls': owl.$elem.attr('id'),
            id: OwlPlugins.utils.makeID("owl-carousel-control-fullscreen")
          },
          OwlA11y.ExtraControls.fullscreen.features(false)
        );
        button = $('<button />', params);
        button.bind('click keydown', OwlA11y.ExtraControls.fullscreen.buttonAction);
      }
      return button;
    }
  },
  // Controls on root element
  element: {
    init: function(owl){
      // Sets up the owl-buttons object if one doesn't exist
      var controls = $('.owl-controls .owl-buttons', owl.$elem);
      if (!controls.length) {
        $(owl.$elem).find('.owl-controls').append($('<div />', {
          'class': 'owl-buttons'
        }));
        controls = $('.owl-controls .owl-buttons', owl.baseElement);
      }

      // Enumerates all custom controls
      var customControls = [];

      // Play/pause button
      var playpause = OwlA11y.ExtraControls.playpause.button(owl);
      if (!!playpause) customControls.push(playpause);

      // Fullscreen button
      var fullscreen = OwlA11y.ExtraControls.fullscreen.button(owl);
      if (!!fullscreen) customControls.push(fullscreen);

      if (customControls.length) {
        // Builds container for custom container, populates it,
        // and adds it to the controls area
        var customContainer = $('<div />', {
          'class': 'owl-custom-controls'
        });
        customContainer.append(customControls);
        controls.after(customContainer);
      }
    }
  }
};

// Owl Accessiblity Plugin
OwlA11y.Plugin = new OwlPlugins.plugin({
  beforeInit: [
    'a11y.base.setup',
    'a11y.focus.setup'
  ],
  afterInit: function(){
    OwlA11y.Internals.element.init(this);
    OwlA11y.ExtraControls.element.init(this);
  },
  beforeUpdate: [
    'a11y.description.teardown',
    'a11y.base.busy'
  ],
  beforeMove:   [
    'a11y.description.teardown',
    'a11y.base.busy'
  ],
  afterMove:   'a11y.base.act',
  afterUpdate: 'a11y.base.act'
}, {
  a11y: {
    // Base object
    base: {
      // Initialise a11y attributes on base object
      setup: function() {
        this.$elem.attr({
          tabindex: '0',
          'data-owl-carousel-focusable': '1',
          'aria-live': 'off',
          'aria-atomic': 'true',
          'aria-relevant': 'additions',
          'aria-busy': 'true'
        });

        this.$elem.keyup(OwlA11y.Internals.events.documentKeyUp).attr('data-owl-access-keyup', '1');
      },
      // Set carousel as being busy
      busy: function() {
        OwlA11y.Internals.element.busy(this.$elem);
      },
      // Set carousel as not being busy
      notBusy: function() {
        OwlA11y.Internals.element.notBusy(this.$elem);
      },
      // Run post-update action
      act: function(){
        var act = OwlA11y.Internals.events.defaultAfterAction();
        $.debounce(250, act).call(this);
      },
    },
    // Defines focusing behaviour
    focus: {
      // Initialise focus behaviour
      setup: function(){
        this.$elem.focusin(OwlA11y.Internals.events.focusIn);
        this.$elem.focusout(OwlA11y.Internals.events.focusOut);
      }
    },
    // Description text
    description: {
      teardown: function() {
        OwlA11y.Internals.description.teardown(this.$elem.get(0));
      }
    }
  }
});