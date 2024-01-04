const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};

initializeDBAndServer();

const checkRequestsQueries = async (request, response, next) => {
  const { category, priority, status, date } = request.query;
  if (category !== undefined) {
    const categoryArray = ["WORK", "HOME", "LEARNING"];
    const categoryIsInArray = categoryArray.includes(category);
    if (categoryIsInArray) {
      request.query.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
      return;
    }
  }

  if (priority !== undefined) {
    const priorityArray = ["HIGH", "MEDIUM", "LOW"];
    const priorityIsInArray = priorityArray.includes(priority);
    if (priorityIsInArray) {
      request.query.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      return;
    }
  }

  if (status !== undefined) {
    const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    const statusIsInArray = statusArray.includes(status);
    if (statusIsInArray) {
      request.query.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
      return;
    }
  }

  if (date !== undefined) {
    const myDate = new Date(date);
    const isValidDate = isValid(myDate);
    if (isValidDate) {
      const formatedDate = format(myDate, "yyyy-MM-dd");
      console.log(formatedDate);
      request.query.date = formatedDate;
    } else {
      response.status(400);
      response.send("Invalid Due Date");
      return;
    }
  }

  next();
};

const checkRequestsBody = async (request, response, next) => {
  const { category, priority, status, dueDate } = request.body;
  if (category !== undefined) {
    const categoryArray = ["WORK", "HOME", "LEARNING"];
    const categoryIsInArray = categoryArray.includes(category);
    if (categoryIsInArray) {
      request.body.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
      return;
    }
  }

  if (priority !== undefined) {
    const priorityArray = ["HIGH", "MEDIUM", "LOW"];
    const priorityIsInArray = priorityArray.includes(priority);
    if (priorityIsInArray) {
      request.body.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      return;
    }
  }

  if (status !== undefined) {
    const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    const statusIsInArray = statusArray.includes(status);
    if (statusIsInArray) {
      request.body.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
      return;
    }
  }

  if (dueDate !== undefined) {
    const myDate = new Date(dueDate);
    const isValidDate = isValid(myDate);
    if (isValidDate) {
      const formatedDate = format(myDate, "yyyy-MM-dd");
      console.log(formatedDate);
      request.body.dueDate = formatedDate;
    } else {
      response.status(400);
      response.send("Invalid Due Date");
      return;
    }
  }

  next();
};

// const convertDbObjectToResponseObject = (dbObject) => {
//   return {
//     movieId: dbObject.movie_id,
//     directorId: dbObject.director_id,
//     movieName: dbObject.movie_name,
//     leadActor: dbObject.lead_actor,
//   };
// };

