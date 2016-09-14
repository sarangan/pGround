appSrv = angular.module('PGApp.services', []);

//var uuid = require('node-uuid');

// manipulate object
appSrv.service('srvObjManipulation', function(){

  //check the object is empty or not
  this.isEmpty = function (obj) {
    
    for(var i in obj){ 
        return true;
    }
    return false;
  };  

  //check the object is length
  this.ObjLength = function (obj) {
    
    var count = 0;
    for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
           ++count;
        }
    }

    return count;
  };

  this.generateUid = function (separator) {
      /// <summary>
      ///    Creates a unique id for identification purposes.
      /// </summary>
      /// <param name="separator" type="String" optional="true">
      /// The optional separator for grouping the generated segmants: default "-".    
      /// </param>

      var delim = separator || "-";

      /*function S4() {
          return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      }

      return (S4() + S4() + delim + S4() + delim + S4() + delim + S4() + delim + S4() + S4() + S4());*/

      // Generate a v4 (random) id
      return uuid.v4();


  };


  var escapebiguni = function(str) {
    if (typeof(str) != 'string') return str;
    
    //http://stackoverflow.com/questions/1354064/how-to-convert-characters-to-html-entities-using-plain-javascript
    var _escape_overrides = {
      0x00:'\uFFFD', 0x80:'\u20AC', 0x82:'\u201A', 0x83:'\u0192', 0x84:'\u201E',
      0x85:'\u2026', 0x86:'\u2020', 0x87:'\u2021', 0x88:'\u02C6', 0x89:'\u2030',
      0x8A:'\u0160', 0x8B:'\u2039', 0x8C:'\u0152', 0x8E:'\u017D', 0x91:'\u2018',
      0x92:'\u2019', 0x93:'\u201C', 0x94:'\u201D', 0x95:'\u2022', 0x96:'\u2013',
      0x97:'\u2014', 0x98:'\u02DC', 0x99:'\u2122', 0x9A:'\u0161', 0x9B:'\u203A',
      0x9C:'\u0153', 0x9E:'\u017E', 0x9F:'\u0178'
    };
    return str.replace(/([\uD800-\uDBFF][\uDC00-\uFFFF])/g, function(c) {
      var c1 = c.charCodeAt(0);
      // ascii character, use override or escape
      if( c1 <= 0xFF ) return (c1=_escape_overrides[c1])?c1:escape(c).replace(/%(..)/g,"&#x$1;");
      // utf8/16 character
      else if( c.length == 1 ) return "&#" + c1 + ";"; 
      // surrogate pair
      else if( c.length == 2 && c1 >= 0xD800 && c1 <= 0xDBFF ) return "&#" + ((c1-0xD800)*0x400 + c.charCodeAt(1) - 0xDC00 + 0x10000) + ';';
      // no clue .. 
      else return "";
    });
  };

  this.urlencode = function(text){
    
    try {
      text = escapebiguni(text);//for emojis or large unicode range
    } catch(e) {
      console.log(e);
    }
    
    text = escape(text.toString()).replace(/\+/g, "%2B");
    
    // this escapes 128 - 255, as JS uses the unicode code points for them.
    // This causes problems with submitting text via AJAX with the UTF-8 charset.
    var matches = text.match(/(%([0-9A-F]{2}))/gi);
    if (matches)
    {
      for (var matchid = 0; matchid < matches.length; matchid++) {
        var code = matches[matchid].substring(1,3);
        if (parseInt(code, 16) >= 128) {
          text = text.replace(matches[matchid], '%u00' + code);
        }
      }
    }

    // %25 gets translated to % by PHP, so if you have %25u1234,
    // we see it as %u1234 and it gets translated. So make it %u0025u1234,
    // which will print as %u1234!
    text = text.replace('%25', '%u0025');

    return text;

  };


});


appSrv.service('ModalService', function($ionicModal, $rootScope) {


  var init = function(tpl, $scope) {

    var promise;
    $scope = $scope || $rootScope.$new();

    promise = $ionicModal.fromTemplateUrl(tpl, {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      return modal;
    });

    $scope.openModal = function() {
       $scope.modal.show();
     };
     $scope.closeModal = function() {
       $scope.modal.hide();
     };
     $scope.$on('$destroy', function() {
       $scope.modal.remove();
     });

    return promise;
  }

  return {
    init: init
  }

});

