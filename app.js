const express = require("express");
const app = express();
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const sqlite3 = require("sqlite3");
let db = null;
app.use(express.json());

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
    app.get("/todos/:todoId/", async (request, response) => {
      const { todoId } = request.params;
      const query2 = `select * from todo where id=${todoId};`;
      const dbResponse2 = await db.get(query2);
      response.send(dbResponse2);
    });
    app.post("/todos/", async (request, response) => {
      const todoDetails = request.body;
      const { id, todo, priority, status } = todoDetails;
      const query3 = `insert into todo(id,todo,priority,status)
      values(${id},'${todo}','${priority}','${status}');`;

      response.send("Todo Successfully Added");
      const dbResponse3 = await db.run(query3);
    });
    app.put("/todos/:todoId/", async (request, response) => {
      const { todoId } = request.params;
      let updated1 = "";
      const requestBody = request.body;

      switch (true) {
        case requestBody.status !== undefined:
          updated1 = "Status";
          break;

        case requestBody.priority !== undefined:
          updated1 = "Priority";
          break;

        case requestBody.todo !== undefined:
          updated1 = "Todo";
          break;
      }
      const query44 = `select * from todo
        where id=${todoId};`;
      const dbResponse44 = await db.get(query44);
      const {
        todo = dbResponse44.todo,

        priority = dbResponse44.priority,
        status = dbResponse44.status,
      } = request.body;
      const query4 = `update todo set
        
        todo='${todo}',
        priority='${priority}',status='${status}' where id=${todoId};`;

      const dbResponse4 = await db.run(query4);
      response.send(`${updated1} Updated`);
    });
    app.delete("/todos/:todoId/", async (request, response) => {
      const { todoId } = request.params;
      const query5 = `delete from todo where id=${todoId};`;
      const dbResponse5 = await db.run(query5);
      response.send("Todo Deleted");
    });
  } catch (e) {
    console.log("Db error");
  }
};
initiliazeDbAndServer();
module.exports = app;
