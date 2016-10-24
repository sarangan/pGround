var appCtrl = angular.module('PGApp.controllers', []);

appCtrl.controller('AppCtrl', function($scope, $state, $ionicModal, $timeout, AuthService) {

  $scope.logout = function(){
    AuthService.logout();
    $state.go('login');
  }

});


//-----------------------------Inspections list control -------------------------------------------------

/*
 *  Login control
 *  Login to system
 */

appCtrl.controller('InspectionListCtrl', function(
  $scope,
  $state,
  AuthService,
  myModals,
  commonSrv,
  AuthService,
  DatabaseSrv,
  $log,
  synSrv){

    $scope.shouldShowDelete = false;
    $scope.shouldShowReorder = false;
    $scope.listCanSwipe = true
    $scope.items = [];

    $scope.$on('$ionicView.beforeEnter', function() {

      $scope.items = [];
      loadData();

    });

    //load data
    function loadData() {

      $scope.items =  [];

      if (!AuthService.isAuthenticated()) {
        //myModals.showLogin({state: $state.current.name });
        $state.go('login');
      }
      else{

        //commonSrv.getResult('property/inspections').then(function(result){

         DatabaseSrv.initLocalDB().then(function(initdb){

          //var query = "select property_info.*, strftime('%d/%m/%Y', property_info.createdAt) as created_date from property_info inner join property on property_info.property_id = property.property_id where property.company_id=?";
          var query = "select property_info.*, strftime('%d/%m/%Y', property_info.mb_createdAt) as created_date from property_info";

          var data = [AuthService.getCompanyId()];

          $log.log('company id ', AuthService.getCompanyId());

          DatabaseSrv.executeQuery(query , []).then(function(result){

            $log.log('resultsss');
            $log.log(result);


            if(result.data.rows.length > 0) {

              $log.log('out we ');

               for (var i = 0; i < result.data.rows.length; i++) {
                var item = result.data.rows.item(i);

                console.log('item ', item);
                $scope.items.push(item);
              }

              //$scope.items = result.data;

            }



          });

        });


      }

    }

    /*(function init(){

      loadData();
    })();*/

    //refresh data
    $scope.refresh = function(){

      loadData();
    };


    //add new property
    $scope.addNew = function(){

      $log.log('add new ');
      $state.go('app.newPropertyinfo');

    };


    //update avatar image
    $scope.avatarImg = function(imgUrl){

      if(imgUrl == null || imgUrl.length == 0){
        return 'img/list_icon.png';
      }
      else{
        return imgUrl;
      }

    };


    //open link
    $scope.openLink = function(prop_id){


      DatabaseSrv.initLocalDB().then(function(initdb){

          var query = "SELECT property_masteritem_link.total_num FROM property_masteritem_link where property_masteritem_link.option = 'NUM' and property_masteritem_link.total_num > 0 and property_masteritem_link.property_id = ?";

          var data = [prop_id];

          DatabaseSrv.executeQuery(query, data ).then(function(result){

            if(result.status == 1 && result.data.rows.length > 0){

                //$scope.data = result.property[0];
                $state.go('app.proplist', {property_id: prop_id });

              }
              else{

                $state.go('app.property', {property_id: prop_id });
              }

          });


        });

    };

    $scope.syncAll = function(){

        synSrv.syncAll($scope.items);
    }


});

