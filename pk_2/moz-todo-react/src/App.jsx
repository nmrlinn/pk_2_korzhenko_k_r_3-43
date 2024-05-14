import React, { useState, useEffect } from 'react';
import Todo from './components/Todo';
import Form from './components/Form';
import FilterButton from './components/FilterButton';
import axios from 'axios';

const FILTER_MAP = {
  All: () => true,
  Active: (task) => !task.completed,
  Completed: (task) => task.completed,
};
const FILTER_NAMES = Object.keys(FILTER_MAP);

function App() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksResponse, usersResponse] = await Promise.all([
          axios.get('https://jsonplaceholder.typicode.com/todos'),
          axios.get('https://jsonplaceholder.typicode.com/users')
        ]);
        setTasks(tasksResponse.data);
        setUsers(usersResponse.data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  function addTask(name) {
    const newTask = { id: `todo-${tasks.length + 1}`, name, completed: false };
    setTasks([...tasks, newTask]);
  }

  function editTask(id, newName) {
    const editedTaskList = tasks.map((task) => {
      if (id === task.id) {
        return { ...task, name: newName };
      }
      return task;
    });
    setTasks(editedTaskList);
  }

  function toggleTaskCompleted(id) {
    const updatedTasks = tasks.map((task) => {
      if (id === task.id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    setTasks(updatedTasks);
  }

  function deleteTask(id) {
    const remainingTasks = tasks.filter((task) => id !== task.id);
    setTasks(remainingTasks);
  }

  const filteredTasks = tasks.filter(FILTER_MAP[filter]);
  const filteredTasksByUser = selectedUser ? filteredTasks.filter(task => task.userId === selectedUser) : filteredTasks;

  const taskList = filteredTasksByUser.map((task) => {
    const user = users.find((user) => user.id === task.userId);
    if (user) {
      return (
        <Todo
          id={task.id}
          name={task.title}
          completed={task.completed}
          key={task.id}
          toggleTaskCompleted={toggleTaskCompleted}
          deleteTask={deleteTask}
          editTask={editTask}
          username={user.username}
        />
      );
    }
    return null; // если пользователь не найден
  });

  const filterList = FILTER_NAMES.map((name) => (
    <FilterButton key={name} name={name} isPressed={name === filter} setFilter={setFilter} />
  ));

  const userList = (
    <select value={selectedUser} onChange={(e) => setSelectedUser(parseInt(e.target.value))}>
      <option value={null}>All Users</option>
      {users.map((user) => (
        <option key={user.id} value={user.id}>{user.username}</option>
      ))}
    </select>
  );

  const tasksNoun = taskList.length !== 1 ? 'tasks' : 'task';
  const headingText = `${taskList.length} ${tasksNoun} remaining`;

  return (
    <div className="todoapp stack-large">
      <h1>TodoMatic</h1>
      <Form addTask={addTask} />
      <div className="filters btn-group stack-exception">
        {filterList}
        {userList}
      </div>
      <h2 id="list-heading">{headingText}</h2>
      <ul
        role="list"
        className="todo-list stack-large stack-exception"
        aria-labelledby="list-heading">
        {taskList}
      </ul>
    </div>
  );
}

export default App;
