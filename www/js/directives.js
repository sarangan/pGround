appDir = angular.module('PGApp.directives', []);

//fab menu
appDir.directive('fabMenu', function($timeout, $ionicGesture) {
    var options = {
        /*baseAngle: 212,
        rotationAngle: 30,
        distance: 112,*/
        baseAngle: 200,
        rotationAngle: 31,
        distance: 110,
        animateInOut: 'all', // can be slide, rotate, all
      },
      buttonContainers = [],

      init = function() {

        $timeout(function() {


          var buttonContainers = document.querySelectorAll('.fab-menu-items > li');

          var j =0;

          for (var i = 0; i < buttonContainers.length; i++) {


            if(j % 3 == 0){
              j = 0;
            }

            var button = buttonContainers.item(i);
            var angle = (options.baseAngle + (options.rotationAngle * j));
            button.style.transform = "rotate(" + options.baseAngle + "deg) translate(0px) rotate(-" + options.baseAngle + "deg) scale(0)";
            button.style.WebkitTransform = "rotate(" + options.baseAngle + "deg) translate(0px) rotate(-" + options.baseAngle + "deg) scale(0)";
            button.setAttribute('angle', '' + angle);

            button.style.display = 'block';

            j += 1;
          }

        });

      },

      animateButtonsIn = function() {
        
         var buttonContainers = document.querySelectorAll('.fab-menu-items > li');

         var j =0;

          for (var i = 0; i < buttonContainers.length; i++) {


            if(j % 3 == 0){
              j = 0;
            }

            var button = buttonContainers.item(i);
            // var angle = button.getAttribute('angle');
            // button.style.transform = "rotate(" + angle + "deg) translate(" + options.distance + "px) rotate(-" + angle + "deg) scale(1)";
            // button.style.WebkitTransform = "rotate(" + angle + "deg) translate(" + options.distance + "px) rotate(-" + angle + "deg) scale(1)";

            var angle = (options.baseAngle + (options.rotationAngle * j));
            button.style.transform = "rotate(" + angle + "deg) translate(" + options.distance + "px) rotate(-" + angle + "deg) scale(1)";
            button.style.WebkitTransform = "rotate(" + angle + "deg) translate(" + options.distance + "px) rotate(-" + angle + "deg) scale(1)";

            j += 1;

        }
        

      },
      animateButtonsOut = function() {

        var buttonContainers = document.querySelectorAll('.fab-menu-items > li');
        
         var j =0;

          for (var i = 0; i < buttonContainers.length; i++) {

            if(j % 3 == 0){
              j = 0;
            }

            var button = buttonContainers.item(i);
            var angle = (options.baseAngle + (options.rotationAngle * j));
            button.setAttribute('angle', '' + angle);
            button.style.transform = "rotate(" + options.baseAngle + "deg) translate(0px) rotate(-" + options.baseAngle + "deg) scale(0)";
            button.style.WebkitTransform = "rotate(" + options.baseAngle + "deg) translate(0px) rotate(-" + options.baseAngle + "deg) scale(0)";

            j += 1;
        }

         

      };

    return {
      templateUrl: "templates/common/fab-menu.html",
       restrict : "E",
       replace: true,
      link: function(scope) {
        console.info("fab-menu :: link");

        init();

        scope.fabMenu = {
          active: false
        };

        scope.fabMenuToggle = function() {

          if (scope.fabMenu.active) { // Close Menu
            animateButtonsOut();
          } else { // Open Menu
            animateButtonsIn();
          }
          scope.fabMenu.active = !scope.fabMenu.active;
        }

      }
    }
});


appDir.directive('focusMe', function ($timeout, $parse) {
    return {
        //scope: true,   // optionally create a child scope
        link: function (scope, element, attrs) {
            var model = $parse(attrs.focusMe);
            scope.$watch(model, function (value) {
                console.log('value=', value);
                if (value === true) {
                    $timeout(function () {
                        element[0].focus();
                    });
                }
            });
            // to address @blesh's comment, set attribute value to 'false'
            // on blur event:
            element.bind('blur', function () {
                console.log('blur');
                scope.$apply(model.assign(scope, false));
            });
        }
    };
});