//-----------------------------End Inspections list control ---------------------------------------
appCtrl.controller('NewPropInfoCtrl', function(
  $scope,
  $state,
  $stateParams,
  $cordovaDatePicker,
  $log,
  $cordovaCamera,
  commonSrv,
  $ionicPopup,
  $cordovaFileTransfer,
  PGAppConfig,
  DatabaseSrv,
  srvObjManipulation,
  genericModalService,
  AuthService,
  $timeout,
  synSrv,
  $ionicLoading){


  $scope.data = {};
  $scope.data['reportImage'] = "img/list_icon.png";
  $scope.data['image_url'] = "img/photo-camera.png";

  $scope.property_id = 0;

  $scope.title = "Add new property";


  $scope.$on('$ionicView.beforeEnter', function() {

    $scope.property_id = $stateParams.property_id;

    if( $scope.property_id ){
      //this is where we need to load the old data

      $scope.title =  "Property info";

      //commonSrv.postData('property/getProperty' , {property_id: $scope.property_id}).then(function(result) {

        DatabaseSrv.initLocalDB().then(function(initdb){

          var query = "select property_info.*, strftime('%d/%m/%Y', property_info.mb_createdAt) as created_date, property.description from property_info inner join property on property_info.property_id = property.property_id where property.property_id=?";

          var data = [$scope.property_id];

          DatabaseSrv.executeQuery(query, data ).then(function(result){

            if(result.status == 1 && result.data.rows.length > 0){

                //$scope.data = result.property[0];
                $scope.data.address_1 = result.data.rows.item(0).address_1;
                $scope.data.address_2 =  result.data.rows.item(0).address_2;
                $scope.data.city =  result.data.rows.item(0).city;
                $scope.data.postalcode =  result.data.rows.item(0).postalcode;
                $scope.data.report_type =  result.data.rows.item(0).report_type;
                $scope.data.report_date =  new Date(result.data.rows.item(0).report_date);
                $scope.data.created_date =  result.data.rows.item(0).created_date;
                $scope.data.description =  result.data.rows.item(0).description;

                $scope.data.image_url =  result.data.rows.item(0).image_url;


                $log.log('image url test');
                $log.log($scope.data.image_url);

                if( $scope.data.image_url.length == 0 ){
                  $scope.data.image_url =  "img/photo-camera.png";
                  $log.log('i am here because they call me ');
                }

              }
              else{
                genericModalService.showToast('Could not find the property!', 'LCenter');
              }

          });

      });

    }
    else{
      $scope.title = "Add new property";
    }

  });

  // open date
  $scope.openDate = function(){

    var options = {
      date: new Date(),
      mode: 'date', // or 'time'
      //minDate: new Date() - 10000,
      allowOldDates: true,
      allowFutureDates: true,
      doneButtonLabel: 'DONE',
      doneButtonColor: '#F2F3F4',
      cancelButtonLabel: 'CANCEL',
      cancelButtonColor: '#000000'
    };

    $cordovaDatePicker.show(options).then(function(date){
        //report_date
        $scope.data.report_date =new Date(date).toLocaleDateString("en-UK");
    });

  };

  //open camera
  $scope.openCamera = function(){

      var options = {
          quality: 75,
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: Camera.PictureSourceType.CAMERA,
          allowEdit: true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 800,
          targetHeight: 800,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false,
          correctOrientation:true
      };

      $cordovaCamera.getPicture(options).then(function(imageData){
          // var image = document.getElementById('reportImage');
          // $scope.data['reportImage'] = "data:image/jpeg;base64," + imageData;

          console.log('image url ', imageData);

          $scope.data['image_url'] = imageData;
          $scope.data['reportImage'] = imageData;

        }, function(err){
          // error
          $log.log(err);
      });

  };



  //save propertyInfo
  $scope.save = function(){

    if($scope.data.address_1 != undefined ){

      if($scope.data.address_1 != ''){

          $log.log($scope.data);


            if(!$scope.property_id){


              $log.log('inserting');

              $ionicLoading.show({
                content: 'Loading',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
              });

              //commonSrv.postData('property/add', $scope.data).then(function(result) {
              DatabaseSrv.initLocalDB().then(function(initdb){

                  var query = "INSERT INTO property (property_id, company_id, description, status) VALUES (?,?,?,?)";

                  var prop_unique_id = srvObjManipulation.generateUid();

                  var data = [prop_unique_id , AuthService.getCompanyId(),  $scope.data.description , 1];

                  DatabaseSrv.executeQuery(query, data ).then(function(result){

                    if(result.status == 1){
                      $scope.property_id =  prop_unique_id;//result.data.insertId;

                      $log.log('property id', $scope.property_id);

                      synSrv.update($scope.property_id, 'property', $scope.property_id, 'INSERT', 'property_id' );


                      if($scope.property_id ){


                          var query = "INSERT INTO property_info (property_id, address_1, address_2, city, postalcode,  report_type, report_date, image_url) VALUES (?,?,?,?,?,?,?,?)";
                          var data = [$scope.property_id, $scope.data.address_1, $scope.data.address_2, $scope.data.city, $scope.data.postalcode, $scope.data.report_type, new Date($scope.data.report_date).toLocaleDateString("en-UK"), $scope.data.reportImage ];
                          $log.log('date');
                          $log.log(data);
                          DatabaseSrv.executeQuery(query, data ).then(function(prop_info_result){


                            if(prop_info_result.status ==  1){

                                synSrv.update($scope.property_id, 'property_info', $scope.property_id, 'INSERT', 'property_id' );

                                //------------------- setting property template --------------------

                                //meter import

                                query = "select Company_meter_link.* from Company_meter_link where Company_meter_link.status=1";

                                DatabaseSrv.executeQuery(query, []).then(function(Meter_types){

                                    if(Meter_types.status == 1 && Meter_types.data.rows.length > 0){

                                      //query = "INSERT INTO property_meter_link (prop_meter_id, property_id, com_meter_id, reading_value, status) VALUES (?,?,?,?,?)";
                                      query = "INSERT INTO property_meter_link (prop_meter_id, property_id, com_meter_id, meter_name, reading_value, status) ";

                                      var property_meter_link_id = srvObjManipulation.generateUid();
                                      synSrv.update($scope.property_id, 'property_meter_link', property_meter_link_id, 'INSERT', 'prop_meter_id' );

                                      query += " select '"+ property_meter_link_id +  "' as prop_meter_id, '" + $scope.property_id + "' as property_id, " +  Meter_types.data.rows.item(0).com_meter_id +  " as com_meter_id, '"+ Meter_types.data.rows.item(0).meter_name + "' as meter_name, '' as reading_value, 1 as status ";


                                      //for (var i = 0; i < Meter_types.data.rows.length; i++) {
                                      for (var i = 1; i < Meter_types.data.rows.length; i++) {

                                        property_meter_link_id = srvObjManipulation.generateUid();
                                        synSrv.update($scope.property_id, 'property_meter_link', property_meter_link_id, 'INSERT', 'prop_meter_id' );

                                        /*data = [srvObjManipulation.generateUid(), $scope.property_id, Meter_types.data.rows.item(i).com_meter_id, '', 1 ];

                                        DatabaseSrv.executeQuery(query, data).then(function(prop_meter){
                                          $log.log('updating prop meter!');
                                        });*/
                                        query += " UNION ALL SELECT '" + property_meter_link_id + "','"+  $scope.property_id +  "'," + Meter_types.data.rows.item(i).com_meter_id + ",'"+ Meter_types.data.rows.item(i).meter_name + "', '', 1 ";
                                      }

                                       DatabaseSrv.executeQuery(query, []).then(function(prop_meter){ //meter saving

                                        $log.log('updating prop meter!');


                                          //general condition import
                                          query = "select Company_general_condition_link.* from Company_general_condition_link where Company_general_condition_link.status=1";

                                          DatabaseSrv.executeQuery(query, []).then(function(General_conditions){

                                              if(General_conditions.status == 1 && General_conditions.data.rows.length > 0){

                                                //query = "INSERT INTO property_general_condition_link (prop_general_id, property_id, com_general_id, priority, user_input, comment, status ) VALUES (?,?,?,?,?,?,?)";
                                                query = "INSERT INTO property_general_condition_link (prop_general_id, property_id, com_general_id, item_name, options, type, priority, user_input, comment, status ) ";

                                                var property_general_condition_link_id = srvObjManipulation.generateUid();
                                                synSrv.update($scope.property_id, 'property_general_condition_link', property_general_condition_link_id, 'INSERT', 'prop_general_id' );

                                                query += " select '"+ srvObjManipulation.generateUid() +  "' as prop_general_id, '" +  $scope.property_id +  "' as property_id, " + General_conditions.data.rows.item(0).com_general_id + " as com_general_id, '" + General_conditions.data.rows.item(0).item_name + "' as item_name,'" + General_conditions.data.rows.item(0).options + "' as options, '" + General_conditions.data.rows.item(0).type + "' as type,"  +  General_conditions.data.rows.item(0).priority + " as priority, '' as user_input, '' as comment, 1 as status ";

                                                //for (var i = 0; i < General_conditions.data.rows.length; i++) {
                                                for (var i = 1; i < General_conditions.data.rows.length; i++) {

                                                  property_general_condition_link_id = srvObjManipulation.generateUid();
                                                  synSrv.update($scope.property_id, 'property_general_condition_link', property_general_condition_link_id, 'INSERT', 'prop_general_id' );

                                                  /*data = [srvObjManipulation.generateUid(), $scope.property_id, General_conditions.data.rows.item(i).com_general_id, General_conditions.data.rows.item(i).priority, '', '', 1 ];

                                                  DatabaseSrv.executeQuery(query, data).then(function(prop_meter){
                                                    $log.log('updating general condition!');
                                                  });*/
                                                   query += " UNION ALL SELECT '"+ property_general_condition_link_id + "','" +  $scope.property_id + "'," +  General_conditions.data.rows.item(i).com_general_id + ",'"+ General_conditions.data.rows.item(i).item_name + "','" + General_conditions.data.rows.item(i).options + "','" + General_conditions.data.rows.item(i).type +"'," +   General_conditions.data.rows.item(i).priority + ", '', '', 1 ";

                                                }

                                                DatabaseSrv.executeQuery(query, []).then(function(prop_generals){

                                                  $log.log('updating property general condition!');


                                                  //----------------------------------------------------------------------------------------------------------------------------------

                                                        //master items import
                                                        // merger

                                                        query = "select Company_masteritem_link.* from Company_masteritem_link where Company_masteritem_link.status='true'";

                                                        DatabaseSrv.executeQuery(query, []).then(function(master_items){

                                                            if(master_items.status == 1 && master_items.data.rows.length > 0){

                                                             // query = "INSERT INTO property_masteritem_link (prop_master_id, property_id, com_master_id, type, self_prop_master_id, name,  priority, total_num, status) VALUES (?,?,?,?,?,?,?,?,?)";

                                                             query = "INSERT INTO property_masteritem_link (prop_master_id, property_id, com_master_id, type, com_type, option, self_prop_master_id, name,  priority, total_num, status) ";

                                                             var property_masteritem_link_id = srvObjManipulation.generateUid();
                                                             synSrv.update($scope.property_id, 'property_masteritem_link', property_masteritem_link_id, 'INSERT', 'prop_master_id' );

                                                             query += " select '"+ property_masteritem_link_id +"' as prop_master_id, '"+ $scope.property_id +"' as property_id, '"+ master_items.data.rows.item(0).com_master_id +"' as com_master_id, 'DEFAULT' as type,'" + master_items.data.rows.item(0).type + "' as com_type,'" + master_items.data.rows.item(0).option + "' as option, '0' as self_prop_master_id, '"+ master_items.data.rows.item(0).item_name +"' as name, "+ master_items.data.rows.item(0).priority +" as priority, 0 as total_num, 1 as status ";

                                                              //for (var i = 0; i < master_items.data.rows.length; i++) {
                                                              for (var i = 1; i < master_items.data.rows.length; i++) {

                                                                /*data = [srvObjManipulation.generateUid(), $scope.property_id, master_items.data.rows.item(i).com_master_id, 'DEFAULT', 0, master_items.data.rows.item(i).item_name , master_items.data.rows.item(i).priority, 0, 1 ];

                                                                DatabaseSrv.executeQuery(query, data).then(function(master_items){
                                                                  $log.log('updating property master items!');
                                                                });*/

                                                                property_masteritem_link_id = srvObjManipulation.generateUid();
                                                                synSrv.update($scope.property_id, 'property_masteritem_link', property_masteritem_link_id, 'INSERT', 'prop_master_id' );

                                                                 query += " UNION ALL SELECT '"+ property_masteritem_link_id +"', '"+ $scope.property_id +"', '"+ master_items.data.rows.item(i).com_master_id +"', 'DEFAULT', '" + master_items.data.rows.item(i).type + "','" + master_items.data.rows.item(i).option + "', '0', '"+ master_items.data.rows.item(i).item_name +"', "+ master_items.data.rows.item(i).priority +", 0, 1 ";

                                                              }

                                                                DatabaseSrv.executeQuery(query, []).then(function(prop_subs){
                                                                  $log.log('updated once property master items!');

                                                                  //sub items import
                                                                    query = "select Company_subitem_link.* from Company_subitem_link where Company_subitem_link.status=1";

                                                                    DatabaseSrv.executeQuery(query, []).then(function(sub_items){

                                                                        if(sub_items.status == 1 && sub_items.data.rows.length > 0){


                                                                          //query = "INSERT INTO property_subitem_link (prop_subitem_id, property_id, com_subitem_id, priority, status) VALUES (?,?,?,?,?)";

                                                                          query = "INSERT INTO property_subitem_link (prop_subitem_id, property_id, com_subitem_id, item_name, type, priority, status) ";

                                                                          var property_subitem_link_id = srvObjManipulation.generateUid();
                                                                          synSrv.update($scope.property_id, 'property_subitem_link', property_subitem_link_id, 'INSERT', 'prop_subitem_id' );

                                                                          query += " select '" +  property_subitem_link_id + "' as prop_subitem_id, '" + $scope.property_id + "' as property_id, '"+ sub_items.data.rows.item(0).com_subitem_id +"' as com_subitem_id, '"+ sub_items.data.rows.item(0).item_name + "' as item_name,'" + sub_items.data.rows.item(0).type + "' as type," + sub_items.data.rows.item(0).priority +" as priority, 1 as status ";
                                                                          //query += " UNION ALL SELECT '" +  srvObjManipulation.generateUid() + "', '" + $scope.property_id + "', '"+ sub_items.data.rows.item(0).com_subitem_id +"', "+ sub_items.data.rows.item(0).priority +", 1 " ;

                                                                          //for (var i = 0; i < sub_items.data.rows.length; i++) {
                                                                          for (var i = 1; i < sub_items.data.rows.length; i++) {

                                                                            /*data = [srvObjManipulation.generateUid(), $scope.property_id, sub_items.data.rows.item(i).com_subitem_id, sub_items.data.rows.item(i).priority, 1 ];

                                                                            DatabaseSrv.executeQuery(query, data).then(function(prop_subs){
                                                                              $log.log('updating property sub items!');
                                                                            });*/

                                                                            property_subitem_link_id = srvObjManipulation.generateUid();
                                                                            synSrv.update($scope.property_id, 'property_subitem_link', property_subitem_link_id, 'INSERT', 'prop_subitem_id' );

                                                                            query += " UNION ALL SELECT '" +  property_subitem_link_id + "', '" + $scope.property_id + "', '"+ sub_items.data.rows.item(i).com_subitem_id +"', '"+  sub_items.data.rows.item(i).item_name + "','" + sub_items.data.rows.item(i).type + "'," + sub_items.data.rows.item(i).priority +", 1 ";

                                                                          }


                                                                          DatabaseSrv.executeQuery(query, []).then(function(prop_subs){
                                                                              $log.log('updated once property sub items!');
                                                                              $ionicLoading.hide();
                                                                               genericModalService.showToast('Please add rooms for this property!', 'LCenter');

                                                                              $timeout(function(){
                                                                                $state.go('app.property', {property_id : $scope.property_id });
                                                                              });

                                                                            });


                                                                         // $timeout(function(){
                                                                            //we got property id , upload image to server
                                                                            //$state.go('app.property', {property_id : $scope.property_id });
                                                                         // }, 300);



                                                                        }
                                                                        else{
                                                                          $log.log('Could not load sub items !');
                                                                        }

                                                                    });



                                                                });

                                                            }
                                                            else{
                                                              $log.log('Could not load master items !');
                                                            }

                                                        });




                                                  //----------------------------------------------------------------------------------------------------------------------------------

                                                });



                                              }
                                              else{
                                                $log.log('Could not load general condition !');
                                              }

                                          });




                                      });



                                    }
                                    else{
                                      $log.log('Could not load company meter!');
                                    }

                                });

                                //------------------------------------------------------------------



                                /*var alertPopup = $ionicPopup.alert({
                                  title: 'Saved!',
                                  template: 'Successfully Saved!'
                                });*/



                            }


                          });


                      }



                    }

                  });

              });


            }
            else{

              $scope.data.property_id = $scope.property_id;


              $log.log('updating');

              //commonSrv.postData('property/edit', $scope.data).then(function(result) {

              DatabaseSrv.initLocalDB().then(function(initdb){


                var query = "UPDATE property_info SET address_1=?, address_2=?, city=?, postalcode=?, report_type=?, report_date=?, image_url=? WHERE property_id=?";
                var data = [$scope.data.address_1, $scope.data.address_2, $scope.data.city, $scope.data.postalcode, $scope.data.report_type, new Date($scope.data.report_date).toLocaleDateString("en-UK"), $scope.data.image_url, $scope.property_id ];

                $log.log('image urkl test');
                $log.log(data);

                  DatabaseSrv.executeQuery(query, data ).then(function(prop_info_result){

                    if(prop_info_result.status ==  1){

                      synSrv.update($scope.property_id, 'property_info', $scope.property_id, 'UPDATE', 'property_id' );

                      /*var alertPopup = $ionicPopup.alert({
                        title: 'Saved!',
                        template: 'Successfully Saved!'
                      });*/

                      genericModalService.showToast('Successfully Saved!', 'LCenter');

                    }

                  });

              });

            }



      }
      else{
        var alertPopup = $ionicPopup.alert({
                title: 'Address empty!',
                template: 'Please provide address!'
        });
      }

    }
    else{

      var alertPopup = $ionicPopup.alert({
          title: 'Address empty!',
          template: 'Please provide address!'
        });

    }


     // Destination URL
     /*var url = PGAppConfig.apiEndPoint +  'property/uploadlogo';

     //File for Upload
     var targetPath =  $scope.data['reportImage'];

     // File name only
     var filename = targetPath.split("/").pop();

     $log.log(filename);

     var options = {
          fileKey: "file",
          fileName: filename,
          chunkedMode: false,
          mimeType: "image/jpg",
          params : {'directory':'upload', 'fileName':filename}
      };

      targetPath =  '../img/ionic.png';
      $cordovaFileTransfer.upload(url, targetPath, options).then(function (result) {
          console.log("SUCCESS: " + JSON.stringify(result.response));
      }, function (err) {
          console.log("ERROR: " + JSON.stringify(err));
      }, function (progress) {
          // PROGRESS HANDLING GOES HERE
      });*/

      //$state.go('app.newProperty');
  };



});


