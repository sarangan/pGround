appFact = angular.module('PGApp.factories', []);

//common serves for get data
appFact.factory('commonSrv', function($http, PGAppConfig, $q, $ionicLoading, genericModalService, $log) {
  //console.log('ApiEndpoint', ApiEndpoint)

  var getApiData = function(url, loadingContent) {

    // this to set custom ionic loading
    if(loadingContent == undefined){
      loadingContent =  'loading';
    }

    var q = $q.defer();

    //set custom header to get pass through
    url = ( (PGAppConfig.APP=="DEV")?  PGAppConfig.apiDevEndPoint : PGAppConfig.apiEndPoint ) + url;
    var req = {
         method: 'GET',
         url: url, //ApiEndpoint.url,
         headers: {
           'Authorization': 'Bearer ' +  PGAppConfig.TOKEN_KEY
         },
         timeout: 30000
    };

    if( loadingContent ==  'loading'){
      $ionicLoading.show({
              content: 'Loading',
              animation: 'fade-in',
              showBackdrop: true,
              maxWidth: 200,
              showDelay: 0
            });
    }
    else if(loadingContent ==  'updating' ){

      $ionicLoading.show({
          // content: 'Loading',
          animation: 'fade-in',
          showBackdrop: true,
          // maxWidth: 200,
          showDelay: 0,
          //template: 'Updating...'
          template: '<p class="item-icon-right">Updating<ion-spinner icon="dots" class="spinner-stable"/></p>'
      });

    }
    else if(loadingContent ==  'noloading' ){

    }

    $http(req).success(function(data) {
      $ionicLoading.hide();
      q.resolve(data);
    })
    .error(function(error){
      $log.error(error);
      $ionicLoading.hide();
      genericModalService.showToast('Could not load data, Please try again!');
      q.reject(error);
    })

    return q.promise;
  };

  var postData = function(url, data, loadingContent) {

    if(loadingContent == undefined){
      loadingContent =  'loading';
    }

    var q = $q.defer();

    //set custom header to get pass through
    var temp_url = ( (PGAppConfig.APP=="DEV")?  PGAppConfig.apiDevEndPoint : PGAppConfig.apiEndPoint ) + url;

    var req = {
         method: 'POST',
         url: temp_url, //ApiEndpoint.url,
         data : data
    };

    if(url != 'auth/authenticate'){

        req['headers'] =  {
           'Authorization': 'Bearer ' +  PGAppConfig.TOKEN_KEY
         };
    }





    if( loadingContent ==  'loading'){
      $ionicLoading.show({
              content: 'Loading',
              animation: 'fade-in',
              showBackdrop: true,
              maxWidth: 200,
              showDelay: 0
            });
    }
    else if(loadingContent ==  'updating' ){

      $ionicLoading.show({
          // content: 'Loading',
          animation: 'fade-in',
          showBackdrop: true,
          // maxWidth: 200,
          showDelay: 0,
          template: '<p class="item-icon-right">Updating<ion-spinner icon="dots" class="spinner-stable"/></p>'
      });

    }
    else if(loadingContent ==  'noloading' ){

    }


    $http(req)
    .success(function(data) {
      $ionicLoading.hide();
      q.resolve(data);
    })
    .error(function(error){
      $log.error(error);
      $ionicLoading.hide();
      genericModalService.showToast('Could not load data, Please try again!');
      q.reject(error);
    })

    return q.promise;
  };


  var getOutSourceData = function(url) {

    // this to set custom ionic loading

    var q = $q.defer();


    var req = {
         method: 'GET',
         url: url,
         timeout: 30000
    };

    $ionicLoading.show({
              content: 'Loading',
              animation: 'fade-in',
              showBackdrop: true,
              maxWidth: 200,
              showDelay: 0
            });

    $http(req)
    .success(function(data) {

      $ionicLoading.hide();
      q.resolve(data);
    })
    .error(function(error){
      $log.error(error);

      $ionicLoading.hide();

      genericModalService.showToast('Could not load data, Please try again!');

      q.reject(error);
    })

    return q.promise;
  };



  return {
    getResult: getApiData,
    postData : postData,
    getOutSourceData : getOutSourceData
  };
});

