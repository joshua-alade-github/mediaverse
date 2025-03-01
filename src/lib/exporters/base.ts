export interface ExportOptions {
  format?: 'json' | 'csv';
  types: string[];
}

export abstract class BaseExporter {
  protected userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  abstract export(options: ExportOptions): Promise<string>;
}