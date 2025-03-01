import Papa from 'papaparse';

export function parseCSV(content: string) {
  return new Promise((resolve, reject) => {
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error),
    });
  });
}

export function generateCSV(data: any[], fields?: string[]) {
  const parser = new Parser({
    fields: fields || Object.keys(data[0]),
  });
  return parser.parse(data);
}