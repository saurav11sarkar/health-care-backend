export interface IPagenation {
  page?: number;
  limit?: number;
  skip?: number;
  sortBy?: string | undefined;
  sortOrder?: string | undefined;
}