appSrv.service('ModalService', function($ionicModal, $rootScope) {

  var init = function(tpl, $scope) {

    var promise;
    $scope = $scope || $rootScope.$new();

    promise = $ionicModal.fromTemplateUrl(tpl, {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      return modal;
    });

    $scope.openModal = function() {
       $scope.modal.show();
     };
     $scope.closeModal = function() {
       $scope.modal.hide();
     };
     $scope.$on('$destroy', function() {
       $scope.modal.remove();
     });

    return promise;
  }

  return {
    init: init
  }

});

//this is for login auth service
appSrv.service('AuthService', function($q, $http, PGAppConfig, $localstorage, commonSrv, $log, myModals, genericModalService, DatabaseSrv) {

  var LOCAL_TOKEN_KEY = PGAppConfig.LOCAL_TOKEN_KEY;//'HMZAPPAUTHKEY';
  var USER_DETAILS_KEY = 'PGAPPAUTHUSER';
  var username = '';
  var isAuthenticated = false;
  var authToken;
  var userDetails = {};

 
  (function loadUserCredentials() {

    $log.log('Auth init config');

    var token = $localstorage.get(LOCAL_TOKEN_KEY);
    if (token) {

      useCredentials(token);
      
    }
    else
    {
      isAuthenticated = false;
    }
    $log.log('tokon checking ' + token);


  })();
 
  function storeUserCredentials(token, user) {
    
    $localstorage.set(LOCAL_TOKEN_KEY, token); //store tokon

     userDetails = {
                      user_id : user.id,
                      email :  user.email,
                      company_id : user.company_id,
                      type : user.type,
                      first_name : user.first_name,
                      last_name : user.last_name,
                      contact : user.contact
                  };


    $localstorage.setObject(USER_DETAILS_KEY, userDetails); //store user details

    useCredentials(token);
  }
 
  function useCredentials(token) {

    userDetails = $localstorage.getObject(USER_DETAILS_KEY);

    isAuthenticated = true;
    authToken = token;

    username = userDetails.first_name + ' ' +  userDetails.last_name;
 
    PGAppConfig['TOKEN_KEY'] = token;

    //Set the token as header for your requests!
    //$http.defaults.headers.common['X-Auth-Token'] = token;
    //$http.defaults.headers.common.Authorization = token;
  }
 
  function destroyUserCredentials() {
    authToken = undefined;
    username = '';
    isAuthenticated = false;
    //$http.defaults.headers.common['X-Auth-Token'] = undefined;
    //delete $http.defaults.headers.common.Authorization;

    $localstorage.remove(USER_DETAILS_KEY);   

    $localstorage.remove(LOCAL_TOKEN_KEY);
    
  }
 
  var login = function(username, password) {

    return $q(function(resolve, reject) {

      var data = {
        email :  username,
        password : password
      };

        commonSrv.postData( 'auth/authenticate', data)
            .then(function(result) {

              if(result != undefined){

                var keys = Object.keys(result).map(function(x){ return x.toUpperCase() }) //$.map( Object.keys(result) , String.toUpperCase);            

                if( keys.indexOf( ("token").toUpperCase() )  != -1 ){
                  //login success

                  // Make a request and receive your auth token from your server
	              userDetails = {
                      user_id : result.user.id,
                      email :  result.user.email,
                      company_id : result.user.company_id,
                      type : result.user.type,
                      first_name : result.user.first_name,
                      last_name : result.user.last_name,
                      contact : result.user.contact
                  };

                  storeUserCredentials(result.token, result.user);


                  getCompanyTemplate(result.token, result.user);


                  resolve('Login success.');

                }
                else{
                  reject('Login Failed.');
                }

              }
              else{
                reject('Login Failed.');
              }

          });

      



    });

  };


  //get company template
  function getCompanyTemplate(token, user){

      commonSrv.postData( 'company/getTemplate')
          .then(function(result) {

            console.log(result);

            if(result.status == 1){

              console.log('success');    

              DatabaseSrv.initLocalDB().then(function(initdb){

                DatabaseSrv.setCompanyTemplate().then(function(tempate){

                      if(result.data.master ){

                          var master_items = result.data.master;
                          var query = "INSERT INTO company_masteritem_link (com_master_id, original_master_id, company_id, item_name, type, option, priority, status) VALUES (?,?,?,?,?,?,?,?)";

                          for(var i =0, l= master_items.length; i < l; i++){

                            DatabaseSrv.executeQuery(query, [master_items[i].com_master_id , master_items[i].original_master_id, master_items[i].company_id, master_items[i].item_name, master_items[i].type, master_items[i].option,  master_items[i].priority,  master_items[i].status ]).then(function(masteritems){

                            });
                           /* $cordovaSQLite.execute(db, query, [master_items[i].com_master_id , master_items[i].original_master_id, master_items[i].company_id, master_items[i].item_name, master_items[i].type, master_items[i].option,  master_items[i].priority,  master_items[i].status ]).then(function(res) {
                                console.log("INSERT master item ID -> " + res.insertId);
                            }, function (err) {
                                console.error(err);
                            });*/

                          }

                      }


                      if(result.data.sub ){

                          var sub_items = result.data.sub;
                          var query = "INSERT INTO company_subitem_link (com_subitem_id, com_master_id, company_id, item_name, type, priority, status) VALUES (?,?,?,?,?,?,?)";

                          for(var i =0, l= sub_items.length; i < l; i++){
                             DatabaseSrv.executeQuery(query, [sub_items[i].com_subitem_id , sub_items[i].com_master_id, sub_items[i].company_id, sub_items[i].item_name, sub_items[i].type, sub_items[i].priority,  sub_items[i].status ]).then(function(subitems){

                             });
                           /* $cordovaSQLite.execute(db, query, [sub_items[i].com_subitem_id , sub_items[i].com_master_id, sub_items[i].company_id, sub_items[i].item_name, sub_items[i].type, sub_items[i].priority,  sub_items[i].status ]).then(function(res) {
                                console.log("INSERT sub item ID -> " + res.insertId);
                            }, function (err) {
                                console.error(err);
                            });*/

                          }

                      }


                  if(result.data.meter ){

                      var meter_items = result.data.meter;
                      var query = "INSERT INTO company_meter_link (com_meter_id, company_id, meter_name, status) VALUES (?,?,?,?)";

                      for(var i =0, l= meter_items.length; i < l; i++){

                        DatabaseSrv.executeQuery(query, [meter_items[i].com_meter_id , meter_items[i].company_id, meter_items[i].meter_name, meter_items[i].status ] ).then(function(meter){

                        });

                        /*$cordovaSQLite.execute(db, query, [meter_items[i].com_meter_id , meter_items[i].company_id, meter_items[i].meter_name, meter_items[i].status ]).then(function(res) {
                            console.log("INSERT meter item ID -> " + res.insertId);
                        }, function (err) {
                            console.error(err);
                        });*/

                      }

                  }


                  if(result.data.general ){

                      var general_items = result.data.general;
                      var query = "INSERT INTO company_general_condition_link (com_general_id, company_id, item_name, options, priority, type, status) VALUES (?,?,?,?,?,?,?)";

                      for(var i =0, l= general_items.length; i < l; i++){

                        DatabaseSrv.executeQuery(query, [general_items[i].com_general_id , general_items[i].company_id, general_items[i].item_name,  general_items[i].options,  general_items[i].priority,  general_items[i].type, general_items[i].status ] ).then(function(generalitems){
                        }); 
                       /* $cordovaSQLite.execute(db, query, [general_items[i].com_general_id , general_items[i].company_id, general_items[i].item_name,  general_items[i].options,  general_items[i].priority,  general_items[i].type, general_items[i].status ]).then(function(res) {
                            console.log("INSERT general item ID -> " + res.insertId);
                        }, function (err) {
                            console.error(err);
                        });*/

                      }

                  }


                });

              });

            }

      });

  };

  var getToken = function(){
    var token = $localstorage.get(LOCAL_TOKEN_KEY);
    return token;
  };

  var setToken = function(token){
    $localstorage.set(LOCAL_TOKEN_KEY, token); //store tokon
  };

 
  var logout = function(){     

  	destroyUserCredentials();
    //myModals.showLogin({state: 'tab.settings' });

    DatabaseSrv.deleteDB();
    
  };
 
  
  var isChkAuthenticated = function(){

    var token = $localstorage.get(LOCAL_TOKEN_KEY);
    if (token) {
      // good
    }
    else
    {
      isAuthenticated = false;
    }
    return isAuthenticated;
   
  };


  var getUserDetails = function(){
     userDetails = $localstorage.getObject(USER_DETAILS_KEY);

     return userDetails;
  };


  var getCompanyId = function(){

    var userDetails = $localstorage.getObject(USER_DETAILS_KEY);

     return userDetails.company_id;

  }
 
  /*loadUserCredentials();*/
 
  return {
    login: login,
    logout: logout,
    isAuthenticated: isChkAuthenticated, //function() {return isAuthenticated;},
    username: function() {return username;},
    role: function() {return role;},
    userDetails: getUserDetails,
    getCompanyId: getCompanyId,
    getToken : getToken,
    setToken : setToken
  };
});