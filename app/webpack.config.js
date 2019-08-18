const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

//Use webpack to package the files and configure the intermediate server part of the system.
module.exports = {
  //Specifies the '.js' file that the server executes.
  mode: 'development',
  entry: "./src/app.js",
  output: {
    filename: "app.js",
    path: path.resolve(__dirname, "dist"),
  },
  //Configure the CSS parser.
  module: {
    rules: [{
        test: /\.css$/,
        loader: 'style-loader!css-loader?modules'
    }]
  },
  //Specifies the path to the system programme files and the image used in login page.
  plugins: [
    new CopyWebpackPlugin([
      { from: "./src/index.html", to: "index.html" }, 
      { from: "./src/adminregister.html", to: "adminregister.html" },
      { from: "./src/register.html", to: "register.html" },
      { from: "./src/mainpage.html", to: "mainpage.html" },
      { from: './src/add-student.html', to: "add-student.html"},
      { from: './src/studentInfo.html', to: "studentInfo.html" },
      { from: './src/image/indexpicture.jpg', to: "indexpicture.jpg" }
    ]),
  ],
  //Configure the intermediate server part of the system
  devServer: { contentBase: path.join(__dirname, "dist"), compress: true },
};




