export interface ImportResult {
  succeeded: number;
  failed: number;
  errors: string[];
}

export abstract class BaseImporter {
  protected userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  abstract import(content: string): Promise<ImportResult>;

  protected async createDefaultLists() {
    const supabase = createClient();
    const defaultLists = [
      { title: 'Watchlist', is_default: true },
      { title: 'Watched', is_default: true },
      { title: 'Favorites', is_default: true },
    ];

    for (const list of defaultLists) {
      await supabase
        .from('lists')
        .insert({
          ...list,
          user_id: this.userId,
        })
        .select()
        .single();
    }
  }
}