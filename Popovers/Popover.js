; (function (global, $) {

    var Tour = function (selector, guideLines) {
        return new Tour.init(selector, guideLines);
    }

    var options = function (typed, contents, titled) {

        return {
            animation: true,
            html: true,
            placement: function () {
                var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                return w < 767 ? 'bottom' : 'left';
            },
            container: 'body',
            trigger: 'manual',
            title: titled || 'Welcome',
            content: contents || 'Start your tour for this site',
            delay: { show: 1000, hide: 0 },
            template: templates[typed],
            boundary: 'scrollParent'
        };
    };

    var templates = {
        start: '<div class="popover"><div class="arrow"></div><div class="popover-header"></div><div class="popover-body"></div><div class="p-1"><a href="#" class="btn btn-info btn-sm float-right tour-next">Start</a><a href="#" class="btn btn-danger btn-sm tour-cancel">Cancel</a></div></div>',
        mid: '<div class="popover"><div class="arrow"></div><h4 class="popover-header"></h4><div class="popover-body"></div><div class="p-1"><div class="btn-group float-right"><a href="#" class="btn btn-primary btn-sm tour-previous">Previous</a><a href="#" class="btn btn-primary btn-sm tour-next">Next</a></div><a href="#" class="btn btn-danger btn-sm tour-cancel">Cancel</a></div></div>',
        end: '<div class="popover"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div><div class="p-1"><a href="#" class="btn btn-info btn-sm float-right tour-start">Start Over</a><a href="#" class="btn btn-danger btn-sm tour-end">End</a></div></div>'
    };

    var currentindex = 0;

    var isScrolled = false;

    var isBackDrop = false;

    var backDrop = '<div class="modal-backdrop" style="opacity:0.7;"></div>';

    Tour.prototype = {
        createPopup: function (index) {
            var title = this.guideLines[index].title || 'Title';
            var content = this.guideLines[index].content || 'Content';
            var shownCallback = this.guideLines[index].onShown || null;
            var hiddenCallback = this.guideLines[index].onHide || null;

            this.jQueryValidate();

            var popover;
            if (index === 0) {
                popover = $(this.popovers[index]).popover(options('start', content, title));
            }
            else if (index === this.popovers.length - 1) {
                popover = $(this.popovers[index]).popover(options('end', content, title));
            }
            else {
                popover = $(this.popovers[index]).popover(options('mid', content, title));
            }

            if (shownCallback) {
                $(popover).on('shown.bs.popover', shownCallback);
            }

            if (hiddenCallback) {
                $(popover).on('hidden.bs.popover', hiddenCallback);
            }

            return this;
        },
        loadPopup: function () {
            var self = this;
            this.sortPopup();
            this.popovers.each(function (i, e) {
                self.createPopup(i);
            });
            this.bindEvents();

            return this;
        },
        validate: function () {
            if (this.guideLines === undefined || this.guideLines.length < 1 || this.popovers === undefined || this.popovers.length < 1) {
                throw "Invalid or no details given";
            }
        },
        sortPopup: function () {
            this.validate();
            this.guideLines = this.guideLines.sort(function (a, b) {
                var x = parseInt(a['ordinal']); var y = parseInt(b['ordinal']);
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
            this.popovers = this.popovers.sort(function (a, b) {
                var x = parseInt($(a).attr('ordinal')); var y = parseInt($(b).attr('ordinal'));
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });

            return this;
        },
        bindEvents: function () {
            var self = this;

            $(window.document).on('click', 'div.popover a.tour-next', function (e) {
                e.preventDefault();
                self.closePopup();
                self.startTour(currentindex + 1);
            });

            $(window.document).on('click', 'div.popover a.tour-previous', function (e) {
                e.preventDefault();
                self.closePopup();
                self.startTour(currentindex - 1);
            });

            $(window.document).on('click', 'div.popover a.tour-cancel', function (e) {
                e.preventDefault();
                self.closePopup();
                self.EnableBackDrop(false);
            });

            $(window.document).on('click', 'div.popover a.tour-end', function (e) {
                e.preventDefault();
                self.endTour();
            });

            $(window.document).on('click', 'div.popover a.tour-start', function (e) {
                e.preventDefault();
                self.endTour();
                self.startTour();
            });

            return this;
        },
        log: function () {
            if (console) {
                //console.log('Popovers : ',this.popovers);
                //console.log('GuideLine : ',this.guideLines);
                console.log(currentindex);
            }

            return this;
        },
        startTour: function (startFrom) {
            this.jQueryValidate();

            if (startFrom == undefined || startFrom === 0) {

                $(this.popovers[0]).popover('show');
                currentindex = 0;
                this.EnableBackDrop(true);
            }
            else {
                $(this.popovers[startFrom]).popover('show');
                currentindex = startFrom;
            }
            this.scrolling();
            this.setElementFocus(currentindex);

            this.log();

            return this;
        },
        closePopup: function () {

            if (currentindex > -1 && currentindex < this.popovers.length) {
                $(this.popovers[currentindex]).popover('hide');
                this.unsetElementFocus(currentindex);
            }

            return this;
        },
        endTour: function () {
            this.EnableBackDrop(false);
            this.closePopup();
            currentindex = 0;
        },
        dismissPopovers: function () {
            this.popovers.each(function (i, e) {
                $(e).popover('destroy');
            });
        },
        jQueryValidate: function () {
            if (!$) {
                throw "jQuery not loaded";
            }

            var bootstrap3_enabled = (typeof $().emulateTransitionEnd == 'function');
            if (!bootstrap3_enabled) {
                throw "bootstrap not loaded";
            }

        },
        scrolling: function () {

            if (this.popovers[currentindex] && isScrolled) {

                if (!this.checkScroll($(this.popovers[currentindex]))) {

                    $('html, body').animate({
                        scrollTop: parseInt($(this.popovers[currentindex]).position().top)
                    }, 500);
                    console.log('Position: ' + $(this.popovers[currentindex]).position().top + ',  Offset: ' + $(this.popovers[currentindex]).offset().top);
                }

                //                var pageTop = $(window).scrollTop();
                //                var pageBottom = pageTop + $(window).height();
                //                var elementTop = $(this.popovers[currentindex]).offset().top;
                //                var elementBottom = elementTop + $(this.popovers[currentindex]).height();
                ////                
                //                console.log('pageTop: ' + pageTop + ', pageBottom: ' + pageBottom);
                //                console.log('elementTop: ' + elementTop + ', elementBottom: ' + elementBottom);
                ////
                ////
                //                if ((pageTop < elementTop) && (pageBottom > elementBottom)) {
                //                    $('html,body').animate({scrollTop: elementBottom + elementBottom  }, 1000);
                //                    console.log('elementBottom');
                //                } else if((elementBottom <= pageBottom) && (elementTop >= pageTop)) {
                //                    
                //                    $('html,body').animate({scrollTop:pageTop}, 1000);
                //                    console.log('pageTop');
                //
                //                }
                //                else{
                //                    $('html,body').animate({scrollTop:elementTop}, 1000);
                //                    console.log('elementTop');
                //                }
                //                var offset = $(this.popovers[currentindex]).offset().top - $(window).scrollTop();
                //                if(offset > window.innerHeight){
                //                    // Not in view
                //                    $('html,body').animate({scrollTop: offset}, 1000);
                //                    return false;
                //                }

                //                var p = $(this.popovers[currentindex]).offset().top;
                //                $('#scrollPos').html($(window).scrollTop());
                //                $('#elementPos').html(p);
                //                if(!this.isElementInView($(this.popovers[currentindex]),true)){
                //                    $('html, body').animate({
                //                    scrollTop: p > $(window).scrollTop() ? p  : p - 70
                //                    }, 1000);
                //                }
                //                else if(p < $(window).height() && p > $(window).scrollTop){
                //                    $('html, body').animate({
                //                    scrollTop: p - 70
                //                    }, 1000);
                //                }
            }

            return this;
        },
        setScroll: function (scr) {
            if (scr) {
                isScrolled = scr;
            }

            return this;
        },
        checkScroll: function (el) {
            var top = el.offsetTop;
            var left = el.offsetLeft;
            var width = el.offsetWidth;
            var height = el.offsetHeight;

            while (el.offsetParent) {
                el = el.offsetParent;
                top += el.offsetTop;
                left += el.offsetLeft;
            }

            return (
                top < (window.pageYOffset + window.innerHeight) &&
                left < (window.pageXOffset + window.innerWidth) &&
                (top + height) > window.pageYOffset &&
                (left + width) > window.pageXOffset
            );
        },
        setBackDrop: function (scr) {
            if (scr) {
                isBackDrop = scr;
            }

            return this;
        },
        EnableBackDrop: function (addOrRemove) {
            this.jQueryValidate();
            if (addOrRemove && isBackDrop) {
                if (!$('body').find('.modal-backdrop:first').length) {
                    $('body').prepend(backDrop);
                }
            }
            else {
                $('body').find('.modal-backdrop:first').remove();
            }

            return this;
        },
        setElementFocus: function (index) {

            var temp = $(this.popovers[index]);
            if (index >= 0 && isBackDrop) {
                $(temp).css("position", 'relative');
                $(temp).css("z-index", parseInt($('.modal-backdrop').css('z-index')) + 1);
            }
        },
        unsetElementFocus: function (index) {
            var temp = $(this.popovers[index]);
            if (index >= 0 && isBackDrop) {
                $(temp).css("position", '');
                $(temp).css("z-index", parseInt($('.modal-backdrop').css('z-index')) - 1);
            }
        }


    };

    Tour.init = function (selector, guideLines) {

        var self = this;

        self.selector = selector || '[data-toggle="popover"]';
        self.guideLines = guideLines || '';
        self.popovers = $(self.selector);

        self.jQueryValidate();
        self.validate();

    }

    Tour.init.prototype = Tour.prototype;

    Tour.global = global.T$ = Tour;

}(window, jQuery));