appFact.factory('genericModalService', function($rootScope, $q, $ionicModal, $cordovaToast, $log) {

    function show(templateUrl, scope, animation){
      var deferred = $q.defer();
      var modalScope = typeof scope !== 'undefined' ? scope : $rootScope.$new();

      $ionicModal.fromTemplateUrl(templateUrl, {
            scope: modalScope,
            animation: animation || 'none'
        }).then(function(modal) {
            modalScope.modal = modal;

            modalScope.openModal = function(){
              modalScope.modal.show();
            };

            modalScope.closeModal = function(){
              modalScope.modal.hide();
            };

            modalScope.$on('modal.hidden', function (thisModal){
              thisModal.currentScope.$destroy();
              thisModal.currentScope.modal.remove();
            });

            modalScope.modal.show();

            deferred.resolve(modalScope);
        });

        return deferred.promise;
    };

    function showToast(text, position){

      $log.log(text);
      if(position == undefined){
        position =  'LCenter';
      }

      try{

          if(position == 'LCenter'){

            try {

              $cordovaToast.showLongCenter(text).then(function(success) {
                // success
                $log.log(success);
              }, function (error) {
                // error
                $log.error(error);
              });

            } catch(e) {
              // statements
              console.log(e);
            }



          }
          else if(position == 'SBottom'){

            try {
              $cordovaToast.showShortBottom(text).then(function(success) {
                // success
                $log.log(success);
              }, function (error) {
                // error
                $log.error(error);
              });
            } catch(e) {
              // statements
              console.log(e);
            }



          }
          else if(position == 'LBottom'){

            try {
              $cordovaToast.showLongBottom(text).then(function(success) {
                // success
                $log.log(success);
              }, function (error) {
                // error
                $log.error(error);
              });
            } catch(e) {
              // statements
              console.log(e);
            }


          }


      }
      catch(e){
        $log.error(e);
      }

    }

    return {
      show: show,
      showToast: showToast
    };

});

//this is to open ionic model
appFact.factory('appModalService', function($ionicModal, $rootScope, $q, $injector, $controller, $log){

    function show(templateUrl, controller, parameters) {
        // Grab the injector and create a new scope
        var deferred = $q.defer(),
            ctrlInstance,
            modalScope = $rootScope.$new(),
            thisScopeId = modalScope.$id;

            //$ionicNativeTransitions.enable(false);

        $ionicModal.fromTemplateUrl(templateUrl, {
            scope: modalScope,
            animation: 'none'//'slide-in-up'
        }).then(function (modal) {
            modalScope.modal = modal;

            modalScope.openModal = function () {

                modalScope.modal.show();
            };
            modalScope.closeModal = function (result) {
                deferred.resolve(result);
                //$ionicNativeTransitions.enable(true);
                modalScope.modal.hide();
            };
            modalScope.$on('modal.hidden', function (thisModal) {
                if (thisModal.currentScope) {
                    var modalScopeId = thisModal.currentScope.$id;
                    if (thisScopeId === modalScopeId) {
                        deferred.resolve(null);
                        _cleanup(thisModal.currentScope);
                    }
                }
            });

            // Invoke the controller
            var locals = { '$scope': modalScope, 'parameters': parameters };
            var ctrlEval = _evalController(controller);
            ctrlInstance = $controller(controller, locals);
            if (ctrlEval.isControllerAs) {
                ctrlInstance.openModal = modalScope.openModal;
                ctrlInstance.closeModal = modalScope.closeModal;
            }

            modalScope.modal.show();

        }, function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }


    function _cleanup(scope) {
        scope.$destroy();
        if (scope.modal) {
            scope.modal.remove();
        }
    }


    function _evalController(ctrlName) {
        var result = {
            isControllerAs: false,
            controllerName: '',
            propName: ''
        };
        var fragments = (ctrlName || '').trim().split(/\s+/);
        result.isControllerAs = fragments.length === 3 && (fragments[1] || '').toLowerCase() === 'as';
        if (result.isControllerAs) {
            result.controllerName = fragments[0];
            result.propName = fragments[2];
        } else {
            result.controllerName = ctrlName;
        }

        return result;
    }

    return {
        show: show
    };

  }
);



appFact.factory('myModals', function (appModalService, $log){

  var service = {
      showLogin: showLogin,
      gCommentBox: gCommentBox,
      subCommentBox: subCommentBox,
      help: help
  };

  function showLogin(userInfo){
      // return promise resolved by '$scope.closeModal(data)'
      // Use:
      // myModals.showLogin(userParameters) // get this inject 'parameters' on 'loginModalCtrl'
      //  .then(function (result) {
      //      // result from closeModal parameter
      //  });
      return appModalService.show('templates/model/login.html', 'LoginCtrl', userInfo);
      // or not 'as controller'
      // return appModalService.show('templates/modals/login.html', 'loginModalCtrl', userInfo)
  };

  function gCommentBox(commentInfo){

      return appModalService.show('templates/model/g-comment.html', 'GCommentCtrl', commentInfo);
  };

  function subCommentBox(commentInfo){

      return appModalService.show('templates/model/sub-comment.html', 'SubCommentCtrl', commentInfo);
  };

  function help(helpInfo){

      return appModalService.show('templates/model/how.html', 'HowCtrl', helpInfo);
  };


  return service;

});

//store data in localstorage
appFact.factory('$localstorage', ['$window', function($window, $log) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    },
    remove: function(key){
      $window.localStorage.removeItem(key);
    },
    clear: function(){
      $window.localStorage.clear();
    }

  }
}]);


