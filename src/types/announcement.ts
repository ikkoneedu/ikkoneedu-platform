/**
 * Duyuru veri modeli.
 */

export type AnnouncementAudience = "all" | "parents" | "students" | "teachers";

export interface Announcement {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  category: string;
  audience: AnnouncementAudience;
  publishedAt: string;
  authorId: string;
}
