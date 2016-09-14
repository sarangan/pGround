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
      subCommentBox: subCommentBox 
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

          if( ionic.Platform.isAndroid() ){
            db_con = $cordovaSQLite.openDB({ name: db_name , iosDatabaseLocation:'default' });
             q.resolve({status: true, db: db_con});
          }
          else if(ionic.Platform.isIOS() ){
            db_con = $cordovaSQLite.openDB({ name: db_name ,  location: 2, createFromLocation: 1 });
             q.resolve({status: true, db: db_con});
          }
         

      });

      return q.promise;

  };


  function setCompanyTemplate(){

     var q = $q.defer();
    
    if(db_con){

      $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS company_masteritem_link (com_master_id integer primary key, original_master_id integer, company_id integer, item_name text, type text, option text, priority integer, status integer)");
      $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS company_subitem_link (com_subitem_id integer primary key, com_master_id integer, company_id integer, item_name text, type text, priority integer, status integer)");
      $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS company_meter_link (com_meter_id integer primary key, company_id integer, meter_name text, type text, status integer)");
      $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS company_general_condition_link (com_general_id integer primary key, company_id integer, item_name text, options text, priority integer, type text, status integer)");

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

        $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property (id integer primary key, property_id text, company_id integer, description text, status integer, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)");
        $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property_info (property_id text, address_1 text, address_2 text, city text, postalcode text, report_type text, report_date DATETIME, image_url text, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)");
        $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property_masteritem_link (id integer primary key, prop_master_id text, property_id text, com_master_id integer, type text, self_prop_master_id text, name text, priority integer, total_num integer, status integer, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)");
        //$cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property_master_num_link (id integer primary key, prop_num_id text, prop_master_id text, name text, description text, status integer, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)");
        $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property_subitem_link (id integer primary key, prop_subitem_id text, property_id text, com_subitem_id integer, priority integer, status integer, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)");
        
        $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property_general_condition_link (id integer primary key, prop_general_id text, property_id text, com_general_id integer, priority integer, user_input text, comment text, status integer, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)");

        $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property_feedback (id integer primary key, prop_feedback_id text, item_id text, option text, comment text, type text, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)");
        $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS photos (id integer primary key, photo_id text, item_id text, type text, img_url text, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)");
        
        $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property_sub_feedback_general (id integer primary key, prop_sub_feedback_general_id text, item_id text, comment text, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)");
        $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property_sub_voice_general (id integer primary key, prop_sub_feedback_general_id text, item_id text, voice_name text, voice_url text, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)");

        $cordovaSQLite.execute(db_con, "CREATE TABLE IF NOT EXISTS property_meter_link (id integer primary key, prop_meter_id text, property_id text, com_meter_id integer, reading_value text, status integer, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)");
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
          $ionicLoading.hide();
          q.resolve({status: 1, data: res, params: params });

      }, function (err) {
          $log.log(err);
          $ionicLoading.hide();
          q.reject({status: 2, err: err});
      });



   }

   $ionicLoading.hide();

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