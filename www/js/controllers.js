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
  $log){

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
          var query = "select property_info.*, strftime('%d/%m/%Y', property_info.createdAt) as created_date from property_info";

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

          var query = "SELECT property_masteritem_link.total_num FROM property_masteritem_link inner JOIN company_masteritem_link on property_masteritem_link.com_master_id = company_masteritem_link.com_master_id where company_masteritem_link.option = 'NUM' and property_masteritem_link.total_num > 0 and property_masteritem_link.property_id = ?";

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
  $timeout){


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

          var query = "select property_info.*, strftime('%d/%m/%Y', property_info.createdAt) as created_date, property.description from property_info inner join property on property_info.property_id = property.property_id where property.property_id=?";

          var data = [$scope.property_id];
      
          DatabaseSrv.executeQuery(query, data ).then(function(result){
    
            if(result.status == 1 && result.data.rows.length > 0){

                //$scope.data = result.property[0];
                $scope.data.address_1 = result.data.rows.item(0).address_1;
                $scope.data.address_2 =  result.data.rows.item(0).address_2;
                $scope.data.city =  result.data.rows.item(0).city;
                $scope.data.postalcode =  result.data.rows.item(0).postalcode;
                $scope.data.report_type =  result.data.rows.item(0).report_type;
                $scope.data.report_date =  result.data.rows.item(0).report_date;
                $scope.data.created_date =  result.data.rows.item(0).created_date;
                $scope.data.description =  result.data.rows.item(0).description;

                $scope.data.image_url =  result.data.rows.item(0).image_url;

                if( $scope.data.image_url.length == 0 || $scope.data.image_url.indexOf('list_icon.png') ){
                  $scope.data.image_url =  "img/photo-camera.png";
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

              //commonSrv.postData('property/add', $scope.data).then(function(result) {
              DatabaseSrv.initLocalDB().then(function(initdb){

                  var query = "INSERT INTO property (property_id, company_id, description, status) VALUES (?,?,?,?)";

                  var prop_unique_id = srvObjManipulation.generateUid();

                  var data = [prop_unique_id , AuthService.getCompanyId(),  $scope.data.description , 1];
              
                  DatabaseSrv.executeQuery(query, data ).then(function(result){
            
                    if(result.status == 1){
                      $scope.property_id =  prop_unique_id;//result.data.insertId;

                      $log.log('property id', $scope.property_id);


                      if($scope.property_id ){


                          var query = "INSERT INTO property_info (property_id, address_1, address_2, city, postalcode,  report_type, report_date, image_url) VALUES (?,?,?,?,?,?,?,?)";
                          var data = [$scope.property_id, $scope.data.address_1, $scope.data.address_2, $scope.data.city, $scope.data.postalcode, $scope.data.report_type, $scope.data.report_date, $scope.data.reportImage ];
                      
                          DatabaseSrv.executeQuery(query, data ).then(function(prop_info_result){


                            if(prop_info_result.status ==  1){

                                //------------------- setting property template --------------------

                                //meter import

                                query = "select Company_meter_link.* from Company_meter_link where Company_meter_link.status=1";
                                                            
                                DatabaseSrv.executeQuery(query, []).then(function(Meter_types){
                          
                                    if(Meter_types.status == 1 && Meter_types.data.rows.length > 0){

                                       query = "INSERT INTO property_meter_link (prop_meter_id, property_id, com_meter_id, reading_value, status) VALUES (?,?,?,?,?)";
                                        
                                       for (var i = 0; i < Meter_types.data.rows.length; i++) {
                                        
                                        data = [srvObjManipulation.generateUid(), $scope.property_id, Meter_types.data.rows.item(i).com_meter_id, '', 1 ];

                                        DatabaseSrv.executeQuery(query, data).then(function(prop_meter){
                                          $log.log('updating prop meter!');
                                        });

                                      }
                                      

                                    }
                                    else{
                                      $log.log('Could not load company meter!'); 
                                    }

                                });


                                //general condition import
                                query = "select Company_general_condition_link.* from Company_general_condition_link where Company_general_condition_link.status=1";
                                                            
                                DatabaseSrv.executeQuery(query, []).then(function(General_conditions){
                          
                                    if(General_conditions.status == 1 && General_conditions.data.rows.length > 0){

                                      query = "INSERT INTO property_general_condition_link (prop_general_id, property_id, com_general_id, priority, user_input, comment, status ) VALUES (?,?,?,?,?,?,?)";

                                      for (var i = 0; i < General_conditions.data.rows.length; i++) {

                                        data = [srvObjManipulation.generateUid(), $scope.property_id, General_conditions.data.rows.item(i).com_general_id, General_conditions.data.rows.item(i).priority, '', '', 1 ];

                                        DatabaseSrv.executeQuery(query, data).then(function(prop_meter){
                                          $log.log('updating general condition!');
                                        });


                                      }                                                                        

                                    }
                                    else{
                                      $log.log('Could not load general condition !'); 
                                    }

                                });


                                //master items import 
                                // merger wai

                                query = "select Company_masteritem_link.* from Company_masteritem_link where Company_masteritem_link.status='true'";

                                DatabaseSrv.executeQuery(query, []).then(function(master_items){
                          
                                    if(master_items.status == 1 && master_items.data.rows.length > 0){

                                     // query = "INSERT INTO property_masteritem_link (prop_master_id, property_id, com_master_id, type, self_prop_master_id, name,  priority, total_num, status) VALUES (?,?,?,?,?,?,?,?,?)";

                                     query = "INSERT INTO property_masteritem_link (prop_master_id, property_id, com_master_id, type, self_prop_master_id, name,  priority, total_num, status) ";

                                     query += " select '"+ srvObjManipulation.generateUid() +"' as prop_master_id, '"+ $scope.property_id +"' as property_id, '"+ master_items.data.rows.item(0).com_master_id +"' as com_master_id, 'DEFAULT' as type, '0' as self_prop_master_id, '"+ master_items.data.rows.item(0).item_name +"' as name, "+ master_items.data.rows.item(0).priority +" as priority, 0 as total_num, 1 as status ";

                                      //for (var i = 0; i < master_items.data.rows.length; i++) {
                                      for (var i = 1; i < master_items.data.rows.length; i++) {

                                        /*data = [srvObjManipulation.generateUid(), $scope.property_id, master_items.data.rows.item(i).com_master_id, 'DEFAULT', 0, master_items.data.rows.item(i).item_name , master_items.data.rows.item(i).priority, 0, 1 ];

                                        DatabaseSrv.executeQuery(query, data).then(function(master_items){
                                          $log.log('updating property master items!');
                                        });*/

                                         query += " UNION ALL SELECT '"+ srvObjManipulation.generateUid() +"', '"+ $scope.property_id +"', '"+ master_items.data.rows.item(i).com_master_id +"', 'DEFAULT', '0', '"+ master_items.data.rows.item(i).item_name +"', "+ master_items.data.rows.item(i).priority +", 0, 1 ";

                                      }

                                        DatabaseSrv.executeQuery(query, []).then(function(prop_subs){
                                          $log.log('updated once property master items!');

                                          //sub items import
                                            query = "select Company_subitem_link.* from Company_subitem_link where Company_subitem_link.status=1";
                                                                        
                                            DatabaseSrv.executeQuery(query, []).then(function(sub_items){
                                      
                                                if(sub_items.status == 1 && sub_items.data.rows.length > 0){


                                                  //query = "INSERT INTO property_subitem_link (prop_subitem_id, property_id, com_subitem_id, priority, status) VALUES (?,?,?,?,?)";

                                                  query = "INSERT INTO property_subitem_link (prop_subitem_id, property_id, com_subitem_id, priority, status) ";

                                                  query += " select '" +  srvObjManipulation.generateUid() + "' as prop_subitem_id, '" + $scope.property_id + "' as property_id, '"+ sub_items.data.rows.item(0).com_subitem_id +"' as com_subitem_id, "+ sub_items.data.rows.item(0).priority +" as priority, 1 as status ";
                                                  //query += " UNION ALL SELECT '" +  srvObjManipulation.generateUid() + "', '" + $scope.property_id + "', '"+ sub_items.data.rows.item(0).com_subitem_id +"', "+ sub_items.data.rows.item(0).priority +", 1 " ; 
                                                  
                                                  //for (var i = 0; i < sub_items.data.rows.length; i++) {
                                                  for (var i = 1; i < sub_items.data.rows.length; i++) {

                                                    /*data = [srvObjManipulation.generateUid(), $scope.property_id, sub_items.data.rows.item(i).com_subitem_id, sub_items.data.rows.item(i).priority, 1 ];

                                                    DatabaseSrv.executeQuery(query, data).then(function(prop_subs){
                                                      $log.log('updating property sub items!');
                                                    });*/

                                                    query += " UNION ALL SELECT '" +  srvObjManipulation.generateUid() + "', '" + $scope.property_id + "', '"+ sub_items.data.rows.item(i).com_subitem_id +"', "+ sub_items.data.rows.item(i).priority +", 1 ";

                                                  }


                                                  DatabaseSrv.executeQuery(query, []).then(function(prop_subs){
                                                      $log.log('updated once property sub items!');

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
                var data = [$scope.data.address_1, $scope.data.address_2, $scope.data.city, $scope.data.postalcode, $scope.data.report_type, $scope.data.report_date, $scope.data.image_url, $scope.property_id ];

                  DatabaseSrv.executeQuery(query, data ).then(function(prop_info_result){

                    if(prop_info_result.status ==  1){

                      var alertPopup = $ionicPopup.alert({
                        title: 'Saved!',
                        template: 'Successfully Saved!'
                      });


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
appCtrl.controller('PropCtrl', function($scope, $state, $stateParams, commonSrv, $log, $ionicPopup, $ionicHistory, DatabaseSrv, srvObjManipulation, $timeout){

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


          var query = "select property_masteritem_link.*, company_masteritem_link.item_name, company_masteritem_link.type, company_masteritem_link.option from property_masteritem_link inner join company_masteritem_link on property_masteritem_link.com_master_id = company_masteritem_link.com_master_id where property_masteritem_link.type='DEFAULT' and property_masteritem_link.property_id =? order by property_masteritem_link.com_master_id, company_masteritem_link.option ";
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
                  $scope.options.push({name: $scope.template.rows.item(i).name, item_name: $scope.template.rows.item(i).item_name, prop_master_id: $scope.template.rows.item(i).prop_master_id, status: $scope.setToggle($scope.template.rows.item(i).status), priority: $scope.template.rows.item(i).priority, com_master_id:  $scope.template.rows.item(i).com_master_id }); 
                }
                else if($scope.template.rows.item(i).option == 'NUM' ){
                  $scope.nums.push({name: $scope.template.rows.item(i).name, item_name: $scope.template.rows.item(i).item_name, prop_master_id: $scope.template.rows.item(i).prop_master_id, total_num: $scope.template.rows.item(i).total_num, priority: $scope.template.rows.item(i).priority, com_master_id:  $scope.template.rows.item(i).com_master_id })
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

                  query = "select Company_masteritem_link.* from Company_masteritem_link where Company_masteritem_link.com_master_id=?";

                  $log.log(i +' - ', com_sub.params.com_master_id);

                  data = [com_sub.params.com_master_id];

                  var xparams = com_sub.params;

                  DatabaseSrv.executeQuery(query, data, xparams ).then(function(com_master_item){

                    if(com_master_item.status == 1 && com_master_item.data.rows.length > 0){
                      
                      if(com_master_item.params.total_num > 0){

                        for(var j=1; j <= com_master_item.params.total_num; j++){

                          query = "INSERT INTO property_masteritem_link (prop_master_id, property_id, com_master_id, type, self_prop_master_id, name, priority, total_num, status) VALUES (?,?,?,?,?,?,?,?,?)";

                          data = [srvObjManipulation.generateUid(), $scope.property_id, com_master_item.params.com_master_id, 'SELF', com_master_item.params.prop_master_id, com_master_item.data.rows.item(0).item_name + ' ' + (j).toString(), 1, 0, 1 ];

                          DatabaseSrv.executeQuery(query, data).then(function(master_items){
                            $log.log('inserting self property master items!');
                          });

                        }

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
             
              DatabaseSrv.executeQuery(query, data).then(function(com_sub){

                if(com_sub.status ==  1){
                  $log.log('updated opt ');
                }

              });


            }

          }



          $timeout(function(){
              //we got property id , upload image to server
              var alertPopup = $ionicPopup.alert({
                title: 'Saved!',
                template: 'Successfully Saved!'
              });

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
appCtrl.controller('ProplistCtrl', function($scope, $state, $stateParams, commonSrv, $log, $ionicPopup, $cordovaKeyboard, DatabaseSrv, genericModalService, $timeout, roomObj){

  $scope.property_id = 0;
  $scope.items = [];
  $scope.data = { };


  $scope.$on('$ionicView.beforeEnter', function() {

    $scope.items = [];
    $scope.data = { };

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

          var query = "select property_masteritem_link.*, company_masteritem_link.item_name, company_masteritem_link.type as template_type, company_masteritem_link.option from property_masteritem_link left join company_masteritem_link on property_masteritem_link.com_master_id = company_masteritem_link.com_master_id where NOT(company_masteritem_link.option ='NUM' and property_masteritem_link.type ='DEFAULT') and property_masteritem_link.property_id =? and property_masteritem_link.status = 1 order by property_masteritem_link.priority, property_masteritem_link.prop_master_id, company_masteritem_link.option,  company_masteritem_link.item_name";

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
       $state.go('app.addSubDetails', {sub_id: item.prop_master_id, type: 'ITEM' });
    }
    
  };



});


//--------------------------property list sorting list ---------------------------------------------
appCtrl.controller('PropertyListSortCtrl', function($scope, $state, $stateParams, commonSrv, $log, $ionicPopup, DatabaseSrv, $timeout){

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

          var query = "select property_masteritem_link.*, company_masteritem_link.item_name, company_masteritem_link.type as template_type, company_masteritem_link.option from property_masteritem_link left join company_masteritem_link on property_masteritem_link.com_master_id = company_masteritem_link.com_master_id where NOT(company_masteritem_link.option ='NUM' and property_masteritem_link.type ='DEFAULT') and property_masteritem_link.property_id =? and property_masteritem_link.status = 1 order by property_masteritem_link.priority, property_masteritem_link.prop_master_id, company_masteritem_link.option,  company_masteritem_link.item_name";

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
        
              DatabaseSrv.executeQuery(query, data ).then(function(result){
      
                  if(result.status == 1){                  
                    $log.log('prop sort saved!');
                  }
                  else{
                      $log.log('prop sorting save error!');
                  }

              });

          }

          $timeout(function(){

                  var alertPopup = $ionicPopup.alert({
                        title: 'Saved!',
                        template: 'Successfully Saved!'
                      });

          }, 300);


      });


  }

  

});


//--------------------------general condition list ---------------------------------------------
appCtrl.controller('GeneralConditionCtrl', function($scope, $state, $stateParams, commonSrv, $log, $ionicPopup, myModals, DatabaseSrv, $timeout){

  $scope.property_id = 0;
  $scope.items = [];
  $scope.data = {};


  $scope.$on('$ionicView.beforeEnter', function() {

    $scope.items = [];
    $scope.data = {};

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

        /*commonSrv.postData('property/getConditions', data).then(function(result){

          $log.log(result);
          $scope.items = result.conditions;     

        });*/



        DatabaseSrv.initLocalDB().then(function(initdb){

          var query = "select property_general_condition_link.*, company_general_condition_link.item_name, company_general_condition_link.options, company_general_condition_link.type from property_general_condition_link inner join company_general_condition_link on property_general_condition_link.com_general_id = company_general_condition_link.com_general_id where property_general_condition_link.status=1 and property_general_condition_link.property_id=? order by property_general_condition_link.priority";

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

    myModals.gCommentBox({state: 'generalCondition', general_id: general_id});

  };

  //save options
  $scope.save = function(){

    DatabaseSrv.initLocalDB().then(function(initdb){

    for (var i = 0, l = $scope.items.length; i < l; i++) {
      //$log.log($scope.items[i].user_input);

      //$log.log($scope.items[i].prop_general_id);

        var query = "UPDATE Property_general_condition_link SET user_input=? WHERE prop_general_id=?";
        var data = [$scope.items[i].user_input , $scope.items[i].prop_general_id ];
    
          DatabaseSrv.executeQuery(query, data ).then(function(result){
  
              if(result.status == 1){                  
                $log.log('condition saved!');
              }
              else{
                  $log.log('condition save error!');
              }

          });

      }

      $timeout(function(){

              var alertPopup = $ionicPopup.alert({
                    title: 'Saved!',
                    template: 'Successfully Saved!'
                  });

      }, 300);




    });

  };

});

//--------------------------general condition comment ---------------------------------------------
appCtrl.controller('GCommentCtrl', function($scope, $state, $stateParams, parameters, commonSrv, $log, $ionicPopup, DatabaseSrv){

  $scope.general_condition_id = 0;
  $scope.data = {};

  //init function 
  var init = (function(){

    $scope.general_condition_id = parameters.general_id;
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
appCtrl.controller('GeneralConditionSortCtrl', function($scope, $state, $stateParams, commonSrv, $log, $ionicPopup, DatabaseSrv, $timeout){

  $scope.property_id = 0;
  $scope.items = [];
  $scope.data = {};


  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.items = [];
    $scope.data = {};
    $scope.data.showReorder = true;
  });

  (function init(){

    $scope.property_id = $stateParams.property_id;

    initLoadData();

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

          var query = "select property_general_condition_link.*, company_general_condition_link.item_name, company_general_condition_link.options, company_general_condition_link.type from property_general_condition_link inner join company_general_condition_link on property_general_condition_link.com_general_id = company_general_condition_link.com_general_id where property_general_condition_link.status=1 and property_general_condition_link.property_id=? order by property_general_condition_link.priority";

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
      
            DatabaseSrv.executeQuery(query, data ).then(function(result){
    
                if(result.status == 1){                  
                  $log.log('condition sort saved!');
                }
                else{
                    $log.log('condition sorting save error!');
                }

            });

        }

        $timeout(function(){

                var alertPopup = $ionicPopup.alert({
                      title: 'Saved!',
                      template: 'Successfully Saved!'
                    });

        }, 300);


    });


  }

  

});


//--------------------------MeterListCtrl list ---------------------------------------------
appCtrl.controller('MeterListCtrl', function($scope, $state, $stateParams, commonSrv, $log, $ionicPopup,DatabaseSrv){

  $scope.property_id = 0;
  $scope.items = [];
  $scope.data = {};


  $scope.$on('$ionicView.beforeEnter', function() {
  });

  (function init(){

    $scope.property_id = $stateParams.property_id;

    initLoadData();

  })();

  function initLoadData(){

      if($scope.property_id){


        DatabaseSrv.initLocalDB().then(function(initdb){

          var query = "select property_meter_link.*, company_meter_link.meter_name from property_meter_link left join company_meter_link on property_meter_link.com_meter_id = company_meter_link.com_meter_id where property_meter_link.status=1 and property_meter_link.property_id =?";

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
appCtrl.controller('SubItemsListCtrl', function($scope, $state, $stateParams, commonSrv, $log, $ionicPopup, DatabaseSrv, $ionicPopup, roomObj, myModals){

  $scope.property_id = 0;
  $scope.prop_master_id = 0;
  $scope.items = [];
  $scope.data = {};
  $scope.room = {};

  $scope.input = {};
  $scope.input.roomname = '';
  $scope.showButton = true;


  $scope.$on('$ionicView.beforeEnter', function() {

    $scope.items = [];
    $scope.data = {};


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

          var query = "select property_subitem_link.*, company_subitem_link.item_name, company_subitem_link.type, property_masteritem_link.prop_master_id, company_subitem_link.com_master_id, (select count(photos.photo_id) from photos where photos.item_id = property_subitem_link.prop_subitem_id ) as image_count from property_subitem_link inner join company_subitem_link on property_subitem_link.com_subitem_id = company_subitem_link.com_subitem_id inner JOIN property_masteritem_link on company_subitem_link.com_master_id = property_masteritem_link.com_master_id where property_subitem_link.status =1 and property_masteritem_link.prop_master_id =? and property_subitem_link.property_id=? order by company_subitem_link.type";

          var data = [$scope.prop_master_id, $scope.property_id];
      
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


  //open camera 
  $scope.generalCamera = function(){
    $log.log('camera camera');
  };

  $scope.generalComment = function(prop_subitem_id){

    myModals.subCommentBox({ prop_subitem_id: prop_subitem_id});

  };

  $scope.generalVoiceRecorder = function(prop_subitem_id){

    $state.go('app.recordSound', {prop_subitem_id: prop_subitem_id});
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
                  
                  var alertPopup = $ionicPopup.alert({
                    title: 'Saved!',
                    template: 'Successfully Saved!'
                  });

                 
              }
              else{

                  var alertPopup = $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Something went wrong!'
                  });
          
              }

          });

        });


      }
      
    });

  }

});


//--------------------------sub items general condition comment ---------------------------------------------
appCtrl.controller('SubCommentCtrl', function($scope, $state, $stateParams, parameters, commonSrv, $log, $ionicPopup, DatabaseSrv, srvObjManipulation){

  $scope.prop_subitem_id = 0;
  $scope.data = {};

  $scope.prop_sub_feedback_general_id = '';

  //init function 
  var init = (function(){

    $scope.prop_subitem_id = parameters.prop_subitem_id;
    //$scope.data.comment = parameters.comment;

    if($scope.prop_subitem_id ){

     var data = {
          item_id:  $scope.prop_subitem_id
        };



        DatabaseSrv.initLocalDB().then(function(initdb){

          var query = "select property_sub_feedback_general.* from property_sub_feedback_general where property_sub_feedback_general.item_id=?";

          var data = [$scope.prop_subitem_id];
      
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

        var query = "UPDATE property_sub_feedback_general SET comment=? WHERE item_id=?";
        var data = [$scope.data.comment, $scope.prop_subitem_id ];
    
          DatabaseSrv.executeQuery(query, data ).then(function(result){
  
              if(result.status == 1){
                  
                  var alertPopup = $ionicPopup.alert({
                    title: 'Saved!',
                    template: 'Successfully Saved!'
                  });

                  //$scope.closeModal(null);


              }
              else{

                  var alertPopup = $ionicPopup.alert({
                    title: 'Error!',
                    template: 'Something went wrong!'
                  });
          
              }

          });

      });


      }
      else{


        DatabaseSrv.initLocalDB().then(function(initdb){

            var query = "INSERT INTO property_sub_feedback_general (prop_sub_feedback_general_id, item_id, comment ) VALUES (?,?,?)";
            var data = [srvObjManipulation.generateUid(), $scope.prop_subitem_id, $scope.data.comment ];
              DatabaseSrv.executeQuery(query, data ).then(function(result){
      
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

              });

        });


      }

  };

  $scope.onClose = function(){
    $scope.closeModal(null);
  }


});


//-------------------------- add item photo comment options ---------------------------------------------
appCtrl.controller('AddSubDetailsCtrl', function($scope, $state, $stateParams, commonSrv, $log, $ionicPopup, DatabaseSrv, $cordovaCamera, $ionicModal, $ionicPopup, srvObjManipulation){

  $scope.sub_id = '';
  $scope.type = '';
  $scope.items = [];
  $scope.data = {};

  $scope.images = [];
  $scope.imageUrl = '';
  $scope.searchOptSelected = null;
  $scope.newImages = [];
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


  $scope.searchOptList = [{value: 'N/A', text: 'N/A', selected: false}, {value: 'Used', text: 'Used', selected: false}, {value: 'New', text: 'New', selected: false}, {value: 'Poor', text: 'Poor', selected: false}, {value: 'Damage', text: 'Damage', selected: false}];

  $scope.$on('$ionicView.beforeEnter', function() {

      $scope.items = [];
      $scope.data = {};

      $scope.images = [];
      $scope.newImages = [];
      $scope.imageUrl = '';
      $scope.searchOptSelected = null;
      $scope.daleteImage = null;

      initLoadData();    


  });

  (function init(){

    //initLoadData();

  })();

  function initLoadData(){

    $scope.sub_id = $stateParams.sub_id;
    $scope.type = $stateParams.type;


    DatabaseSrv.initLocalDB().then(function(initdb){

        var query = "select property_feedback.* from property_feedback where property_feedback.item_id=? and property_feedback.type=?";

        var data = [$scope.sub_id, $scope.type];
    
        DatabaseSrv.executeQuery(query, data ).then(function(result){
          
          console.log('item length', result.data.rows.length);
            if(result.data.rows.length > 0) {
              
                var item = result.data.rows.item(0);
                console.log('item ', item);

                $scope.data.searchOpt = item.option;
                $scope.searchOptSelected =  item.option;
                $scope.data.comment = item.comment;

            }
          
        });


        query = "select photos.* from photos where photos.item_id=? and photos.type=?";
        data = [$scope.sub_id, $scope.type];
    
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
          $scope.images.push({src: imageData, link: imageData } );
          $scope.newImages.push( {src: imageData, link: imageData} );


          var confirmPopup = $ionicPopup.confirm({
              okText : 'Yes',
              cancelText : 'No',
              title: 'Notice',
              template: 'Do you want to take more photos?'
          });

        confirmPopup.then(function(res) {
            if(res) {
                $scope.openCamera();
            }
        });

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

                var index =  $scope.images.indexOf($scope.daleteImage);
                if (index > -1) {
                     $scope.images.splice(index, 1);
                }


              }

            });

        });

      }
      else{

            var index =  $scope.images.indexOf($scope.daleteImage);
            if (index > -1) {
              $scope.images.splice(index, 1);
            }

            index =  $scope.newImages.indexOf($scope.daleteImage);
            if (index > -1) {
              $scope.newImages.splice(index, 1);
            }

        }

    }

  };


  //save photos and comment and option section  
  $scope.save = function(){

    DatabaseSrv.initLocalDB().then(function(initdb){


        var query = "SELECT * from property_feedback where item_id=? and type=?";
        var data = [$scope.sub_id, $scope.type ];

        DatabaseSrv.executeQuery(query, data ).then(function(result){
  
              if(result.status == 1 && result.data.rows.length > 0 ){

                query = "UPDATE property_feedback set option=?, comment=? where item_id=? and type=?";

                //we got data exists
                if($scope.type == 'SUB'){ //sub items details general items 
                  
                  data = [$scope.searchOptSelected, $scope.data.comment, $scope.sub_id,  $scope.type ];

                }
                else if($scope.type == 'METER'){

                  data = ['', $scope.data.comment, $scope.sub_id,  $scope.type ];
                }
                else{

                  data = [$scope.searchOptSelected, $scope.data.comment, $scope.sub_id,  $scope.type ];
                }
            
                  DatabaseSrv.executeQuery(query, data ).then(function(result){
                      
                    if($scope.newImages.length == 0 ){

                        if(result.status == 1 ){
                            
                            var alertPopup = $ionicPopup.alert({
                              title: 'Updated!',
                              template: 'Successfully Updated!'
                            });                         
                        }
                        else{

                            var alertPopup = $ionicPopup.alert({
                              title: 'Error!',
                              template: 'Something went wrong!'
                            });                  
                        }
                    }

                  });



                  if($scope.newImages.length > 0 ){

                    query = "INSERT INTO photos (photo_id, item_id, type, img_url) ";
                    query += " SELECT '"+ srvObjManipulation.generateUid()+"' as photo_id, '"+ $scope.sub_id +"' as item_id, '"+ $scope.type +"' as type, '"+ $scope.newImages[0].link +"' as img_url ";
                    
                    for(var i=1, l = $scope.newImages.length; i < l; i++ ){
                      query += " UNION ALL SELECT '"+ srvObjManipulation.generateUid()+"', '"+ $scope.sub_id +"', '"+ $scope.type +"', '"+ $scope.newImages[i].link +"' ";
                    }
                      
                    DatabaseSrv.executeQuery(query, []).then(function(result){
              
                        if(result.status == 1){
                          
                          var alertPopup = $ionicPopup.alert({
                            title: 'Saved!',
                            template: 'Successfully Saved!'
                          });

                        }
                        else{

                          var alertPopup = $ionicPopup.alert({
                            title: 'Error!',
                            template: 'Something went wrong!'
                          });
                  
                        }

                    });

                  }
               

              }
              else{
                // add new entry 
                query = "INSERT INTO property_feedback (prop_feedback_id, item_id, option, comment, type) VALUES (?,?,?,?,?)";

                if($scope.type == 'SUB'){ //sub items details general items 

                    data = [srvObjManipulation.generateUid(), $scope.sub_id, $scope.searchOptSelected , $scope.data.comment,  $scope.type  ];
                }
                else if($scope.type == 'METER'){

                    data = [srvObjManipulation.generateUid(), $scope.sub_id, '' , $scope.data.comment,  $scope.type  ];
                }
                else{

                     data = [srvObjManipulation.generateUid(), $scope.sub_id, $scope.searchOptSelected , $scope.data.comment,  $scope.type  ];
                }
            
                    DatabaseSrv.executeQuery(query, data ).then(function(result){
                        
                        if($scope.newImages.length == 0 ){

                          if(result.status == 1 ){
                              
                              var alertPopup = $ionicPopup.alert({
                                title: 'Saved!',
                                template: 'Successfully Saved!'
                              });
                             
                          }
                          else{

                              var alertPopup = $ionicPopup.alert({
                                title: 'Error!',
                                template: 'Something went wrong!'
                              });
                      
                          }

                        }

                    });


                    if($scope.newImages.length > 0 ){ // this is where get insert new images database

                        query = "INSERT INTO photos (photo_id, item_id, type, img_url) "; 
                        query += " select '"+ srvObjManipulation.generateUid()+"' as photo_id, '"+ $scope.sub_id +"' as item_id, '"+ $scope.type +"' as type, '"+ $scope.newImages[0].link +"' as img_url ";
                        
                        for(var i=1, l = $scope.newImages.length; i < l; i++ ){
                          query += " UNION ALL SELECT '"+ srvObjManipulation.generateUid()+"', '"+ $scope.sub_id +"', '"+ $scope.type +"', '"+ $scope.newImages[i].link +"' ";
                        }
                          
                        DatabaseSrv.executeQuery(query, [] ).then(function(result){
                  
                            if(result.status == 1){
                              
                              var alertPopup = $ionicPopup.alert({
                                title: 'Saved!',
                                template: 'Successfully Saved!'
                              });

                            }
                            else{

                              var alertPopup = $ionicPopup.alert({
                                title: 'Error!',
                                template: 'Something went wrong!'
                              });
                      
                            }

                        });

                    }                

              }

        }); // select man

        

        if($scope.type == 'METER'){

            query = "UPDATE property_meter_link set reading_value=? where prop_meter_id=?";
            data = [ $scope.data.reading_value, $scope.sub_id ];

            DatabaseSrv.executeQuery(query, data ).then(function(result){
                
              if($scope.newImages.length == 0 ){

                  if(result.status == 1 ){

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
appCtrl.controller('RecordSoundCtrl', function($scope, $state, $stateParams, commonSrv, $log, $ionicPopup, DatabaseSrv, $ionicModal, $ionicPopup, srvObjManipulation){
    
  $scope.sound = {name: ""};
  $scope.sound.file = '';
  $scope.sound.filePath = '';

  $scope.sounds = [];
  $scope.prop_subitem_id = '';

  var media = null;

    $scope.$on('$ionicView.beforeEnter', function() {

      $scope.sound = {name: ""};
      $scope.sound.file = '';
      $scope.sound.filePath = '';

      $scope.sounds = [];

      $scope.prop_subitem_id = $stateParams.prop_subitem_id;
    
      initLoadData();   

  });


  // init function man
  function initLoadData(){

      DatabaseSrv.initLocalDB().then(function(initdb){

          var query = "select property_sub_voice_general.* from property_sub_voice_general where property_sub_voice_general.item_id =?";

          var data = [$scope.prop_subitem_id];
      
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

              var query = "INSERT INTO property_sub_voice_general (prop_sub_feedback_general_id, item_id, voice_name, voice_url ) VALUES (?,?,?,?)";
              var pro_feed_id = srvObjManipulation.generateUid();
              var data = [pro_feed_id, $scope.prop_subitem_id,  $scope.sound.name, $scope.sound.file ];
                DatabaseSrv.executeQuery(query, data ).then(function(result){
        
                    if(result.status == 1){
                        
                        var alertPopup = $ionicPopup.alert({
                          title: 'Saved!',
                          template: 'Successfully Saved!'
                        });

                        $scope.sounds.push({ prop_sub_feedback_general_id: pro_feed_id, item_id: $scope.prop_subitem_id, voice_name: $scope.sound.name, voice_url: $scope.sound.file, play: true });

                        $log.log($scope.sounds);
                        
                    }
                    else{

                        var alertPopup = $ionicPopup.alert({
                          title: 'Error!',
                          template: 'Something went wrong!'
                        });
                
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