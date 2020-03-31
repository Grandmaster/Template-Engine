const Manager = require("./lib/Manager");
const Engineer = require("./lib/Engineer");
const Intern = require("./lib/Intern");
const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");
const OUTPUT_DIR = path.resolve(__dirname, "output");
const outputPath = path.join(OUTPUT_DIR, "team.html");
const render = require("./lib/htmlRenderer");
// Write code to use inquirer to gather information about the development team members,
// and to create objects for each team member (using the correct classes as blueprints!)
inquirer
  .prompt([
    {
      type: "input",
      message: "How many people are in your team?",
      name: "count"
    },
    {
      type: "input",
      message:
        "One of your employees must be a manager. How many of the remaining are engineers?",
      name: "engineerCount"
    },
    {
      type: "input",
      message: "...And how many of them are interns?",
      name: "internCount"
    }
  ])
  .then(function(response) {
    // Creating an array of prompts for inquirer and objects to store data
    var promptList = [];
    var employeeList = {};
    var engineerList = {};
    var internList = {};
    // Creating the various prompts
    managerPrompt = {
      type: "input",
      message:
        'Please enter information about the manager for this team, in this format: "name id email office_number" : ',
      name: "manager"
    };
    engineerPrompt = {
      type: "input",
      message:
        'Please enter information about an engineer for this team, in this format: "name id email github_username" : ',
      name: "engineer"
    };
    internPrompt = {
      type: "input",
      message:
        'Please enter information about an intern for this team, in this format: "name id email school" : ',
      name: "intern"
    };
    // Adding the prompts to the array based on response data from the inquirer
    promptList.push(managerPrompt);
    for (var i = 0; i < parseInt(response.engineerCount); i++) {
      promptList.push(engineerPrompt);
    }
    for (var i = 0; i < parseInt(response.internCount); i++) {
      promptList.push(internPrompt);
    }
    // function to prompt the user to enter info for employees.
    async function enterEmployeeInfo() {
      eCount = 0;
      iCount = 0;
      for (let i of promptList) {
        if (i.name == "engineer") {
          await inquirer.prompt(i).then(response => {
            eCount++;
            Object.assign(engineerList, { [eCount]: response });
          });
        } else if (i.name == "intern") {
          await inquirer.prompt(i).then(response => {
            iCount++;
            Object.assign(internList, { [iCount]: response });
          });
        } else if (i.name == "manager") {
          await inquirer.prompt(i).then(response => {
            Object.assign(employeeList, response);
          });
        }
      }
      Object.assign(
        employeeList,
        { engineers: engineerList },
        { interns: internList }
      );
      await generateEmployeeObjects(employeeList);
    }
    enterEmployeeInfo();
  });
// Function that takes the info entered by the user and builds employee objects out of it.
// It also creates a html file out of the data, and writes it to the output folder
async function generateEmployeeObjects(employeeList) {
  // Creates manager object
  const managerInfo = employeeList.manager.split(" ");
  [name, id, email, office] = managerInfo;
  let manager = new Manager(name, id, email, office);
  // Creates engineer objects
  engineerList = [];
  for (let person in employeeList.engineers) {
    const engineerInfo = employeeList.engineers[person].engineer.split(" ");
    [name, id, email, g_username] = engineerInfo;
    let engineer = new Engineer(name, id, email, g_username);
    engineerList.push(engineer);
  }
  // Creates new intern objects
  internList = [];
  for (let person in employeeList.interns) {
    const internInfo = employeeList.interns[person].intern.split(" ");
    [name, id, email, school] = internInfo;
    let intern = new Intern(name, id, email, school);
    internList.push(intern);
  }
  // Puts all objects in one array
  var employeeObjectList = [manager].concat(engineerList, internList);
  // Writes data to a html file.
  var html = render(employeeObjectList);
  html = html.replace(/,/g, "");
  fs.writeFile("./output/team.html", html, err => {
    if (err) {
      throw err;
    }
    console.log("file was successfully created!");
  });
  // Creates styling for the html page, and writes it to the output folder
  var style = `.card.employee-card {
      margin: 10px;
  }
  .jumbotron{
    background-color: red;
    color: white;
  }
  .card-header{
    background-color: blue;
    color: white;
  }`;
  fs.writeFile("./output/style.css", style, err => {
    if (err) {
      throw err;
    }
    console.log("Added styling to the page!");
  });
}
// After the user has input all employees desired, call the `render` function (required
// above) and pass in an array containing all employee objects; the `render` function will
// generate and return a block of HTML including templated divs for each employee!

// After you have your html, you're now ready to create an HTML file using the HTML
// returned from the `render` function. Now write it to a file named `team.html` in the
// `output` folder. You can use the variable `outputPath` above target this location.
// Hint: you may need to check if the `output` folder exists and create it if it
// does not.

// HINT: each employee type (manager, engineer, or intern) has slightly different
// information; write your code to ask different questions via inquirer depending on
// employee type.

// HINT: make sure to build out your classes first! Remember that your Manager, Engineer,
// and Intern classes should all extend from a class named Employee; see the directions
// for further information. Be sure to test out each class and verify it generates an
// object with the correct structure and methods. This structure will be crucial in order
// for the provided `render` function to work!```