//App http interceptor for checking and updating the auth token
appFact.factory('appHttpInterceptor', function ($q, PGAppConfig, $localstorage, $injector, $log) {


  function checkCredentials(){

    var token = $localstorage.get(PGAppConfig.LOCAL_TOKEN_KEY);

    if (token){
      return token;
    }
    else{
      return '';
    }

    $log.log('tokon checking ' + token);
  };


    return {

        request : function(config){

          if (config.url.indexOf('html') == -1 ) {
                //console.log("HTTP " + config.method + " request: " + config.url);
              $log.log('request');
              //console.log(config);

              var token = checkCredentials();
            }



          return config;

        },

        response: function (response) {

            return response;
        },
        responseError: function (response) {
            // do something on error
            $log.log('resposeError');
            $log.log(response);
            return $q.reject(response);
        }
    };
});

appFact.factory('DatabaseSrv', function($q, PGAppConfig, $cordovaSQLite, $ionicPlatform, $log, $ionicLoading){

  var db_con = null;
  var db_name = "property_ground.db";

  var service = {
      initLocalDB: initLocalDB,
      deleteDB: deleteDB,
      setCompanyTemplate: setCompanyTemplate,
      executeQuery: executeQuery
  };

  function initLocalDB(){

      var q = $q.defer();

      $ionicPlatform.ready(function(){

        /*if (window.cordova && window.SQLitePlugin) {
          db_con = $cordovaSQLite.openDB( db_name , 1 );
          q.resolve({status: true, db: db_con});
        }
        else {
          db_con = window.openDatabase('property_ground', '1.0', db_name, 100 * 1024 * 1024);
          q.resolve({status: true, db: db_con});
        } */


          if( ionic.Platform.isAndroid() ){
            db_con = $cordovaSQLite.openDB({ name: db_name , iosDatabaseLocation:'default', location: 2, createFromLocation: 1  });
             q.resolve({status: true, db: db_con});
           }
           else if(ionic.Platform.isIOS() ){
             db_con = $cordovaSQLite.openDB({ name: db_name ,  location: 2, createFromLocation: 1 });
              q.resolve({status: true, db: db_con});
           }

          /*if (window.cordova && window.SQLitePlugin) {
              db_con = $cordovaSQLite.openDB( 'property_ground.db', 1 );
              q.resolve({status: true, db: db_con});
          } else {
              db_con = window.openDatabase('property_ground', '1.0', 'property_ground.db', 100 * 1024 * 1024);
              q.resolve({status: true, db: db_con});
          }*/

         /*db_con = window.sqlitePlugin.openDatabase({name: db_name , location: 'default'});
         q.resolve({status: true, db: db_con});*/

        /* if (window.cordova && window.SQLitePlugin) {
           db_con  = window.sqlitePlugin.openDatabase({ name: db_name, location: 1 })
        } else {
            db_con  = window.openDatabase('property_ground', '1.0', db_name, 100 * 1024 * 1024);
        }*/


        /*if (!db_con) {
            if (window.sqlitePlugin !== undefined) {
              db_con = $cordovaSQLite.openDB({ name: db_name, iosDatabaseLocation:'default'});
              //db_con = window.sqlitePlugin.openDatabase({ name: db_name, location: 2, createFromLocation: 1 });
              q.resolve({status: true, db: db_con});
            } else {
              // For debugging in the browser
              db_con = window.openDatabase(db_name , "1.0", "Database", 200000);
              q.resolve({status: true, db: db_con});
            }
          }*/

      });

      return q.promise;

  };


  function setCompanyTemplate(){

     var q = $q.defer();

    if(db_con){

      $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS company_masteritem_link (com_master_id integer primary key, original_master_id integer, company_id integer, item_name text, type text, option text, priority integer, status integer)");
      $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS company_subitem_link (com_subitem_id integer primary key, com_master_id integer, company_id integer, item_name text, type text, priority integer, status integer)");
      $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS company_meter_link (com_meter_id integer primary key, company_id integer, meter_name text, status integer)");
      $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS company_general_condition_link (com_general_id integer primary key, company_id integer, item_name text, options text, priority integer, type text, status integer)");

      $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS sync (id integer primary key, syn_id text, property_id text, table_name text, key_id text, task text, pk_name text, status integer )"); //task INSERT, UPDATE, DELETE

      $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS current_sync(id integer primary key, property_id text, status integer) ");

      createOtherTable();

      q.resolve({status: true});

    }
    else{
      q.reject({status: false});
    }


    $log.log('company template created...');

    return q.promise;

  };


  function createOtherTable(){
    if(db_con){

      $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property (id integer primary key, property_id text, company_id integer, description text, status integer, mb_createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, sync integer DEFAULT 1 )");
      $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property_info (property_id text, address_1 text, address_2 text, city text, postalcode text, report_type text, report_date DATETIME, image_url text, mb_createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, locked integer DEFAULT 0, sync integer DEFAULT 1)");
      $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property_masteritem_link (id integer primary key, prop_master_id text, property_id text, com_master_id integer, type text, com_type text, option text, self_prop_master_id text, name text, priority integer, total_num integer, status integer, mb_createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, sync integer DEFAULT 1)");
      $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property_subitem_link (id integer primary key, prop_subitem_id text, property_id text, com_subitem_id integer, item_name text, type text, priority integer, status integer, mb_createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, sync integer DEFAULT 1)");

      $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property_general_condition_link (id integer primary key, prop_general_id text, property_id text, com_general_id integer, item_name text, options text, type text, priority integer, user_input text, comment text, status integer, mb_createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, sync integer DEFAULT 1)");

      $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property_feedback (id integer primary key, prop_feedback_id text, property_id text, item_id text, parent_id text, option text, comment text, type text, description text, mb_createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, sync integer DEFAULT 1)");
      $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS photos (id integer primary key, photo_id text, property_id text, item_id text, parent_id text, type text, img_url text, mb_createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, sync integer DEFAULT 1)");

      $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property_sub_feedback_general (id integer primary key, prop_sub_feedback_general_id text, property_id text, item_id text, parent_id text, comment text, mb_createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, sync integer DEFAULT 1)");
      $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property_sub_voice_general (id integer primary key, prop_sub_feedback_general_id text, property_id text, item_id text, parent_id text, voice_name text, voice_url text, mb_createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, sync integer DEFAULT 1)");

      $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property_meter_link (id integer primary key, prop_meter_id text, property_id text, com_meter_id integer, meter_name text, reading_value text, status integer, mb_createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, sync integer DEFAULT 1)");

      $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS signatures (id integer primary key, sign_id text, property_id text, comment text, tenant_url text, lanlord_url text, clerk_url text, mb_createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, sync integer DEFAULT 1)"); //type TENANT, LANLORD, CLERK

      $log.log('tables created..');
     }

  }

  function executeQuery(query, data, params, loadingContent ){

    var q = $q.defer();

    // this to set custom ionic loading
    if(loadingContent == undefined){
      loadingContent =  'loading';
    }

    if( loadingContent ==  'loading'){
      $ionicLoading.show({
              content: 'Loading',
              animation: 'fade-in',
              showBackdrop: true,
              maxWidth: 200,
              showDelay: 0
            });
    }
    else if(loadingContent ==  'updating' ){

      $ionicLoading.show({
          // content: 'Loading',
          animation: 'fade-in',
          showBackdrop: true,
          // maxWidth: 200,
          showDelay: 0,
          //template: 'Updating...'
          template: '<p class="item-icon-right">Updating<ion-spinner icon="dots" class="spinner-stable"/></p>'
      });

    }
    else if(loadingContent ==  'noloading' ){

    }

    if(params == undefined ){
      params = {};
    }

    if(db_con){

      console.log('data ', data);

      $cordovaSQLite.execute(db_con, query, data).then(function(res) {
          $log.log("INSERT item -> " );
          $log.log(res);
          if(loadingContent !=  'noloading' ){
            $ionicLoading.hide();
          }
          q.resolve({status: 1, data: res, params: params });

      }, function (err) {
          $log.log(err);
          $ionicLoading.hide();
          q.reject({status: 2, err: err});
      });



   }

   if(loadingContent !=  'noloading' ){
    $ionicLoading.hide();
  }

   return q.promise;

  };

  function deleteDB(){

      if( ionic.Platform.isAndroid() ){
        $cordovaSQLite.deleteDB({ name: db_name , iosDatabaseLocation:'default' });
      }
      else if(ionic.Platform.isIOS() ){
        $cordovaSQLite.deleteDB({ name: db_name ,  location: 2, createFromLocation: 1 });
      }
  };


  return service;


});


