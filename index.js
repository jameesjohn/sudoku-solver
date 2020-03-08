const createGrid = () => {
  const store = [];
  for (let i = 0; i < 9; i++) {
    const inner = [];
    for (let j = 0; j < 9; j++) {
      inner.push(new Cell([i,j]))
    }
    store.push(inner);
  }

  return store;
}

const createHtml = (grid) => {
  const root = document.querySelector('#root');
  root.addEventListener('input', (e) => {
    handleInputEvent(e, grid);
  });
  root.addEventListener('click', handleDblClick);

  for (let i = 0; i < grid.length; i++) {
    let parent = document.createElement('div');
    parent.style.display = 'flex';
    for (let j = 0; j < grid[i].length; j++) {
      let span = document.createElement('input');
      span.disabled = true;
      span.value = grid[i][j].value;
      span.setAttribute('outer', `${i}`);
      span.setAttribute('inner', `${j}`);
      span.style.width = '40px';
      span.style.height = '40px';
      span.style.borderTop = 'solid 1px black';
      span.style.fontSize = '30px';
      span.style.color = 'black';
      span.style.textAlign = 'center';
      span.style.borderLeft = 'solid 1px black';

      if(j === 8 || (j+1) % 3 === 0) {
        span.style.borderRight = 'solid 1px black';
      }
      if(i === 8 || (i+1) % 3 === 0) {
        span.style.borderBottom = 'solid 1px black';
      }
      parent.appendChild(span);
    }
    root.appendChild(parent);
  }
}

const handleInputEvent = (e, grid) => {
  const target = e.target;
  const value = Math.floor(Number(target.value.trim()));
  target.disabled = true;

  if(Number.isNaN(value) ||value < 1 ||value > 9) {
    target.value = '';
    displayError('Input must be a number that is less than 10')
    target.disabled = false;
    return;
  }
  const outer = Number(target.getAttribute('outer'));
  const inner = Number(target.getAttribute('inner'));

  const cell = grid[outer][inner];
  cell.setValue(value);
  console.log(grid);
}

const handleDblClick = e => {
  e.target.disabled = false;
  e.target.focus()
}

const displayError = message => {
  const errorBag = document.querySelector('#errorBag');
  errorBag.textContent = message;

  errorBag.style.color = 'red';

  setTimeout(() => {
    errorBag.textContent = '';
  }, 3000)

}

