export type ProjectStatus = "active" | "completed" | "archived";

export type ProjectDocument = {
  url: string;
  name: string;
};

export type ProjectTeamMember = {
  id: string;
  name: string;
  email: string;
};

export type ProjectAuthor = {
  id: string;
  name: string;
  email: string;
};

export type Project = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  status: ProjectStatus;
  documents: ProjectDocument[];
  createdAt: string;
  updatedAt: string;
  createdById: string;
  userId: string | null;
  teams: ProjectTeamMember[];
  createdBy: ProjectAuthor;
  isOverdue: boolean;
  overdueDays: number;
};

export type ProjectPaginationMeta = {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
  };
};

export type GetProjectsResponse = {
  data: Project[];
  meta: ProjectPaginationMeta;
};

export type GetProjectsParams = {
  name?: string;
  status?: ProjectStatus | "all";
  page?: number;
  perPage?: number;
};