//shared search data
//used to share objects
appFact.factory('roomObj', function(){

   var myData = {};

    var setData = function(newObj) {
      myData = newObj;
    };

    var getData = function(){
      return myData;
    };

    return {
      setData: setData,
      getData: getData
    };

});

// this service to get property info based on property id
appFact.factory('PropInfoSrv', function(DatabaseSrv, $q, $log){

  var propInfo = function(property_id){

      var propInfoData = {};
      var q = $q.defer();

      if(property_id){

        DatabaseSrv.initLocalDB().then(function(initdb){

          var query = "select property_info.*, strftime('%d/%m/%Y', property_info.mb_createdAt) as created_date, property.description from property_info inner join property on property_info.property_id = property.property_id where property.property_id=?";
          var data = [property_id];

          DatabaseSrv.executeQuery(query, data ).then(function(result){

              if(result.status == 1 && result.data.rows.length > 0){
                //$scope.data = result.property[0];
                propInfoData.address_1 = result.data.rows.item(0).address_1;
                propInfoData.address_2 =  result.data.rows.item(0).address_2;
                propInfoData.city = result.data.rows.item(0).city;
                propInfoData.postalcode =  result.data.rows.item(0).postalcode;
                propInfoData.report_type = result.data.rows.item(0).report_type;
                propInfoData.report_date = result.data.rows.item(0).report_date;
                propInfoData.created_date = result.data.rows.item(0).created_date;
                propInfoData.description = result.data.rows.item(0).description;

                propInfoData.image_url = result.data.rows.item(0).image_url;

                if( propInfoData.image_url.length == 0 || propInfoData.image_url.indexOf('list_icon.png') ){
                  propInfoData.image_url =  "img/photo-camera.png";
                }

                q.resolve({data: propInfoData, status: 1} );

              }
              else{
                q.resolve({data: propInfoData, status: 0});
                $log.log('Could not find the property!');
              }

          });

        });

      }
      else{
        q.resolve({data: propInfoData, status: 0});
      }


    return q.promise;

  };

  return{
      getPropInfo: propInfo
  };

});