const calculatePossibleValues = (grid) => {
  let shouldReflow = false;
  function stage1(grid, rerun=true) {
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        const cell = grid[i][j];
        if(cell.value !== null) {
          continue;
        }
        cell.possibleValues = cell.possibleValues.filter(value => {
          return (_canNumberBeInBlock(cell, value) && _canNumberBeInColumn(cell, value) && _canNumberBeInRow(cell, value));
        })

        if(cell.possibleValues.length === 1) {
          cell.setValue(cell.possibleValues[0], 'blue');
          shouldReflow = true;
        }
      }
    }
    if(shouldReflow) {
      shouldReflow = false;
      stage1(grid);
    } else {
      stage2(grid, false);
    }
  }
  stage1(grid);

  function stage2(grid) {

    /* stage1(grid, false) */
    let setVal = false;
    for (let i = 0; i < grid.length; i++) {
      const emptyCells = _getEmptyCellsInRow(i);
      const possibleValues = [];
      emptyCells.forEach(cell => {
        cell.possibleValues = cell.possibleValues.filter(value => {
          return (_canNumberBeInBlock(cell, value) && _canNumberBeInColumn(cell, value) && _canNumberBeInRow(cell, value));
        })
        possibleValues.push(...cell.possibleValues);
      });
      emptyCells.forEach(cell => {
        cell.possibleValues.forEach(value => {
          const temp = possibleValues.filter(val => val === value);
          if(temp.length === 1) {
            setVal = true;
            cell.setValue(value, 'blue');
          }
        })
      })
    }


    let count = 0;
    let currentBlock = _getBlockCoordinates(grid[0][0]);
    do {
      const possibleValues = [];
      const emptyCells = [];
      for(let i = currentBlock[0][0]; i < (currentBlock[0][0] + 3); i++) {
        for(let j = currentBlock[0][1]; j < (currentBlock[0][1] + 3); j++) {
          const cell = grid[i][j];
          if (cell.value === null) {
            emptyCells.push(cell);
            cell.possibleValues = cell.possibleValues.filter(value => {
              return (_canNumberBeInBlock(cell, value) && _canNumberBeInColumn(cell, value) && _canNumberBeInRow(cell, value));
            })
            possibleValues.push(...cell.possibleValues);
          }
        }
      }

      const possibleValuesSet = new Set(possibleValues);
      possibleValuesSet.forEach(value => {
        const filtered = possibleValues.filter(val => val === value);
        if(filtered.length === 1) {
          setVal = true;
          const cell = emptyCells.find(cl => {
            return(cl.possibleValues.includes(filtered[0]));
          })

          cell.setValue(value, 'blue');
        }
      });

      count++;
      if(count < 3) {
        currentBlock = _getBlockCoordinates(grid[0][(count % 3) * 3]);
      } else if(count < 6) {
        currentBlock = _getBlockCoordinates(grid[3][(count % 3) * 3]);
      } else {
        currentBlock = _getBlockCoordinates(grid[6][(count % 3) * 3]);
      }

    }
    while(count < 9);

    for (let i = 0; i < grid.length; i++) {
      const emptyCells = _getEmptyCellsInCol(i);
      const possibleValues = [];
      // const setted =
      emptyCells.forEach(cell => {
        debugger;
        cell.possibleValues = cell.possibleValues.filter(value => {
          return (_canNumberBeInBlock(cell, value) && _canNumberBeInColumn(cell, value) && _canNumberBeInRow(cell, value));
        })
        possibleValues.push(...cell.possibleValues);
      });
      emptyCells.forEach(cell => {
        cell.possibleValues.forEach(value => {
          const temp = possibleValues.filter(val => val === value);
          if(temp.length === 1) {
            setVal = true;
            cell.setValue(value, 'blue');
          }
        })
      })
    }
    if(setVal) {
      stage1(grid)
    }
  }

  if(shouldReflow) {
    shouldReflow = false;
    stage1(grid);
  } else {
    /* for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        const cell = grid[i][j];
        if(cell.value !== null) {
          continue;
        }
        canOnlyExistInPosition(cell);
      }
    } */
  }


  function canOnlyExistInPosition(cell) {
    const blockCoordinates = _getBlockCoordinates(cell);
    const emptyCells = _getEmptyCellsInBlock(blockCoordinates);
    const possibleValues = [];

    for (let index = 0; index < emptyCells.length; index++) {
      const element = emptyCells[index];
      possibleValues.push(...element.possibleValues);
    }

    for (let index = 0; index < emptyCells.length; index++) {
      const element = emptyCells[index];
      for (let j = 0; j < element.possibleValues.length; j++) {
        const current = element.possibleValues[j];

        const temp = possibleValues.filter(value => value === current);
        if(temp.length === 1) {
          if(_canNumberBeInBlock(cell, current) && _canNumberBeInColumn(cell, current) && _canNumberBeInRow(cell, current)) {
            shouldReflow = true;
            element.setValue(current);
          }
        }
      }
    }

    if(shouldReflow) {
      calculatePossibleValues(grid);
    }
  }

  function _getEmptyCellsInRow(outer) {
    const emptyCells = [];
    for (let index = 0; index < grid[outer].length; index++) {
      const element = grid[outer][index];
      if(element.value === null) {
        emptyCells.push(element);
      }
    }
    return emptyCells
  }
  function _getEmptyCellsInCol(col) {
    const emptyCells = [];
    for (let i = 0; i < 9; i++) {
      const element = grid[i][col];
      if(element.value === null) {
        emptyCells.push(element);
      }
    }

    return emptyCells;
  }

  function _getEmptyCellsInBlock(blockCoordinates) {
    const emptyCells = [];
    for(let i = blockCoordinates[0][0]; i <= blockCoordinates[1][0]; i++) {
      for(let j = blockCoordinates[0][1]; j <= blockCoordinates[1][1]; j++) {
        const currentCell = grid[i][j];
        if(currentCell.value === null) {
          emptyCells.push(currentCell);
        }
      }
    }

    return emptyCells;
  }

  function _getBlockCoordinates(cell) {
    const blockStart = [];

    for(let i = 1; i <= 3; i++) {
      if(cell.coordinates[0] < i * 3) {
        if(blockStart[0] === undefined) {
          blockStart[0] = ((i - 1) * 3);
        }
      }

      if(cell.coordinates[1] < i * 3) {
        if(blockStart[1] === undefined) {
          blockStart[1] = ((i - 1) * 3);
        }
      }
    }

    return [blockStart, [blockStart[0] + 2, blockStart[1] + 2]]
  }

  function _canNumberBeInBlock(cell, number) {
    const blockCoordinates = _getBlockCoordinates(cell);

    for(let i = blockCoordinates[0][0]; i <= blockCoordinates[1][0]; i++) {
      for(let j = blockCoordinates[0][1]; j <= blockCoordinates[1][1]; j++) {
        const currentCell = grid[i][j];
        if(currentCell == cell) {
          continue;
        }
        if(currentCell.value === number) {
          return false;
        }
      }
    }

    return true;
  }

  function _canNumberBeInRow(cell, number) {
    for (let index = 0; index < 9; index++) {
      const currentCell = grid[cell.coordinates[0]][index]
      if(currentCell == cell) {
        continue;
      }
      if(currentCell.value === number) {
        return false
      }
    }

    return true;
  }

  function _canNumberBeInColumn(cell, number) {
    for (let index = 0; index < 9; index++) {
      const currentCell = grid[index][cell.coordinates[1]]
      if(currentCell == cell) {
        continue;
      }
      if(currentCell.value === number) {
        return false
      }
    }

    return true;
  }
}



class Cell {
  constructor(coordinates, value = null) {
    this.value = value;
    this.coordinates = coordinates
    this.possibleValues = [1,2,3,4,5,6,7,8,9];
  }
  setValue(value, color = 'black') {
    this.value = value;
    const element = document.querySelector(`input[outer="${this.coordinates[0]}"][inner="${this.coordinates[1]}"]`);
    element.value = value;
    element.style.color = color;
  }
}

function run() {
  const grid = createGrid();

  createHtml(grid);

  document.querySelector('#solve').addEventListener('click', () => {
    calculatePossibleValues(grid);
  })
}

run();