//-------------------------- this is to load property template --------------------------------------
appCtrl.controller('PropCtrl', function($scope, $state, $stateParams, commonSrv, $log, $ionicPopup, $ionicHistory, DatabaseSrv, srvObjManipulation, $timeout, genericModalService, synSrv){

  $scope.property_id = 0;
  $scope.template = [];
  $scope.data = {};

  $scope.options = [];
  $scope.nums = [];


  $scope.$on('$ionicView.beforeEnter', function() {

    $log.log('property id ', $stateParams.property_id);

    $scope.property_id = $stateParams.property_id;

    initLoadData();

   // $ionicHistory.clearHistory(); // clear history
  });


  // go back to listing screen
  $scope.goBack = function(){

      $state.go('app.inspections');
  }


  function initLoadData(){

    if($scope.property_id){

      /*var data = {
        property_id:  $scope.property_id
      };*/

      //commonSrv.postData('property/getTemplate', data).then(function(result){

        DatabaseSrv.initLocalDB().then(function(initdb){


          var query = "select property_masteritem_link.* from property_masteritem_link where property_masteritem_link.type='DEFAULT' and property_masteritem_link.status=1 and property_masteritem_link.property_id =? order by property_masteritem_link.com_master_id, property_masteritem_link.option ";
          //var query = "select property_masteritem_link.* from property_masteritem_link ";
          var data = [$scope.property_id];

          DatabaseSrv.executeQuery(query, data ).then(function(result){

            $log.log('result');


            $scope.template = result.data;

            if(result.status == 1 && $scope.template.rows.length > 0){

             // sub_items.data.rows.item(i).com_subitem_id

              for (var i=0, l=$scope.template.rows.length; i < l; i++) {

                $log.log($scope.template.rows.item(i));

                if( $scope.template.rows.item(i).option == 'OPT'){
                  $scope.options.push({name: $scope.template.rows.item(i).name, prop_master_id: $scope.template.rows.item(i).prop_master_id, status: $scope.setToggle($scope.template.rows.item(i).status), priority: $scope.template.rows.item(i).priority, com_master_id:  $scope.template.rows.item(i).com_master_id });
                }
                else if($scope.template.rows.item(i).option == 'NUM' ){
                  $scope.nums.push({name: $scope.template.rows.item(i).name, prop_master_id: $scope.template.rows.item(i).prop_master_id, total_num: $scope.template.rows.item(i).total_num, priority: $scope.template.rows.item(i).priority, com_master_id:  $scope.template.rows.item(i).com_master_id })
                }

              }

            }

          });

        });

    }

  };


  $scope.setToggle = function(value){

    if(value == 1)
      return true;
    else
      return false;
  };

  //toggle change
  $scope.toggleChange = function(){

    console.log($scope.options);
    /*console.log(value);

    $scope.data[model] = value;*/

  };

  //set data
  $scope.setData = function(model, value){

      console.log(model);
      console.log(value);
      $scope.data[model] = value;
  };


  $scope.addRoom = function(item){

    item.total_num = Number(item.total_num) + 1;
  };


  $scope.deductRoom = function(item){

    item.total_num = Number(item.total_num) - 1;

    if( item.total_num < 0){
      item.total_num = 0;
    }
  };


  //save
  $scope.save = function(){


    /*var data = {
      property_id: $scope.property_id,
      nums: $scope.nums,
      options: $scope.options
    };*/

    //$log.log($scope.nums);

    //commonSrv.postData('property/saveTemplate', data).then(function(result){





      DatabaseSrv.initLocalDB().then(function(initdb){

           if($scope.nums){

            for(var i=0, l = $scope.nums.length; i < l ; i++){

              var query = "UPDATE Property_masteritem_link SET total_num=? WHERE prop_master_id=?";
              var data = [$scope.nums[i].total_num, $scope.nums[i].prop_master_id ];

              var params = {
                total_num:  $scope.nums[i].total_num,
                com_master_id: $scope.nums[i].com_master_id,
                prop_master_id: $scope.nums[i].prop_master_id
              };

              DatabaseSrv.executeQuery(query, data, params ).then(function(com_sub){

                if(com_sub.status ==  1){

                  synSrv.update($scope.property_id, 'Property_masteritem_link', com_sub.params.com_master_id, 'UPDATE', 'prop_master_id' );

                  query = "select Company_masteritem_link.* from Company_masteritem_link where Company_masteritem_link.com_master_id=?";

                  $log.log(i +' - ', com_sub.params.com_master_id);

                  data = [com_sub.params.com_master_id];

                  var xparams = com_sub.params;

                  DatabaseSrv.executeQuery(query, data, xparams ).then(function(com_master_item){

                    if(com_master_item.status == 1 && com_master_item.data.rows.length > 0){

                      if(com_master_item.params.total_num > 0){

                        query = "INSERT INTO property_masteritem_link (prop_master_id, property_id, com_master_id, type, com_type, option, self_prop_master_id, name,  priority, total_num, status) ";

                        var property_masteritem_link_id = srvObjManipulation.generateUid();

                        query += " select '"+ property_masteritem_link_id +  "' as prop_master_id, '" +  $scope.property_id +  "' as property_id, " + com_master_item.params.com_master_id +  " as com_master_id, 'SELF' as type, '" +  com_master_item.data.rows.item(0).type + "' as com_type,'" +  com_master_item.data.rows.item(0).option + "' as option, '" + com_master_item.params.prop_master_id + "' as self_prop_master_id, '" + com_master_item.data.rows.item(0).item_name + ' ' + (1).toString() + "' as name, 1 as priority, 0 as total_num, 1 as status ";

                        synSrv.update($scope.property_id, 'property_masteritem_link', property_masteritem_link_id, 'INSERT', 'prop_master_id' );

                        //for(var j=1; j <= com_master_item.params.total_num; j++){
                        for(var j=2; j <= com_master_item.params.total_num; j++){

                         // query = "INSERT INTO property_masteritem_link (prop_master_id, property_id, com_master_id, type, self_prop_master_id, name, priority, total_num, status) VALUES (?,?,?,?,?,?,?,?,?)";

                          /*data = [srvObjManipulation.generateUid(), $scope.property_id, com_master_item.params.com_master_id, 'SELF', com_master_item.params.prop_master_id, com_master_item.data.rows.item(0).item_name + ' ' + (j).toString(), 1, 0, 1 ];

                          DatabaseSrv.executeQuery(query, data).then(function(master_items){
                            $log.log('inserting self property master items!');
                          });*/

                          property_masteritem_link_id = srvObjManipulation.generateUid();
                          synSrv.update($scope.property_id, 'property_masteritem_link', property_masteritem_link_id, 'INSERT', 'prop_master_id' );

                           query += " UNION ALL SELECT '" + property_masteritem_link_id + "','"+ $scope.property_id + "',"+  com_master_item.params.com_master_id + ",'SELF','"+  com_master_item.data.rows.item(0).type + "','"+ com_master_item.data.rows.item(0).option + "','" + com_master_item.params.prop_master_id + "','" + com_master_item.data.rows.item(0).item_name + ' ' + (j).toString() + "', 1, 0, 1 "

                        }

                        DatabaseSrv.executeQuery(query, []).then(function(master_items){
                          $log.log('inserting self property master items!');

                        });




                      }


                    }

                  });


                }

              });


            }

          }


          if($scope.options){

            for(var i=0, l = $scope.options.length; i < l ; i++){

              var query = "UPDATE Property_masteritem_link SET status=? WHERE prop_master_id=?";
              var status = $scope.options[i].status == true? 1: 0;
              var data = [status, $scope.options[i].prop_master_id ];

              var params =  {
                prop_master_id : $scope.options[i].prop_master_id
              }

              DatabaseSrv.executeQuery(query, data, params).then(function(com_sub){

                if(com_sub.status ==  1){

                  synSrv.update($scope.property_id, 'Property_masteritem_link', com_sub.params.prop_master_id , 'UPDATE', 'prop_master_id' );

                  $log.log('updated opt ');
                }

              });


            }

          }



          $timeout(function(){
              //we got property id , upload image to server
              /*var alertPopup = $ionicPopup.alert({
                title: 'Saved!',
                template: 'Successfully Saved!'
              });*/

              genericModalService.showToast('Successfully Saved!', 'LCenter');

              $state.go('app.inspections');

          }, 600);

      });




      /*if(result.status == 1){

         var alertPopup = $ionicPopup.alert({
                title: 'Saved!',
                template: 'Successfully Saved!'
              });

         $state.go('app.inspections');

      }
      else{
         var alertPopup = $ionicPopup.alert({
                title: 'Error!',
                template: 'Something went wrong!'
              });
      }*/

    //});



  };


});



//--------------------------property room list ---------------------------------------------
appCtrl.controller('ProplistCtrl', function($scope, $state, $stateParams, commonSrv, $log, $ionicPopup, $cordovaKeyboard, DatabaseSrv, genericModalService, $timeout, roomObj, PropInfoSrv, synSrv){

  $scope.property_id = 0;
  $scope.items = [];
  $scope.data = { };
  $scope.breadcums = [];

  $scope.$on('$ionicView.beforeEnter', function() {

    $scope.items = [];
    $scope.data = { };
    $scope.breadcums = [];

    $scope.property_id = $stateParams.property_id;

    initLoadData();


    $scope.property_id = $stateParams.property_id;

    //getting property info for breadcums
        PropInfoSrv.getPropInfo($scope.property_id).then(function(propinfo){

          if(propinfo.hasOwnProperty('status')){
            if(propinfo.status == 1){
              var address = (propinfo.data.address_1.length > 9) ? propinfo.data.address_1.substring(0, 9) + '...' : propinfo.data.address_1;
              $scope.breadcums.push(address);
              $scope.breadcums.push('Room list');
            }
          }

        });

  });

  (function init(){

  })();

  function initLoadData(){

      if($scope.property_id){

        var data = {
          property_id:  $scope.property_id
        };





        DatabaseSrv.initLocalDB().then(function(initdb){

          var query = "select property_masteritem_link.*,  property_masteritem_link.com_type as template_type from property_masteritem_link where NOT(property_masteritem_link.option ='NUM' and property_masteritem_link.type ='DEFAULT') and property_masteritem_link.property_id =? and property_masteritem_link.status = 1 order by property_masteritem_link.priority, property_masteritem_link.prop_master_id, property_masteritem_link.option,  property_masteritem_link.name";

          var data = [$scope.property_id];

          DatabaseSrv.executeQuery(query, data ).then(function(result){

            console.log('item length', result.data.rows.length);
              if(result.data.rows.length > 0) {

                 for (var i = 0; i < result.data.rows.length; i++) {
                  var item = result.data.rows.item(i);

                  console.log('item ', item);
                  $scope.items.push(item);
                }

                //$scope.items = result.data;

              }


          });

      });


        //commonSrv.postData('property/getRoomlist', data).then(function(result){

          //$log.log(result);

        //  $scope.items = result.template;


       // });

      }

  };

   $scope.moveItem = function(item, fromIndex, toIndex) {

    fromIndex -= 2;
    toIndex -= 2;

      $scope.items.splice(fromIndex, 1);
      $scope.items.splice(toIndex, 0, item);


      $log.log($scope.items);



    };


  $scope.$on('$ionicView.beforeLeave', function() {
    try{
        if( $cordovaKeyboard.isVisible() == true){
          $cordovaKeyboard.close();
        }
      }
      catch(e) {
        $log.error(e);
      }
  });


  //open links
  $scope.openLink = function(item){

    if(item.template_type == 'METER'){
      $state.go('app.meterlist', {property_id:  $scope.property_id });
    }
    else if(item.template_type == 'SUB' ){

      roomObj.setData({roomObj: item });

      $state.go('app.subitemslist', {property_id:  $scope.property_id, master_id: item.prop_master_id });
    }
    else if(item.template_type == 'ITEM' ){
       $state.go('app.addSubDetails', {sub_id: item.prop_master_id, type: 'ITEM', property_id: $scope.property_id  });
    }

  };


  $scope.syncProperty = function(){


    synSrv.synProperty($scope.property_id );

  };


});


//--------------------------property list sorting list ---------------------------------------------
appCtrl.controller('PropertyListSortCtrl', function($scope, $state, $stateParams, commonSrv, $log, $ionicPopup, DatabaseSrv, $timeout, genericModalService, synSrv){

  $scope.property_id = 0;
  $scope.items = [];
  $scope.data = { };


  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.items = [];
    $scope.data = { };

    $scope.data.showReorder = true;

    $scope.property_id = $stateParams.property_id;

    initLoadData();

  });

  (function init(){

  })();

  function initLoadData(){

      if($scope.property_id){

        var data = {
          property_id:  $scope.property_id
        };




        DatabaseSrv.initLocalDB().then(function(initdb){

          var query = "select property_masteritem_link.*, property_masteritem_link.com_type as template_type from property_masteritem_link where NOT(property_masteritem_link.option ='NUM' and property_masteritem_link.type ='DEFAULT') and property_masteritem_link.property_id =? and property_masteritem_link.status = 1 order by property_masteritem_link.priority, property_masteritem_link.prop_master_id, property_masteritem_link.option,  property_masteritem_link.name";

          var data = [$scope.property_id];

          DatabaseSrv.executeQuery(query, data ).then(function(result){

            console.log('item length', result.data.rows.length);
              if(result.data.rows.length > 0) {

                 for (var i = 0; i < result.data.rows.length; i++) {
                  var item = result.data.rows.item(i);

                  console.log('item ', item);
                  $scope.items.push(item);
                }

                //$scope.items = result.data;

              }


          });

      });
      }

  };

  $scope.moveItem = function(item, fromIndex, toIndex) {
    $scope.items.splice(fromIndex, 1);
    $scope.items.splice(toIndex, 0, item);

  };


  $scope.save  = function() {
    $log.log($scope.items);


      DatabaseSrv.initLocalDB().then(function(initdb){

        for (var i = 0, l = $scope.items.length; i < l; i++) {

            var query = "UPDATE property_masteritem_link SET priority=? WHERE prop_master_id=?";
            var data = [(i+1) , $scope.items[i].prop_master_id ];
            var params =  {
              prop_master_id : $scope.items[i].prop_master_id
            };

              DatabaseSrv.executeQuery(query, data, params ).then(function(result){

                  if(result.status == 1){

                    synSrv.update($scope.property_id, 'property_masteritem_link', result.params.prop_master_id , 'UPDATE', 'prop_master_id' );

                    $log.log('prop sort saved!');
                  }
                  else{
                      $log.log('prop sorting save error!');
                  }

              });

          }

          $timeout(function(){

                 /* var alertPopup = $ionicPopup.alert({
                        title: 'Saved!',
                        template: 'Successfully Saved!'
                      });*/

            genericModalService.showToast('Successfully Saved!', 'LCenter');

          }, 300);


      });


  }



});


