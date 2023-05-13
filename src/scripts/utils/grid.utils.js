export const getIndexesByDirection = (
  fromIndex,
  gridSize,
  direction = "down"
) => {
  let adjacentIndex = getAdjacentIndexByDirection(
    fromIndex,
    gridSize,
    direction
  );

  if (adjacentIndex !== -1) {
    return [
      adjacentIndex,
      ...getIndexesByDirection(adjacentIndex, gridSize, direction),
    ];
  }

  return [];
};

export const getAdjacentIndexByDirection = (
  targetCellIndex,
  gridSize,
  direction = "down"
) => {
  const row = Math.floor(targetCellIndex / gridSize.cols);
  const col = targetCellIndex - row * gridSize.cols;
  let nextIndex = -1;

  switch (direction) {
    case "down": {
      if (row < gridSize.rows - 1) {
        // row below
        nextIndex = targetCellIndex + gridSize.cols;
      } else {
        // no row below
      }
      break;
    }
    case "up": {
      if (row > 0) {
        // row below
        nextIndex = targetCellIndex - gridSize.cols;
      } else {
        // no row above
      }
      break;
    }
    case "left": {
      if (col < gridSize.cols - 1) {
        // row below
        nextIndex = targetCellIndex + 1;
      } else {
        // no col to the left
      }
      break;
    }
    case "right": {
      if (col > 0) {
        // row below
        nextIndex = targetCellIndex - 1;
      } else {
        // no col to the right
      }
      break;
    }
  }

  return nextIndex;
};
