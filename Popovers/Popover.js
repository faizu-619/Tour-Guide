;(function(global,$){
    
    var Tour = function(selector,guideLines){
        return new Tour.init(selector,guideLines);
    }
    
    var options = function(typed,contents,titled){
        
                 return {
                animation: true,
                html: true,
                placement: function(){
                    var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                    return w < 767 ? 'bottom auto' : 'left auto' ;
                },
                container: 'body',
                trigger: 'manual',
                title: titled || 'Welcome',
                content: contents || 'Start your tour for this site',
                delay: {show: 2000, hide: 500},
                template: templates[typed]
            };
    };
    
    var templates = {
        start: '<div class="popover"><div class="arrow"></div><div class="popover-title"></div><div class="popover-content"></div><div class="popover-footer"><a href="#" class="btn btn-info btn-sm pull-right tour-next">Start</a><a href="#" class="btn btn-danger btn-sm tour-cancel">Cancel</a></div></div>',
        mid: '<div class="popover"><div class="arrow"></div><h4 class="popover-title"></h4><div class="popover-content"></div><div class="popover-footer"><a href="#" class="btn btn-info btn-sm pull-right tour-next">Next</a><a href="#" class="btn btn-danger btn-sm tour-cancel">Cancel</a></div></div>',
        end: '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div><div class="popover-footer"><a href="#" class="btn btn-info btn-sm pull-right tour-start">Start Over</a><a href="#" class="btn btn-danger btn-sm tour-end">End</a></div></div>'
    };
    
    var currentindex = 0;
    
    var isScrolled = false;
    
    Tour.prototype = {
        createPopup: function(index){
            var title = this.guideLines[index].title || 'Title';
            var content = this.guideLines[index].content || 'Content';
            this.jQueryValidate();
            if(index === 0){
                $(this.popovers[index]).popover(options('start',content,title));
            }
            else if(index === this.popovers.length - 1){
                $(this.popovers[index]).popover(options('end',content,title));
            }
            else{
                $(this.popovers[index]).popover(options('mid',content,title));
            }
            
            
            return this;
        },
        loadPopup: function(){
            var self = this;
            this.sortPopup();
            this.popovers.each(function(i,e){
                self.createPopup(i);
            });
            this.bindEvents();
            
            return this;
        },
        validate: function(){
            if(this.guideLines === undefined || this.guideLines.length < 1 || this.popovers === undefined || this.popovers.length < 1){
                throw "Invalid or no details given";
            }
        },
        sortPopup: function(){
            this.validate();
            this.guideLines = this.guideLines.sort(function(a, b) {
                var x = parseInt(a['ordinal']); var y = parseInt(b['ordinal']);
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });
            this.popovers = this.popovers.sort(function(a, b) {
                var x = parseInt($(a).attr('ordinal')); var y = parseInt($(b).attr('ordinal'));
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });
            
            return this;
        },
        bindEvents: function(){
            var self = this;
            
            $(window.document).on('click','div.popover a.tour-next',function(e){
                e.preventDefault();
                self.closePopup();
                self.startTour(currentindex+1);
            });
            
            $(window.document).on('click','div.popover a.tour-cancel',function(e){
                e.preventDefault();
                self.closePopup();
            });
            
            $(window.document).on('click','div.popover a.tour-end',function(e){
                e.preventDefault();
                ;
            });
            
            $(window.document).on('click','div.popover a.tour-start',function(e){
                e.preventDefault();
                self.endTour();
                self.startTour();
            });
            
            return this;
        },
        log: function(){
            if(console){
                //console.log('Popovers : ',this.popovers);
                //console.log('GuideLine : ',this.guideLines);
                console.log(currentindex);
            }
            
            return this;
        },
        startTour: function(startFrom){
            this.jQueryValidate();
            
            if(startFrom == undefined || startFrom === 0){
                
                $(this.popovers[0]).popover('show');
                currentindex = 0;
            }
            else{
                $(this.popovers[startFrom]).popover('show');
                currentindex = startFrom;
            }
            this.scrolling();
            
            this.log();
            
            return this;
        },
        closePopup: function(){
            
            if(currentindex > -1 && currentindex < this.popovers.length){
                $(this.popovers[currentindex]).popover('hide');
            }
            
            return this;
        },
        endTour: function(){
            this.closePopup();
            currentindex = 0;
        },
        dismissPopovers: function(){
          this.popovers.each(function(i,e){
              $(e).popover('destroy');
          });
        },
        jQueryValidate: function(){
            if(!$){
                throw "jQuery not loaded";
            }
            
            var bootstrap3_enabled = (typeof $().emulateTransitionEnd == 'function');
            if(!bootstrap3_enabled){
                throw "bootstrap not loaded";
            }
            
        },
        scrolling: function(){

            if(this.popovers[currentindex] && isScrolled){
                
                if(!this.checkScroll($(this.popovers[currentindex]))){
                    
                    //$('#scrollPos').html($(window).scrollTop());
                    //$('#elementPos').html(JSON.stringify($(this.popovers[currentindex]).position())+JSON.stringify($(this.popovers[currentindex]).offset()));
                    
                    $('html, body').animate({
                    scrollTop: parseInt($(this.popovers[currentindex]).position().top)
                    }, 1000);
                    //console.log($(this.popovers[currentindex]).position());
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
        },
        setScroll: function(scr){
            if(scr){
                isScrolled = scr;
            }
        },
//        isElementInView: function (element, fullyInView) {
//        var pageTop = $(window).scrollTop();
//        var pageBottom = pageTop + $(window).height();
//        var elementTop = $(element).offset().top;
//        var elementBottom = elementTop + $(element).height();
//
//            if (fullyInView === true) {
//                return ((pageTop < elementTop) && (pageBottom > elementBottom));
//            } else {
//                return ((elementBottom <= pageBottom) && (elementTop >= pageTop));
//            }
//        },
        checkScroll: function (el) {
          var top = el.offsetTop;
          var left = el.offsetLeft;
          var width = el.offsetWidth;
          var height = el.offsetHeight;

          while(el.offsetParent) {
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
        }

                                        
    };
    
    Tour.init = function(selector,guideLines){
        
        var self = this;
        
        self.selector = selector || '[data-toggle="popover"]';        
        self.guideLines = guideLines || '';
        self.popovers = $(self.selector);
        
        self.jQueryValidate();
        self.validate();

    }
    
    Tour.init.prototype = Tour.prototype;
    
    Tour.global = global.T$ = Tour;
    
}(window,jQuery));