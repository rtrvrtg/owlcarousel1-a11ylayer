var OwlA11y = {};

// Owl Accessiblity Internals
OwlA11y.Internals = {
  // Element functions
  element: {
    init: function(e){
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
      var renderChildrenUnfocusable = function(elem) {
        $(elem).find('[tabindex]').each(function(){
          renderUnfocusable(this);
        });
        $(elem).find('a').not('[tabindex]').each(function(){
          renderUnfocusable(this);
        });
      };
      var renderUnfocusable = function(elem){
        var ti = $(elem).attr('tabindex');
        if (!ti) ti = "0";
        if (ti != "-1") {
          $(elem).attr({
            'data-tabindex-default': ti,
            'tabindex': "-1"
          });
        }
      };
      var renderFocusable = function(elem) {
        $(elem).attr('tabindex', $(elem).attr('data-tabindex-default'));
      };
      if (isFocusable) {
        $(slide).attr({
          'aria-hidden': 'false',
          'tabindex': '0'
        });
        $(slide).find('[data-tabindex-default]').each(function(){
          renderFocusable(this);
        });
      }
      else {
        $(slide).attr({
          'aria-hidden': 'true',
          'tabindex': '-1'
        });
        renderChildrenUnfocusable(slide);
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
        OwlA11y.Internals.element.notBusy(this.owl.baseElement)
        OwlA11y.Internals.visibleItems.mark(this.owl);
        OwlA11y.Internals.events.triggerChanges(this.owl);
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
        if (!!action) owl[action]();
      }
    },
    focusInStopOnHover: function(e){
      OwlA11y.Internals.element.ifUnfocused(this, function(e){
        OwlA11y.Internals.element.markFocused(e);
        OwlA11y.Internals.blips.clear(e);
        $(elem).data('owlCarousel').stop();
        OwlA11y.Internals.description.setup($(e));
      });
    },
    focusOutStopOnOver: function(e){
      OwlA11y.Internals.element.ifFocused(this, function(e){
        OwlA11y.Internals.element.markUnfocused(e);
        $(this).data('owlCarousel').play();
        OwlA11y.Internals.description.teardown(e);
      });
    },
    focusInDefault: function(e){
      OwlA11y.Internals.element.ifUnfocused(this, function(e){
        OwlA11y.Internals.element.markFocused(e);
        OwlA11y.Internals.blips.clear(e);
        OwlA11y.Internals.description.setup($(e));
      });
    },
    focusOutDefault: function(e){
      OwlA11y.Internals.element.ifFocused(this, function(e){
        OwlA11y.Internals.element.markUnfocused(e);
        OwlA11y.Internals.description.teardown(e);
      });
    },
    triggerChanges: function(owl) {
      var blipID = OwlPlugins.utils.makeID('owl-blip');
      var blip = OwlA11y.Internals.element.makeHiddenPara(
        "The carousel has moved.",
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

// Owl Accessiblity Plugin
OwlA11y.Plugin = new OwlPlugins.plugin({
  beforeInit: [
    'a11y.base.setup',
    'a11y.focus.setup'
  ],
  afterInit: function(){
    OwlA11y.Internals.element.init(this);
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
        if (!$('body').attr('data-owl-access-keyup')) {
          $(document.documentElement).keyup(OwlA11y.Internals.events.documentKeyUp);
          $('body').attr('data-owl-access-keyup', '1');
        }
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
        if (this.options.stopOnHover) {
          this.$elem.focusin(OwlA11y.Internals.events.focusInStopOnHover);
          this.$elem.focusout(OwlA11y.Internals.events.focusOutStopOnHover);
        }
        else {
          this.$elem.focusin(OwlA11y.Internals.events.focusInDefault);
          this.$elem.focusout(OwlA11y.Internals.events.focusOutDefault);
        }
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