//--------------------------general condition list ---------------------------------------------
appCtrl.controller('GeneralConditionCtrl', function($scope, $state, $stateParams, commonSrv, $log, $ionicPopup, myModals, DatabaseSrv, $timeout, genericModalService, PropInfoSrv, synSrv){

  $scope.property_id = 0;
  $scope.items = [];
  $scope.data = {};
  $scope.breadcums = [];

  $scope.$on('$ionicView.beforeEnter', function() {

    $scope.items = [];
    $scope.data = {};
    $scope.breadcums = [];

     $scope.property_id = $stateParams.property_id;

    initLoadData();



    $scope.property_id = $stateParams.property_id;

    //getting property info for breadcums
    PropInfoSrv.getPropInfo($scope.property_id).then(function(propinfo){

      if(propinfo.hasOwnProperty('status')){
        if(propinfo.status == 1){
          var address = (propinfo.data.address_1.length > 9) ? propinfo.data.address_1.substring(0, 9) + '...' : propinfo.data.address_1;
          $scope.breadcums.push(address);
          $scope.breadcums.push('Room list');
          $scope.breadcums.push('General condition');
        }
      }

    });

  });

  (function init(){


  })();

  function initLoadData(){

      if($scope.property_id){

        var data = {
          property_id:  $scope.property_id
        };

        /*commonSrv.postData('property/getConditions', data).then(function(result){

          $log.log(result);
          $scope.items = result.conditions;

        });*/



        DatabaseSrv.initLocalDB().then(function(initdb){

          var query = "select property_general_condition_link.* from property_general_condition_link where property_general_condition_link.status=1 and property_general_condition_link.property_id=? order by property_general_condition_link.priority";

          var data = [$scope.property_id];

          DatabaseSrv.executeQuery(query, data ).then(function(result){

            console.log('item length', result.data.rows.length);
              if(result.data.rows.length > 0) {

                 for (var i = 0; i < result.data.rows.length; i++) {
                  var item = result.data.rows.item(i);

                  console.log('item ', item);
                  $scope.items.push(item);
                }

                //$scope.items = result.data;

              }


          });

      });



      }

  };

  $scope.splitArray = function(str) {
    //console.log(str.split(';') );
     return str.split(';');
  }


  $scope.openComment = function(general_id , comment){

    myModals.gCommentBox({state: 'generalCondition', general_id: general_id, property_id: $scope.property_id });

  };

  //save options
  $scope.save = function(){

    DatabaseSrv.initLocalDB().then(function(initdb){

    for (var i = 0, l = $scope.items.length; i < l; i++) {
      //$log.log($scope.items[i].user_input);

      //$log.log($scope.items[i].prop_general_id);

        var query = "UPDATE Property_general_condition_link SET user_input=? WHERE prop_general_id=?";
        var data = [$scope.items[i].user_input , $scope.items[i].prop_general_id ];
        var params = {
          prop_general_id: $scope.items[i].prop_general_id
        };
          DatabaseSrv.executeQuery(query, data, params ).then(function(result){

              if(result.status == 1){

                synSrv.update($scope.property_id, 'Property_general_condition_link', result.params.prop_general_id , 'UPDATE', 'prop_general_id' );

                $log.log('condition saved!');
              }
              else{
                  $log.log('condition save error!');
              }

          });

      }

      $timeout(function(){

             /* var alertPopup = $ionicPopup.alert({
                    title: 'Saved!',
                    template: 'Successfully Saved!'
                  });*/

           genericModalService.showToast('Successfully Saved!', 'LCenter');

      }, 300);




    });

  };

});

//--------------------------general condition comment ---------------------------------------------
appCtrl.controller('GCommentCtrl', function($scope, $state, $stateParams, parameters, commonSrv, $log, $ionicPopup, DatabaseSrv, genericModalService, synSrv){

  $scope.general_condition_id = 0;
  $scope.property_id = '';
  $scope.data = {};

  //init function
  var init = (function(){

    $scope.general_condition_id = parameters.general_id;
    $scope.property_id = parameters.property_id;

    //$scope.data.comment = parameters.comment;

    if($scope.general_condition_id ){

     var data = {
          condition_id:  $scope.general_condition_id
        };



        DatabaseSrv.initLocalDB().then(function(initdb){

          var query = "select Property_general_condition_link.* from Property_general_condition_link where Property_general_condition_link.prop_general_id=?";

          var data = [$scope.general_condition_id];

          DatabaseSrv.executeQuery(query, data ).then(function(result){

            console.log('item length', result.data.rows.length);
              if(result.data.rows.length > 0) {

                  $scope.data.comment = result.data.rows.item(0).comment;


                //$scope.items = result.data;

              }


          });

      });



      /*commonSrv.postData('property/getConditionComment', data).then(function(result){

        $log.log(result);
        if(result.status == 1){
          $scope.data.comment = result.general_condition.comment;
        }

      });*/

    }


  })();


  $scope.saveComment = function(){

      if($scope.general_condition_id){

        /*var data = {
          condition_id: $scope.general_condition_id,
          comment:  $scope.data.comment
        };*/


      DatabaseSrv.initLocalDB().then(function(initdb){

        var query = "UPDATE Property_general_condition_link SET comment=? WHERE prop_general_id=?";
        var data = [$scope.data.comment, $scope.general_condition_id ];

          DatabaseSrv.executeQuery(query, data ).then(function(result){

              if(result.status == 1){

                  /*var alertPopup = $ionicPopup.alert({
                    title: 'Saved!',
                    template: 'Successfully Saved!'
                  });*/

                  synSrv.update($scope.property_id, 'Property_general_condition_link', $scope.general_condition_id , 'UPDATE', 'prop_general_id' );

                   genericModalService.showToast('Successfully Saved!', 'LCenter');

                  $scope.closeModal(null);


              }
              else{

                  /*var alertPopup = $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Something went wrong!'
                  });*/

                   genericModalService.showToast('Something went wrong!', 'LCenter');

              }

          });

      });


        /*commonSrv.postData('property/addConditionComment', data).then(function(result){

          $log.log(result);

          if(result.status == 1){

             var alertPopup = $ionicPopup.alert({
                    title: 'Saved!',
                    template: 'Successfully Saved!'
                  });

              $scope.closeModal(null);

          }
          else{
             var alertPopup = $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Something went wrong!'
                  });
          }

        });*/

      }

  };

  $scope.onClose = function(){
    $scope.closeModal(null);
  }


});


//--------------------------general condition sorting list ---------------------------------------------
appCtrl.controller('GeneralConditionSortCtrl', function($scope, $state, $stateParams, commonSrv, $log, $ionicPopup, DatabaseSrv, $timeout, genericModalService, synSrv){

  $scope.property_id = 0;
  $scope.items = [];
  $scope.data = {};


  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.items = [];
    $scope.data = {};
    $scope.data.showReorder = true;

    $scope.property_id = $stateParams.property_id;

    initLoadData();

  });

  (function init(){

  })();

  function initLoadData(){

      if($scope.property_id){

        /*var data = {
          property_id:  $scope.property_id
        };

        commonSrv.postData('property/getConditions', data).then(function(result){

          $log.log(result);
          $scope.items = result.conditions;

        });*/

        DatabaseSrv.initLocalDB().then(function(initdb){

          var query = "select property_general_condition_link.* from property_general_condition_link where property_general_condition_link.status=1 and property_general_condition_link.property_id=? order by property_general_condition_link.priority";

          var data = [$scope.property_id];

          DatabaseSrv.executeQuery(query, data ).then(function(result){

            console.log('item length', result.data.rows.length);
              if(result.data.rows.length > 0) {

                 for (var i = 0; i < result.data.rows.length; i++) {
                  var item = result.data.rows.item(i);

                  console.log('item ', item);
                  $scope.items.push(item);
                }

                //$scope.items = result.data;

              }


          });

        });

      }

  };

  $scope.moveItem = function(item, fromIndex, toIndex) {
    $scope.items.splice(fromIndex, 1);
    $scope.items.splice(toIndex, 0, item);

  };


  $scope.save  = function() {
    $log.log($scope.items);


    DatabaseSrv.initLocalDB().then(function(initdb){

      for (var i = 0, l = $scope.items.length; i < l; i++) {

          var query = "UPDATE Property_general_condition_link SET priority=? WHERE prop_general_id=?";
          var data = [(i+1) , $scope.items[i].prop_general_id ];

          var params = {
            prop_general_id: $scope.items[i].prop_general_id
          };

            DatabaseSrv.executeQuery(query, data, params).then(function(result){

                if(result.status == 1){

                  synSrv.update($scope.property_id, 'Property_general_condition_link', result.params.prop_general_id , 'UPDATE', 'prop_general_id' );

                  $log.log('condition sort saved!');
                }
                else{
                    $log.log('condition sorting save error!');
                }

            });

        }

        $timeout(function(){

               /* var alertPopup = $ionicPopup.alert({
                      title: 'Saved!',
                      template: 'Successfully Saved!'
                    });*/

                    genericModalService.showToast('Successfully Saved!', 'LCenter');

        }, 300);


    });


  }



});


//--------------------------MeterListCtrl list ---------------------------------------------
appCtrl.controller('MeterListCtrl', function($scope, $state, $stateParams, commonSrv, $log, $ionicPopup,DatabaseSrv, PropInfoSrv, synSrv){

  $scope.property_id = 0;
  $scope.items = [];
  $scope.data = {};
  $scope.breadcums = [];


  $scope.$on('$ionicView.beforeEnter', function() {

    $scope.items = [];
    $scope.data = {};
    $scope.breadcums = [];

    $scope.property_id = $stateParams.property_id;

    initLoadData();


    //getting property info for breadcums
    PropInfoSrv.getPropInfo($scope.property_id).then(function(propinfo){

      if(propinfo.hasOwnProperty('status')){
        if(propinfo.status == 1){
          var address = (propinfo.data.address_1.length > 9) ? propinfo.data.address_1.substring(0, 9) + '...' : propinfo.data.address_1;
          $scope.breadcums.push(address);
          $scope.breadcums.push('Room list');
          $scope.breadcums.push('Meter list');
        }
      }

    });


  });

  (function init(){

  })();

  function initLoadData(){

      if($scope.property_id){


        DatabaseSrv.initLocalDB().then(function(initdb){

          var query = "select property_meter_link.* from property_meter_link where property_meter_link.status=1 and property_meter_link.property_id =?";

          var data = [$scope.property_id];

          DatabaseSrv.executeQuery(query, data ).then(function(result){

            console.log('item length', result.data.rows.length);
              if(result.data.rows.length > 0) {

                for (var i = 0; i < result.data.rows.length; i++) {
                  var item = result.data.rows.item(i);

                  console.log('item ', item);
                  $scope.items.push(item);
                }

                //$scope.items = result.data;

              }


          });

        });


        /*var data = {
          property_id:  $scope.property_id
        };

        commonSrv.postData('property/getMeterList', data).then(function(result){

          $log.log(result);
          if(result.status == 1){
            $scope.items = result.meter_list;
          }


        });*/

      }

  };

  $scope.reset = function (argument) {
     DatabaseSrv.setCompanyTemplate();
  }


});


