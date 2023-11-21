import { useState } from 'react';
import React from 'react';

type Todo = {
  item: string;
  completed: boolean;
  id: string;
};

const FILTER = {
  COMPLETED: 'Completed',
  ACTIVE: 'Active',
  ALL: 'All',
} as const;

const SHIFT = {
  UP: 'Up',
  DOWN: 'Down',
} as const;

type ObjectValues<T> = T[keyof T];

type Filter = ObjectValues<typeof FILTER>;
type Shift = ObjectValues<typeof SHIFT>;

export function App() {
  const [todoList, setTodoList] = useState<Todo[]>([]);
  const [todoFilter, setTodoFilter] = useState<Filter>(FILTER.ALL);

  function addTodoItem(newItem: string) {
    const newTodo = {
      item: newItem,
      completed: false,
      id: Math.random().toString(20).substring(2, 6),
    };
    setTodoList((s) => [...s, newTodo]);
  }

  function submitTodoItem(todo: Todo) {
    if (todo.id === 'undefined') {
      addTodoItem(todo.item);
      return;
    }
    const index = todoList.findIndex((t) => t.id === todo.id);
    todoList.splice(index, 1);
    todoList.splice(index, 0, todo);
    setTodoList([...todoList]);
  }

  function removeTodoItem(todo: Todo) {
    const index = todoList.findIndex((t) => t.id === todo.id);
    todoList.splice(index, 1);
    setTodoList([...todoList]);
  }

  function shiftTodoItem(todo: Todo, shift: Shift) {
    const index = todoList.findIndex((t) => t.id === todo.id);
    let shiftIndex: number;
    if (todoFilter !== FILTER.ALL) {
      switch (shift) {
        case SHIFT.UP:
          shiftIndex =
            index -
            todoList
              .slice(0, index)
              .reverse()
              .findIndex((t) => (todo.completed ? t.completed : !t.completed)) -
            1;
          break;
        case SHIFT.DOWN:
          shiftIndex =
            1 +
            index +
            todoList
              .slice(index)
              .findIndex((t) => (todo.completed ? t.completed : !t.completed));
          break;
      }
    } else {
      switch (shift) {
        case SHIFT.UP:
          shiftIndex = index - 1;
          break;
        case SHIFT.DOWN:
          shiftIndex = index + 1;
          break;
      }
    }
    const s = todoList.splice(index, 1);
    todoList.splice(shiftIndex, 0, s[0]);
    setTodoList([...todoList]);
  }

  function toggleTodoItemCompleted(todo: Todo) {
    const index = todoList.findIndex((t) => t.id === todo.id);
    todoList[index].completed = !todoList[index].completed;
    setTodoList([...todoList]);
  }

  function toggleAllCompleted() {
    const toggle: boolean = !todoList.every((t) => t.completed);
    todoList.map((t) => (t.completed = toggle));
    setTodoList([...todoList]);
  }

  function clearCompleted() {
    setTodoList(todoList.filter((t) => !t.completed));
  }

  function filterTodoItems(filter: Filter): Todo[] {
    switch (filter) {
      case FILTER.ALL:
        return todoList;
      case FILTER.ACTIVE:
        return todoList.filter((t) => !t.completed);
      case FILTER.COMPLETED:
        return todoList.filter((t) => t.completed);
    }
  }

  return (
    <section className="bg-gray-900 h-full">
      <section className="flex items-center justify-center bg-gray-900 p-10">
        <section className="flex flex-col items-center justify-center gap-[10px] w-[50%] max-h-[90%]">
          <div className="flex flex-col gap-[5px] w-full p-2.5 border-gray-600 border-2 rounded-lg bg-slate-800">
            <div className="flex flex-row justify-center">
              <div className="text-5xl text-white text-center my-3 bg-gray-700 rounded-lg w-40 border-2 border-gray-600">
                TODO
              </div>
            </div>
            <div className="flex flex-row flex-nowrap gap-[5px] items-center border-2 border-gray-600 rounded-lg p-2.5">
              <Checkmark
                completed={todoList.every((t) => t.completed)}
                setCompleted={toggleAllCompleted}
              />
              <InputBox submitTodo={submitTodoItem} />
            </div>
            <TodoList
              submitTodo={submitTodoItem}
              removeItem={removeTodoItem}
              shiftItem={shiftTodoItem}
              toggleTodo={toggleTodoItemCompleted}
            >
              {filterTodoItems(todoFilter)}
            </TodoList>
            <TodoSummary
              clearCompleted={clearCompleted}
              setFilter={setTodoFilter}
              currentFilter={todoFilter}
            >
              {todoList}
            </TodoSummary>
          </div>
          <div className="text-sm italic text-gray-500">
            Double Click an Item to Edit.
          </div>
        </section>
      </section>
    </section>
  );
}

