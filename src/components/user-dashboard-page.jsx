import { useEffect, useMemo } from 'react';
import { FaBookOpen, FaCalendarAlt, FaChevronRight, FaUserCircle, FaGraduationCap, FaFire, FaUser, FaAward } from 'react-icons/fa';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

const formatDate = (value) => {
  if (!value) return 'Recently';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const formatInr = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export function UserDashboardPage() {
  const {
    user,
    isAuthenticated,
    purchasedCourses,
    purchasedCoursesLoading,
    purchasedCoursesError,
    refreshPurchasedCourses,
  } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stats = useMemo(() => [
    {
      label: 'Courses Enrolled',
      value: purchasedCourses.length,
      icon: FaBookOpen,
      color: 'var(--accent-orange)',
      description: purchasedCourses.length === 1 ? '1 course' : `${purchasedCourses.length} courses`
    },
    {
      label: 'Total Invested',
      value: formatInr(purchasedCourses.reduce((sum, c) => sum + (c.purchase?.amount ?? c.price ?? 0), 0)),
      icon: FaGraduationCap,
      color: 'var(--accent-orange)',
      description: 'Lifetime access'
    },
    {
      label: 'Last Updated',
      value: purchasedCourses[0]?.purchase?.purchasedAt ? formatDate(purchasedCourses[0].purchase.purchasedAt) : 'Just now',
      icon: FaCalendarAlt,
      color: 'var(--accent-orange)',
      description: 'Recently active'
    },
  ], [purchasedCourses]);

  if (!isAuthenticated) {
    return <Navigate to="/auth?next=/dashboard" replace />;
  }

  return (
    <section className="dashboard-shell section-shell">
      <div className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <span className="eyebrow">Welcome Back</span>
          <h1>Continue your learning</h1>
          <p>
            Pick up where you left off. Access all your purchased courses and keep building your skills.
          </p>
        </div>

        <div className="dashboard-hero-panel">
          <div className="dashboard-avatar-large" aria-hidden="true">
            {user?.name ? user.name.trim().slice(0, 1).toUpperCase() : 'S'}
          </div>
          <div className="dashboard-hero-panel-content">
            <strong>{user?.name || 'Student'}</strong>
            <span>{user?.email || 'student@speakify.com'}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-stats">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article key={stat.label} className="dashboard-stat-card">
              <Icon />
              <div>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
              {stat.description && <small className="dashboard-stat-description">{stat.description}</small>}
            </article>
          );
        })}
      </div>

      <div className="dashboard-section-header">
        <div>
          <span className="eyebrow">Your Courses</span>
          <h2>Enrolled Programs</h2>
        </div>
        <button
          type="button"
          className="dashboard-refresh-button"
          onClick={() => refreshPurchasedCourses()}
          disabled={purchasedCoursesLoading}
        >
          {purchasedCoursesLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {purchasedCoursesError && (
        <div className="dashboard-alert dashboard-alert-error">
          {purchasedCoursesError}
        </div>
      )}

      {purchasedCoursesLoading ? (
        <div className="dashboard-empty-state">
          ⏳ Loading your courses...
        </div>
      ) : purchasedCourses.length === 0 ? (
        <div className="dashboard-empty-state">
          <div>
            <p>No courses yet. Start learning today!</p>
            <Link className="dashboard-empty-link" to="/">
              Explore Courses
              <FaChevronRight />
            </Link>
          </div>
        </div>
      ) : (
        <div className="dashboard-courses-grid">
          {purchasedCourses.map((course) => (
            <article key={course._id} className="dashboard-course-card">
              <div className="dashboard-course-top">
                <div style={{ flex: 1 }}>
                  <span className="dashboard-course-category">{course.category || 'Course'}</span>
                  <h3>{course.title || course.courseName || 'Purchased Course'}</h3>
                </div>
              </div>

              <p className="dashboard-course-description">
                {course.description || 'Expand your skills with this course'}
              </p>

              <div className="dashboard-course-meta">
                <span title="Instructor">
                  <FaUser style={{ fontSize: '0.75rem', opacity: 0.7 }} />
                  <strong>{course.instructor || 'Speakify'}</strong>
                </span>
                <span title="Course Level">
                  <FaAward style={{ fontSize: '0.75rem', opacity: 0.7 }} />
                  <strong>{course.level || 'Beginner'}</strong>
                </span>
              </div>

              <div className="dashboard-course-footer">
                <div className="dashboard-course-footer-left">
                  <span className="dashboard-course-price">{formatInr(course.purchase?.amount ?? course.price)}</span>
                </div>
                <span className="dashboard-course-status">{course.isPublished ? '✓ Active' : 'Ready'}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