//--------------------------sub items list ---------------------------------------------
appCtrl.controller('SubItemsListCtrl', function($scope, $state, $stateParams, commonSrv, $log, $ionicPopup, DatabaseSrv, $ionicPopup, roomObj, myModals, genericModalService, PropInfoSrv, $cordovaCamera, srvObjManipulation, synSrv){

  $scope.property_id = 0;
  $scope.prop_master_id = 0;
  $scope.items = [];
  $scope.data = {};
  $scope.room = {};

  $scope.input = {};
  $scope.input.roomname = '';
  $scope.showButton = true;

  $scope.data.viewName = "Sub items list";
  $scope.breadcums = [];

   var options = {
        quality: 75,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: false,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 800,
        targetHeight: 800,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false,
        correctOrientation:true
      };


  $scope.$on('$ionicView.beforeEnter', function() {

    $scope.items = [];
    $scope.data = {};
    $scope.breadcums = [];

    $scope.data.viewName =  'Sub items list';


    $scope.property_id = $stateParams.property_id;
    $scope.prop_master_id = $stateParams.master_id;


    $scope.room  =  roomObj.getData().roomObj;

    $scope.showButton = ($scope.room.type == 'SELF')? true: false;

    $log.log('room obj ', $scope.room);

    initLoadData();

  });

  (function init(){

  })();

  function initLoadData(){

      if($scope.property_id != 0  || $scope.prop_master_id != 0 ){

       /* var data = {
          property_id:  $scope.property_id,
          prop_master_id:  $scope.prop_master_id
        };*/

        /*commonSrv.postData('property/getSubItemsList', data).then(function(result){

          $log.log(result);
          if(result.status == 1){
            $scope.items = result.sub_items;
          }


        });*/


        DatabaseSrv.initLocalDB().then(function(initdb){

          var query = "select property_subitem_link.*, property_masteritem_link.prop_master_id, property_masteritem_link.name as master_item_name, company_subitem_link.com_master_id, (select count(photos.photo_id) from photos where photos.item_id = property_subitem_link.prop_subitem_id and photos.parent_id= property_masteritem_link.prop_master_id  ) as image_count from property_subitem_link inner join company_subitem_link on property_subitem_link.com_subitem_id = company_subitem_link.com_subitem_id inner JOIN property_masteritem_link on company_subitem_link.com_master_id = property_masteritem_link.com_master_id where property_subitem_link.status =1 and property_masteritem_link.prop_master_id =? and property_subitem_link.property_id=? order by property_subitem_link.type";

          var data = [$scope.prop_master_id, $scope.property_id];

          var general_sub_item_id = '';

          DatabaseSrv.executeQuery(query, data ).then(function(result){

            console.log('item length', result.data.rows.length);
              if(result.data.rows.length > 0) {

                for (var i = 0; i < result.data.rows.length; i++) {
                  var item = result.data.rows.item(i);

                  console.log('item ', item);
                  $scope.items.push(item);
                  //$scope.data.photos = item.image_count;

                  if(item.type =='GENERAL' ){
                    general_sub_item_id= item.prop_subitem_id;
                  }

                }

                 $scope.data.viewName =  result.data.rows.item(0).master_item_name ;
                  //getting property info for breadcums
                  PropInfoSrv.getPropInfo($scope.property_id).then(function(propinfo){

                    if(propinfo.hasOwnProperty('status')){
                      if(propinfo.status == 1){
                        var address = (propinfo.data.address_1.length > 9) ? propinfo.data.address_1.substring(0, 9) + '...' : propinfo.data.address_1;
                        $scope.breadcums.push(address);
                        $scope.breadcums.push('Room list');
                        $scope.breadcums.push( $scope.data.viewName);

                      }
                    }

                  });


                   //-----------------------------------------------------------------------
                    query = "select count(photos.photo_id) as image_count from photos where photos.item_id =? and photos.parent_id=? and photos.type='GENERAL' ";
                    data = [general_sub_item_id, $scope.prop_master_id];
                    DatabaseSrv.executeQuery(query, data ).then(function(result){
                      console.log('item length', result.data.rows.length);
                        if(result.data.rows.length > 0) {
                            $scope.data.image_count = result.data.rows.item(0).image_count;
                        }
                    });

                    //----------------------------------------------------------------------
                    query = "select property_sub_feedback_general.* from property_sub_feedback_general where property_sub_feedback_general.item_id=? and property_sub_feedback_general.parent_id=?";
                    data = [general_sub_item_id, $scope.prop_master_id];
                    DatabaseSrv.executeQuery(query, data ).then(function(result){
                      console.log('item length', result.data.rows.length);
                        if(result.data.rows.length > 0) {
                            $scope.data.comment_length = result.data.rows.item(0).comment.trim().length;
                        }
                    });

                    //----------------------------------------------------------------------
                    query = "select count(property_sub_voice_general.prop_sub_feedback_general_id) as voice_count from property_sub_voice_general where property_sub_voice_general.item_id =? and property_sub_voice_general.parent_id=?";
                    data = [general_sub_item_id, $scope.prop_master_id];
                    DatabaseSrv.executeQuery(query, data ).then(function(result){
                        if(result.data.rows.length > 0) {
                           $scope.data.voice_count = result.data.rows.item(0).voice_count;
                        }
                    });



              }


          });



        });



      }

  };


  //general camera function
  $scope.generalCamera = function(prop_subitem_id){
    $state.go('app.generalPhotos', {prop_subitem_id: prop_subitem_id, property_id: $scope.property_id, prop_master_id: $scope.prop_master_id})
  };

  $scope.generalComment = function(prop_subitem_id){

    myModals.subCommentBox({ prop_subitem_id: prop_subitem_id, property_id: $scope.property_id, prop_master_id: $scope.prop_master_id });

  };

  $scope.generalVoiceRecorder = function(prop_subitem_id){

    $state.go('app.recordSound', {prop_subitem_id: prop_subitem_id, property_id: $scope.property_id, prop_master_id: $scope.prop_master_id});
  };

  $scope.rename = function(){

    $scope.input.roomname = $scope.room.name;

    var myPopup = $ionicPopup.show({
          template: '<input type="text" ng-model="input.roomname" style="border-bottom: 1px solid #009AF2;">',
          title: 'Rename',
          subTitle: 'Rename this room',
          scope: $scope,
          buttons: [
            { text: 'No',
              type: 'button-positive' },
            {
              text: '<b>Yes</b>',
              type: 'button-positive',
              onTap: function(e) {
                if (!$scope.input.roomname) {
                  //don't allow the user to close unless he enters wifi password
                  e.preventDefault();
                }
                else{
                  return $scope.input.roomname;
                }
              }
            }
          ]
        });


    myPopup.then(function(res){

      if(res){
        $log.log(res);

        DatabaseSrv.initLocalDB().then(function(initdb){

          var query = "UPDATE property_masteritem_link SET name=? WHERE prop_master_id=?";
          var data = [res, $scope.prop_master_id ];

          DatabaseSrv.executeQuery(query, data ).then(function(result){

              if(result.status == 1){

                  synSrv.update($scope.property_id, 'property_masteritem_link', $scope.prop_master_id , 'INSERT', 'prop_master_id' );

                 /* var alertPopup = $ionicPopup.alert({
                    title: 'Saved!',
                    template: 'Successfully Saved!'
                  });*/

                  genericModalService.showToast('Successfully Saved!', 'LCenter');


              }
              else{

                 /* var alertPopup = $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Something went wrong!'
                  });*/

                  genericModalService.showToast('Something went wrong!', 'LCenter');

              }

          });

        });


      }

    });

  }

  //copy
  $scope.copy = function(){

    $scope.input.roomname = $scope.room.name + ' copy';

    var myPopup = $ionicPopup.show({
          template: '<input type="text" ng-model="input.roomname" style="border-bottom: 1px solid #009AF2;">',
          title: 'Copy',
          subTitle: 'Copy this room',
          scope: $scope,
          buttons: [
            { text: 'No',
              type: 'button-positive' },
            {
              text: '<b>Yes</b>',
              type: 'button-positive',
              onTap: function(e) {
                if (!$scope.input.roomname) {
                  //don't allow the user to close unless he enters wifi password
                  e.preventDefault();
                }
                else{
                  return $scope.input.roomname;
                }
              }
            }
          ]
        });


    myPopup.then(function(res){

      if(res){
        $log.log(res);

        DatabaseSrv.initLocalDB().then(function(initdb){

                    //master items import
                    var property_masteritem_link_id = srvObjManipulation.generateUid();

                    var query = "INSERT INTO property_masteritem_link (prop_master_id, property_id, com_master_id, type, com_type, option, self_prop_master_id, name,  priority, total_num, status) select '" + property_masteritem_link_id + "',  property_id,  com_master_id, type, com_type, option, self_prop_master_id, '" + res + "', priority, total_num, status from property_masteritem_link where prop_master_id='" + $scope.prop_master_id + "'";

                    $log.log('copy query');

                    $log.log(query);

                    DatabaseSrv.executeQuery(query, []).then(function(master_item){
                      $log.log('copied property master item!');

                      $log.log(master_item);

                      $log.log('copping master');

                         query = "select property_subitem_link.*, property_masteritem_link.prop_master_id, property_masteritem_link.name as master_item_name, company_subitem_link.com_master_id from property_subitem_link inner join company_subitem_link on property_subitem_link.com_subitem_id = company_subitem_link.com_subitem_id inner JOIN property_masteritem_link on company_subitem_link.com_master_id = property_masteritem_link.com_master_id where property_subitem_link.status =1 and property_masteritem_link.prop_master_id =? order by property_subitem_link.type";
                         var data = [$scope.prop_master_id];

                         DatabaseSrv.executeQuery(query, data).then(function(sub_items){

                            if(sub_items.status == 1 && sub_items.data.rows.length > 0){

                          //    query = "INSERT INTO property_subitem_link (prop_subitem_id, property_id, com_subitem_id, item_name, type, priority, status) VALUES (?,?,?,?,?,?,?)";

                              for (var i = 0; i < sub_items.data.rows.length; i++) {

                                // var property_subitem_link_id = srvObjManipulation.generateUid();
                                // data = [property_subitem_link_id, sub_items.data.rows.item(i).property_id , sub_items.data.rows.item(i).com_subitem_id, sub_items.data.rows.item(i).item_name, sub_items.data.rows.item(i).type, sub_items.data.rows.item(i).priority, 1 ];
                                // var params = {
                                //   property_subitem_link_id : property_subitem_link_id,
                                //   type: sub_items.data.rows.item(i).type,
                                //   master_sub_item_id:  sub_items.data.rows.item(i).prop_subitem_id
                                // };

                              //  DatabaseSrv.executeQuery(query, data, params).then(function(prop_subs){
                                //  $log.log('copy property sub item!');

                                //  if(prop_subs.status == 1){

                                  //  synSrv.update($scope.property_id, 'property_subitem_link', prop_subs.params.property_subitem_link_id, 'INSERT' );

                                    if(sub_items.data.rows.item(i).type =='GENERAL' ){

                                      $log.log('copy GENERAL feedback');
                                      var prop_sub_feedback_general_id = srvObjManipulation.generateUid();
                                      query = "INSERT INTO property_sub_feedback_general (prop_sub_feedback_general_id, item_id, parent_id, comment ) select '"+ prop_sub_feedback_general_id +"', item_id,'"+ property_masteritem_link_id +"' , comment from property_sub_feedback_general where property_sub_feedback_general.item_id='" + sub_items.data.rows.item(i).prop_subitem_id +"' and property_sub_feedback_general.parent_id='" + $scope.prop_master_id + "'";
                                      var params = {
                                        prop_sub_feedback_general_id: prop_sub_feedback_general_id
                                      };

                                      DatabaseSrv.executeQuery(query, [], params).then(function(gen_feed){
                                        $log.log('copied GENERAL feedback');
                                        synSrv.update($scope.property_id, 'property_sub_feedback_general', gen_feed.params.prop_sub_feedback_general_id, 'INSERT', 'prop_sub_feedback_general_id' );
                                      });

                                    }
                                    else{

                                      $log.log('copy other feedback');
                                      var prop_feedback_id = srvObjManipulation.generateUid();
                                      var params = {
                                        prop_feedback_id: prop_feedback_id
                                      };

                                      query = "INSERT INTO property_feedback (prop_feedback_id, item_id, parent_id, option, comment, description, type) select '" + prop_feedback_id + "', item_id, '" + property_masteritem_link_id + "', option, comment, description, type from property_feedback where property_feedback.item_id='"+ sub_items.data.rows.item(i).prop_subitem_id + "' and property_feedback.parent_id='" + $scope.prop_master_id + "'";
                                      DatabaseSrv.executeQuery(query, [], params).then(function(nar_feed){
                                          $log.log('copied normalL feedback');
                                          synSrv.update($scope.property_id, 'property_sub_feedback_general', nar_feed.params.prop_sub_feedback_general_id, 'INSERT', 'prop_feedback_id' );
                                      });

                                    }


                                  //}


                                //});



                              }

                              genericModalService.showToast('Successfully Copied!', 'LCenter');


                            }
                            else{
                              $log.log('Could not load sub items !');
                            }

                       });



                    });






        });


      }

    });

  };


  //this is to delete room
  $scope.delete = function(){

    var confirmPopup = $ionicPopup.confirm({
     title: 'Delete a room',
     template: 'Are you sure you want to delete this room?'
   });

   confirmPopup.then(function(res) {
     if(res) {
       $log.log('deleting room');

       DatabaseSrv.initLocalDB().then(function(initdb){

         //--------------------- feedback general deleting
         var query = "select property_sub_feedback_general.prop_sub_feedback_general_id from property_sub_feedback_general where property_sub_feedback_general.parent_id=?";
         var data = [ $scope.prop_master_id ];
         DatabaseSrv.executeQuery(query, data ).then(function(result){
           if(result.status == 1 && result.data.rows.length > 0){

             query = "delete from property_sub_feedback_general where prop_sub_feedback_general_id=?";
             var prop_sub_feedback_general_id = result.data.rows.item(0).prop_sub_feedback_general_id ;
             data = [ prop_sub_feedback_general_id ];

             DatabaseSrv.executeQuery(query, []).then(function(nar_feed){
                 $log.log('deleted general feedback items');
                 synSrv.update($scope.property_id, 'property_sub_feedback_general', prop_sub_feedback_general_id, 'DELETE', 'prop_sub_feedback_general_id' );
             });
           }
         });

         //---------------------- recorded voice deleting
         var query = "select property_sub_voice_general.prop_sub_feedback_general_id from property_sub_voice_general where property_sub_voice_general.parent_id=?";
         var data = [$scope.prop_master_id];

         DatabaseSrv.executeQuery(query, data).then(function(result){
             if(result.data.rows.length > 0) {
               for (var i = 0; i < result.data.rows.length; i++) {
                 var item = result.data.rows.item(i);
                 query = "delete from property_sub_voice_general where property_sub_voice_general.prop_sub_feedback_general_id=?";
                 var prop_sub_feedback_general_id = item.prop_sub_feedback_general_id ;
                 data = [ prop_sub_feedback_general_id ];
                 var params =  {
                   prop_sub_feedback_general_id: prop_sub_feedback_general_id
                 };
                 DatabaseSrv.executeQuery(query, [], params).then(function(voice_feed){
                     $log.log('deleted voice feed');
                     synSrv.update($scope.property_id, 'property_sub_voice_general', voice_feed.params.prop_sub_feedback_general_id, 'DELETE', 'prop_sub_feedback_general_id' );
                 });

               }
             }
         });

         //--------------- feedback deleting
         var query = "select property_feedback.prop_feedback_id from property_feedback where property_feedback.parent_id=?";
         var data = [$scope.prop_master_id];

         DatabaseSrv.executeQuery(query, data).then(function(result){
             if(result.data.rows.length > 0) {
               for (var i = 0; i < result.data.rows.length; i++) {
                 var item = result.data.rows.item(i);
                 query = "delete from property_feedback where property_feedback.prop_feedback_id=?";
                 var prop_feedback_id = item.prop_feedback_id ;
                 data = [ prop_feedback_id ];
                 var params =  {
                   prop_feedback_id: prop_feedback_id
                 };
                 DatabaseSrv.executeQuery(query, [], params).then(function(feed){
                     $log.log('deleted voice feed');
                     synSrv.update($scope.property_id, 'property_feedback', feed.params.prop_feedback_id, 'DELETE', 'prop_feedback_id' );
                 });

               }
             }
         });


         //-------------- deleting photos
         var query = "select photos.photo_id from photos where photos.parent_id=?";
         var data = [$scope.prop_master_id];

         DatabaseSrv.executeQuery(query, data).then(function(result){
             if(result.data.rows.length > 0) {
               for (var i = 0; i < result.data.rows.length; i++) {
                 var item = result.data.rows.item(i);
                 query = "delete from photos where photos.photo_id=?";
                 var photo_id = item.photo_id ;
                 data = [ photo_id ];
                 var params =  {
                   photo_id: photo_id
                 };
                 DatabaseSrv.executeQuery(query, [], params).then(function(photos_results){
                     $log.log('deleted voice feed');
                     synSrv.update($scope.property_id, 'photos', photos_results.params.photo_id, 'DELETE', 'photo_id' );
                 });

               }
             }
         });


         //-------------- deleting photos
        var query = "delete from property_masteritem_link where property_masteritem_link.prop_master_id=?";
        var data = [$scope.prop_master_id];

         DatabaseSrv.executeQuery(query, []).then(function(nar_feed){
             $log.log('deleted general feedback items');
             synSrv.update($scope.property_id, 'property_masteritem_link', $scope.prop_master_id, 'DELETE', 'prop_master_id' );
         });



       });


     } else {
       $log.log('delete room false');
     }
   });


  };


});