function InputBox(props: {
  children?: Todo;
  submitTodo: (todo: Todo) => void;
}) {
  const [todoItem, setTodoItem] = useState<string>(
    props.children ? props.children.item : ''
  );

  return (
    <form
      onSubmit={(e) => {
        props.submitTodo({ item: todoItem, completed: false, id: 'undefined' });
        setTodoItem('');
        e?.preventDefault();
      }}
      className="flex-grow m-0"
    >
      <input
        type="text"
        placeholder="Enter a todo item here."
        onChange={(e) => setTodoItem(e.currentTarget.value)}
        value={todoItem}
        autoFocus
        className="border-2 text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 bg-gray-700 border-gray-600 hover:border-gray-500 placeholder-gray-400 text-white"
      />
    </form>
  );
}

function Checkmark(props: { completed: boolean; setCompleted: () => void }) {
  return (
    <div className="flex">
      <input
        type="checkbox"
        className="appearance-none peer w-6 h-6 checked:bg-blue-600 checked:border-blue-500 bg-gray-700 border-gray-600 hover:border-gray-500 focus:ring-2 focus:ring-blue-600 rounded border-2 transition-all ease-in-out"
        checked={props.completed ?? false}
        onChange={(_) => props.setCompleted()}
      />
      <svg
        className="absolute w-6 h-6 fill-none stroke-white stroke-2 pointer-events-none hidden peer-checked:block"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <polyline points="20,6 9,17 4,12" />
      </svg>
    </div>
  );
}

function Button(props: {
  children: any;
  selected?: boolean;
  onClick: () => void;
}) {
  const selectedStates = {
    unselected:
      'bg-gray-700 border-2 border-gray-500 rounded-lg text-white hover:border-gray-400 hover:text-gray-800 hover:bg-gray-300',
    selected:
      'bg-gray-400 border-2 border-gray-300 rounded-lg text-gray-800 hover:border-gray-600 hover:text-white hover:bg-gray-500',
  };

  return (
    <button
      className={`group text-sm border-2 rounded-lg flex-grow ${
        props.selected ? selectedStates.selected : selectedStates.unselected
      }`}
      onClick={(_) => props.onClick()}
    >
      {props.children}
    </button>
  );
}

function TodoList(props: {
  children: Todo[];
  submitTodo: (todo: Todo) => void;
  removeItem: (todo: Todo) => void;
  shiftItem: (todo: Todo, shift: Shift) => void;
  toggleTodo: (todo: Todo) => void;
}) {
  return (
    <div className="flex flex-col gap-[5px] border-2 border-gray-600 p-2.5 rounded-lg">
      {props.children.map((todo: Todo, i: number) => {
        return (
          <div
            key={todo.id + 'container'}
            className="flex items-center gap-[5px]"
          >
            <Checkmark
              key={todo.id + 'check'}
              completed={todo.completed}
              setCompleted={() => props.toggleTodo(todo)}
            />
            <TodoItem
              key={todo.id}
              completed={todo.completed}
              submitTodo={props.submitTodo}
              extraContent={
                <TodoItemControl
                  i={i}
                  todo={todo}
                  length={props.children.length}
                  shiftItem={props.shiftItem}
                  removeItem={props.removeItem}
                />
              }
            >
              {todo}
            </TodoItem>
          </div>
        );
      })}
    </div>
  );
}

