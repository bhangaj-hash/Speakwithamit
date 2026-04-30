import { services } from '../data/constant';
import { courseCatalog } from "../data/course-catalog"; 

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');

const serviceOrder = services.map((service) => service.slug);

export const getServiceMeta = (slug) => services.find((service) => service.slug === slug) || null;

export const mergeCourseWithServiceMeta = (course) => {
  if (!course) return null;

  const meta = getServiceMeta(course.slug) || {};

  return {
    ...meta,
    ...course,
    title: course.title || meta.title || meta.shortTitle || 'Course',
    shortTitle: meta.shortTitle || course.title || course.shortTitle || 'Course',
    tagline: meta.tagline || '',
    cardDescription: meta.cardDescription || course.description || '',
    description: course.description || meta.description || '',
    icon: meta.icon || 'book',
    accent: meta.accent || 'var(--accent-orange)',
    priceInr: course.price ?? meta.priceInr ?? 0,
    stats: meta.stats || [],
    outcomes: meta.outcomes || [],
    courseMeta: meta.courseMeta || null,
    courses: meta.courses || [],
  };
};

export const sortCoursesForUi = (courses = []) => {
  const rankedCourses = [...courses];

  return rankedCourses.sort((left, right) => {
    const leftIndex = serviceOrder.indexOf(left.slug);
    const rightIndex = serviceOrder.indexOf(right.slug);

    if (leftIndex === -1 && rightIndex === -1) {
      return String(left.title || '').localeCompare(String(right.title || ''));
    }

    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;
    return leftIndex - rightIndex;
  });
};

const parseCourseResponse = async (response) => {
  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || 'Failed to load courses');
  }

  return payload.data || [];
};

export const fetchCourses = async () => {
  // Optional: mimic API structure if your UI expects it
  return courseCatalog;
};

export const fetchCourseBySlug = async (slug) => {
  if (!slug) {
    throw new Error("Slug is required");
  }

  const normalizedSlug = String(slug)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const course = courseCatalog.find(
    (item) => item.slug === normalizedSlug
  );

  if (!course) {
    throw new Error("Course not found");
  }

  return course;
};
