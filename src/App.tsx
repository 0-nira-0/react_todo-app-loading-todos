/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import { getTodos, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import classNames from 'classnames';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  const [errorMessage, setErrorMessage] = useState('');
  const [filterTodosStatus, setFilterTodosStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [todoTitle, setTodoTitle] = useState('');
  const [updatedTodoTitle, setUpdatedTodoTitle] = useState('');
  const [isFocusTitle, setIsFocusTitle] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const remainedTodos = todos.filter(todo => !todo.completed).length;

  async function getTodosFromServer() {
    setIsLoading(true);

    try {
      const todosFromServer = await getTodos();

      setTodos(todosFromServer);
    } catch {
      setErrorMessage('Unable to load todos');
      await new Promise(() => setTimeout(() => setErrorMessage(''), 3000));
    } finally {
      setIsLoading(false);
    }
  }

  function deleteSelectedTodo(currentTodos: Todo[], todoToDelete: Todo) {
    const newTodos = [...currentTodos];
    const indexTodoToDelete = newTodos.findIndex(todo => todo === todoToDelete);

    newTodos.splice(indexTodoToDelete, 1);

    return newTodos;
  }

  useEffect(() => {
    getTodosFromServer();
  }, []);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setTodos(currentTodos => {
      const maxId = Math.max(0, ...currentTodos.map(todo => todo.id));

      return [
        ...currentTodos,
        {
          title: todoTitle,
          completed: false,
          userId: USER_ID,
          id: maxId + 1,
        },
      ];
    });
    setTodoTitle('');
  }

  function toggleTodo(todo: Todo) {
    const index = todos.findIndex(currentTodo => currentTodo === todo);

    return setTodos(currentTodos => {
      const newTodos = [...currentTodos];

      newTodos[index].completed = !newTodos[index].completed;

      return newTodos;
    });
  }

  const visibleTodos = todos.filter(todo => {
    switch (filterTodosStatus) {
      case 'All':
        return true;
      case 'Completed':
        return todo.completed;
      case 'Active':
        return !todo.completed;
      default:
        return true;
    }
  });

  function isAllTodosComplete() {
    return visibleTodos ? visibleTodos.every(todo => todo.completed) : false;
  }

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* [+] this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className={classNames('todoapp__toggle-all', {
              active: isAllTodosComplete(),
            })}
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form onSubmit={handleSubmit}>
            <input
              data-cy="NewTodoField"
              onChange={event => setTodoTitle(event.target.value)}
              value={todoTitle}
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {visibleTodos.map(todo => (
            <div
              data-cy="Todo"
              key={todo.id}
              className={classNames('todo', { completed: todo.completed })}
            >
              <label className="todo__status-label">
                <input
                  data-cy="TodoStatus"
                  type="checkbox"
                  className="todo__status"
                  checked={todo.completed}
                  onClick={() => toggleTodo(todo)}
                />
              </label>

              {isFocusTitle && todo.id === selectedTodo?.id ? (
                <form
                  onSubmit={event => {
                    event.preventDefault();

                    setTodoTitle(updatedTodoTitle);
                    if (updatedTodoTitle === '') {
                      setTodos(currentTodos =>
                        deleteSelectedTodo(currentTodos, todo),
                      );
                    }
                  }}
                >
                  <input
                    data-cy="TodoTitleField"
                    type="text"
                    autoFocus={selectedTodo?.id === todo.id}
                    className="todo__title-field"
                    placeholder="Empty todo will be deleted"
                    onChange={event => setUpdatedTodoTitle(event.target.value)}
                    value={updatedTodoTitle}
                  />
                </form>
              ) : (
                <>
                  <span
                    data-cy="TodoTitle"
                    onDoubleClick={() => {
                      setIsFocusTitle(true);
                      setSelectedTodo(todo);
                      setUpdatedTodoTitle(todo.title);
                    }}
                    className="todo__title"
                  >
                    {todo.title}
                  </span>
                  <button
                    type="button"
                    className="todo__remove"
                    data-cy="TodoDelete"
                    onClick={() =>
                      setTodos(currentTodos =>
                        deleteSelectedTodo(currentTodos, todo),
                      )
                    }
                  >
                    ×
                  </button>
                </>
              )}

              <div
                data-cy="TodoLoader"
                className={classNames('modal overlay', {
                  'is-active': isLoading,
                })}
              >
                <div className="modal-background has-background-white-ter" />
                <div className="loader" />
              </div>
            </div>
          ))}
        </section>

        {/* [+] Hide the footer if there are no todos */}
        {todos.length !== 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {remainedTodos} items left
            </span>

            {/* [+] Active link should have the 'selected' class */}
            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                onClick={() => setFilterTodosStatus('All')}
                className={classNames('filter__link', {
                  selected: filterTodosStatus === 'All',
                })}
                data-cy="FilterLinkAll"
              >
                All
              </a>

              <a
                href="#/active"
                onClick={() => setFilterTodosStatus('Active')}
                className={classNames('filter__link', {
                  selected: filterTodosStatus === 'Active',
                })}
                data-cy="FilterLinkActive"
              >
                Active
              </a>

              <a
                href="#/completed"
                onClick={() => setFilterTodosStatus('Completed')}
                className={classNames('filter__link', {
                  selected: filterTodosStatus === 'Completed',
                })}
                data-cy="FilterLinkCompleted"
              >
                Completed
              </a>
            </nav>

            {/* [+] this button should be disabled if there are no completed todos */}
            <button
              type="button"
              className="todoapp__clear-completed"
              disabled={isAllTodosComplete()}
              data-cy="ClearCompletedButton"
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        // eslint-disable-next-line max-len
        className={classNames(
          'notification is-danger is-light has-text-weight-normal',
          { hidden: errorMessage === '' },
        )}
      >
        <button data-cy="HideErrorButton" type="button" className="delete" />
        {/* show only one message at a time */}
        {errorMessage}
      </div>
    </div>
  );
};
