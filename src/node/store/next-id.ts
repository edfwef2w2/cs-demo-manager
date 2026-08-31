export function nextNumericId(rows: Array<{ id: number | string }>) {
  let maxId = 0;
  for (const row of rows) {
    const id = typeof row.id === 'number' ? row.id : Number(row.id);
    if (Number.isFinite(id) && id > maxId) {
      maxId = id;
    }
  }

  return maxId + 1;
}

export function assignSequentialIds<T extends { id?: number | string }>(rows: T[], startId = 1): Array<T & { id: number }> {
  return rows.map((row, index) => {
    return {
      ...row,
      id: startId + index,
    };
  });
}
