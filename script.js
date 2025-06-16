
document.getElementById('solve-btn').addEventListener('click', () => {
  const coinsInput = document.getElementById('coins').value.trim();
  const amountInput = document.getElementById('amount').value.trim();

  if (!coinsInput || !amountInput) {
    alert('Please enter both coin denominations and target amount.');
    return;
  }

  const coins = coinsInput.split(',').map(coin => parseInt(coin.trim(), 10)).filter(coin => !isNaN(coin));
  const amount = parseInt(amountInput, 10);

  if (coins.length === 0 || isNaN(amount)) {
    alert('Please enter valid coin denominations and target amount.');
    return;
  }

  const sortedCoins = [...coins].sort((a, b) => b - a);

  // Greedy Algorithm
  const greedyResult = greedyCoinChange(sortedCoins, amount);
  document.getElementById('greedy-result').innerText = `Coins used: ${greedyResult.result.join(', ')} (Total: ${greedyResult.result.length})`;
  visualizeGreedyTable(greedyResult.steps);

  // Dynamic Programming
  const dpResult = dpCoinChange(coins, amount);
  document.getElementById('dp-result').innerText = `Coins used: ${dpResult.coinsUsed.join(', ')} (Total: ${dpResult.coinsUsed.length})`;

  // Visualize DP Matrix with Timer (Cell-by-cell)
  visualizeDPMatrixWithTimer(dpResult.matrix, coins, amount);

  // Visualize coin picking process (backtracking)
  visualizeCoinPicking(dpResult.coinsUsed, coins, amount);
});

document.getElementById('clear-btn').addEventListener('click', () => {
  document.getElementById('coins').value = '';
  document.getElementById('amount').value = '';
  document.getElementById('greedy-result').innerText = '';
  document.getElementById('dp-result').innerText = '';
  document.getElementById('greedy-table').innerHTML = '';
  document.getElementById('dp-matrix').innerHTML = '';
  document.getElementById('coin-picking').innerHTML = '';  // Clear the coin picking display
});

// Greedy Algorithm
function greedyCoinChange(coins, amount) {
  const result = [];
  const steps = [];
  let remainingAmount = amount;

  for (const coin of coins) {
    while (remainingAmount >= coin) {
      result.push(coin);
      remainingAmount -= coin;
      steps.push({ coin, remainingAmount });
    }
  }

  return { result, steps };
}

// Dynamic Programming
function dpCoinChange(coins, amount) {
  const dpMatrix = Array(coins.length + 1)
    .fill()
    .map(() => Array(amount + 1).fill(Infinity));

  // Initialize DP Matrix for 0 amount
  for (let i = 0; i <= coins.length; i++) {
    dpMatrix[i][0] = 0;
  }

  // Build DP Matrix
  for (let coinIndex = 1; coinIndex <= coins.length; coinIndex++) {
    const coin = coins[coinIndex - 1];
    for (let currentAmount = 1; currentAmount <= amount; currentAmount++) {
      if (coin > currentAmount) {
        dpMatrix[coinIndex][currentAmount] = dpMatrix[coinIndex - 1][currentAmount];
      } else {
        dpMatrix[coinIndex][currentAmount] = Math.min(
          dpMatrix[coinIndex - 1][currentAmount],
          1 + dpMatrix[coinIndex][currentAmount - coin]
        );
      }
    }
  }

  // Backtracking to get coins used
  const coinsUsed = [];
  let remainingAmount = amount;
  let coinIndex = coins.length;

  while (remainingAmount > 0 && coinIndex > 0) {
    if (dpMatrix[coinIndex][remainingAmount] !== dpMatrix[coinIndex - 1][remainingAmount]) {
      coinsUsed.push(coins[coinIndex - 1]);
      remainingAmount -= coins[coinIndex - 1];
    } else {
      coinIndex--;
    }
  }

  return { coinsUsed, matrix: dpMatrix };
}

