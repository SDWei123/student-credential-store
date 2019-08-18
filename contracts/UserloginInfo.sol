pragma solidity ^ 0.5.0;
contract UserloginInfo {
    enum AccountType {
        User,
        Administrator
    }
    enum UseraccountType {
        Students,
        Company
    }
    uint public userIndex;  //The user index.
    mapping (uint=>User) userstore;

    struct User{
        uint id;     //This user's index in this system 
        string username; //The user name for this user account
        string password; //The Password of this user account
        string schorcomname; //The name of the user's school or company
        AccountType acttype; //The account type of the user account
        UseraccountType usacty; //Types of users for normal accounts
    }
    constructor ()  public {
        userIndex = 0;
    }
    //Build a new user account information structure to store the new user account information.
    function addUser(string memory _username, string memory _pwd, string memory _schcomname, uint _acttype, uint _usactype) public {
        userIndex += 1; //When a new user is added, index increases by 1.
        User memory newuser = User(userIndex, _username, _pwd, _schcomname, AccountType(_acttype), UseraccountType(_usactype));
        userstore[userIndex] = newuser;
    }
    //The user account information structure and its information are queried by the user index.
    function getUserInfo(uint _userId) public view returns(string memory, string memory, string memory, AccountType, UseraccountType) {
    User memory user = userstore[_userId];
    return (user.username, user.password, user.schorcomname,user.acttype, user.usacty);
    }
}