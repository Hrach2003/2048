const is_mobile =
  !!navigator.userAgent.match(/iphone|android|blackberry/gi) || false;

const boardHTML = document.getElementById("_2048_");
const excels = document.getElementsByClassName("excel");
let rows = 4;
let cols = 4;
let board = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

const excel_values = {
  0: "rgb(205,193,180)",
  2: "rgb(238,228,218)",
  4: "rgb(237,224,200)",
  8: "rgb(242,177,121)",
  16: "rgb(245,149,99)",
  32: "rgb(246,124,95)",
  64: "rgb(246,94,59)",
  128: "rgb(237,207,114)",
  256: "rgb(223, 223, 89)",
};

for (let i = 0; i < board.length; i++) {
  for (let j = 0; j < board[i].length; j++) {
    boardHTML.innerHTML += `
          <div class="excel">
            <div class="empty" j="${j}" i="${i}"></div>
          </div>`;
  }
}

const searched_excel = (i, j) =>
  document.querySelector(`.excel [i="${i}"][j="${j}"]`);

function add_number(_board_) {
  let pos_options = [];
  for (let i = 0; i < _board_.length; i++) {
    for (let j = 0; j < _board_.length; j++) {
      if (!_board_[i][j]) {
        pos_options.push({ i, j });
      }
    }
  }

  let index = Math.floor(Math.random() * (pos_options.length - 1));
  let value = Math.round(Math.random()) * 2 + 2;
  if (pos_options.length) {
    let _excel_ = searched_excel(pos_options[index].i, pos_options[index].j);
    _excel_.innerHTML = value;
    _excel_.style.transition = "all 0.3s ease";
    _excel_.style.backgroundColor = excel_values[value];
    _excel_.classList.replace("empty", "full");
    _board_[pos_options[index].i][pos_options[index].j] = value;
  }
}

function handle_HTML_board_change(_board_) {
  for (let i = 0; i < _board_.length; i++) {
    for (let j = 0; j < _board_.length; j++) {
      let excel = searched_excel(i, j);

      if (Number(excel.innerText) !== _board_[i][j]) {
        excel.classList.replace("empty", "full");
        excel.innerText = _board_[i][j];
        excel.style.backgroundColor = excel_values[_board_[i][j]];
      }

      if (Number(excel.innerText) === 0) {
        excel.innerText = "";
        excel.classList.replace("full", "empty");
      }
      if (Number(excel.innerText) <= 4) {
        excel.style.color = "rgb(119,110,101)";
        excel.style.boxShadow = `none`;
      } else if (Number(excel.innerText) > 4 && Number(excel.innerText) < 256) {
        excel.style.color = "white";
        excel.style.boxShadow = `none`;
      } else {
        excel.style.color = "white";
        excel.style.boxShadow = `0 0 15px 2px ${
          excel_values[Number(excel.innerText)]
        }`;
      }
    }
  }
}

function push_in_one_border(row, dir = "right") {
  let arr = row.filter((val) => val);
  let missing = cols - arr.length;
  let zero = Array(missing).fill(0);
  dir === "right" ? arr.unshift(...zero) : arr.push(...zero);
  return arr;
}

function combine_similares(row, dir = "right") {
  row = push_in_one_border(row, dir);
  for (let i = row.length - 1; i > 0; i--) {
    if (row[i] === row[i - 1]) {
      row[i] *= 2;
      row[i - 1] = 0;
      row = push_in_one_border(row, dir);
    }
  }
  return row;
}

function rotate(_board_) {
  const N = _board_.length - 1;
  const result = _board_.map((row, i) =>
    row.map((val, j) => _board_[N - j][i])
  );
  _board_ = result;
  return _board_;
}

function push_right(_board_) {
  let copy_board = JSON.parse(JSON.stringify(_board_));
  for (let i = 0; i < copy_board.length; i++) {
    copy_board[i] = combine_similares(copy_board[i]);
  }
  return copy_board;
}
function push_up(_board_) {
  let copy_board = JSON.parse(JSON.stringify(_board_));
  copy_board = rotate(copy_board);
  for (let i = 0; i < copy_board.length; i++) {
    copy_board[i] = combine_similares(copy_board[i]);
  }
  copy_board = rotate(rotate(rotate(copy_board)));
  return copy_board;
}
function push_left(_board_) {
  let copy_board = JSON.parse(JSON.stringify(_board_));
  for (let i = 0; i < copy_board.length; i++) {
    copy_board[i] = combine_similares(copy_board[i], "left");
  }
  return copy_board;
}

function push_down(_board_) {
  let copy_board = JSON.parse(JSON.stringify(_board_));
  copy_board = rotate(copy_board);
  for (let i = 0; i < copy_board.length; i++) {
    copy_board[i] = combine_similares(copy_board[i], "left");
  }
  copy_board = rotate(rotate(rotate(copy_board)));
  return copy_board;
}

function is_changed(_board_, changed_board) {
  for (let i = 0; i < _board_.length; i++) {
    for (let j = 0; j < _board_.length; j++) {
      if (_board_[i][j] !== changed_board[i][j]) return true;
    }
  }
  return false;
}

function is_game_over(_board_) {
  if (is_changed(_board_, push_left(_board_))) return false;
  if (is_changed(_board_, push_right(_board_))) return false;
  if (is_changed(_board_, push_up(_board_))) return false;
  if (is_changed(_board_, push_down(_board_))) return false;

  return true;
}

function handle_movement(key) {
  const add = () => {
    handle_HTML_board_change(board);
    add_number(board);
  };

  if (key === 37 && is_changed(board, push_left(board))) {
    board = push_left(board);
    add();
  }
  if (key === 38 && is_changed(board, push_up(board))) {
    board = push_up(board);
    add();
  }
  if (key === 39 && is_changed(board, push_right(board))) {
    board = push_right(board);
    add();
  }
  if (key === 40 && is_changed(board, push_down(board))) {
    board = push_down(board);
    add();
  }
  if (is_game_over(board)) {
    handle_HTML_board_change(board);
    alert("game over");
  }
}

window.onload = () => {
  add_number(board);

  if (is_mobile) {
    document.addEventListener("swiped-left", () => {
      handle_movement(37);
    });
    document.addEventListener("swiped-up", () => {
      handle_movement(38);
    });
    document.addEventListener("swiped-right", () => {
      handle_movement(39);
    });
    document.addEventListener("swiped-down", () => {
      handle_movement(40);
    });
  } else {
    document.addEventListener("keyup", (e) => {
      handle_movement(e.keyCode);
    });
  }
};