//--------------------------sub items general condition comment ---------------------------------------------
appCtrl.controller('SubCommentCtrl', function($scope, $state, $stateParams, parameters, commonSrv, $log, $ionicPopup, DatabaseSrv, srvObjManipulation, genericModalService, synSrv){

  $scope.prop_subitem_id = 0;
  $scope.data = {};

  $scope.prop_sub_feedback_general_id = '';

  //init function
  var init = (function(){

    $scope.prop_subitem_id = parameters.prop_subitem_id;
    $scope.property_id = parameters.property_id;
    $scope.prop_master_id = parameters.prop_master_id;
    //$scope.data.comment = parameters.comment;

    if($scope.prop_subitem_id ){

     var data = {
          item_id:  $scope.prop_subitem_id
        };



        DatabaseSrv.initLocalDB().then(function(initdb){

          var query = "select property_sub_feedback_general.* from property_sub_feedback_general where property_sub_feedback_general.item_id=? and property_sub_feedback_general.parent_id=?";

          var data = [$scope.prop_subitem_id, $scope.prop_master_id];

          DatabaseSrv.executeQuery(query, data ).then(function(result){

            console.log('item length', result.data.rows.length);
              if(result.data.rows.length > 0) {

                  $scope.data.comment = result.data.rows.item(0).comment;
                  $scope.prop_sub_feedback_general_id = result.data.rows.item(0).prop_sub_feedback_general_id

                //$scope.items = result.data;

              }


          });

      });

    }


  })();


  $scope.saveComment = function(){

      if($scope.prop_sub_feedback_general_id.trim().length > 0){

        /*var data = {
          condition_id: $scope.general_condition_id,
          comment:  $scope.data.comment
        };*/


      DatabaseSrv.initLocalDB().then(function(initdb){

        var query = "UPDATE property_sub_feedback_general SET comment=? WHERE item_id=? and parent_id=?";
        var data = [$scope.data.comment, $scope.prop_subitem_id, $scope.prop_master_id ];

          DatabaseSrv.executeQuery(query, data ).then(function(result){

              if(result.status == 1){

                  /*var alertPopup = $ionicPopup.alert({
                    title: 'Saved!',
                    template: 'Successfully Saved!'
                  });*/

                  synSrv.update($scope.property_id, 'property_sub_feedback_general', $scope.prop_sub_feedback_general_id , 'UPDATE', 'prop_sub_feedback_general_id' );

                  genericModalService.showToast('Successfully Saved!', 'LCenter');

                  //$scope.closeModal(null);


              }
              else{

                  /*var alertPopup = $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Something went wrong!'
                  });*/

                  genericModalService.showToast('Something went wrong!', 'LCenter');

              }

          });

      });


      }
      else{


        DatabaseSrv.initLocalDB().then(function(initdb){

            var query = "INSERT INTO property_sub_feedback_general (prop_sub_feedback_general_id, item_id, parent_id, comment ) VALUES (?,?,?,?)";

            var prop_sub_feedback_general_id = srvObjManipulation.generateUid();

            var data = [prop_sub_feedback_general_id , $scope.prop_subitem_id, $scope.prop_master_id, $scope.data.comment ];
              DatabaseSrv.executeQuery(query, data ).then(function(result){

                  if(result.status == 1){

                     /* var alertPopup = $ionicPopup.alert({
                        title: 'Saved!',
                        template: 'Successfully Saved!'
                      });*/

                      synSrv.update($scope.property_id, 'property_sub_feedback_general', prop_sub_feedback_general_id , 'INSERT', 'prop_sub_feedback_general_id' );

                      genericModalService.showToast('Successfully Saved!', 'LCenter');

                      $scope.closeModal(null);


                  }
                  else{

                     /* var alertPopup = $ionicPopup.alert({
                        title: 'Error!',
                        template: 'Something went wrong!'
                      });*/
                      genericModalService.showToast('Something went wrong!', 'LCenter');

                  }

              });

        });


      }

  };

  $scope.onClose = function(){
    $scope.closeModal(null);
  }


});