/*//used to play and record sounds
appFact.factory('Sounds', function($q) {

  var deleteSound = function(x) {
    console.log("calling deleteSound");
    var deferred = $q.defer();
    getSounds().then(function(sounds) {
      sounds.splice(x,1);
      localStorage.mysoundboard = JSON.stringify(sounds);
      deferred.resolve();
    });

    return deferred.promise;

  }

  var getSounds = function() {
    var deferred = $q.defer();
    var sounds = [];

    if(localStorage.mysoundboard) {
      sounds = JSON.parse(localStorage.mysoundboard);
    }
    deferred.resolve(sounds);

    return deferred.promise;
  }

  var playSound = function(x) {
    getSounds().then(function(sounds) {
      var sound = sounds[x];


      Ok, so on Android, we just work.
      On iOS, we need to rewrite to ../Library/NoCloud/FILE'

      var mediaUrl = sound.file;
      if(device.platform.indexOf("iOS") >= 0) {
        mediaUrl = "../Library/NoCloud/" + mediaUrl.split("/").pop();
      }
      var media = new Media(mediaUrl, function(e) {
        media.release();
      }, function(err) {
        console.log("media err", err);
      });
      media.play();
    });
  }

  var saveSound = function(s) {
    console.log("calling saveSound");
    var deferred = $q.defer();
    getSounds().then(function(sounds) {
      sounds.push(s);
      localStorage.mysoundboard = JSON.stringify(sounds);
      deferred.resolve();
    });

    return deferred.promise;
  }

  return {
    get:getSounds,
    save:saveSound,
    delete:deleteSound,
    play:playSound
  };
});*/


// $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS sync (id integer primary key, syn_id text, property_id text, table_name text, key_id text, task text, status integer )");
//$cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS current_sync(id integer primary key, property_id text, status integer) ");
 //task INSERT, UPDATE, DELETE

 // "CREATE TABLE IF NOT EXISTS sync (id integer primary key, syn_id text, property_id text, table_name text, key_id text, task text, status integer )"); //task INSERT, UPDATE, DELETE
 /*$cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property (id integer primary key, property_id text, company_id integer, description text, status integer, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)");
 $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property_info (property_id text, address_1 text, address_2 text, city text, postalcode text, report_type text, report_date DATETIME, image_url text, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)");
 $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property_masteritem_link (id integer primary key, prop_master_id text, property_id text, com_master_id integer, type text, com_type text, option text, self_prop_master_id text, name text, priority integer, total_num integer, status integer, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)");
 $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property_subitem_link (id integer primary key, prop_subitem_id text, property_id text, com_subitem_id integer, item_name text, type text, priority integer, status integer, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)");
 $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property_general_condition_link (id integer primary key, prop_general_id text, property_id text, com_general_id integer, item_name text, options text, type text, priority integer, user_input text, comment text, status integer, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)");
 $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property_feedback (id integer primary key, prop_feedback_id text, item_id text, parent_id text, option text, comment text, type text, description text,createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)");
 $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS photos (id integer primary key, photo_id text, item_id text, parent_id text, type text, img_url text, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)");
 $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property_sub_feedback_general (id integer primary key, prop_sub_feedback_general_id text, item_id text, parent_id text, comment text, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)");
 $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property_sub_voice_general (id integer primary key, prop_sub_feedback_general_id text, item_id text, parent_id text, voice_name text, voice_url text, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)");
 $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property_meter_link (id integer primary key, prop_meter_id text, property_id text, com_meter_id integer, meter_name text, reading_value text, status integer, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)");
 $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS signatures (id integer primary key, sign_id text, property_id text, comment text, tenant_url text, lanlord_url text, clerk_url text, mb_createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, sync integer DEFAULT 1)"); //type TENANT, LANLORD, CLERK

 */