function visualizeDPMatrixWithTimer(matrix, coins, amount) {
  const dpMatrixElement = document.getElementById('dp-matrix');
  dpMatrixElement.innerHTML = '';

  const tableElement = document.createElement('table');
  tableElement.classList.add('table', 'table-bordered');

  // Create header row with column amounts
  const headerRow = document.createElement('tr');
  const headerCell = document.createElement('th');
  headerCell.innerText = 'Coins \ Amounts';
  headerRow.appendChild(headerCell);

  for (let i = 0; i <= amount; i++) {
    const headerCell = document.createElement('th');
    headerCell.innerText = i;
    headerRow.appendChild(headerCell);
  }
  tableElement.appendChild(headerRow);

  // Add empty rows for the DP matrix
  for (let row = 0; row <= coins.length; row++) {
    const rowElement = document.createElement('tr');
    const firstCell = document.createElement('td');
    firstCell.innerText = row === 0 ? 'No Coin' : coins[row - 1];
    rowElement.appendChild(firstCell);
    for (let col = 0; col <= amount; col++) {
      const cell = document.createElement('td');
      rowElement.appendChild(cell);
    }
    tableElement.appendChild(rowElement);
  }

  dpMatrixElement.appendChild(tableElement);

  // Start filling the matrix with a delay
  let currentRow = 0;
  let currentCol = 0;

  const fillMatrixTimer = setInterval(() => {
    // Only update the cell if it's within the matrix bounds
    if (currentRow <= coins.length && currentCol <= amount) {
      const cell = tableElement.rows[currentRow + 1].cells[currentCol + 1];
      cell.innerText = matrix[currentRow][currentCol] === Infinity ? '∞' : matrix[currentRow][currentCol];

      // Move to the next cell
      currentCol++;

      // Move to the next row once we reach the end of the current row
      if (currentCol > amount) {
        currentCol = 0;
        currentRow++;
      }

      // Stop when all matrix cells have been updated
      if (currentRow > coins.length) {
        clearInterval(fillMatrixTimer);
      }
    }
  }, 800); // 800ms delay for each cell update
}

function visualizeGreedyTable(steps) {
  const greedyTable = document.getElementById('greedy-table');
  greedyTable.innerHTML = '';

  const tableElement = document.createElement('table');
  tableElement.classList.add('table', 'table-bordered');

  const headerRow = document.createElement('tr');
  const headerCell1 = document.createElement('th');
  headerCell1.innerText = 'Step';
  headerRow.appendChild(headerCell1);
  const headerCell2 = document.createElement('th');
  headerCell2.innerText = 'Coin Used';
  headerRow.appendChild(headerCell2);
  const headerCell3 = document.createElement('th');
  headerCell3.innerText = 'Remaining Amount';
  headerRow.appendChild(headerCell3);
  tableElement.appendChild(headerRow);

  steps.forEach((step, index) => {
    const bodyRow = document.createElement('tr');
    const bodyCell1 = document.createElement('td');
    bodyCell1.innerText = index + 1;
    bodyRow.appendChild(bodyCell1);
    const bodyCell2 = document.createElement('td');
    bodyCell2.innerText = step.coin;
    bodyRow.appendChild(bodyCell2);
    const bodyCell3 = document.createElement('td');
    bodyCell3.innerText = step.remainingAmount;
    bodyRow.appendChild(bodyCell3);
    tableElement.appendChild(bodyRow);
  });

  greedyTable.appendChild(tableElement);
}

// Visualize Coin Picking Process (backtracking)
function visualizeCoinPicking(coinsUsed, coins, amount) {
  const coinPickingElement = document.getElementById('coin-picking');
  coinPickingElement.innerHTML = '';  // Clear any previous content

  // Create an element to show the backtracking steps
  const coinPickingDiv = document.createElement('div');
  coinPickingDiv.classList.add('coin-picking-container');
  coinPickingElement.appendChild(coinPickingDiv);

  // Add the starting amount
  let remainingAmount = amount;
  let stepIndex = 0;
  
  // Create a visual representation of the remaining amount
  const amountDisplay = document.createElement('p');
  amountDisplay.innerText = `Remaining Amount: ${remainingAmount}`;
  coinPickingDiv.appendChild(amountDisplay);

  // Animation for coin picking
  const pickCoinTimer = setInterval(() => {
    if (stepIndex < coinsUsed.length) {
      // Get the coin to be picked
      const coin = coinsUsed[stepIndex];
      
      // Create a coin element to highlight
      const coinElement = document.createElement('div');
      coinElement.classList.add('coin');
      coinElement.innerText = coin;
      coinPickingDiv.appendChild(coinElement);
      
      // Update remaining amount
      remainingAmount -= coin;
      amountDisplay.innerText = `Remaining Amount: ${remainingAmount}`;

      // Highlight the coin being picked
      coinElement.classList.add('highlight-coin');
      
      stepIndex++;
    } else {
      clearInterval(pickCoinTimer);  // Stop the timer when all coins are picked
    }
  }, 1000);  // Delay for each coin pick (1 second)
}
