const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];
const todos = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(
    (element) => element.username === username);

  if(!user)
    return response.status(400).json({error: "User not found!"});
  
    request.user = user;

    return next();

}

app.post('/users', (request, response) => { //passou no insomnia
  const { name, username} = request.body;

  const userAlreadyExists = users.find((element)=>element.username === username);
  if(userAlreadyExists){
    return response.status(400).json({error:"User already exists!"});
  }
  const newUser= {
    id: uuidv4(),
    name,
    username,
    todos:[]
  };
    users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => { //passou no insomnia
  const {user} = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => { //passou no insomnia
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline} = request.body;
  const {id} = request.params;

  const item = user.todos.find((element)=>element.id === id);
  
  if(!item){
    return response.status(404).json({error:"Todo not found!"});
  }
    item.title = title;
    item.deadline = new Date(deadline);
  
    return response.json(item);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const {id} = request.params;
  const item = user.todos.find((element)=>element.id === id);
  if(!item){
    return response.status(404).json({error:"Todo not found!"});
  }
    item.done = true;

    return response.json(item);
 
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const {id} = request.params;

  const item = user.todos.find((element)=>element.id === id);

  if(!item){
    return response.status(404).json({error:"Todo not found!"});
  }

  user.todos.splice(item,1);
  return response.status(204).send();

});

module.exports = app;