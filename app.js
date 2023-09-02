const express = require("express");
const app = express();
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const sqlite3 = require("sqlite3");
let db = null;

const status1 = (requestQuery) => {
  return requestQuery.status != undefined;
};
const priority1 = (requestQuery) => {
  return requestQuery.priority != undefined;
};
const priorityStatus = (requestQuery) => {
  return requestQuery.priority != undefined && requestQuery.status != undefined;
};

const initiliazeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started");
    });
    app.get("/todos/", async (request, response) => {
      let query = null;
      let dbResponse = null;
      const { search_q = "", priority, status } = request.query;
      switch (true) {
        case priorityStatus(request.query):
          query = `select * from todo
              where todo like '%${search_q}%' and
              status='${status}' and priority='${priority}';`;

          break;
        case status1(request.query):
          query = `select * from todo
              where todo like '%${search_q}%' and
              status='${status}';`;

          break;
        case priority1(request.query):
          query = `select * from todo
              where todo like '%${search_q}%' and
             priority='${priority}';`;

          break;
        default:
          query = `select * from todo
              where todo like '%${search_q}%'`;

          break;
      }
      dbResponse = await db.all(query);
      response.send(dbResponse);
    });
  } catch (e) {
    console.log("Db error");
  }
};
initiliazeDbAndServer();
module.exports = app;