function TodoItem(props: {
  children: Todo;
  completed: boolean;
  submitTodo: (t: Todo) => void;
  extraContent?: JSX.Element;
}) {
  const [hovered, setHovered] = useState<boolean>(false);
  const [editting, setEditting] = useState<boolean>(false);

  return (
    <div className="flex gap-[5px] h-[60px] flex-grow">
      <div
        className="flex justify-between items-center flex-grow rounded-lg border-2 border-gray-600 bg-gray-700 hover:border-gray-500 transition-all ease-in-out"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onDoubleClick={() => setEditting(true)}
        onBlur={() => setEditting(false)}
      >
        {editting ? (
          <InputBox
            submitTodo={(t: Todo) => {
              t.id = props.children.id;
              props.submitTodo(t);
              setEditting(false);
            }}
          >
            {props.children}
          </InputBox>
        ) : (
          <TodoItemText completed={props.completed}>
            {props.children.item}
          </TodoItemText>
        )}
        {hovered ? props.extraContent : null}
      </div>
    </div>
  );
}

function TodoItemText(props: { children: string; completed: boolean }) {
  return (
    <span
      className={`text-sm p-2.5 ${
        props.completed ? 'text-gray-500' : 'text-white'
      } ${props.completed ? 'line-through' : ''}`}
    >
      {props.children}
    </span>
  );
}

function TodoItemControl(props: {
  i: number;
  todo: Todo;
  length: number;
  shiftItem: (todo: Todo, shift: Shift) => void;
  removeItem: (todo: Todo) => void;
}) {
  return (
    <div className="flex gap-[1px] p-2.5">
      <Button onClick={() => props.removeItem(props.todo)}>
        <span className="px-1.5 py-1 text-center text-white group-hover:text-gray-800">
          X
        </span>
      </Button>
      <div className="flex flex-col gap-[1px] justify-center">
        {props.i - 1 >= 0 ? (
          <Button onClick={() => props.shiftItem(props.todo, SHIFT.UP)}>
            <div className="p-1">
              <svg
                className="w-4 h-2 fill-none stroke-white group-hover:stroke-gray-800 stroke-2 pointer-events-none"
                strokeLinecap="round"
                aria-hidden
              >
                <polyline points="2,6 8,2 14,6" />
              </svg>
            </div>
          </Button>
        ) : null}
        {props.i + 1 < props.length ? (
          <Button onClick={() => props.shiftItem(props.todo, SHIFT.DOWN)}>
            <div className="p-1">
              <svg
                className="w-4 h-2 fill-none stroke-white group-hover:stroke-gray-800 stroke-2 pointer-events-none"
                strokeLinecap="round"
                aria-hidden
              >
                <polyline points="2,2 8,6 14,2" />
              </svg>
            </div>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function TodoSummary(props: {
  children: Todo[];
  currentFilter: Filter;
  clearCompleted: () => void;
  setFilter: (f: Filter) => void;
}) {
  return (
    <div className="flex justify-between items-center gap-[5px]">
      <span className="text-white text-sm p-[2px]">
        {`Remaining Items: ${
          props.children.filter((t) => !t.completed).length
        }`}
      </span>
      <div
        style={{ display: 'flex', flexFlow: 'row nowrap', gap: 5 }}
        className="flex gap-[5px]"
      >
        <Button
          onClick={() => props.setFilter(FILTER.ALL)}
          selected={props.currentFilter === FILTER.ALL}
        >
          <div className="p-2.5">All</div>
        </Button>
        <Button
          onClick={() => props.setFilter(FILTER.ACTIVE)}
          selected={props.currentFilter === FILTER.ACTIVE}
        >
          <div className="p-2.5">Active</div>
        </Button>

        <Button
          onClick={() => props.setFilter(FILTER.COMPLETED)}
          selected={props.currentFilter === FILTER.COMPLETED}
        >
          <div className="p-2.5">Completed</div>
        </Button>
      </div>
      <div>
        <Button onClick={() => props.clearCompleted()}>
          <div className="p-2.5">Clear Completed</div>
        </Button>
      </div>
    </div>
  );
}