app.get("/todos/", checkRequestsQueries, async (request, response) => {
  const { search_q = "", priority, status, category } = request.query;
  if (priority !== undefined && status !== undefined) {
    const getTodosQuery = `
    SELECT
    id,todo,priority,status,category,due_date AS dueDate
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
    const todos = await db.all(getTodosQuery);
    response.send(todos);
  } else if (priority !== undefined) {
    const getTodosQuery = `
   SELECT
   id,todo,priority,status,category,due_date AS dueDate
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
    const todos = await db.all(getTodosQuery);
    response.send(todos);
  } else if (status !== undefined) {
    const getTodosQuery = `
   SELECT
   id,todo,priority,status,category,due_date AS dueDate
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
    const todos = await db.all(getTodosQuery);
    response.send(todos);
  } else if (category !== undefined && status !== undefined) {
    const getTodosQuery = `
   SELECT
    id,todo,priority,status,category,due_date AS dueDate
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND category = '${category}';`;
    const todos = await db.all(getTodosQuery);
    response.send(todos);
  } else if (category !== undefined && priority !== undefined) {
    const getTodosQuery = `
   SELECT
   id,todo,priority,status,category,due_date AS dueDate
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}'
    AND category = '${category}';`;
    const todos = await db.all(getTodosQuery);
    response.send(todos);
  } else if (category !== undefined) {
    const getTodosQuery = `
   SELECT
    id,todo,priority,status,category,due_date AS dueDate
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND category = '${category}';`;
    const todos = await db.all(getTodosQuery);
    response.send(todos);
  } else {
    const getTodosQuery = `
   SELECT
   id,todo,priority,status,category,due_date AS dueDate
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
    const todos = await db.all(getTodosQuery);
    response.send(todos);
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT
    id,todo,priority,status,category,due_date AS dueDate
   FROM
    todo
    WHERE
      id = ${todoId};`;
  const todo = await db.get(getTodoQuery);
  response.send(todo);
});

app.get("/agenda/", checkRequestsQueries, async (request, response) => {
  const { date } = request.query;
  const getTodoQuery = `
    SELECT
    id,todo,priority,status,category,due_date AS dueDate
   FROM
    todo
    WHERE
      due_date = '${date}';`;
  const todo = await db.all(getTodoQuery);
  response.send(todo);
});

app.post("/todos/", checkRequestsBody, async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status, category, dueDate } = todoDetails;
  const addTodoQuery = `
    INSERT INTO
      todo (id,todo,category,priority,status,due_date)
    VALUES
      (
         ${id},
         '${todo}',
         '${category}',
         '${priority}',
         '${status}',
         '${dueDate}'
      );`;

  const dbResponse = await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", checkRequestsBody, async (request, response) => {
  const { todoId } = request.params;
  const todoDetails = request.body;
  if (todoDetails.status !== undefined) {
    const { status } = todoDetails;
    const updateTodoQuery = `
    UPDATE
      todo
    SET
      status='${status}'
    WHERE
      id = ${todoId};`;
    await db.run(updateTodoQuery);
    response.send("Status Updated");
  } else if (todoDetails.priority !== undefined) {
    const { priority } = todoDetails;
    const updateTodoQuery = `
    UPDATE
      todo
    SET
      priority='${priority}'
    WHERE
      id = ${todoId};`;
    await db.run(updateTodoQuery);
    response.send("Priority Updated");
  } else if (todoDetails.todo !== undefined) {
    const { todo } = todoDetails;
    const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo ='${todo}'
    WHERE
      id = ${todoId};`;
    await db.run(updateTodoQuery);
    response.send("Todo Updated");
  } else if (todoDetails.category !== undefined) {
    const { category } = todoDetails;
    const updateTodoQuery = `
    UPDATE
      todo
    SET
      category ='${category}'
    WHERE
      id = ${todoId};`;
    await db.run(updateTodoQuery);
    response.send("Category Updated");
  } else if (todoDetails.dueDate !== undefined) {
    const { dueDate } = todoDetails;
    const updateTodoQuery = `
    UPDATE
      todo
    SET
      due_date ='${dueDate}'
    WHERE
      id = ${todoId};`;
    await db.run(updateTodoQuery);
    response.send("Due Date Updated");
  } else {
    const { todo } = todoDetails;
    const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}'
    WHERE
      id = ${todoId};`;
    await db.run(updateTodoQuery);
    response.send("Todo Updated");
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM
      todo
    WHERE
      id = ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

// app.get("/players/", async (request, response) => {
//   const playersDetailsQuery = `SELECT player_id AS playerId,player_name AS playerName FROM player_details;`;
//   const playersDetails = await db.all(playersDetailsQuery);
//   response.send(playersDetails);
// });

// app.get("/players/:playerId/matches", async (request, response) => {
//   const { playerId } = request.params;
//   let playerMatchesQuery = `SELECT match_id AS matchId,match,year FROM player_match_score NATURAL JOIN match_details WHERE player_id = ${playerId};`;
//   let playerMatches = await db.all(playerMatchesQuery);
//   response.send(playerMatches);
// });

// app.get("/matches/:matchId/players", async (request, response) => {
//   const { matchId } = request.params;
//   let playersDetailsQuery = `SELECT player_id AS playerId,player_name AS playerName FROM player_match_score NATURAL JOIN player_details WHERE match_id = ${matchId};`;
//   let players = await db.all(playersDetailsQuery);
//   response.send(players);
// });

// app.get("/players/:playerId/playerScores", async (request, response) => {
//   const { playerId } = request.params;
//   let playerScoreQuery = `SELECT player_id AS playerId,player_name AS playerName,score AS totalScore,fours AS totalFours,sixes AS totalSixes FROM player_details NATURAL JOIN player_match_score WHERE player_id = ${playerId};`;
//   let playerScore = await db.get(playerScoreQuery);
//   response.send(playerScore);
// });

// // app.get("/districts/:districtId/details/", async (request, response) => {
// //   const { districtId } = request.params;
// //   const getStateIdQuery = `
// //     select state_id from district
// //     where district_id = ${districtId};
// //     `;
// //   const getStateIdQueryResponse = await db.get(getStateIdQuery);
// //   const getStateNameQuery = `
// //     select state_name as stateName from state
// //     where state_id = ${getStateIdQueryResponse.state_id};
// //     `;
// //   const getStateNameQueryResponse = await db.get(getStateNameQuery);
// //   response.send(getStateNameQueryResponse);
// // });

module.exports = app;
