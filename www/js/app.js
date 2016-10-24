// Property ground App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

angular.module('PGApp', [
  'ionic',
  'ngCordova',
  'ionic-native-transitions',
  'PGApp.controllers',
  'PGApp.factories',
  'PGApp.services',
  'PGApp.directives',
  'ion-floating-menu' ])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      //StatusBar.styleDefault();

      if (ionic.Platform.isAndroid()) {
        StatusBar.backgroundColorByHexString("#0071b2");
      } else {
        StatusBar.styleLightContent();
      }

    }

    console.log('creating ');

    /*if( ionic.Platform.isAndroid() ){
      db = $cordovaSQLite.openDB({ name: "property_ground.db" , iosDatabaseLocation:'default' });
    }
    else if(ionic.Platform.isIOS() ){
      db = $cordovaSQLite.openDB({ name: "property_ground.db" ,  location: 2, createFromLocation: 1 });
    }


    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS company_masteritem_link (com_master_id integer primary key, original_master_id integer, company_id integer, item_name text, type text, option text, priority integer, status integer)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS company_subitem_link (com_subitem_id integer primary key, com_master_id integer, company_id integer, item_name text, type text, priority integer, status integer)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS company_meter_link (com_meter_id integer primary key, company_id integer, meter_name text, type text, status integer)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS company_general_condition_link (com_general_id integer primary key, company_id integer, item_name text, options text, priority integer, type text, status integer)");
*/

  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider, $ionicNativeTransitionsProvider) {


  $ionicConfigProvider.backButton.previousTitleText(false);
  $ionicConfigProvider.views.transition('none'); // disable the slide animation
  $ionicConfigProvider.scrolling.jsScrolling(false); // enable the native scrolling
  $ionicConfigProvider.backButton.text('Back');
  //$httpProvider.interceptors.push('appHttpInterceptor');

  $ionicNativeTransitionsProvider.setDefaultOptions({
        duration: 250,
        slowdownfactor: 4, // overlap views (higher number is more) or no overlap (1), default 4
        iosdelay: -1, // ms to wait for the iOS webview to update before animation kicks in, default -1
        androiddelay: -1, // same as above but for Android, default -1
        winphonedelay: -1, // same as above but for Windows Phone, default -1,
        fixedPixelsTop: 0, // the number of pixels of your fixed header, default 0 (iOS and Android)
        fixedPixelsBottom: 0, // the number of pixels of your fixed footer (f.i. a tab bar), default 0 (iOS and Android)
        triggerTransitionEvent: '$ionicView.afterEnter', // internal ionic-native-transitions option
        backInOppositeDirection: false // Takes over default back transition and state back transition to use the opposite direction transition to go back

  });

   /*$ionicNativeTransitionsProvider.setDefaultTransition({
        "type" : "fade",
        "duration" : 250
    });
   $ionicNativeTransitionsProvider.setDefaultBackTransition({
        "type" : "fade",
        "duration" : 250
    });*/


  $stateProvider.state('login', {
    url: '/login',
    templateUrl: 'templates/app/login.html',
    controller: 'LoginCtrl'
  })


  $stateProvider

  .state('app', {
    url: '/app',
   /* abstract: true,*/
    templateUrl: 'templates/app/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.inspections', {
      url: '/inspections',
      views: {
        'menuContent': {
          templateUrl: 'templates/app/inspections.html',
          controller: 'InspectionListCtrl'
        }
      }
    })

  .state('app.newPropertyinfo', {
      url: '/newPropertyinfo/:property_id',
      views: {
        'menuContent': {
          templateUrl: 'templates/app/new-property_info.html',
          controller: 'NewPropInfoCtrl'
        }
      }
    })

  .state('app.property', {
      url: '/property/:property_id',
      views: {
        'menuContent': {
          templateUrl: 'templates/app/property-template.html',
          controller: 'PropCtrl'
        }
      }
    })


    .state('app.proplist', {
      url: '/proplist/:property_id',
      views: {
        'menuContent': {
          templateUrl: 'templates/app/prop-list.html',
          controller: 'ProplistCtrl'
        }
      }
    })


    .state('app.proplistsort', {
      url: '/proplistsort/:property_id',
      views: {
        'menuContent': {
          templateUrl: 'templates/app/property-list-sorting.html',
          controller: 'PropertyListSortCtrl'
        }
      }
    })

    .state('app.generalcondition', {
      url: '/generalcondition/:property_id',
      views: {
        'menuContent': {
          templateUrl: 'templates/app/general-condition.html',
          controller: 'GeneralConditionCtrl'
        }
      }
    })

    .state('app.generalconditionsort', {
      url: '/generalconditionsort/:property_id',
      views: {
        'menuContent': {
          templateUrl: 'templates/app/general-condition-sorting.html',
          controller: 'GeneralConditionSortCtrl'
        }
      }
    })

    .state('app.meterlist', {
      url: '/meterlist/:property_id',
      views: {
        'menuContent': {
          templateUrl: 'templates/app/meter-list.html',
          controller: 'MeterListCtrl'
        }
      }
    })

    .state('app.subitemslist', {
      url: '/subitemslist/:property_id/:master_id',
      views: {
        'menuContent': {
          templateUrl: 'templates/app/sub-items-list.html',
          controller: 'SubItemsListCtrl'
        }
      }
    })

    .state('app.addSubDetails', {
      url: '/addSubDetails/:sub_id/:master_id/:type/:property_id',
      views: {
        'menuContent': {
          templateUrl: 'templates/app/add-sub-item-items.html',
          controller: 'AddSubDetailsCtrl'
        }
      }
    })

    .state('app.recordSound', {
      url: '/recordSoundCtrl/:prop_subitem_id/:property_id/:master_id',
      views:{
        'menuContent': {
          templateUrl: 'templates/app/record-sound.html',
          controller: 'RecordSoundCtrl'
        }
      }
    })

    .state('app.generalPhotos', {
      url: '/generalPhotosCtrl/:prop_subitem_id/:master_id/:property_id',
      views:{
        'menuContent': {
          templateUrl: 'templates/app/general-photos.html',
          controller: 'GeneralPhotosCtrl'
        }
      }
    })
    ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/inspections');


  delete $httpProvider.defaults.headers.common['X-Requested-With'];
  $httpProvider.defaults.headers.post['Accept'] = 'application/json, text/javascript';
  // $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';//'application/json; charset=utf-8';
  //$httpProvider.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
  $httpProvider.defaults.useXDomain = true;
  $httpProvider.defaults.withCredentials = true;

})

//end points and other global constants
.constant('PGAppConfig', {
  apiEndPoint: 'http://52.39.72.94:3000/',
  apiDevEndPoint: 'http://localhost:1337/',
  urlHome: 'http://www.propertyground.com/',
  urlDefaultImg: 'img/defaultavatar.png',
  APP : 'PRO',
  AppName :  'Property Ground app',
  LOCAL_TOKEN_KEY: 'PGAuth'
});
