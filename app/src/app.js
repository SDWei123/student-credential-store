//Introduce the required library functions and APIs.
import "./app.css";
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'
import ecommerce_store_artifacts from '../../client/src/contracts/CredentialStore.json'
import UserloginInfo_artifacts from '../../client/src/contracts/UserloginInfo.json'
var CredentialStore = contract(ecommerce_store_artifacts);
var UserloginInfo = contract(UserloginInfo_artifacts);
const ipfsAPI = require('ipfs-api');
const ipfs = ipfsAPI({host: 'localhost', port: '5001', protocol: 'http'});
const crypto = require("crypto");

window.App = {
 start: function() {
 var self = this;
 CredentialStore.setProvider(web3.currentProvider);
 UserloginInfo.setProvider(web3.currentProvider);

 getTotalStd();

 //Response function, which is triggered when the picture input box (the 'add student' page and 'browse information' page) changes.
 var reader;
 $("#certi-image").change(function(event) {
    console.log("choose pictures");
    //Read the image information into the Reader container.
    const file = event.target.files[0]
    reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
 });

 //The search content box cannot be input when a user selects the 'students added by this school' option.
 $("#search-area").change(function(){
  var sel=$("#search-area").val();
  if(sel=="4"){
    document.getElementById("search-info").disabled=true;
    document.getElementById("search-info").value="";
  }else{
    document.getElementById("search-info").disabled=false;
  }
  
 });

 //The response function of the form for adding student information'.
 $("#add-item-to-store").submit(function(event) {
  //Get form parameters (the student information that the user fills in).
  const req = $("#add-item-to-store").serialize();
  let params = JSON.parse('{"' + req.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
  let decodedParams = {}
  Object.keys(params).forEach(function(v) {
  decodedParams[v] = decodeURIComponent(decodeURI(params[v]));
  });
  //Call this function to process the student information that the user fills in.
   savenewStudentInfo(reader, decodedParams);
  event.preventDefault();
  });

  //The response function of the form for searching.
$("#search-studentInfo").submit(function(event) {
  //Get form parameters (the searching content and conditions that the user fills in).
  const req = $("#search-studentInfo").serialize();
  console.log(req);
  let params = JSON.parse('{"' + req.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
  let decodedParams = {};
  Object.keys(params).forEach(function(v) {
  decodedParams[v] = decodeURIComponent(decodeURI(params[v]));
  });
  //Get the school name that the user chooses to search in.
  var searchschool=$("#search-school-name").find("option:selected").text();
  alert("You are using the search function, please click the ok button and wait for a while！")
  searchStdInfo(searchschool,decodedParams);
  event.preventDefault();
  });

//This response function is executed when the system page jumps to the page 'Browsing detailed information about the student'.
if ($("#student-desc").length > 0) {
  console.log($("#product-desc"));
  //Get the student index sent through the URL which corresponds to the button 'Show details' in the student information overview box that the user clicks.
  let studentId = (new URLSearchParams(window.location.search).get('Id'));
  console.log(studentId);
  //Call the function that displays the student details.
  Showstddetail(studentId);
 };

//The response function for dynamically adding searched schools in select controls.
 if ($("#search-condition").length > 0) {
      addSclOptionToSelect()
 };

//The response function for deleting the student information (Remain the student Index).
$("#btdelete").click(function(){
  alert("The student information will be deleted!");
  //Gets the index of the student to delete.
  var deleteId=$("#student-id").attr("value");
  let account=web3.eth.accounts.currentProvider.selectedAddress;
  let lgaddr=sessionStorage.getItem('account-address');
  //Call the contract function to delete the student information structure stored on the blockchain.
    CredentialStore.deployed().then(function(i) {
      i.deleteStudentInfo(deleteId,{from:account}).then(function(f) {
        console.log(f)
        alert("The information have been successfully deleted");
        window.location.href='mainpage.html'
    })});

});

//The response function which are triggered when the user clicks the button 'Change this student’s information'. 
$("#buchange").click(async function(){
  alert("Please modify the information on the current page.");
  //HTML element controls on the page 'Browsing detailed information about the student' become editable.
$("#student-name").removeAttr("readonly");
$("#student-num").removeAttr("readonly");
$("#student-major").removeAttr("readonly");
$("#degree-type").removeAttr("disabled");
$("#average-grade").removeAttr("disabled");
$("#academic-performance").removeAttr("disabled");
$("#gender-condition").removeAttr("disabled");
$("#student-description").removeAttr("readonly");
//Some controls for resetting partial student information are displayed on the page.
$("#msg4").show();
document.getElementById("lab1").style.display= "inline"; 
document.getElementById("msg5").style.display= "inline"; 
$("#lab2").show();
document.getElementById("msg6").style.display= "inline"; 
$("#lab3").show();
});                 

//The response function for logging out.
$("#log-out").click(function(){
  alert("The account has logged out!");
  window.location.href='index.html';
  //Use Session API to erase the current account information stored in the Session.
  sessionStorage.setItem('user',"");
  sessionStorage.setItem('account-type',"");
  sessionStorage.setItem('account-address',"");
  sessionStorage.setItem('schorcomname',"");
  sessionStorage.setItem('useractype',"");
});

//The response function for avoiding duplicate registration (active).
$("#find-user").click(function(){
  var username1=document.getElementById("user-name1").value;
  checkUser(username1);
});

//The response function for sorting function.
$("#sort-method-form").submit(function(event) {
  //Parse form parameters
  const req = $("#sort-method-form").serialize();
  let params = JSON.parse('{"' + req.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
  let decodedParams = {};
  Object.keys(params).forEach(function(v) {
  decodedParams[v] = decodeURIComponent(decodeURI(params[v]));
  });
  //console.log(decodedParams);
  if(decodedParams["sort-method"]=="name-ascending"){
    var flag=0;
    sortByName(flag);
  }else if(decodedParams["sort-method"]=="name-descending"){
    var flag=1;
    sortByName(flag);
  }else if(decodedParams["sort-method"]=="gratime-ascending"){
    var flag=0;
    sortByGraTime(flag);
  }else if(decodedParams["sort-method"]=="gratime-descending"){
    var flag=1;
    sortByGraTime(flag);
  }else if(decodedParams["sort-method"]=="grade-ascending"){
    var flag=0;
    sortByGrade(flag);
  }else{
    var flag=1;
    sortByGrade(flag);
  }
  event.preventDefault();
  });

  //The response function for altering the student information.
$("#alter-student-in-store").submit(function(event) {
  //Parse form parameters.
    const req = $("#alter-student-in-store").serialize();
    let params = JSON.parse('{"' + req.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
    let decodedParams = {}
    Object.keys(params).forEach(function(v) {
    decodedParams[v] = decodeURIComponent(decodeURI(params[v]));
    });
    console.log(decodedParams);
    var fileInput = $('#certi-image').get(0).files[0];
    console.log(fileInput);
    //Determine if a new image has been uploaded. 
    if(fileInput){
      //If uploaded a new image, store it to the IPFS.
      saveImageOnIpfs(reader).then(function(idn1) {
        let imagenewId,descnewId;
        imagenewId = idn1;
        //Upload the large-text description to the IPFS as well.
        saveTextBlobOnIpfs(decodedParams["student-description"]).then(function(idn2) {
          descnewId = idn2;
          //Call a function to modify the student information on the blockchain.
          AlterStudentInfoToBlockchain(decodedParams, imagenewId, descnewId);
         });
      });
    } else{
      //Without uploading a new image.
      saveTextBlobOnIpfs(decodedParams["student-description"]).then(function(idn2) {
        let imagenewId,descnewId;
        descnewId = idn2;
        var imagesrc=$("#credential-showimage").attr("src");
        imagenewId = imagesrc.substring(27);
        AlterStudentInfoToBlockchain(decodedParams, imagenewId, descnewId);
       });
    }
    event.preventDefault();
    });

    //The response function for login function.
    $("#login-page").submit(function(event) {
      //Parse form parameters.
      const req = $("#login-page").serialize();
      let params = JSON.parse('{"' + req.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
      let decodedParams = {};
      Object.keys(params).forEach(function(v) {
      decodedParams[v] = decodeURIComponent(decodeURI(params[v]));
      });
      //Realize login verification and account information storage
      userVerify(decodedParams);
      //window.location.href='mainpage.html'
      event.preventDefault();
      });


      //The response function for the registration of the administrative account.
      $("#adminregister-page").submit(function(event) {
        //Parse form parameters.
        const req = $("#adminregister-page").serialize();
        let params = JSON.parse('{"' + req.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
        let decodedParams = {};
        Object.keys(params).forEach(function(v) {
        decodedParams[v] = decodeURIComponent(decodeURI(params[v]));
        });
        console.log(decodedParams);
        //Process the password after two password inputs are consistent.
        if (decodedParams["pwd2"]==decodedParams["repwd1"]){
          let adminname=decodedParams["user-name1"];
          //Use the built-in SHA-1 library functions to dispose password.
          let ecpwd = crypto.createHash('sha1').update(decodedParams["pwd2"]).digest('hex');
          // console.log(ecpwd);
          let accounttype=1;
          //The school name matches the username.
          var schcomname=decodedParams["user-name1"];
          //console.log(ecpwd);
          //Store newly registered user information into a new user account information structure on the blockchain.
          saveNewUseronChain(adminname, ecpwd, schcomname, accounttype, accounttype)
        }else{
          alert("These two inputted passwords do not match. Please re-enter them.");
          document.getElementById("pwd2").value= "";
          document.getElementById("repwd1").value= "";
        }
        event.preventDefault();
        });

      //The response function for the registration of the normal account.
      $("#register-page").submit(function(event) {
        //Parse form parameters.
        const req = $("#register-page").serialize();
        let params = JSON.parse('{"' + req.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
        let decodedParams = {};
        Object.keys(params).forEach(function(v) {
        decodedParams[v] = decodeURIComponent(decodeURI(params[v]));
        });
        console.log(decodedParams);
        //Process the password after two password inputs are consistent.
        if (decodedParams["pwd1"]==decodedParams["repwd"]){
          let username=decodedParams["user-name1"];
          //Use the built-in SHA-1 library functions to dispose password.
          let ecpwd = crypto.createHash('sha1').update(decodedParams["pwd1"]).digest('hex');
          if(decodedParams["account-type1"]=="students"){
             var useractp=0;
          }else{
            useractp=1;
          }
          let accounttype=0;
          var schcomname=decodedParams["schorcomname"];
          //console.log(ecpwd);
          //Store newly registered user information into a new user account information structure on the blockchain.
          saveNewUseronChain(username, ecpwd, schcomname, accounttype,useractp)
        }else{
          alert("These two inputted passwords do not match. Please re-enter them.");
          document.getElementById("pwd1").value= "";
          document.getElementById("repwd").value= "";
        }
        event.preventDefault();
        }); 

        //The response function for multi-conditional filtering function.
        $("#Multidata-filtering").submit(function(event) {
          //Parse form parameters.
          const req = $("#Multidata-filtering").serialize();
          let params = JSON.parse('{"' + req.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
          let decodedParams = {};
          Object.keys(params).forEach(function(v) {
          decodedParams[v] = decodeURIComponent(decodeURI(params[v]));
          });
          console.log(decodedParams);
          //Filter students by conditions.
          Filterstudent(decodedParams);
          event.preventDefault();
          });
        
          //The response function for returning to the home page.
          $("#btback").click(function(){
            alert("The page will be returned to Homepage!");
            window.location.href='mainpage.html'
          });
 }
};

//Filter students by conditions.
async function Filterstudent(decodedParams){
   //Processing time parameter (Convert to integer parameters).
   if(decodedParams["before-date"]!=""){
    var beforetime=Date.parse(decodedParams["before-date"]) / 1000;
  } else {
    var beforetime=Math.round(new Date() / 1000);
  }
  if(decodedParams["gender-filter"]=="Male"){
    var gendercon=0;
  }else{
    var gendercon=1;
  }
  // console.log(beforetime);
  var filcounter=0;
  window.filterstd=[];
  window.sortstd=[];
  let stdnum=window.studentInfo.length;
  //The global object arrays obtained in the search function are judged and filtered by multiple conditions.
  for(var i=0;i<stdnum;i++){
    if (beforetime>=window.studentDetail[i][3] && decodedParams["academicper"]==window.studentAcademic[i][1] && decodedParams["student-detype"]==window.studentInfo[i][4] && gendercon==window.studentInfo[i][5]){
      filterstd.push(window.studentInfo[i]);
      filcounter++;
    }
  }
  //Get all filtered objects.
  if(window.filterstd.length>0){
    alert(filcounter+"results have been filtered to fit the criteria, please see searchresults");
    $("#sercount").html(filcounter);
    //The 'Searched Results' list is cleared and redisplayed.
    $("#search-list").html("");
    for(var k=0;k<filterstd.length;k++){
      const CredentialStoreInstance=await CredentialStore.deployed();
      var gratime=await CredentialStoreInstance.getStudentDetails.call(filterstd[k][0]);
      var grade=await CredentialStoreInstance.getStudentGrades.call(filterstd[k][0]);
      var gradeper=await CredentialStoreInstance.getStudentGrades.call(filterstd[k][0]);
      $("#search-list").append(buildStudent(filterstd[k],gratime[3],grade[0],gradeper[1]));
      window.sortstd.push(filterstd[k][0]);
    }
    if(window.filterstd.length>1){
      //Display controls for the sorting function.
      $("#sort-button").attr("style","background-color:#DCDCDC; display:flex; justify-content:center;");
    }else{
      $("#sort-button").attr("style","display:none;");
    }
  }else{
    alert("There are no students who meet the requirements. Please re-filter the students by other conditions.");
    $("#search-list").html("");
    $("#sercount").html(filcounter);
  }
  //console.log(window.filterstd);
}

//Sort search results by score.
async function sortByGrade(flag){
  //console.log(flag);
  const CredentialStoreInstance=await CredentialStore.deployed();
  var sortobjgrp=[];
  //Select specific elements to form a new array of objects.
  for(var i=0; i<window.sortstd.length;i++){
    var stdid=await CredentialStoreInstance.getStudentInfo.call(window.sortstd[i]);
    var stdgrade=await CredentialStoreInstance.getStudentGrades.call(window.sortstd[i]);
    sortobjgrp.push({id:stdid[0], grade:stdgrade[0]});
  }
  
  if(flag==0){
    //Sort the new array of objects.
    var sortObj = sortobjgrp.sort(compareac("grade"));
    // console.log(sortObj);
    $("#search-list").html("");
    var num=sortObj.length;
    //According to the first element's value, sequently query and output to complete the sorting function.
    for(var k=0;k<num;k++){
      const CredentialStoreInstance=await CredentialStore.deployed();
      var p=await CredentialStoreInstance.getStudentInfo.call(sortObj[k]["id"]);
      var gratime=await CredentialStoreInstance.getStudentDetails.call(p[0]);
      var grade=await CredentialStoreInstance.getStudentGrades.call(p[0]);
      var gradeper=await CredentialStoreInstance.getStudentGrades.call(p[0]);
      $("#search-list").append(buildStudent(p,gratime[3],grade[0],gradeper[1]));
    }
  }else{
    var sortObj = sortobjgrp.sort(comparede("grade"));
  // console.log(sortObj);
  $("#search-list").html("");
  var num=sortObj.length;
  for(var k=0;k<num;k++){
    const CredentialStoreInstance=await CredentialStore.deployed();
    var p=await CredentialStoreInstance.getStudentInfo.call(sortObj[k]["id"]);
    var gratime=await CredentialStoreInstance.getStudentDetails.call(p[0]);
    var grade=await CredentialStoreInstance.getStudentGrades.call(p[0]);
    var gradeper=await CredentialStoreInstance.getStudentGrades.call(p[0]);
    $("#search-list").append(buildStudent(p,gratime[3],grade[0],gradeper[1]));
  }
  }
}

//Sort by the graduation time.
async function sortByGraTime(flag){
  const CredentialStoreInstance=await CredentialStore.deployed();
  var sortobjgrp=[];
  //Select specific elements (information) to form a new array of objects.
  for(var i=0; i<window.sortstd.length;i++){
    var stdid=await CredentialStoreInstance.getStudentInfo.call(window.sortstd[i]);
    var stdgradutime=await CredentialStoreInstance.getStudentDetails.call(window.sortstd[i]);
    sortobjgrp.push({id:stdid[0], gradutime:stdgradutime[3]});
  }
  
  if(flag==0){
   //Sort the new array of objects.
    var sortObj = sortobjgrp.sort(compareac("gradutime"));
   //console.log(sortObj);
    $("#search-list").html("");
   //According to the first element's value, sequently query and output to complete the sorting function.
  for(var k=0;k<sortObj.length;k++){
    const CredentialStoreInstance=await CredentialStore.deployed();
    var p=await CredentialStoreInstance.getStudentInfo.call(sortObj[k]["id"]);
    var gratime=await CredentialStoreInstance.getStudentDetails.call(p[0]);
    var grade=await CredentialStoreInstance.getStudentGrades.call(p[0]);
    var gradeper=await CredentialStoreInstance.getStudentGrades.call(p[0]);
    $("#search-list").append(buildStudent(p,gratime[3],grade[0],gradeper[1]));
  }
  }else{
    //Display in descending order 
    var sortObj = sortobjgrp.sort(comparede("gradutime"));
  //console.log(sortObj);
  $("#search-list").html("");
  for(var k=0;k<sortObj.length;k++){
    const CredentialStoreInstance=await CredentialStore.deployed();
    var p=await CredentialStoreInstance.getStudentInfo.call(sortObj[k]["id"]);
    var gratime=await CredentialStoreInstance.getStudentDetails.call(p[0]);
    var grade=await CredentialStoreInstance.getStudentGrades.call(p[0]);
    var gradeper=await CredentialStoreInstance.getStudentGrades.call(p[0]);
    $("#search-list").append(buildStudent(p,gratime[3],grade[0],gradeper[1]));
  }
  }
}

//Sort by name
async function sortByName(flag){
  const CredentialStoreInstance=await CredentialStore.deployed();
  var sortobjgrp=[];
  //Select specific elements (information) to form a new array of objects.
  for(var i=0; i<window.sortstd.length;i++){
    var stdinfo=await CredentialStoreInstance.getStudentInfo.call(window.sortstd[i]);
    sortobjgrp.push({id:stdinfo[0], stdname:stdinfo[2]});
  }
  //Sort by name and display each student information overview box.
  // console.log(sortobjgrp);
  if(flag==0){
    var sortObj=[];
    sortObj = sortobjgrp.sort(comparenameac("stdname"));
    $("#search-list").html("");
   for(var k=0;k<sortObj.length;k++){
    var p=await CredentialStoreInstance.getStudentInfo.call(sortObj[k]["id"]);
    var gratime=await CredentialStoreInstance.getStudentDetails.call(p[0]);
    var grade=await CredentialStoreInstance.getStudentGrades.call(p[0]);
    var gradeper=await CredentialStoreInstance.getStudentGrades.call(p[0]);
    $("#search-list").append(buildStudent(p,gratime[3],grade[0],gradeper[1]));
   }
  }else{
    var sortObj=[];
    sortObj = sortobjgrp.sort(comparenamede("stdname"));
    $("#search-list").html("");
    for(var k=0;k<sortObj.length;k++){
      const CredentialStoreInstance=await CredentialStore.deployed();
      var p=await CredentialStoreInstance.getStudentInfo.call(sortObj[k]["id"]);
      var gratime=await CredentialStoreInstance.getStudentDetails.call(p[0]);
      var grade=await CredentialStoreInstance.getStudentGrades.call(p[0]);
      var gradeper=await CredentialStoreInstance.getStudentGrades.call(p[0]);
      $("#search-list").append(buildStudent(p,gratime[3],grade[0],gradeper[1]));
    }
  }
}

//Comparison of numbers 
function compareac(property){
  return function(obj1,obj2){
      var value1 = obj1[property];
      var value2 = obj2[property];
      return value1 - value2;     //ascending order
  }
}

//Comparison of numbers
function comparede(property){
  return function(obj1,obj2){
      var value1 = obj1[property];
      var value2 = obj2[property];
      return value2 - value1;     //descending order 
  }
}

//Comparison of strings 
function comparenameac(property){
  return function(obj1,obj2){
      var value1 = obj1[property].toUpperCase();
      var value2 = obj2[property].toUpperCase();
      //ascending order
      if(value1<value2){
        return -1;
      }else{
        return 1;
      }
  }
}

//Comparison of strings
function comparenamede(property){
  return function(obj1,obj2){
      var value1 = obj1[property].toUpperCase();
      var value2 = obj2[property].toUpperCase();
      //descending order 
      if(value1<value2){
        return 1;
      }else{
        return -1;
      }
  }
}

//Login judgment
async function userVerify(params){
   console.log(params);
   let accounttype1
   if(params["account-type"]=="user"){
    accounttype1=0;
   }else{
    accounttype1=1;
   }
   //Go through all studnet information structures to find this user name.
   const UserloginInfoInstance=await UserloginInfo.deployed();
   const usernum=await UserloginInfoInstance.userIndex();
   var flag=0;
   var k=1;
   var obj;
   while(k<=usernum){
    obj=await UserloginInfoInstance.getUserInfo.call(k);
    //console.log(obj);
    if(params["user-name"]==obj[0]){
       flag++;
       break;
    }
    k++;
   }
   //console.log(obj);
   let curact=web3.eth.accounts.currentProvider.selectedAddress;
   if(flag==0){
     alert("The user are not found. Please register.")
   }else{
    if (!curact){
      alert("Currently Metamask wallet is not logged in. Please log an Ethereum external account into this wallet.")
    }else{
    //The password entered by the user is hashed and compared with the password hash stored on the blockchian.
    var ecinputpwd=crypto.createHash('sha1').update(params["pwd"]).digest('hex');
    if(ecinputpwd==obj[1]){
      if(accounttype1==parseInt(obj[3])){
        //After successful login, Session API is used to store user account information into the Session.
        alert("Login successfully!");
        window.location.href='mainpage.html';
        sessionStorage.setItem('user',obj[0]);
        sessionStorage.setItem('account-type',accounttype1);
        sessionStorage.setItem('account-address',curact);
        sessionStorage.setItem('schorcomname',obj[2]);
        sessionStorage.setItem('useractype',obj[4]);
      }else{
       alert("Wrong account type!");
      }
    }else{
      alert("Password input error!");
    }
   }
  }
}

//Check to see if the user name already exists when registering
async function checkUser(username1){
  const UserloginInfoInstance=await UserloginInfo.deployed();
  const usernum1=await UserloginInfoInstance.userIndex();
  var flag2=0;
  var obj2;
  //Query each user account information structure in the back-end storage framework and determine whether the user name exists.
  for(var i=1; i<=usernum1;i++){
    obj2=await UserloginInfoInstance.getUserInfo.call(i);
    if(username1==obj2[0]){
      flag2++;
    }
  }

  if(flag2!=0){
    alert("The account already exists. Please register again with a new name!");
  }else{
    alert("The account can be registered");
  }
}

//The function which dynamically add searched schools in select controls
async function addSclOptionToSelect(){
  const UserloginInfoInstance=await UserloginInfo.deployed();
  const usernum1=await UserloginInfoInstance.userIndex();
  var objgroup=[];
  //First, all administrator accounts (school names) are read from the back-end blockchain.
  for(var i=1; i<=usernum1;i++){
    var obj1=await UserloginInfoInstance.getUserInfo.call(i);
    if (obj1[3]=="1"){
      objgroup.push(obj1);
    }
  }
  var objnum=objgroup.length;
  //console.log(objgroup[0][0]);
  //Dynamically add these school names in select controls
  if(objgroup!=null){
    for(var i=0;i<objnum;i++){
      $("#search-school-name").append("<option value="+objgroup[i][0]+">"+objgroup[i][0]+"</option>");
      console.log(objgroup[i][0]);
      $("#search-school-name option[index='0']").selected='selected';
    }
  }
}

//Store the newly added user information on the blockchain.
async function saveNewUseronChain(username, ecpwd, schcomname, accounttype, useractype){
  const UserloginInfoInstance=await UserloginInfo.deployed();
  const usernum1=await UserloginInfoInstance.userIndex();
  var flag=0;
  var obj1;
  //First determine if the user name exists.
  for(var i=1; i<=usernum1;i++){
    obj1=await UserloginInfoInstance.getUserInfo.call(i);
    if(username==obj1[0]){
      flag++;
    }
  }

  if(flag!=0){
    alert("The account already exists. Please register again with a new name!");
  }else{
    //Use the truffle-contract API to call contract functions to add the user account information to the back-end blockchain.
    let account=web3.eth.accounts.currentProvider.selectedAddress;
    UserloginInfo.deployed().then((i)=>{
    i.addUser(username, ecpwd, schcomname, accounttype, useractype,{from:account}).then((f)=>{
      console.log(f);
      alert("You have successfully registered, please login!");
      //Page jump to the home page.
      window.location.href='index.html'
    })
  });
 }
  
}

//Modify the student information stored on the blockchain (student information structure).
async function AlterStudentInfoToBlockchain(params, imagenewId, descnewId){
  console.log(params["student-id"]);
  let newstarttime, newfinishtime;
  //Converts time variables to integer variables.
  if(params["starttimeset"]==""){
    newstarttime=Date.parse(params["starttime"]) / 1000;
  } else {
    newstarttime=Date.parse(params["starttimeset"]) / 1000;
  }
  if(params["finishtimereset"]==""){
    newfinishtime=Date.parse(params["finishtime"]) / 1000;
  } else {
    newfinishtime=Date.parse(params["finishtimereset"]) / 1000;
  }
  let current_time = Math.round(new Date() / 1000);
  let account=web3.eth.accounts.currentProvider.selectedAddress;
  var lguser=sessionStorage.getItem('user');
  var lgaddress=sessionStorage.getItem('account-address');
  var avggrade=parseInt(params["average-grade"]);
  //Validity judgment of input information
  if(newstarttime>=newfinishtime){
    alert("The date of graduation is prior to the commencement of the degree. Please enter a valid time.");
  }else if(newfinishtime<=current_time){
    //Use the truffle-contract API to call the contract function to modify the student information on the blockchain.
      alert("The modification needs to be paid twice with metamask.");
      const CredentialStoreInstance=await CredentialStore.deployed();
      await CredentialStoreInstance.changeStudentInfo1(params["student-id"], params["student-num"], params["student-name"], params["student-major"], params["degree-type"], imagenewId, descnewId, newstarttime, newfinishtime, avggrade, {from:account});
      await CredentialStoreInstance.changeStudentInfo2(params["student-id"], params["academic-performance"], parseInt(params["gender-condition"]), current_time, {from:account});
      alert("Your information was successfully changed");
      window.location.href="studentInfo.html?Id=" + params["student-id"];
  }else{ 
    alert("Graduation time cannot be later than the current time, please re-enter.");
  } 
}


function getTotalStd(){
  CredentialStore.deployed().then(function(i) {
    i.studentnum().then((stnumber)=>{
      // console.log("total students:"+stnumber);
      $("#total-students").html("Total students stored in this system:" + stnumber);
     });
    });
};

//Search for the student information.
async function searchStdInfo(searchschool,decodedParams) {
  let serarea=decodedParams["search-area"];
  let sercont=decodedParams["search-info"];
  let lgaddr=sessionStorage.getItem('account-address');
  if(serarea=="4"){
    //Displays all student information stored under the currently logged admintrative account (school).
    window.studentInfo=[];
    window.studentDetail=[];
    window.studentAcademic=[];
    window.sortstd=[];
    $('#search-list').html("");
    // var stdsergrp=[];
    let serschname=searchschool;
    console.log(serschname);
    //Gets the number of all students stored in the back-end blockchain.
    const CredentialStoreInstance=await CredentialStore.deployed();
    const studentnum=await CredentialStoreInstance.studentIndex();
    var count=0;
    //Traverses and displays information about all students under the name of the school
   for(var k=1; k<=studentnum; k++){
     //Use the truffle-contract API to call the search function in the contract.
    var p=await CredentialStoreInstance.searchStudentInfo.call(serschname,k);
    if(p[1]!=""){
      var objstdInfo=await CredentialStoreInstance.getStudentInfo.call(p[0]);
      var gratime=await CredentialStoreInstance.getStudentDetails.call(objstdInfo[0]);
      var grade=await CredentialStoreInstance.getStudentGrades.call(objstdInfo[0]);
      var gradeper=await CredentialStoreInstance.getStudentGrades.call(objstdInfo[0]);
      $("#search-list").append(buildStudent(objstdInfo,gratime[3],grade[0],gradeper[1]));
      var objstddetail=await CredentialStoreInstance.getStudentDetails.call(objstdInfo[0]);
      var objstdAcademic=await CredentialStoreInstance.getStudentGrades.call(objstdInfo[0]);
      window.sortstd.push(objstdInfo[0]);
      //The student information that meets the requirements is put into the global object array for the filtering and sorting function of the system.
      studentInfo.push(objstdInfo);
      studentDetail.push(objstddetail);
      studentAcademic.push(objstdAcademic);
      //Count the number of students searched.
      count++;
    }
   }
   if(count>1){
    $("#sort-button").attr("style","background-color:#DCDCDC; display:flex; justify-content:center;");
    $("#search-condition2").attr("style","background-color:#DCDCDC; display:flex; justify-content:center;");
    alert(count+"results were totally found.");
    $("#sercount").html(count);
   }else if(count==1){
    alert("Find a qualified student.");
    $("#sercount").html(count);
   }else{
    alert("No qualified students found, please search again");
   }
  }else{
    //When users choose other schools, searching students according to the search information and schools input by them.
    $('#search-list').html("");
    let serschname=searchschool;
    const CredentialStoreInstance=await CredentialStore.deployed();
    const studentnum=await CredentialStoreInstance.studentIndex();
    //The student information that meets the requirements is put into three global arrays of objects for the filtering and sorting function of the system.
    
  window.studentInfo=[];
  window.studentDetail=[];
  window.studentAcademic=[];
  window.sortstd=[];
  var count=0;
  for(var k=1; k<=studentnum; k++){
    //Use the truffle-contract API to call the search function in the contract.
    var p=await CredentialStoreInstance.searchStudentInfo.call(serschname,k);
    //Realize the fuzzy search (the regular expression matching test method in JavaScript, case-insensitive).
    var str = p[serarea];
    var patt1 = new RegExp(sercont,"i");
    var result = patt1.test(str);
    if(result==true){
      //Output the student information found and store the details in three global arrays of objects (used in filtering and sorting system functions).
      var objstdInfo=await CredentialStoreInstance.getStudentInfo.call(p[0]);
      var objstddetail=await CredentialStoreInstance.getStudentDetails.call(p[0]);
      var objstdAcademic=await CredentialStoreInstance.getStudentGrades.call(p[0]);
      var gratime=await CredentialStoreInstance.getStudentDetails.call(objstdInfo[0]);
      var grade=await CredentialStoreInstance.getStudentGrades.call(objstdInfo[0]);
      var gradeper=await CredentialStoreInstance.getStudentGrades.call(objstdInfo[0]);
      $("#search-list").append(buildStudent(objstdInfo,gratime[3],grade[0],gradeper[1]));
      window.sortstd.push(objstdInfo[0]);
      studentInfo.push(objstdInfo);
      studentDetail.push(objstddetail);
      studentAcademic.push(objstdAcademic);
      count++;
    }
  }
  if(count>1){
    $("#sort-button").attr("style","background-color:#DCDCDC; display:flex; justify-content:center;");
    $("#search-condition2").attr("style","background-color:#DCDCDC; display:flex; justify-content:center;");
    $("#sercount").html(count);
    alert(count+"results were totally found.");
  }else if(count==1){
   alert("Find a qualified student.");
   $("#sercount").html(count);
  }else{
   alert("No qualified students found, please search again.");
  }
 }
}


//Self-encapsulated promise function that uploads images to the IPFS.
function saveImageOnIpfs(reader) {
  return new Promise(function(resolve, reject) {
  const buffer = Buffer.from(reader.result);
  //IPFS API (upload files).
  ipfs.add(buffer)
  .then((response) => {
  console.log(response)
  resolve(response[0].hash);
  }).catch((err) => {
  // When the upload fails, the browser debug window prints an error message.
  console.error(err)
  reject(err);
  })
  })
}

//Self-encapsulated promise function that upload the large-text description to the IPFS.
function saveTextBlobOnIpfs(blob) {
  return new Promise(function(resolve, reject) {
  const descBuffer = Buffer.from(blob, 'utf-8');
  //IPFS API (upload files).
  ipfs.add(descBuffer)
  .then((response) => {
  console.log(response)
  resolve(response[0].hash);
  }).catch((err) => {
  // When the upload fails, the browser debug window prints an error message.
  console.error(err)
  reject(err);
  })
  })
}

function savenewStudentInfo(reader, decodedParams){
  let imageId, descId;
  //Two promise functions are called to upload some information to the IPFS.
  saveImageOnIpfs(reader).then(function(id1) {
  imageId = id1;
  saveTextBlobOnIpfs(decodedParams["student-description"]).then(function(id2) {
    descId = id2;
    saveStudentInfoToBlockchain(decodedParams, imageId, descId);
   })
});

}

//Store other information and hash addresses from the IPFS to the blockchain.
function saveStudentInfoToBlockchain(params, imageId, descId) {
    //Converts time parameters to integer variables.
    let starttime = Date.parse(params["starttime"]) / 1000;
    let finishtime= Date.parse(params["finishtime"]) / 1000;
    let current_time = Math.round(new Date() / 1000);
    var avggrade=parseInt(params["average-grade"]);
    var lguser=sessionStorage.getItem('user');
    var lgaddress=sessionStorage.getItem('account-address');
    //console.log(params["student-school"]);
    // console.log(account);
    let account=web3.eth.accounts.currentProvider.selectedAddress;
    //Judge the rationality of input time parameters
    if(starttime>=finishtime){
        alert("The date of graduation is prior to the commencement of the degree. Please enter a valid time.");
      }else if(finishtime>current_time){
        alert("Graduation time cannot be longer than the current time, please re-enter.");
      }else{
        //Use the truffle-contract API to call the relevant contract function to add to the back-end blockchain.
          CredentialStore.deployed().then(function(i) {
          i.addStudentToStore(params["student-num"], params["student-name"], lguser, params["degree-type"], imageId, 
          descId, starttime, finishtime, avggrade, params["academic-performance"], parseInt(params["gender-condition"]), 
          params["student-major"], current_time, {from:account}).then(function(f) {
            console.log(f)
            alert("This student information is successfully added to this store!");
            window.location.href="mainpage.html";
            })});   
      }
}


//Construction of the student overview information box.
function buildStudent(student,gratime,grade,gradeper) {
    //console.log("buildProduct");
    let node = $("<div/>");
    node.addClass("col-sm-3 text-center col-margin-bottom-1");
    node.append("<div>" +"Certificate ID:"+student[1] + "</div>");
    node.append("<div>" +"Student Name:"+ student[2] + "</div>");
    node.append("<div>" + "Graduated School:" +student[3] + "</div>");
    node.append("<div>" + "Degree Level:" +student[4] + "</div>");
    if(student[5]==0)
    {
      node.append("<div>" + "Gender: Male" + "</div>");
    }else{
      node.append("<div>" + "Gender: Female" +"</div>");
    }
    node.append("<div>" + "Studeng Major:" +student[6] + "</div>");
    node.append("<div>" + "Graduation Time:" +new Date(gratime * 1000) + "</div>");
    node.append("<div>" + "Average Grade(/100):" +grade + "</div>");
    node.append("<div>" + "Academic Performance:" +gradeper + "</div>");
    node.append("<div>" + "Last Updated Time:" +new Date(student[7] * 1000) + "</div>");
    node.append("<a href='studentInfo.html?Id=" + student[0] + "'class='btn btn-primary'>Show details</a>")
    return node;
};

//Function that displays student details.
async function Showstddetail(studentId){
  console.log("Showstddetails");
  //Use truffle-contract API and student index to call the contract function to query the detailed information of students.
  const CredentialStoreInstance=await CredentialStore.deployed();
  var p=await CredentialStoreInstance.getStudentInfo.call(studentId);
  var lguser=sessionStorage.getItem('user');
  let curact=web3.eth.accounts.currentProvider.selectedAddress;
  //Display the account information on the page 'Browsing detailed information about the student' according to the current user's account information.
  if(lguser==p[3]){
    $("#current-user-type").append("<div>" + "Current user type: Administor(School)"  + "</div>");
    $("#current-user").append("<div>" + "Welcome:"  + lguser + "       "+ "</div>");
    $("#current-account").append("<div>" + "Current login account address of metamask (If the wallet account is not displayed or not shown, please refresh this page to keep it synchronized after making changes or logging in Metamask.):"  + curact + "</div>");
    document.getElementById("buchange").disabled=false;
    document.getElementById("busave").disabled=false;
    document.getElementById("btdelete").disabled=false; 
  }else{
    $("#current-user-type").append("<div>" + "Current user type: Normal"  + "</div>");
    $("#current-user").append("<div>" + "Current user:"  + lguser + "</div>");
    $("#current-account").append("<div>" + "Current login account address of metamask (If the wallet account is not displayed or not shown, please refresh this page to keep it synchronized after making changes or logging in Metamask.):"  + curact + "</div>");
    alert("This student information cannot be modified by the current account.");
  }
   //Use jQuery's DOM mechanism to display the obtained student information to the page 'Browsing detailed information about the student'.
      $("#student-id").attr("value",p[0]);
      $("#student-name").attr("value",p[2]);
      $("#student-num").attr("value",p[1]);
      $("#student-school").attr("value",p[3]);
      $("#degree-type").val(p[4]);
      if(p[5]==0)
      {
        $("#gender-condition").val("0");
      }else{
        $("#gender-condition").val("1");
      }
      $("#student-major").attr("value",p[6]);
      //Convert the stored integer variables back to the time variables and display them.
      var edittime=new Date(p[7] * 1000);
      $("#edit-time").attr("value",edittime);
    var q=await CredentialStoreInstance.getStudentDetails.call(studentId);
    //console.log(q);
    //Get the image stored on the IPFS based on the hash address read.
    var imglk="http://localhost:8080/ipfs/"+q[0];
    $("#credential-showimage").attr({"src":imglk,"width":'250px'});
    var stradr=q[1];
    //Read and display the large-text description information stored on the IPFS.
    ipfs.cat(stradr).then((stream)=>{
        console.log(stream);
        let content =new TextDecoder('utf-8').decode(stream);
        $("#student-description").text(content);
    });
    //Convert the stored integer variables back to the time variables and display them.
    var stime=new Date(q[2] * 1000);
    $("#starttime").attr("value",stime);
    var ftime=new Date(q[3] * 1000);
    $("#finishtime").attr("value",ftime);
    $("#adder-address").attr("value",q[4]);
    var o=await CredentialStoreInstance.getStudentGrades.call(studentId);
    $("#average-grade").attr("value",o[0]);
    $("#academic-performance").val(o[1]);
    // console.log(o);
}

//Execution continues while the system is running (after the intermediate server is started).
window.addEventListener('load', function() {
//Web3.js
if (typeof web3 !== 'undefined') {
console.warn("Using web3 detected from external source.")
window.web3 = new Web3(web3.currentProvider);
//const  account=window.web3.eth.defaultAccount
} else {
alert("No web3 detected. Pleause use metamask to log into an Ethereum external account in the Ethereum network provided by Ganache");
// window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}
App.start();
});

