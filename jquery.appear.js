/*
 * jQuery appear plugin
 *
 * Copyright (c) 2012 Andrey Sidorov
 * licensed under MIT license.
 *
 * https://github.com/morr/jquery.appear/
 *
 * Version: 0.3.3
 */
(function($) {
  var selectors = [];

  var check_binded = false;
  var check_lock = false;
  var defaults = {
    interval: 250,
    force_process: false,
    left_offset: 0,
    top_offset: 0
  };
  var $window = $(window);

  var $prior_appeared = {};
  var selector_settings = {};

  function process() {
    check_lock = false;
    var s;
    for (var index = 0, l = selectors.length; index < l; index++) {
      s = selectors[index];
      var $appeared = $(s).filter(function() {
        var $t = $(this);
        return $t.is(':visible') && is_appeared($t, selector_settings[s].top_offset, selector_settings[s].left_offset);
      });

      $appeared.trigger('appear', [$appeared]);

      if ($prior_appeared[s]) {
        var $disappeared = $prior_appeared[s].not($appeared);
        $disappeared.trigger('disappear', [$disappeared]);
      }
      $prior_appeared[s] = $appeared;
    }
  }

  function is_appeared($element, top_offset , left_offset) {
      var window_left = window.pageXOffset || $window.scrollLeft();
      var window_top = window.pageYOffset || $window.scrollTop();
      var offset = $element.offset();
      var left = offset.left;
      var top = offset.top;

      if (top + $element.height() >= window_top &&
          top - (top_offset || $element.data('appear-top-offset') || 0) <= window_top + $window.height() &&
          left + $element.width() >= window_left &&
          left - (left_offset || $element.data('appear-left-offset') || 0) <= window_left + $window.width()) {
        return true;
      } else if (top + $element.height() + (top_offset || $element.data('appear-top-offset') || 0) >= window_top &&
          !(top >= window_top +  (top_offset || $element.data('appear-top-offset') || 0) ) &&
          left + $element.width() >= window_left &&
          left - (left_offset || $element.data('appear-left-offset') || 0) <= window_left + $window.width()) {
        return true;
      } else {
        return false;
      }
  }

  // "appeared" custom filter
  $.expr[':']['appeared'] = function(element) {
    var $element = $(element);
    if (!$element.is(':visible')) {
      return false;
    }
    return is_appeared($element);
  }

  $.fn.extend({
    // watching for element's appearance in browser viewport
    appear: function(options) {
      var opts = $.extend({}, defaults, options || {});
      var selector = this.selector || this;
      selector_settings[selector] = opts;
      if (!check_binded) {
        var on_check = function() {
          if (check_lock) {
            return;
          }
          check_lock = true;

          setTimeout(process, opts.interval);
        };

        $(window).scroll(on_check).resize(on_check);
        check_binded = true;
      }

      if (opts.force_process) {
        setTimeout(process, opts.interval);
      }
      selectors.push(selector);
      return $(selector);
    }
  });

  $.extend({
    // force elements's appearance check
    force_appear: function() {
      if (check_binded) {
        process();
        return true;
      };
      return false;
    }
  });
})(jQuery);