//-------------------------- add item photo comment options ---------------------------------------------
appCtrl.controller('AddSubDetailsCtrl', function($scope, $state, $stateParams, commonSrv, $log, $ionicPopup, DatabaseSrv, $cordovaCamera, $ionicModal, $ionicPopup, srvObjManipulation, genericModalService, PropInfoSrv, synSrv){

  $scope.sub_id = '';
  $scope.type = '';
  $scope.items = [];
  $scope.data = {};

  $scope.images = [];
  $scope.imageUrl = '';
  $scope.searchOptSelected = null;
  $scope.newImages = [];
  $scope.daleteImage = null;

  $scope.property_id = '';
  $scope.breadcums = [];
  $scope.data.viewName = 'item';


  var options = {
        quality: 75,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: false,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 800,
        targetHeight: 800,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false,
        correctOrientation:true
      };


  $scope.searchOptList = [{value: 'N/A', text: 'N/A', selected: false}, {value: 'Used', text: 'Used', selected: false}, {value: 'New', text: 'New', selected: false}, {value: 'Poor', text: 'Poor', selected: false}, {value: 'Damage', text: 'Damage', selected: false}];

  $scope.$on('$ionicView.beforeEnter', function() {

      $scope.items = [];
      $scope.data = {};

      $scope.images = [];
      $scope.newImages = [];
      $scope.imageUrl = '';
      $scope.searchOptSelected = null;
      $scope.daleteImage = null;

      $scope.property_id =  $stateParams.property_id;
      $scope.sub_id = $stateParams.sub_id;
      $scope.type = $stateParams.type;
      $scope.master_id =  $stateParams.master_id;

      loadBreadCums();
      initLoadData();

  });

  (function init(){

  })();


  function loadBreadCums(){

    $scope.breadcums = [];
    $scope.viewName = 'item';


    //getting property info for breadcums
    PropInfoSrv.getPropInfo($scope.property_id).then(function(propinfo){

      if(propinfo.hasOwnProperty('status')){
        if(propinfo.status == 1){
          var address = (propinfo.data.address_1.length > 9) ? propinfo.data.address_1.substring(0, 9) + '...' : propinfo.data.address_1;
          $scope.breadcums.push(address);
          $scope.breadcums.push('Room..');

          if($stateParams.type == 'ITEM' ){


              var query = "select property_masteritem_link.* from property_masteritem_link where property_masteritem_link.prop_master_id=?";
              var data = [$scope.sub_id];

              //$scope.master_id = $scope.sub_id;


              DatabaseSrv.executeQuery(query, data ).then(function(result){

                console.log('item length imtem name', result.data.rows.length);
                if(result.data.rows.length > 0) {
                  $scope.data.viewName =result.data.rows.item(0).name;
                  $scope.breadcums.push(result.data.rows.item(0).name);

                }
              });

          }
          else if($stateParams.type == 'METER'){

              var query = "select property_meter_link.* from property_meter_link where property_meter_link.status=1 and property_meter_link.prop_meter_id =?";
              var data = [$scope.sub_id];

              //$scope.master_id = $scope.sub_id;


              DatabaseSrv.executeQuery(query, data ).then(function(result){

                console.log('item length imtem name', result.data.rows.length);
                if(result.data.rows.length > 0) {
                  $scope.data.viewName = result.data.rows.item(0).meter_name;
                  $scope.breadcums.push('Meter list');
                  $scope.breadcums.push(result.data.rows.item(0).meter_name);
                }

              });


          }
          else if($stateParams.type == 'SUB'){

              $log.log('logging sub id from');
              $log.log($scope.sub_id);

              var query = "select property_subitem_link.*, property_subitem_link.item_name as sub_item_name, property_masteritem_link.prop_master_id, property_masteritem_link.name as master_item_name from property_subitem_link inner join company_subitem_link on property_subitem_link.com_subitem_id = company_subitem_link.com_subitem_id inner JOIN property_masteritem_link on company_subitem_link.com_master_id = property_masteritem_link.com_master_id  where property_subitem_link.status =1 and property_subitem_link.prop_subitem_id =? and property_masteritem_link.prop_master_id=?";
              var data = [$scope.sub_id, $scope.master_id];

              DatabaseSrv.executeQuery(query, data ).then(function(result){

                console.log('item length imtem name', result.data.rows.length);
                if(result.data.rows.length > 0) {

                  //$scope.master_id = result.data.rows.item(0).prop_master_id;


                  $scope.data.viewName = result.data.rows.item(0).sub_item_name;
                  var master_item_name = (result.data.rows.item(0).master_item_name > 5) ? result.data.rows.item(0).master_item_name.substring(0, 5) + '..' : result.data.rows.item(0).master_item_name;

                  $log.log('mster name ', master_item_name);

                  $scope.breadcums.push(master_item_name);
                  var sub_item_name = (result.data.rows.item(0).sub_item_name.length > 5) ? result.data.rows.item(0).sub_item_name.substring(0, 5) + '..' : result.data.rows.item(0).sub_item_name;
                  $scope.breadcums.push(sub_item_name);
                }

              });

          }





        }
      }

    });


  }

  function initLoadData(){

    DatabaseSrv.initLocalDB().then(function(initdb){

        var query = "select property_feedback.* from property_feedback where property_feedback.item_id=? and property_feedback.parent_id=? and property_feedback.type=?";

        var data = [$scope.sub_id, $scope.master_id, $scope.type];

        $log.log('----------------------------------------------');
        $log.log(data);
        $log.log('----------------------------------------------');

        DatabaseSrv.executeQuery(query, data ).then(function(result){

          console.log('item length', result.data.rows.length);
            if(result.data.rows.length > 0) {

                var item = result.data.rows.item(0);
                console.log('item ', item);

                $scope.data.searchOpt = item.option;
                $scope.searchOptSelected =  item.option;
                $scope.data.comment = item.comment;
                $scope.data.description = item.description;

            }

        });


        query = "select photos.* from photos where photos.item_id=? and photos.parent_id=? and photos.type=?";
        data = [$scope.sub_id, $scope.master_id, $scope.type];

        DatabaseSrv.executeQuery(query, data ).then(function(result){

            console.log('item length', result.data.rows.length);
            if(result.data.rows.length > 0){

              for (var i = 0; i < result.data.rows.length; i++) {
                var item = result.data.rows.item(i);

                $scope.images.push({src: item.img_url, link: item.img_url, image_id: item.photo_id } );

              }

            }

        });


        if($scope.type ==  'METER'){


            query = "select property_meter_link.* from property_meter_link where property_meter_link.prop_meter_id=? ";
            data = [$scope.sub_id];

            DatabaseSrv.executeQuery(query, data ).then(function(result){

                console.log('item length', result.data.rows.length);
                if(result.data.rows.length > 0) {

                    var item = result.data.rows.item(0);
                    console.log('item ', item);
                    $scope.data.reading_value = item.reading_value;

                }

            });


        }


    });

  };

  //refresh data
  $scope.refresh  = function(){

      $scope.items = [];
      $scope.data = {};

      $scope.images = [];
      $scope.newImages = [];
      $scope.imageUrl = '';
      $scope.searchOptSelected = null;
      $scope.daleteImage = null;

      initLoadData();

  };

  $scope.searchOptChange = function(opt){
    $scope.searchOptSelected = opt.value;
  };

  $scope.openCamera = function(){

      $cordovaCamera.getPicture(options).then(function(imageData){
          // var image = document.getElementById('reportImage');
          // $scope.data['reportImage'] = "data:image/jpeg;base64," + imageData;

          //$scope.data['reportImage'] = imageData;

          console.log('file url ', imageData);

          var query = "INSERT INTO photos (photo_id, item_id, parent_id, type, img_url) VALUES (?,?,?,?,?) ";
          var photo_id  = srvObjManipulation.generateUid();
          var data = [photo_id, $scope.sub_id, $scope.master_id, $scope.type, imageData ];
          $log.log('camera data saving');
          $log.log(data);

          DatabaseSrv.initLocalDB().then(function(initdb){
            DatabaseSrv.executeQuery(query, data).then(function(result){

                if(result.status == 1){

                  synSrv.update($scope.property_id, 'photos', photo_id , 'INSERT', 'photo_id' );

                  $log.log('Saved  photo ' + imageData) ;

                  $scope.images.push({src: imageData, link: imageData, image_id: photo_id } );
                  $scope.newImages.push( {src: imageData, link: imageData, image_id: photo_id } );

                }
                else{
                  $log.log('photo saving problem') ;
                }

            });

          });



          //--------------

        var
            closeInSeconds = 3,
            displayText = "<span id='timer_id_camera'>Close in #1 seconds.</span>",
            timer;

        swal(
              {
                title: "Do you want to take more photos?",
                text: displayText.replace(/#1/, closeInSeconds),
                timer: closeInSeconds * 1000,
                showConfirmButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Done!",
                html: true,
                animation: false
              },
              function(isConfirm){

                  if (isConfirm) {
                    $log.log("camera bye bye.");
                  }
                  else{
                    $log.log("normal cancel");
                    $scope.openCamera();
                  }

              }

          );

          timer = setInterval(function() {
            closeInSeconds--;
            if (closeInSeconds < 0) {
              clearInterval(timer);
              swal.close();
            }
            document.getElementById("timer_id_camera").innerHTML = displayText.replace(/#1/, closeInSeconds);
          }, 1000);

        //-----------------

        }, function(err){
          // error
          $log.log(err);
      });

  };


  $scope.tapImage = function(url) {

    $scope.imageUrl = url.link;

    $scope.daleteImage = url;

    console.log('imkage url', $scope.imageUrl);
    $scope.showModal('templates/model/image-preview.html');
  };

  //open image slide model
  $scope.showModal = function(templateUrl) {

    $ionicModal.fromTemplateUrl(templateUrl, {
      scope: $scope,
      animation: 'none'//'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      //posts-list
      $scope.modal.show();
    });

  };

  // close image model
  $scope.closeModal = function() {
    $scope.modal.hide();
    $scope.modal.remove();
  };

  //delete the image from scope and database
  $scope.delete = function(){

    if($scope.daleteImage != null){

      if($scope.daleteImage.hasOwnProperty('image_id') ){ // got image from database

        DatabaseSrv.initLocalDB().then(function(initdb){

            var query = "delete from photos where photo_id=?";
            var data = [ $scope.daleteImage.image_id ];

            DatabaseSrv.executeQuery(query, data ).then(function(result){

              if(result.status == 1){

                synSrv.update($scope.property_id, 'photos', $scope.daleteImage.image_id , 'DELETE', 'photo_id' );

                var index =  $scope.images.indexOf($scope.daleteImage);
                if (index > -1) {
                    $scope.images.splice(index, 1);
                    $scope.closeModal();
                }

              }

            });

        });

      }
      else{

            var index =  $scope.images.indexOf($scope.daleteImage);
            if (index > -1) {
              $scope.images.splice(index, 1);
               $scope.closeModal();
            }

            index =  $scope.newImages.indexOf($scope.daleteImage);
            if (index > -1) {
              $scope.newImages.splice(index, 1);
               $scope.closeModal();
            }

        }

    }

  };


  //save photos and comment and option section
  $scope.save = function(){

    DatabaseSrv.initLocalDB().then(function(initdb){

        var query = "SELECT * from property_feedback where item_id=? and parent_id=? and type=?";
        var data = [$scope.sub_id, $scope.master_id, $scope.type ];

        DatabaseSrv.executeQuery(query, data ).then(function(result){

              if(result.status == 1 && result.data.rows.length > 0 ){

                query = "UPDATE property_feedback set option=?, comment=?, description=? where item_id=? and parent_id=? and type=?";


                //we got data exists
                if($scope.type == 'SUB'){ //sub items details general items
                  data = [$scope.searchOptSelected, $scope.data.comment,  $scope.data.description, $scope.sub_id, $scope.master_id,  $scope.type ];
                }
                else if($scope.type == 'METER'){
                  data = ['', $scope.data.comment, $scope.data.description, $scope.sub_id, $scope.master_id,  $scope.type ];
                }
                else{
                  data = [$scope.searchOptSelected, $scope.data.comment, $scope.data.description, $scope.sub_id, $scope.master_id,  $scope.type ];
                }

                  DatabaseSrv.executeQuery(query, data ).then(function(result){

                    //if($scope.newImages.length == 0 ){

                        if(result.status == 1 ){

                          synSrv.update($scope.property_id, 'property_feedback',  result.data.rows.item(0).prop_feedback_id , 'UPDATE', 'prop_feedback_id' );
                          genericModalService.showToast('Successfully Saved!', 'LCenter');

                        }
                        else{
                          genericModalService.showToast('Something went wrong!', 'LCenter');
                        }

                    //}

                  });



                 /* if($scope.newImages.length > 0 ){

                    query = "INSERT INTO photos (photo_id, item_id, type, img_url) ";
                    query += " SELECT '"+ srvObjManipulation.generateUid()+"' as photo_id, '"+ $scope.sub_id +"' as item_id, '"+ $scope.type +"' as type, '"+ $scope.newImages[0].link +"' as img_url ";

                    for(var i=1, l = $scope.newImages.length; i < l; i++ ){
                      query += " UNION ALL SELECT '"+ srvObjManipulation.generateUid()+"', '"+ $scope.sub_id +"', '"+ $scope.type +"', '"+ $scope.newImages[i].link +"' ";
                    }

                    DatabaseSrv.executeQuery(query, []).then(function(result){

                        if(result.status == 1){
                          genericModalService.showToast('Successfully Saved!', 'LCenter');
                        }
                        else{
                          genericModalService.showToast('Something went wrong!', 'LCenter');
                        }

                    });

                  }*/


              }
              else{
                // add new entry
                query = "INSERT INTO property_feedback (prop_feedback_id, item_id, parent_id, option, comment, description, type) VALUES (?,?,?,?,?,?,?)";

                var prop_feedback_id =  srvObjManipulation.generateUid();
                if($scope.type == 'SUB'){ //sub items details general items

                    data = [prop_feedback_id, $scope.sub_id, $scope.master_id, $scope.searchOptSelected , $scope.data.comment, $scope.data.description,  $scope.type  ];
                }
                else if($scope.type == 'METER'){

                    data = [prop_feedback_id, $scope.sub_id, $scope.master_id, '' , $scope.data.comment, $scope.data.description,  $scope.type  ];
                }
                else{

                     data = [prop_feedback_id, $scope.sub_id, $scope.master_id, $scope.searchOptSelected , $scope.data.comment, $scope.data.description,  $scope.type  ];
                }

                    DatabaseSrv.executeQuery(query, data ).then(function(result){

                        //if($scope.newImages.length == 0 ){

                          if(result.status == 1 ){

                            synSrv.update($scope.property_id, 'property_feedback', prop_feedback_id , 'INSERT', 'prop_feedback_id' );

                            genericModalService.showToast('Successfully Saved!', 'LCenter');
                          }
                          else{
                            genericModalService.showToast('Something went wrong!', 'LCenter');
                          }

                        //}

                    });


                    /*if($scope.newImages.length > 0 ){ // this is where get insert new images database

                        query = "INSERT INTO photos (photo_id, item_id, type, img_url) ";
                        query += " select '"+ srvObjManipulation.generateUid()+"' as photo_id, '"+ $scope.sub_id +"' as item_id, '"+ $scope.type +"' as type, '"+ $scope.newImages[0].link +"' as img_url ";

                        for(var i=1, l = $scope.newImages.length; i < l; i++ ){
                          query += " UNION ALL SELECT '"+ srvObjManipulation.generateUid()+"', '"+ $scope.sub_id +"', '"+ $scope.type +"', '"+ $scope.newImages[i].link +"' ";
                        }

                        DatabaseSrv.executeQuery(query, [] ).then(function(result){

                            if(result.status == 1){
                              genericModalService.showToast('Successfully Saved!', 'LCenter');
                            }
                            else{
                              genericModalService.showToast('Something went wrong!', 'LCenter');
                            }

                        });

                    }*/

              }

        }); // select man



        if($scope.type == 'METER'){

            query = "UPDATE property_meter_link set reading_value=? where prop_meter_id=?";
            data = [ $scope.data.reading_value, $scope.sub_id ];

            DatabaseSrv.executeQuery(query, data ).then(function(result){

              if($scope.newImages.length == 0 ){

                  if(result.status == 1 ){

                    synSrv.update($scope.property_id, 'property_meter_link', $scope.sub_id  , 'UPDATE', 'prop_meter_id' );

                      $log.log('updated meter value');

                      /*var alertPopup = $ionicPopup.alert({
                        title: 'Updated!',
                        template: 'Successfully Updated!'
                      }); */
                  }
                  else{

                      /*var alertPopup = $ionicPopup.alert({
                        title: 'Error!',
                        template: 'Something went wrong!'
                      });        */
                  }
              }

            });

        }


    });

  };


});

//voice recorder controller
appCtrl.controller('RecordSoundCtrl', function($scope, $state, $stateParams, commonSrv, $log, $ionicPopup, DatabaseSrv, $ionicModal, $ionicPopup, srvObjManipulation, genericModalService, synSrv){

  $scope.sound = {name: ""};
  $scope.sound.file = '';
  $scope.sound.filePath = '';

  $scope.sounds = [];
  $scope.prop_subitem_id = '';
   $scope.property_id = '';


  var media = null;

    $scope.$on('$ionicView.beforeEnter', function() {

      $scope.sound = {name: ""};
      $scope.sound.file = '';
      $scope.sound.filePath = '';

      $scope.sounds = [];

      $scope.prop_subitem_id = $stateParams.prop_subitem_id;
      $scope.property_id = $stateParams.property_id;
      $scope.prop_master_id = $stateParams.prop_master_id;

      initLoadData();

  });


  // init function man
  function initLoadData(){

      DatabaseSrv.initLocalDB().then(function(initdb){

          var query = "select property_sub_voice_general.* from property_sub_voice_general where property_sub_voice_general.item_id =? and property_sub_voice_general.parent_id=?";

          var data = [$scope.prop_subitem_id, $scope.prop_master_id];

          DatabaseSrv.executeQuery(query, data ).then(function(result){

            console.log('item length', result.data.rows.length);
              if(result.data.rows.length > 0) {

                for (var i = 0; i < result.data.rows.length; i++) {
                  var item = result.data.rows.item(i);

                  console.log('item ', item);
                  item.play = true;
                  $scope.sounds.push(item);
                }


              }


          });

      });


  };


  $scope.saveSound = function() {

    $scope.sound.name = Date.now();

    if(!$scope.sound.file) {
      var alertPopup = $ionicPopup.alert({
                                title: 'Error!',
                                template: 'Record a sound first!'
                              });
      return;
    }

    /*
    begin the copy to persist location

    first, this path below is persistent on both ios and and
    */
    var loc = cordova.file.dataDirectory;
    /*
    but now we have an issue with file name. so let's use the existing extension,
    but a unique filename based on seconds since epoch
    */
    var extension = $scope.sound.file.split(".").pop();
    var filepart = Date.now();
    $scope.sound.name = 'Voice_'+ filepart;
    var filename = filepart + "." + extension;



    $log.log("new filename is " + filename);

    window.resolveLocalFileSystemURL(loc, function(d) {

      window.resolveLocalFileSystemURL($scope.sound.file, function(fe) {

        fe.copyTo(d, filename, function(e) {
          $log.log('success in copy sound file');
          $log.log(e);
          $scope.sound.file = e.nativeURL;
          $scope.sound.path = e.fullPath;

          //get sounds file saved now save database

            DatabaseSrv.initLocalDB().then(function(initdb){

              var query = "INSERT INTO property_sub_voice_general (prop_sub_feedback_general_id, item_id, parent_id, voice_name, voice_url ) VALUES (?,?,?,?,?)";
              var pro_feed_id = srvObjManipulation.generateUid();
              var data = [pro_feed_id, $scope.prop_subitem_id, $scope.prop_master_id,  $scope.sound.name, $scope.sound.file ];
                DatabaseSrv.executeQuery(query, data ).then(function(result){

                    if(result.status == 1){

                        /*var alertPopup = $ionicPopup.alert({
                          title: 'Saved!',
                          template: 'Successfully Saved!'
                        });*/
                        synSrv.update($scope.property_id, 'property_sub_voice_general', pro_feed_id , 'INSERT', 'prop_sub_feedback_general_id' );

                        genericModalService.showToast('Successfully Saved!', 'LCenter');

                        $scope.sounds.push({ prop_sub_feedback_general_id: pro_feed_id, item_id: $scope.prop_subitem_id, parent_id: $scope.prop_master_id, voice_name: $scope.sound.name, voice_url: $scope.sound.file, play: true });

                        $log.log($scope.sounds);

                    }
                    else{

                        /*var alertPopup = $ionicPopup.alert({
                          title: 'Error!',
                          template: 'Something went wrong!'
                        });*/
                        genericModalService.showToast('Something went wrong!', 'LCenter');

                    }

                });

            });


        }, function(e) {
          $log.log('error in coipy');
          $log.log(e);
        });


      }, function(e) {
        $log.log("error in inner bullcrap");
        $log.log(e);
      });


    }, function(e) {
      $log.log('error in fs');
      $log.log(e);
    });


  }

  var captureError = function(e) {
    $log.log('captureError' ,e);
  }

  var captureSuccess = function(e) {
    $log.log('captureSuccess');
    $log.log(e);
    $scope.sound.file = e[0].localURL;
    $scope.sound.filePath = e[0].fullPath;
    //$scope.sound.name = e[0].name;

    $scope.saveSound();

  }

  $scope.record = function() {
    navigator.device.capture.captureAudio(
        captureSuccess,captureError,{duration:10});
  }


  // play the sound
  $scope.play = function(sound) {

    if(!sound.voice_url) {
      var alertPopup = $ionicPopup.alert({
                                title: 'Error!',
                                template: 'Error playing the voice!'
                              });
      return;
    }

    media = new Media(sound.voice_url, function(e) {
      media.release();
    }, function(err) {
      console.log("media err", err);
    });

    media.play();
    sound.play = false;

  };

  // stop playback sound
  $scope.stop = function(sound){

    if(media){
      media.stop();
      sound.play = true ;
    }

  };



});

//general photos controller
appCtrl.controller('GeneralPhotosCtrl', function($scope, $state, $stateParams, commonSrv, $log, $ionicPopup, DatabaseSrv, $ionicModal, $ionicPopup, srvObjManipulation, genericModalService, synSrv, $cordovaCamera){


   $scope.prop_subitem_id = '';
   $scope.property_id = '';
   $scope.prop_master_id = '';

      $scope.images = [];
      $scope.newImages = [];
      $scope.imageUrl = '';
      $scope.searchOptSelected = null;
      $scope.daleteImage = null;

      var options = {
            quality: 75,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: false,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 800,
            targetHeight: 800,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false,
            correctOrientation:true
          };

   $scope.$on('$ionicView.beforeEnter', function() {

      $scope.prop_subitem_id = $stateParams.prop_subitem_id;
      $scope.property_id = $stateParams.property_id;
      $scope.prop_master_id =  $stateParams.master_id;
      $scope.images = [];
      $scope.newImages = [];
      $scope.imageUrl = '';
      $scope.searchOptSelected = null;
      $scope.daleteImage = null;

      initLoadData();

  });


    $scope.openCamera = function(){

      $cordovaCamera.getPicture(options).then(function(imageData){
          // var image = document.getElementById('reportImage');
          // $scope.data['reportImage'] = "data:image/jpeg;base64," + imageData;

          //$scope.data['reportImage'] = imageData;

          console.log('file url ', imageData);

          var query = "INSERT INTO photos (photo_id, item_id, parent_id, type, img_url) VALUES (?,?,?,?,?) ";
          var photo_id  = srvObjManipulation.generateUid();
          var data = [photo_id, $scope.prop_subitem_id, $scope.prop_master_id, 'GENERAL', imageData ];
          $log.log('camera data saving');
          $log.log(data);

          DatabaseSrv.initLocalDB().then(function(initdb){
            DatabaseSrv.executeQuery(query, data).then(function(result){

                if(result.status == 1){

                  synSrv.update($scope.property_id, 'photos', photo_id , 'INSERT', 'photo_id' );

                  $log.log('Saved  photo ' + imageData) ;

                  $scope.images.push({src: imageData, link: imageData, image_id: photo_id } );
                  $scope.newImages.push( {src: imageData, link: imageData, image_id: photo_id } );

                }
                else{
                  $log.log('photo saving problem') ;
                }

            });

          });



       //--------------

        var
            closeInSeconds = 3,
            displayText = "<span id='timer_id_camera'>Close in #1 seconds.</span>",
            timer;

        swal(
              {
                title: "Do you want to take more photos?",
                text: displayText.replace(/#1/, closeInSeconds),
                timer: closeInSeconds * 1000,
                showConfirmButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Done!",
                html: true,
                animation: false
              },
              function(isConfirm){

                  if (isConfirm) {
                    $log.log("camera bye bye.");
                  }
                  else{
                    $log.log("normal cancel");
                    $scope.openCamera();
                  }

              }

          );

          timer = setInterval(function() {
            closeInSeconds--;
            if (closeInSeconds < 0) {
              clearInterval(timer);
              swal.close();
            }
            document.getElementById("timer_id_camera").innerHTML = displayText.replace(/#1/, closeInSeconds);
          }, 1000);

        //-----------------

        }, function(err){
          // error
          $log.log(err);
      });

  };


  function initLoadData(){

    DatabaseSrv.initLocalDB().then(function(initdb){


        query = "select photos.* from photos where photos.item_id=? and photos.parent_id=? and photos.type='GENERAL'";
        data = [$scope.prop_subitem_id, $scope.prop_master_id];

        DatabaseSrv.executeQuery(query, data ).then(function(result){

            console.log('item length', result.data.rows.length);
            if(result.data.rows.length > 0){

              for (var i = 0; i < result.data.rows.length; i++) {
                var item = result.data.rows.item(i);

                $scope.images.push({src: item.img_url, link: item.img_url, image_id: item.photo_id } );

              }

            }

        });


    });

  };


  $scope.tapImage = function(url) {

    $scope.imageUrl = url.link;

    $scope.daleteImage = url;

    console.log('imkage url', $scope.imageUrl);
    $scope.showModal('templates/model/image-preview.html');
  };

  //open image slide model
  $scope.showModal = function(templateUrl) {

    $ionicModal.fromTemplateUrl(templateUrl, {
      scope: $scope,
      animation: 'none'//'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      //posts-list
      $scope.modal.show();
    });

  };

  // close image model
  $scope.closeModal = function() {
    $scope.modal.hide();
    $scope.modal.remove();
  };

  //delete the image from scope and database
  $scope.delete = function(){

    if($scope.daleteImage != null){

      if($scope.daleteImage.hasOwnProperty('image_id') ){ // got image from database

        DatabaseSrv.initLocalDB().then(function(initdb){

            var query = "delete from photos where photo_id=?";
            var data = [ $scope.daleteImage.image_id ];

            DatabaseSrv.executeQuery(query, data ).then(function(result){

              if(result.status == 1){

                synSrv.update($scope.property_id, 'photos', $scope.daleteImage.image_id , 'DELETE', 'photo_id' );

                var index =  $scope.images.indexOf($scope.daleteImage);
                if (index > -1) {
                    $scope.images.splice(index, 1);
                    $scope.closeModal();
                }

              }

            });

        });

      }
      else{

            var index =  $scope.images.indexOf($scope.daleteImage);
            if (index > -1) {
              $scope.images.splice(index, 1);
               $scope.closeModal();
            }

            index =  $scope.newImages.indexOf($scope.daleteImage);
            if (index > -1) {
              $scope.newImages.splice(index, 1);
               $scope.closeModal();
            }

        }

    }

  };


});


//-----------------------------Login control -------------------------------------------------

/*
 *  Login control
 *  Login to system
 */


appCtrl.controller('LoginCtrl', function(
  $scope,
  $state,
  $log,
  AuthService,
  $ionicPopup,
  $ionicHistory,
  genericModalService){


    $scope.$on('$ionicView.afterEnter', function() {
      $ionicHistory.clearHistory();
    });

    $scope.doLogin = function(data){

      if(data != undefined){
        if( data.username != undefined && data.password !=  undefined ){

            AuthService.login(data.username, data.password).then(function(authenticated) {

              try{
                genericModalService.showToast('Welcome to Property ground !', 'LBottom');
                data.username = '';
                data.password = '';
              }
              catch(e){
                $log.error(e);
              }

             // $scope.closeModal(null);

             $state.go('app.inspections');

            }, function(err) {
              var alertPopup = $ionicPopup.alert({
                title: 'Login failed!',
                template: 'Please check your credentials!'
              });

            });

        }

      }

    };



  });


//-----------------------------End Login control -------------------------------------------------