appFact.factory('synSrv', function($log, DatabaseSrv, srvObjManipulation, commonSrv, genericModalService, $q, $timeout, $cordovaFileTransfer, PGAppConfig ){

  var tables = [
    {table_name: 'property', pk_name: 'property_id'},
    {table_name: 'property_info', pk_name: 'property_id'},
    {table_name: 'property_masteritem_link', pk_name: 'prop_master_id'},
    {table_name: 'property_subitem_link', pk_name: 'prop_subitem_id'},
    {table_name: 'property_general_condition_link', pk_name: 'prop_general_id'},
    {table_name: 'property_feedback', pk_name: 'prop_feedback_id'},
    {table_name: 'property_sub_feedback_general', pk_name: 'prop_sub_feedback_general_id'},
    {table_name: 'property_sub_voice_general', pk_name: 'prop_sub_feedback_general_id'},
    {table_name: 'property_meter_link', pk_name: 'prop_meter_id'},
    {table_name: 'photos', pk_name: 'photo_id'},
    {table_name: 'signatures', pk_name: 'sign_id'}
  ];

  var init = function(){

    $log.log('::Checking the sync tables ::');

     ionic.Platform.ready(function(){

        DatabaseSrv.initLocalDB().then(function(initdb){

          var query = "select * from current_sync where status =?";
          var data = [1];

          DatabaseSrv.executeQuery(query, data ).then(function(result){

              if(result.data.rows.length > 0 && result.status == 1) {

                for (var i = 0; i < result.data.rows.length; i++) {
                    var item = result.data.rows.item(i);

                    var property_id = item.property_id;
                    $log.log('Init starting :: sync ', property_id);
                    syncProp(property_id);

                  }
              }

            });

        });

     });

   };

    var update = function(property_id, table, key_id, task, pk_name) {

        //   DatabaseSrv.initLocalDB().then(function(initdb){
        //
        //     var query = "INSERT INTO sync (syn_id, property_id, table_name, key_id, task, pk_name, status) VALUES (?,?,?,?,?,?,?)";
        //     var data = [srvObjManipulation.generateUid(), property_id, table, key_id, task, pk_name, 1 ];
        //
        //     DatabaseSrv.executeQuery(query, data ).then(function(result){
        //
        //           if(result.status == 1){
        //
        //               $log.log('Successfully Saved!');
        //           }
        //           else{
        //               $log.log('Something went wrong!');
        //
        //           }
        //
        //     });
        //
        // });


    };


    function sendServer(syncData){

      //found photos table
      // "CREATE TABLE IF NOT EXISTS photos (id integer primary key, photo_id text, property_id text, item_id text, parent_id text, type text, img_url text, mb_createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, sync integer DEFAULT 1)");

      if(syncData.table == 'photos' ){

        $log.log('::: UPLOADING PHOTO :::');

        var options = {
            fileKey: "photo",
            fileName: syncData.data.photo_id + '.jpg',
            chunkedMode: false,
            mimeType: "multipart/form-data"
        };
        var server = ( (PGAppConfig.APP=="DEV")? PGAppConfig.apiDevEndPoint : PGAppConfig.apiEndPoint ) +  'property/uploadphoto';
        var filePath = syncData.data.img_url;

       /* var params = {};
        params['Authorization'] = 'Bearer ' +  PGAppConfig.TOKEN_KEY;
        options.params = params;*/

        var params = {};
        params.headers = {Authorization: 'Bearer ' +  PGAppConfig.TOKEN_KEY };
        params.data = syncData.data;
        options.params = params;

         /*   $log.log('Beffore logs for sync details');
          $log.log(syncData.data);*/


        $cordovaFileTransfer.upload(server, filePath, options).then(function(result) {
            $log.log("SUCCESS: " , result.response );

            $log.log("data: ");
            var photoObj = JSON.parse(result.response).data;
            $log.log(photoObj);

            if(photoObj){

              DatabaseSrv.initLocalDB().then(function(initdb){

                var query = "UPDATE photos SET sync=? WHERE photo_id =?";
                var data = [ 2 , photoObj.photo_id];
                DatabaseSrv.executeQuery(query, data ).then(function(resuls_db){
                  $log.log('Sync successfull Photos '  , result.photo_id );
                });

              });


            }

        }, function(err) {
            $log.log("ERROR: " , err );
            //alert(JSON.stringify(err));
        });



      }
      else if(syncData.table == 'property_sub_voice_general' && (syncData.data.voice_url.length > 0) ){

            $log.log('::: UPLOADING Voice files :::');
          var mine = "multipart/form-data";
          if(syncData.data.voice_url.substr(syncData.data.voice_url.lastIndexOf('.')+1) == 'm4a'){
            mine = 'audio/m4a';
          }


          var options = {
              fileKey: "voice",
              fileName: syncData.data.prop_sub_feedback_general_id + '.'+  syncData.data.voice_url.substr(syncData.data.voice_url.lastIndexOf('.')+1),
              chunkedMode: false,
              mimeType: mine
          };

          var server = ( (PGAppConfig.APP=="DEV")? PGAppConfig.apiDevEndPoint : PGAppConfig.apiEndPoint ) +  'property/uploadvoice';
          var filePath = syncData.data.voice_url;

          var params = {};
          params.headers = {Authorization: 'Bearer ' +  PGAppConfig.TOKEN_KEY };
          params.data = syncData.data;
          options.params = params;


          $cordovaFileTransfer.upload(server, filePath, options).then(function(result) {
              $log.log("SUCCESS: " , result.response );

              $log.log("data: ");
              var voiceObj = JSON.parse(result.response).data;
              $log.log(voiceObj);

              if(voiceObj){

                DatabaseSrv.initLocalDB().then(function(initdb){

                  var query = "UPDATE property_sub_voice_general SET sync=? WHERE prop_sub_feedback_general_id =?";
                  var data = [ 2 , voiceObj.prop_sub_feedback_general_id];
                  DatabaseSrv.executeQuery(query, data ).then(function(resuls_db){
                    $log.log('Sync successfull voice '  , result.prop_sub_feedback_general_id );
                  });

                });


              }

          }, function(err) {
              $log.log("ERROR: " , err );
              //alert(JSON.stringify(err));
          });



      }
      else{

              commonSrv.postData('property/syncmob', syncData, 'noloading').then(function(result){

                $log.log('logs for sync details');
                $log.log(result);

                if(result.status == 1){
                  if(result.synid){

                      DatabaseSrv.initLocalDB().then(function(initdb){

                        var query = "UPDATE " + result.table + "  SET sync=? WHERE " + result.key + " =?";
                        var data = [ 2 , result.synid];

                        var params = {
                          data:  result.data,
                          table:  result.table,
                          synid: result.synid
                        };

                        DatabaseSrv.executeQuery(query, data, params ).then(function(resuls_db){
                          $log.log('Sync successfull ' + resuls_db.params.table ,  resuls_db.params.synid );


                              if( resuls_db.params.table == 'property_info' && ( resuls_db.params.data.image_url.length > 0) ){
                                  // we got to update the url

                                  if( resuls_db.params.data.image_url  == "img/photo-camera.png" || resuls_db.params.data.image_url  == "img/list_icon.png" ){
                                    //we cannot upload the image becase its default image
                                    $log.log('Quit uploading property image ');
                                  }
                                  else{
                                    //upload image
                                    $log.log('upload property image to server ');

                                    var filename =  resuls_db.params.data.property_id  + '.'+  resuls_db.params.data.image_url.substr(resuls_db.params.data.image_url.lastIndexOf('.')+1) ;
                                    var serverurl = 'property/uploadpropertyimg';
                                    var myfilepath = resuls_db.params.data.image_url;
                                    var data = {property_id : resuls_db.params.data.property_id };

                                    uploadImage(filename, serverurl, myfilepath, data );
                                  }

                              }

                              // if( resuls_db.params.table == 'property_info' && ( resuls_db.params.data.sign_url.length > 0) ){
                              //     // we got to update the url
                              //
                              //       //upload image
                              //       $log.log('upload property image to server ');
                              //
                              //       var filename =  resuls_db.params.data.property_id + '_signature' + '.'+  resuls_db.params.data.sign_url.substr(resuls_db.params.data.sign_url.lastIndexOf('.')+1) ;
                              //       var serverurl = 'property/uploadsignature';
                              //       var myfilepath = resuls_db.params.data.sign_url;
                              //       var data = {property_id : resuls_db.params.data.property_id };
                              //
                              //       uploadImage(filename, serverurl, myfilepath, data );
                              //
                              //
                              // }


                        });




                      });

                  }

                }

            });



      }



    };


    function uploadImage(filename, serverurl, myfilepath, data ){

          $log.log('::: UPLOADING SINGLE PHOTO :::');

          var options = {
              fileKey: "photo",
              fileName: filename,
              chunkedMode: false,
              mimeType: "multipart/form-data"
          };
          var server = ( (PGAppConfig.APP=="DEV")? PGAppConfig.apiDevEndPoint : PGAppConfig.apiEndPoint ) +  serverurl;
          var filePath = myfilepath;

          var params = {};
          params.headers = {Authorization: 'Bearer ' +  PGAppConfig.TOKEN_KEY };
          params.data = data;
          options.params = params;

          $cordovaFileTransfer.upload(server, filePath, options).then(function(result) {
              $log.log("SUCCESS: IMAGEC :::" , result.response );

          }, function(err) {
              $log.log("ERROR: " , err );
              //alert(JSON.stringify(err));
          });

    };



    var synProperty = function(property_id){

      syncStart(property_id);

    };


    function syncStart(property_id){

      var query = "select * from current_sync where property_id=? and status=?";
      var data = [property_id, 1]; // 1 is currently on process

        DatabaseSrv.initLocalDB().then(function(initdb){

            DatabaseSrv.executeQuery(query, data ).then(function(result){

                console.log('item length', result.data.rows.length);
                if(result.data.rows.length <= 0){

                  var query = "INSERT INTO current_sync (property_id, status) VALUES (?,?)";
                  var data = [property_id, 1 ];

                  DatabaseSrv.executeQuery(query, data ).then(function(result){

                      if(result.status == 1) {
                        syncProp(property_id);
                      }

                  });

                }
                else{
                  syncProp(property_id);
                }

            });

        });

    };


    function syncProp(property_id){

      for (var i = 0; i < tables.length; i++) {

        var sql_query = "select * from " + tables[i].table_name + " where property_id=? and sync=?";
        var sql_data = [property_id, 1];
        var params = {task: 'INSERT', table_name: tables[i].table_name, pk_name: tables[i].pk_name };

        pullData(sql_query, sql_data, params);

      }


      $timeout(function(){
        checkSyncProcess(property_id);
      }, 3000);

    }


    function checkSyncProcess(property_id){

      finishedSyncCheck(property_id).then(function(res){

        $log.log('SYNC checking after timing ::::', res);

        if(res != undefined){

          if(res.notSync == true){
            // still not sync yet

            $log.log('::::::NOT YET MAN sync');
          }
          else{
                  //no more syn data
                  // no more status 1
                  $log.log('::::::almost sync');
                  var query = "update current_sync set status=? where property_id=?";
                  var data = [2, property_id];

                  DatabaseSrv.executeQuery(query, data ).then(function(result){
                      $log.log('updating starter sync table, guess it almost sync');

                      genericModalService.showToast('Sync finished!', 'LCenter');
                  });
          }

        }
      });

    }

    function finishedSyncCheck(property_id){

      var q = $q.defer();
      var notSync = false;

      for (var i = 0; i < tables.length; i++) {

        var sql_query = "select * from " + tables[i].table_name + " where property_id=? and sync=?";
        var sql_data = [property_id, 1];
        var params = {task: 'INSERT', table_name: tables[i].table_name, pk_name: tables[i].pk_name };

        DatabaseSrv.executeQuery(sql_query, sql_data,  params).then(function(result_insert){

          if(result_insert.data.rows.length > 0 && result_insert.status == 1) {
            notSync = true;
            q.resolve( {notSync: notSync } );
          }

        });

      }

      return q.promise;

    }


    function pullData(sql_query, sql_data, params){

          DatabaseSrv.executeQuery(sql_query, sql_data,  params).then(function(result_insert){

            if(result_insert.data.rows.length > 0 && result_insert.status == 1) {

              for (var i = 0, l = result_insert.data.rows.length; i < l; i++) {

                  var item = result_insert.data.rows.item(i);
                  $log.log('::pulling data for sync::', result_insert.params.table_name);
                  $log.log(':::DATA:::' ,  item );

                  var syncData = {
                    sync: item[result_insert.params.pk_name],
                    data: item,
                    task: 'INSERT',
                    table: result_insert.params.table_name,
                    key:  result_insert.params.pk_name
                  };

                  sendServer(syncData);

              }

            }

          });

      };


    var syncAll = function(props){
      $log.log(props);

        for (var i = 0, l = props.length ; i < l; i++) {
          syncStart(props[i]);
        }
    };

    return {
      update: update,
      synProperty: synProperty,
      syncAll: syncAll,
      init: init
    };

});
