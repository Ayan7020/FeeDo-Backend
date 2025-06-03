export interface DatabaseError extends Error {
    code?: string;
    name: string;
} 