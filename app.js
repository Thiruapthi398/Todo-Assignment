const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const DATE = require("date-fns/format");

app.use(express.json());

const dbpath = path.join(__dirname, "todoApplication.db");
let db = null;

const inizatilezingDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("The Server is Running At http:localhost:3000");
    });
  } catch (e) {
    console.log(`There is a error ${e.message}`);
    process.exit(1);
  }
};

inizatilezingDBAndServer();

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.category !== undefined
  );
};

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const hasCategoryAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.category !== undefined
  );
};

/// API 1

app.get("/todos/", async (request, response) => {
  const { status, search_q = "", priority, category } = request.query;
  //console.log(search_q);
  let data = null;
  let getTodosQuery = "";
  switch (true) {
    case hasStatusProperty(request.query):
      getTodosQuery = `
                select *
                from 
                todo
                where todo LIKE '%${search_q}%' AND 
                status = '${status}';
            `;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
            select *
            from todo
            where todo LIKE '%${search_q}%' AND 
            priority = '${priority}';
        `;
      break;
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
            select *
            from todo
            where todo LIKE '%${search_q}%' AND 
            priority = '${priority}' AND status = '${status}';
        `;
      break;
    case hasCategoryAndStatusProperties(request.query):
      getTodosQuery = `
            select *
            from todo
            where todo LIKE '%${search_q}%' AND 
            category = '${category}' AND status = '${status}';
        `;
      break;
    case hasCategoryProperty(request.query):
      getTodosQuery = `
             select *
            from todo
            where todo LIKE '%${search_q}%' AND 
            category = '${category}'
        `;
      break;
    case hasCategoryAndPriorityProperties(request.query):
      getTodosQuery = `
             select *
            from todo
            where todo LIKE '%${search_q}%' AND 
            category = '${category}' AND  priority = '${priority}'
        `;
      break;

    default:
      getTodosQuery = `
                select *
                from 
                todo
                where todo LIKE '%${search_q}%';`;
      break;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});

/// API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const SelectQueryOnId = `
        select * 
        from todo
        where id = ${todoId};
    `;
  const SelectIdData = await db.get(SelectQueryOnId);
  response.send(SelectIdData);
});

/// API 3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  date = format(new date(), yyyy - MM - dd);
  console.log(date);
  const DataOnDateQuery = `
        select * 
        from todo
        where due_date = '${date}';
    `;
  const DataOnData = await db.get(DataOnDateQuery);
  console.log(DataOnData);
  response.send(DataOnData);
});

//API 4 POST
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;

  const CreateTodoQuery = `
        INSERT INTO todo(id,todo,category,priority,status,due_date) 
        values(
                ${id},
                '${todo}',
                '${priority}',
                '${status}',
                '${category}',
                '${dueDate}'
        );
    `;
  await db.run(CreateTodoQuery);
  response.send("Todo Successfully Added");
});

/// API 5 PUT
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  let updatedColumn = "";
  switch (true) {
    case requestBody.status !== undefined:
      updatedColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updatedColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updatedColumn = "Todo";
      break;
    case requestBody.category !== undefined:
      updatedColumn = "Category";
      break;
    case requestBody.dueDate !== undefined:
      updatedColumn = " Due Date";
  }
  const previousTodoQuery = `
        SELECT
            *
        FROM
            todo
        WHERE 
         id = ${todoId};`;

  const previousTodo = await database.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate,
  } = request.body;

  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category = '${category}',
      due_date = '${dueDate}'
    WHERE
      id = ${todoId};`;
  await db.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

// API Delete 6

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const DeleteQuery = `
        delete from todo
        where id = ${todoId};
    `;
  await db.run(DeleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
