pragma solidity ^ 0.5.0;
contract CredentialStore {
  //Enumeration variable definition
    enum Gender {
        male,
        female
    }
    uint public studentIndex;   //Count the number of students stored in this app
    uint public studentnum;

  //link admin address with corresponding student sturctures(info) 
    mapping (string=>mapping (uint=>Student)) stores;  
  //link student ID(in store) with school admin address
    mapping (uint => string) studentIdInStore; 

    struct Student{
        uint id;           //Student id in this store
        string Cnum;         //Student certificate id
        string name;       //student name
        address scaccount;     //The ETH account used last time
        string Degreetype;    //Degree level
        string imageLink;  //Degree image hash
        string descLink;   //Large-text description hash
        uint starttime;  // the date when student start to learn
        uint finishtime;    //graduation date
        uint avergrade;     //average score in total years
        string acadeper;        //academic performance(merit, pass,...)
        Gender condition;  //Gender of the student
        string major;        //student major
        uint updatetime;     //The time when this student info added
    }
    
    constructor ()  public {
        studentIndex = 0;
        studentnum = 0;
    }
    //Add student information to the blockchain
    function addStudentToStore(string memory _Cnum, string memory _name, string memory _school, 
    string memory _Degreetype, string memory _imageLink, string memory _descLink, uint starttime, 
    uint finishtime, uint _avggrade, string memory _acadeper, uint _gender, string memory _major, 
    uint _updatetime) public {
    studentIndex += 1;
    studentnum +=1;
    //Build a new structure to store student information
    Student memory student = Student(studentIndex, _Cnum, _name, msg.sender, _Degreetype, _imageLink, 
    _descLink, starttime, finishtime, _avggrade, _acadeper, Gender(_gender), _major, _updatetime);
    //link this structure to the mapping
    stores[_school][studentIndex] = student;
    studentIdInStore[studentIndex] = _school;
  }
   //Read some student information through the student ID
  function getStudentInfo(uint _stuId) view public returns(uint, string memory, 
  string memory, string memory, string memory, Gender, string memory,uint) {

    Student memory student = stores[studentIdInStore[_stuId]][_stuId];

    return (student.id, student.Cnum, student.name, studentIdInStore[_stuId], 
    student.Degreetype, student.condition, student.major, student.updatetime);
  }

   //Read some student information through the student ID
  function getStudentDetails(uint _stuId) view public returns(string memory, string memory, uint, uint, address) {
    Student memory student = stores[studentIdInStore[_stuId]][_stuId];
    return (student.imageLink, student.descLink, student.starttime, student.finishtime, student.scaccount);
  }
  
  //Get students' grades
  function getStudentGrades(uint _stuId) view public returns(uint,string memory) {
    Student memory student = stores[studentIdInStore[_stuId]][_stuId];
    return (student.avergrade, student.acadeper);
  }

  //Modify some contents in the student information structure.
  function changeStudentInfo1(uint _stuId, string memory _Cnum, 
  string memory _name, string memory _major, 
  string memory _Degreetype, string memory _imageLink, 
  string memory _descLink, uint starttime, 
  uint finishtime, uint _avggrade) public {
    Student storage chstudent = stores[studentIdInStore[_stuId]][_stuId];
    chstudent.name = _name;
    chstudent.Cnum = _Cnum;
    chstudent.major = _major;
    chstudent.Degreetype = _Degreetype;
    chstudent.imageLink = _imageLink;
    chstudent.descLink = _descLink;
    chstudent.starttime = starttime;
    chstudent.finishtime = finishtime;
    chstudent.avergrade = _avggrade;
  }

//Modify some contents in the student information structure.
function changeStudentInfo2(uint _stuId, string memory _acadeper, uint _gender, uint _updatetime) public {
    Student storage chstudent = stores[studentIdInStore[_stuId]][_stuId];
    chstudent.acadeper = _acadeper;
    chstudent.condition = Gender(_gender);
    chstudent.updatetime = _updatetime;
    chstudent.scaccount = msg.sender;
}

 //Delete function, not delete information structure, is to erase most variables' values in the structure.
 function deleteStudentInfo(uint _stuId) public {
   Student storage destudent = stores[studentIdInStore[_stuId]][_stuId];
    destudent.name = "";
    destudent.Cnum = "";
    destudent.scaccount = address(0x00);
    destudent.Degreetype = "";
    destudent.imageLink = "";
    destudent.descLink = "";
    destudent.starttime = 0;
    destudent.finishtime = 0;
    destudent.avergrade = 0;
    destudent.acadeper = "";
    destudent.condition = Gender(0);
    destudent.updatetime = 0;
    destudent.major = "";
    studentnum -= 1;
 } 
  
  //Use a school name and a student index to query the relevant student information structure.
  function searchStudentInfo(string memory _school, uint _stdId) 
  view public returns(uint, string memory, string memory, string memory) {
     Student memory student = stores[_school][_stdId];
     return (student.id, student.Cnum, student.name, student.major);
  }

}

