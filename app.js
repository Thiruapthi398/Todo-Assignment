const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");

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

const ConvertingTheSnakeToPascal = (each) => {
  return {
    id: each.id,
    todo: each.todo,
    priority: each.priority,
    status: each.status,
    category: each.category,
    dueDate: each.due_date,
  };
};

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

  switch (true) {
    case hasStatusProperty(request.query):
      getTodosQuery = `
                select *
                from 
                todo
                where todo LIKE '%${search_q}%' AND 
                status = '${status}';
            `;
      console.log(getTodosQuery);
      console.log(status);
      data = await db.all(getTodosQuery);
      console.log(data.length);
      let Length = data.length;
      if (Length !== 0) {
        response.send(data.map((each) => ConvertingTheSnakeToPascal(each)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
            select *
            from todo
            where todo LIKE '%${search_q}%' AND 
            priority = '${priority}';
        `;
      data = await db.all(getTodosQuery);
      let Length1 = data.length;
      if (Length1 !== 0) {
        response.send(data.map((each) => ConvertingTheSnakeToPascal(each)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }

      break;
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
            select *
            from todo
            where todo LIKE '%${search_q}%' AND 
            priority = '${priority}' AND status = '${status}';
        `;
      data = await db.all(getTodosQuery);
      response.send(data.map((each) => ConvertingTheSnakeToPascal(each)));
      break;
    case hasCategoryAndStatusProperties(request.query):
      getTodosQuery = `
            select *
            from todo
            where todo LIKE '%${search_q}%' AND 
            category = '${category}' AND status = '${status}';
        `;
      data = await db.all(getTodosQuery);
      response.send(data.map((each) => ConvertingTheSnakeToPascal(each)));
      break;
    case hasCategoryProperty(request.query):
      getTodosQuery = `
             select *
            from todo
            where todo LIKE '%${search_q}%' AND 
            category = '${category}'
        `;
      data = await db.all(getTodosQuery);
      let Length2 = data.length;
      if (Length2 !== 0) {
        response.send(data.map((each) => ConvertingTheSnakeToPascal(each)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;
    case hasCategoryAndPriorityProperties(request.query):
      getTodosQuery = `
             select *
            from todo
            where todo LIKE '%${search_q}%' AND 
            category = '${category}' AND  priority = '${priority}'
        `;
      data = await db.all(getTodosQuery);
      response.send(data.map((each) => ConvertingTheSnakeToPascal(each)));
      break;

    default:
      getTodosQuery = `
    select *
     from
    todo
    where todo LIKE '%${search_q}%';`;
      data = await db.all(getTodosQuery);
      response.send(data.map((each) => ConvertingTheSnakeToPascal(each)));
      break;
  }
  //console.log(getTodosQuery);
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
  response.send(ConvertingTheSnakeToPascal(SelectIdData));
});

/// API 3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const ISVAILD = isValid(new Date(date));
  console.log(ISVAILD);
  if (ISVAILD === true) {
    const date1 = format(new Date(date), "yyyy-MM-dd");
    console.log(date1);
    const date2 = Number(format(new Date(date), "yyyy"));
    const date3 = Number(format(new Date(date), "MM"));
    const date4 = Number(format(new Date(date), "dd"));

    console.log(typeof date2);
    console.log(typeof date3);
    console.log(typeof date4);

    const GetDateQuery = `select * from todo where cast(strftime('%Y',due_date) as int)=${date2} and cast(strftime("%m",due_date) as int)=${date3} and cast(strftime("%d",due_date) as int) = ${date4};`;
    const GetDate = await db.all(GetDateQuery);
    console.log(GetDate);
    const GetDateLength = GetDate.length;
    if (GetDateLength !== 0) {
      response.send(GetDate.map((each) => ConvertingTheSnakeToPascal(each)));
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
    console.log(GetDateLength);
    //response.send(GetDate);
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API 4 POST
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  console.log(id);
  console.log(todo);
  console.log(priority);
  console.log(typeof status);
  console.log(category);
  console.log(dueDate);
  console.log(typeof "TO DO)");
  const ISVAILD = isValid(new Date(dueDate));
  if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (
    priority !== "HIGH" &&
    priority !== "MEDIUM" &&
    priority !== "LOW"
  ) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (
    category !== "WORK" &&
    category !== "HOME" &&
    category !== "LEARNING"
  ) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (dueDate.length > 9) {
    response.status(400);
    response.send("Invalid Todo Due Date");
  } else {
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
    //await db.run(CreateTodoQuery);
    response.send("Todo Successfully Added");
    console.log("Todo Successfully Added");
  }

  //response.send("Todo Successfully Added");
});

/// API 5 PUT
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  //const { priority } = requestBody;
  //console.log(priority);

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
      updatedColumn = "Due Date";
      break;
  }
  const previousTodoQuery = `
        SELECT
            *
        FROM
            todo
        WHERE 
         id = ${todoId};`;

  const previousTodo = await db.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.due_date,
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
  //await db.run(updateTodoQuery);
  console.log(updatedColumn);
  response.send(`'${updatedColumn}' Updated`);
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
