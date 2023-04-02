const apiURL = 'http://localhost:5000/todos';

/* DOMContentLoaded */
document.addEventListener('DOMContentLoaded', main());
/* main FUNCTION */
function main() {
  /* theme-switcher */
  document.getElementById('theme-switcher').addEventListener('click', function () {
    document.querySelector('body').classList.toggle('light');
    const themeImg = this.children[0];
    themeImg.setAttribute(
      'src',
      themeImg.getAttribute('src') === './images/icon-sun.png'
        ? './images/icon-moon.png'
        : './images/icon-sun.png'
    );
  });

  // get all todos and initialize listeners
  getTodos();

  /* dragover on .todos container */
  document.querySelector('.todos').addEventListener('dragover', function (e) {
    e.preventDefault();
    if (!e.target.classList.contains('dragging') && e.target.classList.contains('card')) {
      const draggingCard = this.querySelector('.dragging');
      const cards = [...this.querySelectorAll('.card')];
      const currIndex = cards.indexOf(draggingCard);
      const newIndex = cards.indexOf(e.target);
      if (currIndex > newIndex) {
        this.insertBefore(draggingCard, e.target);
      } else {
        this.insertBefore(draggingCard, e.target.nextSibling);
      }
    }
  });

  /* when user leave webpage, send a request to make sure the latest todo's sequence will be saved */
  window.addEventListener('beforeunload', (e) => {
    // e.returnValue = '';
    const cards = [...document.querySelectorAll('.todos .card')];
    const newCards = cards.map((card) => {
      return {
        content: card.textContent,
        isCompleted: card.classList.contains('checked'),
      };
    });
    createManyTodos(newCards);
  });

  // add new todo on user input
  const addBtn = document.getElementById('add-btn');
  const txtInput = document.querySelector('.txt-input');
  addBtn.addEventListener('click', function () {
    const txt = txtInput.value.trim();
    if (txt) {
      txtInput.value = '';
      createTodo({ content: txt });
    }
    txtInput.focus();
  });

  // add todo also on enter key event
  txtInput.addEventListener('keydown', (e) => {
    if (e.keyCode === 13) {
      addBtn.click();
    }
  });

  // filter todos
  document.querySelector('.filter').addEventListener('click', (e) => {
    const id = e.target.id;
    if (id) {
      document.querySelector('.on').classList.remove('on');
      document.getElementById(id).classList.add('on');
      document.querySelector('.todos').className = `todos ${id}`;
    }
  });

  //clear completed
  document.getElementById('clear-completed').addEventListener('click', () => {
    let deleteTodos = [];
    document.querySelectorAll('.card.checked').forEach((card) => {
      deleteTodos.push(card.id);
      card.classList.add('fall');
      card.addEventListener('animationend', (e) => {
        setTimeout(() => {
          card.remove();
        }, 100);
      });
    });
    deleteManyTodo(deleteTodos);
  });
}

/*  createTodo() : POST A NEW TODO TO DATABASE */
function createTodo(newTodo) {
  options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTodo),
  };
  fetch(apiURL, options)
    .then((res) => res.json())
    .then((newTodo) => {
      createElement([newTodo]);
    });
}

/* createManyTodos : POST MANY TODOS TO DATABASE */
function createManyTodos(todos) {
  options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(todos),
  };
  fetch(apiURL, options)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
}

/* getTodos() : GET ALL TODOS FROM DATABASE */
function getTodos() {
  fetch(apiURL)
    .then((res) => res.json())
    .then((todos) => {
      createElement(todos);
    });
}

/* updateTodoState() : UPDATE TODO'S STATE TO DATABASE */
function updateTodoState(id, isCompleted) {
  options = {
    method: 'PATCH',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ id, isCompleted }),
  };
  fetch(apiURL, options)
    .then((res) => {
      console.log('Update state success.');
    })
    .catch((err) => {
      console.log(err);
    });
}

/* deleteManyTo() : DELETE MANY TODOS FROM DATABASE */
function deleteManyTodo(deleteTodos) {
  options = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify({ deleteTodos }),
  };
  fetch(apiURL, options)
    .then(() => {
      console.log('Delete many todos success.');
    })
    .catch((err) => {
      console.log(err);
    });
}

/* deleteTodo() : DELETE SPECIFIC TODO FROM DATABASE */
function deleteTodo(id) {
  options = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify({
      id,
    }),
  };
  fetch(`apiURL/${id}`, options)
    .then((res) => {
      console.log('Delete todo success.');
    })
    .catch((err) => {
      console.log(err);
    });
}

/* addTodo() : LIST/CREATE TODOS AND ADD EVENT LISTENERS */
function createElement(todos) {
  console.log(todos);
  if (todos.length == 0) {
    return null;
  }
  const todosLeft = document.getElementById('todos-left');

  todos.forEach((todo) => {
    // Create card
    const card = document.createElement('li');
    const cbContainer = document.createElement('div');
    const cbInput = document.createElement('input');
    const check = document.createElement('span');
    const content = document.createElement('p');
    const clearBtn = document.createElement('button');
    const img = document.createElement('img');

    // Add classes
    card.classList.add('card');
    cbContainer.classList.add('cb-container');
    cbInput.classList.add('cb-input');
    check.classList.add('check');
    content.classList.add('content');
    clearBtn.classList.add('clear');

    // Set attributes
    card.setAttribute('id', todo._id);
    card.setAttribute('draggable', true);
    img.setAttribute('src', '../images/icon-cross.svg');
    img.setAttribute('alt', 'Clear it');
    cbInput.setAttribute('type', 'checkbox');

    // Set todo item for card
    content.textContent = todo.content;

    // if completed -> add respective class / attribute
    if (todo.isCompleted) {
      card.classList.add('checked');
      cbInput.setAttribute('checked', 'checked');
    }

    // Add drag listener to card
    card.addEventListener('dragstart', function () {
      this.classList.add('dragging');
    });
    card.addEventListener('dragend', function () {
      this.classList.remove('dragging');
    });

    // Add click listener to checkbox
    cbInput.addEventListener('click', function () {
      const correspondingCard = this.parentElement.parentElement;
      const checked = this.checked;

      // update todo's state
      updateTodoState(correspondingCard.id, checked);

      // update class
      checked
        ? correspondingCard.classList.add('checked')
        : correspondingCard.classList.remove('checked');

      // update todosLeft
      todosLeft.textContent = document.querySelectorAll('.todos .card:not(.checked)').length;
    });

    // Add click listener to clear button
    clearBtn.addEventListener('click', function () {
      const correspondingCard = this.parentElement;

      // add class for Animation
      correspondingCard.classList.add('fall');

      // remove todo in localStorage i.e. removeTodo(index)
      deleteTodo(correspondingCard.id);

      // update todosLeft and remove card from DOM after animation
      correspondingCard.addEventListener('animationend', function () {
        setTimeout(() => {
          correspondingCard.remove();
          todosLeft.textContent = document.querySelectorAll('.todos .card:not(.checked)').length;
        }, 100);
      });
    });

    // append all elements that we created to its parents
    clearBtn.appendChild(img);
    cbContainer.append(cbInput, check);
    card.append(cbContainer, content, clearBtn);
    document.querySelector('.todos').appendChild(card);
  });
  // update todosLeft
  todosLeft.textContent = document.querySelectorAll('.todos .card:not(.checked)').length;
}
