-- ============================================================================
--  KMSIT COMPUTER · LMS + CMS PLATFORM
--  Struktur database MySQL lengkap (satu-satunya database yang didukung)
-- ----------------------------------------------------------------------------
--  CARA IMPORT (phpMyAdmin):
--    1. Buka phpMyAdmin → tab "Import"
--    2. Pilih file ini (kmsit_computer.sql)
--    3. Format: SQL · klik "Go"
--  Database `kmsit_computer` akan dibuat otomatis beserta seluruh tabel & seed.
--  Setelah import, isi kredensial ini di backend/.env Laravel:
--    DB_CONNECTION=mysql
--    DB_HOST=127.0.0.1  DB_PORT=3306
--    DB_DATABASE=kmsit_computer
--    DB_USERNAME=...    DB_PASSWORD=...
-- ----------------------------------------------------------------------------
--  Mesin   : InnoDB (transaksi + foreign key)
--  Charset : utf8mb4 / utf8mb4_unicode_ci
--  Syarat  : MySQL 5.7+ atau MariaDB 10.4+
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `kmsit_computer`
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `kmsit_computer`;

-- ============================ LARAVEL FRAMEWORK =============================

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `id` VARCHAR(255) NOT NULL,
  `user_id` BIGINT UNSIGNED NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `payload` LONGTEXT NOT NULL,
  `last_activity` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `cache`;
CREATE TABLE `cache` (
  `key` VARCHAR(255) NOT NULL,
  `value` MEDIUMTEXT NOT NULL,
  `expiration` INT NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE `cache_locks` (
  `key` VARCHAR(255) NOT NULL,
  `owner` VARCHAR(255) NOT NULL,
  `expiration` INT NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `queue` VARCHAR(255) NOT NULL,
  `payload` LONGTEXT NOT NULL,
  `attempts` TINYINT UNSIGNED NOT NULL,
  `reserved_at` INT UNSIGNED NULL,
  `available_at` INT UNSIGNED NOT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE `job_batches` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `total_jobs` INT NOT NULL,
  `pending_jobs` INT NOT NULL,
  `failed_jobs` INT NOT NULL,
  `failed_job_ids` LONGTEXT NOT NULL,
  `options` MEDIUMTEXT NULL,
  `cancelled_at` INT NULL,
  `created_at` INT NOT NULL,
  `finished_at` INT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE `failed_jobs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` VARCHAR(255) NOT NULL,
  `connection` TEXT NOT NULL,
  `queue` TEXT NOT NULL,
  `payload` LONGTEXT NOT NULL,
  `exception` LONGTEXT NOT NULL,
  `failed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE `personal_access_tokens` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` VARCHAR(255) NOT NULL,
  `tokenable_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `token` VARCHAR(64) NOT NULL,
  `abilities` TEXT NULL,
  `last_used_at` TIMESTAMP NULL,
  `expires_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`, `tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================ AUTH & RBAC ===============================

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(40) NOT NULL,
  `label` VARCHAR(60) NOT NULL,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(60) NOT NULL,
  `label` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(190) NOT NULL,
  `email_verified_at` TIMESTAMP NULL,
  `password` VARCHAR(255) NOT NULL COMMENT 'bcrypt hash — tidak pernah plain text',
  `google_id` VARCHAR(190) NULL COMMENT 'OAuth Google / Gmail',
  `role_id` BIGINT UNSIGNED NOT NULL DEFAULT 4,
  `phone` VARCHAR(30) NULL,
  `bio` TEXT NULL,
  `color` VARCHAR(9) NOT NULL DEFAULT '#0e8a75',
  `bank` VARCHAR(40) NULL,
  `account_number` VARCHAR(40) NULL,
  `status` ENUM('active','suspended') NOT NULL DEFAULT 'active',
  `remember_token` VARCHAR(100) NULL,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_google_id_index` (`google_id`),
  KEY `users_status_index` (`status`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `role_user`;
CREATE TABLE `role_user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_user_unique` (`role_id`, `user_id`),
  CONSTRAINT `fk_ru_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ru_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `permission_role`;
CREATE TABLE `permission_role` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `permission_id` BIGINT UNSIGNED NOT NULL,
  `role_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permission_role_unique` (`permission_id`, `role_id`),
  CONSTRAINT `fk_pr_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pr_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================ SETTINGS ==================================

DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `skey` VARCHAR(80) NOT NULL,
  `value` TEXT NULL,
  `sgroup` VARCHAR(40) NOT NULL DEFAULT 'general',
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_skey_unique` (`skey`),
  KEY `settings_sgroup_index` (`sgroup`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================ CMS: HALAMAN & MENU ===========================

DROP TABLE IF EXISTS `pages`;
CREATE TABLE `pages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(190) NOT NULL,
  `slug` VARCHAR(190) NOT NULL,
  `content` LONGTEXT NULL,
  `featured_image` VARCHAR(255) NULL,
  `status` ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  `seo_title` VARCHAR(190) NULL,
  `seo_description` TEXT NULL,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pages_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `menus`;
CREATE TABLE `menus` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(80) NOT NULL,
  `location` ENUM('header','footer') NOT NULL DEFAULT 'header',
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `menus_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `menu_items`;
CREATE TABLE `menu_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `menu_id` BIGINT UNSIGNED NOT NULL,
  `parent_id` BIGINT UNSIGNED NULL COMMENT 'nested / dropdown',
  `label` VARCHAR(100) NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  `target` ENUM('_self','_blank') NOT NULL DEFAULT '_self',
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `menu_items_menu_index` (`menu_id`),
  KEY `menu_items_parent_index` (`parent_id`),
  CONSTRAINT `fk_mi_menu` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mi_parent` FOREIGN KEY (`parent_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `media`;
CREATE TABLE `media` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(190) NOT NULL,
  `path` VARCHAR(255) NOT NULL COMMENT 'Laravel Storage disk: public',
  `url` VARCHAR(255) NOT NULL,
  `mime` VARCHAR(100) NOT NULL,
  `size` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `uploaded_by` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `media_mime_index` (`mime`),
  CONSTRAINT `fk_media_user` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `home_sections`;
CREATE TABLE `home_sections` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` ENUM('hero','stats','featured','categories','latest','tutorials','articles','news','programs','instructors','testimonials','cta') NOT NULL,
  `title` VARCHAR(160) NOT NULL,
  `subtitle` VARCHAR(255) NULL,
  `settings` JSON NULL COMMENT 'konfigurasi bebas per section',
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `home_sections_order_index` (`sort_order`),
  KEY `home_sections_active_index` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================ KATEGORI ==================================

DROP TABLE IF EXISTS `course_categories`;
CREATE TABLE `course_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(80) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `color` VARCHAR(9) NOT NULL DEFAULT '#0e8a75',
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`), UNIQUE KEY `cc_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `article_categories`;
CREATE TABLE `article_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(80) NOT NULL, `slug` VARCHAR(100) NOT NULL, `color` VARCHAR(9) NOT NULL DEFAULT '#0e8a75',
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`), UNIQUE KEY `ac_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `news_categories`;
CREATE TABLE `news_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(80) NOT NULL, `slug` VARCHAR(100) NOT NULL, `color` VARCHAR(9) NOT NULL DEFAULT '#0e8a75',
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`), UNIQUE KEY `nc_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `tutorial_categories`;
CREATE TABLE `tutorial_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(80) NOT NULL, `slug` VARCHAR(100) NOT NULL, `color` VARCHAR(9) NOT NULL DEFAULT '#0e8a75',
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`), UNIQUE KEY `tc_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `program_categories`;
CREATE TABLE `program_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(80) NOT NULL, `slug` VARCHAR(100) NOT NULL, `color` VARCHAR(9) NOT NULL DEFAULT '#0e8a75',
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`), UNIQUE KEY `pc_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================ LMS: KELAS ================================

DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(190) NOT NULL,
  `title` VARCHAR(190) NOT NULL,
  `description` TEXT NULL,
  `long_description` LONGTEXT NULL,
  `thumbnail` VARCHAR(255) NULL,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `price` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '0 = kelas gratis',
  `level` ENUM('Pemula','Menengah','Lanjutan') NOT NULL DEFAULT 'Pemula',
  `status` ENUM('draft','published') NOT NULL DEFAULT 'draft',
  `rating` DECIMAL(2,1) NOT NULL DEFAULT 0.0,
  `tags` JSON NULL,
  `certificate_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `courses_slug_unique` (`slug`),
  KEY `courses_category_index` (`category_id`),
  KEY `courses_status_index` (`status`),
  KEY `courses_price_index` (`price`),
  CONSTRAINT `fk_courses_category` FOREIGN KEY (`category_id`) REFERENCES `course_categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `course_instructors`;
CREATE TABLE `course_instructors` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id` BIGINT UNSIGNED NOT NULL,
  `instructor_id` BIGINT UNSIGNED NOT NULL,
  `revenue_share` DECIMAL(5,2) NOT NULL DEFAULT 85.00 COMMENT 'persentase untuk instruktur (platform 15%)',
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_instructor_unique` (`course_id`, `instructor_id`),
  KEY `ci_instructor_index` (`instructor_id`),
  CONSTRAINT `fk_ci_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ci_instructor` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `course_modules`;
CREATE TABLE `course_modules` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(190) NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `modules_course_index` (`course_id`),
  CONSTRAINT `fk_modules_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `lessons`;
CREATE TABLE `lessons` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `module_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(190) NOT NULL,
  `type` ENUM('video','text','file','quiz') NOT NULL DEFAULT 'video',
  `youtube_id` VARCHAR(24) NULL COMMENT 'otomatis di-embed dari URL youtube.com / youtu.be',
  `content` LONGTEXT NULL,
  `file_name` VARCHAR(190) NULL,
  `duration` VARCHAR(20) NULL,
  `is_free` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'preview tanpa enrollment',
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `lessons_module_index` (`module_id`),
  CONSTRAINT `fk_lessons_module` FOREIGN KEY (`module_id`) REFERENCES `course_modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================ LMS: QUIZ =================================

DROP TABLE IF EXISTS `quizzes`;
CREATE TABLE `quizzes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id` BIGINT UNSIGNED NOT NULL,
  `lesson_id` BIGINT UNSIGNED NULL,
  `title` VARCHAR(190) NOT NULL,
  `time_limit` INT NOT NULL DEFAULT 10 COMMENT 'menit',
  `passing_grade` INT NOT NULL DEFAULT 70 COMMENT 'persen',
  `attempt_limit` INT NOT NULL DEFAULT 3,
  `randomize` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `quizzes_course_index` (`course_id`),
  KEY `quizzes_lesson_index` (`lesson_id`),
  CONSTRAINT `fk_quizzes_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_quizzes_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `quiz_questions`;
CREATE TABLE `quiz_questions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `quiz_id` BIGINT UNSIGNED NOT NULL,
  `type` ENUM('single','boolean','multiple') NOT NULL DEFAULT 'single',
  `text` TEXT NOT NULL,
  `points` INT NOT NULL DEFAULT 10,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `qq_quiz_index` (`quiz_id`),
  CONSTRAINT `fk_qq_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `quiz_answers`;
CREATE TABLE `quiz_answers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `question_id` BIGINT UNSIGNED NOT NULL,
  `text` TEXT NOT NULL,
  `is_correct` TINYINT(1) NOT NULL DEFAULT 0,
  `sort_order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `qa_question_index` (`question_id`),
  CONSTRAINT `fk_qa_question` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `quiz_attempts`;
CREATE TABLE `quiz_attempts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `quiz_id` BIGINT UNSIGNED NOT NULL,
  `student_id` BIGINT UNSIGNED NOT NULL,
  `score` INT NOT NULL DEFAULT 0,
  `total` INT NOT NULL DEFAULT 0,
  `percent` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `passed` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `attempts_quiz_index` (`quiz_id`),
  KEY `attempts_student_index` (`student_id`),
  CONSTRAINT `fk_attempts_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_attempts_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `quiz_attempt_answers`;
CREATE TABLE `quiz_attempt_answers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `attempt_id` BIGINT UNSIGNED NOT NULL,
  `question_id` BIGINT UNSIGNED NOT NULL,
  `answers` JSON NOT NULL COMMENT 'id jawaban yang dipilih',
  `is_correct` TINYINT(1) NOT NULL DEFAULT 0,
  `points_earned` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `qaa_attempt_index` (`attempt_id`),
  CONSTRAINT `fk_qaa_attempt` FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_qaa_question` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================= LMS: ENROLLMENT & PROGRESS =======================

DROP TABLE IF EXISTS `enrollments`;
CREATE TABLE `enrollments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id` BIGINT UNSIGNED NOT NULL,
  `student_id` BIGINT UNSIGNED NOT NULL,
  `status` ENUM('active','completed') NOT NULL DEFAULT 'active',
  `payment_id` BIGINT UNSIGNED NULL COMMENT 'NULL untuk kelas gratis',
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `enrollment_unique` (`course_id`, `student_id`),
  KEY `enrollments_student_index` (`student_id`),
  CONSTRAINT `fk_enroll_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enroll_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `lesson_progress`;
CREATE TABLE `lesson_progress` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `enrollment_id` BIGINT UNSIGNED NOT NULL,
  `lesson_id` BIGINT UNSIGNED NOT NULL,
  `completed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `progress_unique` (`enrollment_id`, `lesson_id`),
  CONSTRAINT `fk_progress_enroll` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_progress_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================ SERTIFIKAT DIGITAL ============================

DROP TABLE IF EXISTS `certificate_templates`;
CREATE TABLE `certificate_templates` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(80) NOT NULL,
  `config` JSON NOT NULL COMMENT 'warna, layout, posisi elemen',
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ct_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `certificates`;
CREATE TABLE `certificates` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(40) NOT NULL COMMENT 'cth: KMSIT-2025-8F42K1',
  `student_id` BIGINT UNSIGNED NOT NULL,
  `course_id` BIGINT UNSIGNED NOT NULL,
  `template_id` BIGINT UNSIGNED NULL,
  `instructor_name` VARCHAR(120) NOT NULL,
  `issued_at` DATE NOT NULL,
  `qr_payload` VARCHAR(255) NOT NULL COMMENT 'URL verifikasi',
  `verify_url` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `certificates_code_unique` (`code`),
  KEY `certificates_student_index` (`student_id`),
  KEY `certificates_course_index` (`course_id`),
  CONSTRAINT `fk_cert_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cert_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cert_template` FOREIGN KEY (`template_id`) REFERENCES `certificate_templates` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================== KONTEN: ARTIKEL =============================

DROP TABLE IF EXISTS `articles`;
CREATE TABLE `articles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(190) NOT NULL,
  `title` VARCHAR(190) NOT NULL,
  `excerpt` TEXT NULL,
  `content` LONGTEXT NULL,
  `cover` VARCHAR(255) NULL,
  `hue` SMALLINT NOT NULL DEFAULT 168,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `author_id` BIGINT UNSIGNED NOT NULL,
  `status` ENUM('draft','published','scheduled','archived') NOT NULL DEFAULT 'draft',
  `published_at` TIMESTAMP NULL,
  `seo_title` VARCHAR(190) NULL,
  `seo_description` TEXT NULL,
  `views` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `articles_slug_unique` (`slug`),
  KEY `articles_category_index` (`category_id`),
  KEY `articles_status_index` (`status`),
  KEY `articles_published_index` (`published_at`),
  CONSTRAINT `fk_articles_category` FOREIGN KEY (`category_id`) REFERENCES `article_categories` (`id`),
  CONSTRAINT `fk_articles_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `article_tags`;
CREATE TABLE `article_tags` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `article_id` BIGINT UNSIGNED NOT NULL,
  `tag` VARCHAR(60) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `atag_article_index` (`article_id`),
  KEY `atag_tag_index` (`tag`),
  CONSTRAINT `fk_atag_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================== KONTEN: BERITA =============================

DROP TABLE IF EXISTS `news`;
CREATE TABLE `news` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(190) NOT NULL,
  `title` VARCHAR(190) NOT NULL,
  `excerpt` TEXT NULL,
  `content` LONGTEXT NULL,
  `hue` SMALLINT NOT NULL DEFAULT 204,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `author_id` BIGINT UNSIGNED NOT NULL,
  `status` ENUM('draft','published','scheduled','archived') NOT NULL DEFAULT 'draft',
  `published_at` TIMESTAMP NULL,
  `seo_title` VARCHAR(190) NULL,
  `seo_description` TEXT NULL,
  `views` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `news_slug_unique` (`slug`),
  KEY `news_category_index` (`category_id`),
  KEY `news_status_index` (`status`),
  CONSTRAINT `fk_news_category` FOREIGN KEY (`category_id`) REFERENCES `news_categories` (`id`),
  CONSTRAINT `fk_news_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================== KONTEN: TUTORIAL ============================

DROP TABLE IF EXISTS `tutorials`;
CREATE TABLE `tutorials` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(190) NOT NULL,
  `title` VARCHAR(190) NOT NULL,
  `description` TEXT NULL,
  `content` LONGTEXT NULL,
  `hue` SMALLINT NOT NULL DEFAULT 262,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `author_id` BIGINT UNSIGNED NOT NULL,
  `youtube_id` VARCHAR(24) NULL,
  `tags` JSON NULL,
  `status` ENUM('draft','published','scheduled','archived') NOT NULL DEFAULT 'draft',
  `published_at` TIMESTAMP NULL,
  `views` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tutorials_slug_unique` (`slug`),
  KEY `tutorials_category_index` (`category_id`),
  KEY `tutorials_status_index` (`status`),
  CONSTRAINT `fk_tutorials_category` FOREIGN KEY (`category_id`) REFERENCES `tutorial_categories` (`id`),
  CONSTRAINT `fk_tutorials_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================== KONTEN: PROGRAM ============================

DROP TABLE IF EXISTS `programs`;
CREATE TABLE `programs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(190) NOT NULL,
  `title` VARCHAR(190) NOT NULL,
  `description` TEXT NULL,
  `hue` SMALLINT NOT NULL DEFAULT 168,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `duration` VARCHAR(60) NULL,
  `course_ids` JSON NOT NULL,
  `status` ENUM('draft','published') NOT NULL DEFAULT 'draft',
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `programs_slug_unique` (`slug`),
  CONSTRAINT `fk_programs_category` FOREIGN KEY (`category_id`) REFERENCES `program_categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================== PEMBAYARAN (Tripay / Xendit / Stripe) =================

DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `invoice` VARCHAR(40) NOT NULL,
  `student_id` BIGINT UNSIGNED NOT NULL,
  `course_id` BIGINT UNSIGNED NOT NULL,
  `provider` ENUM('tripay','xendit','stripe') NOT NULL,
  `mode` ENUM('sandbox','production') NOT NULL DEFAULT 'sandbox',
  `method` VARCHAR(60) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `gateway_fee` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('pending','paid','failed','expired') NOT NULL DEFAULT 'pending',
  `gateway_ref` VARCHAR(120) NULL COMMENT 'reference dari payment gateway',
  `paid_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payments_invoice_unique` (`invoice`),
  KEY `payments_student_index` (`student_id`),
  KEY `payments_course_index` (`course_id`),
  KEY `payments_status_index` (`status`),
  KEY `payments_provider_index` (`provider`),
  CONSTRAINT `fk_payments_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_payments_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `payment_transactions`;
CREATE TABLE `payment_transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `payment_id` BIGINT UNSIGNED NOT NULL,
  `type` ENUM('charge','webhook','refund') NOT NULL DEFAULT 'charge',
  `amount` DECIMAL(12,2) NOT NULL,
  `raw` JSON NULL COMMENT 'payload asli gateway',
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `pt_payment_index` (`payment_id`),
  CONSTRAINT `fk_pt_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================== DOMPET & PENCAIRAN INSTRUKTUR =====================

DROP TABLE IF EXISTS `instructor_wallets`;
CREATE TABLE `instructor_wallets` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `instructor_id` BIGINT UNSIGNED NOT NULL,
  `balance` DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT 'saldo tersedia',
  `pending` DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT 'menunggu persetujuan',
  `withdrawn` DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT 'total dicairkan',
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wallet_instructor_unique` (`instructor_id`),
  CONSTRAINT `fk_wallet_instructor` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `instructor_wallet_transactions`;
CREATE TABLE `instructor_wallet_transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `wallet_id` BIGINT UNSIGNED NOT NULL,
  `payment_id` BIGINT UNSIGNED NULL,
  `type` ENUM('earning','withdrawal','refund') NOT NULL,
  `gross_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `platform_fee` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '15% biaya penyedia layanan',
  `gateway_fee` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `net_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT 'bagian instruktur',
  `note` VARCHAR(190) NULL,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `iwt_wallet_index` (`wallet_id`),
  KEY `iwt_payment_index` (`payment_id`),
  CONSTRAINT `fk_iwt_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `instructor_wallets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_iwt_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `withdrawal_requests`;
CREATE TABLE `withdrawal_requests` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `wallet_id` BIGINT UNSIGNED NOT NULL,
  `amount` DECIMAL(14,2) NOT NULL,
  `bank` VARCHAR(40) NOT NULL,
  `account_number` VARCHAR(40) NOT NULL,
  `account_holder` VARCHAR(120) NOT NULL,
  `status` ENUM('pending','processing','approved','rejected','completed') NOT NULL DEFAULT 'pending',
  `processed_by` BIGINT UNSIGNED NULL COMMENT 'Super Admin pemroses',
  `note` TEXT NULL,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `wr_wallet_index` (`wallet_id`),
  KEY `wr_status_index` (`status`),
  CONSTRAINT `fk_wr_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `instructor_wallets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wr_admin` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================ INTEGRASI =================================

DROP TABLE IF EXISTS `youtube_integrations`;
CREATE TABLE `youtube_integrations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `channel_id` VARCHAR(80) NULL,
  `api_key` VARCHAR(120) NULL COMMENT 'terenkripsi di aplikasi',
  `enabled` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `zoom_integrations`;
CREATE TABLE `zoom_integrations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `account_id` VARCHAR(120) NULL,
  `client_id` VARCHAR(120) NULL,
  `client_secret` VARCHAR(190) NULL COMMENT 'terenkripsi di aplikasi',
  `enabled` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `google_meet_integrations`;
CREATE TABLE `google_meet_integrations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `client_id` VARCHAR(190) NULL,
  `client_secret` VARCHAR(190) NULL COMMENT 'OAuth Google — terenkripsi',
  `enabled` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================ STRUKTUR ORGANISASI ===========================

DROP TABLE IF EXISTS `org_units`;
CREATE TABLE `org_units` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `tagline` VARCHAR(190) NULL,
  `level` ENUM('board','division','team') NOT NULL DEFAULT 'division',
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `org_members`;
CREATE TABLE `org_members` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `unit_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `position` VARCHAR(120) NOT NULL,
  `email` VARCHAR(190) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `om_unit_index` (`unit_id`),
  CONSTRAINT `fk_om_unit` FOREIGN KEY (`unit_id`) REFERENCES `org_units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================ SISTEM ====================================

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL,
  `title` VARCHAR(160) NOT NULL,
  `body` TEXT NOT NULL,
  `read_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `notif_user_index` (`user_id`),
  KEY `notif_read_index` (`read_at`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE `activity_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL,
  `user_name` VARCHAR(120) NOT NULL,
  `action` VARCHAR(60) NOT NULL,
  `detail` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL, `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `alog_user_index` (`user_id`),
  KEY `alog_action_index` (`action`),
  CONSTRAINT `fk_alog_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
--  SEED DATA (roles, permissions, settings, kategori, menu, section, org)
-- ============================================================================

INSERT INTO `roles` (`id`, `slug`, `label`, `created_at`, `updated_at`) VALUES
  (1, 'super_admin', 'Super Admin', NOW(), NOW()),
  (2, 'admin', 'Admin', NOW(), NOW()),
  (3, 'instructor', 'Instruktur', NOW(), NOW()),
  (4, 'student', 'Siswa', NOW(), NOW());

INSERT INTO `permissions` (`id`, `slug`, `label`, `created_at`, `updated_at`) VALUES
  (1,  'manage_settings',    'Mengatur pengaturan website', NOW(), NOW()),
  (2,  'manage_users',       'Mengatur user', NOW(), NOW()),
  (3,  'manage_roles',       'Mengatur role & permission', NOW(), NOW()),
  (4,  'manage_content',     'Mengelola artikel/berita/tutorial', NOW(), NOW()),
  (5,  'manage_courses',     'Mengelola kelas & kurikulum', NOW(), NOW()),
  (6,  'manage_students',    'Mengelola siswa', NOW(), NOW()),
  (7,  'manage_instructors', 'Mengelola instruktur', NOW(), NOW()),
  (8,  'manage_payments',    'Mengelola pembayaran', NOW(), NOW()),
  (9,  'manage_withdrawals', 'Memproses pencairan instruktur', NOW(), NOW()),
  (10, 'manage_integrations','Mengatur integrasi & gateway', NOW(), NOW()),
  (11, 'manage_cms',         'Mengelola CMS (home, menu, halaman)', NOW(), NOW()),
  (12, 'manage_media',       'Mengelola media library', NOW(), NOW()),
  (13, 'view_reports',       'Melihat laporan', NOW(), NOW());

-- Super Admin: semua permission
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES
  (1,1),(2,1),(3,1),(4,1),(5,1),(6,1),(7,1),(8,1),(9,1),(10,1),(11,1),(12,1),(13,1);
-- Admin: sesuai matriks (tanpa pengaturan inti)
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES
  (4,2),(5,2),(6,2),(7,2),(8,2),(11,2),(12,2),(13,2);
-- Instruktur: kelas miliknya + laporan
INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES
  (5,3),(13,3);

-- Pengaturan default website (nilai identitas dapat diubah Super Admin dari dashboard)
INSERT INTO `settings` (`skey`, `value`, `sgroup`) VALUES
  ('site_name',      'KMSIT Computer', 'identity'),
  ('slogan',         'Belajar Teknologi, Naik Level.', 'identity'),
  ('description',    'Platform LMS & CMS untuk kelas online, tutorial, artikel, berita, quiz, dan sertifikat digital.', 'identity'),
  ('logo_url',       '', 'identity'),
  ('favicon_url',    '', 'identity'),
  ('brand_color',    '#17a58c', 'identity'),
  ('accent_color',   '#e8a33d', 'identity'),
  ('email',          'halo@kmsit.id', 'contact'),
  ('phone',          '(021) 555-0199', 'contact'),
  ('whatsapp',       '6281234567890', 'contact'),
  ('address',        'Jl. Pendidikan Teknologi No. 12, Jakarta Selatan', 'contact'),
  ('map_lat',        '-6.2614927', 'contact'),
  ('map_lng',        '106.8106253', 'contact'),
  ('map_label',      'KMSIT Computer — Kampus Utama', 'contact'),
  ('timezone',       'Asia/Jakarta', 'locale'),
  ('language',       'id', 'locale'),
  ('currency',       'IDR', 'locale'),
  ('maintenance_mode','0', 'system'),
  ('registration_open','1', 'system'),
  ('footer_text',    '© 2025 KMSIT Computer. Seluruh hak cipta dilindungi.', 'identity'),
  ('seo_title',      'KMSIT Computer — LMS & CMS Platform', 'seo'),
  ('seo_description','Kelas online komputer dengan sertifikat digital terverifikasi.', 'seo'),
  ('seo_keywords',   'kursus komputer, lms, bootcamp, sertifikasi, kmsit', 'seo'),
  ('active_gateway', 'tripay', 'payment'),
  ('payment_gateway','tripay', 'payment'),
  ('gateway_mode',   'sandbox', 'payment'),
  ('social_instagram','https://instagram.com/kmsit', 'social'),
  ('social_youtube', 'https://youtube.com/@kmsit', 'social'),
  ('social_facebook','https://facebook.com/kmsit', 'social'),
  ('social_github',  'https://github.com/kmsit', 'social');

INSERT INTO `course_categories` (`id`, `name`, `slug`, `color`) VALUES
  (1, 'Web Development', 'web-development', '#0e8a75'),
  (2, 'Jaringan', 'jaringan', '#3e8fc4'),
  (3, 'Data Science', 'data-science', '#dd8f22'),
  (4, 'Desain', 'desain', '#c04f7e');

INSERT INTO `article_categories` (`id`, `name`, `slug`, `color`) VALUES
  (1, 'Web Dev', 'web-dev', '#0e8a75'),
  (2, 'Karir', 'karir', '#dd8f22'),
  (3, 'Database', 'database', '#3e8fc4');

INSERT INTO `news_categories` (`id`, `name`, `slug`, `color`) VALUES
  (1, 'Kampus', 'kampus', '#0e8a75'),
  (2, 'Kerja Sama', 'kerja-sama', '#3e8fc4');

INSERT INTO `tutorial_categories` (`id`, `name`, `slug`, `color`) VALUES
  (1, 'Frontend', 'frontend', '#0e8a75'),
  (2, 'Server', 'server', '#8a5cc0'),
  (3, 'Tools', 'tools', '#dd8f22');

INSERT INTO `program_categories` (`id`, `name`, `slug`, `color`) VALUES
  (1, 'Bootcamp', 'bootcamp', '#0e8a75'),
  (2, 'Sertifikasi', 'sertifikasi', '#3e8fc4');

INSERT INTO `menus` (`id`, `name`, `location`) VALUES
  (1, 'Menu Utama', 'header'),
  (2, 'Menu Footer', 'footer');

INSERT INTO `menu_items` (`menu_id`, `parent_id`, `label`, `url`, `sort_order`) VALUES
  (1, NULL, 'Beranda',  '/',          1),
  (1, NULL, 'Kelas',    '/courses',   2),
  (1, NULL, 'Program',  '/programs',  3),
  (1, NULL, 'Konten',   '#',          4),
  (1, 4,    'Artikel',  '/articles',  1),
  (1, 4,    'Berita',   '/news',      2),
  (1, 4,    'Tutorial', '/tutorials', 3),
  (1, NULL, 'Tentang',  '/about',     5),
  (2, NULL, 'Tentang Kami',        '/about',             1),
  (2, NULL, 'FAQ',                 '/page/faq',          2),
  (2, NULL, 'Verifikasi Sertifikat','/verify-certificate',3);

INSERT INTO `home_sections` (`type`, `title`, `subtitle`, `sort_order`, `is_active`) VALUES
  ('hero',         'Belajar Teknologi, Naik Level.', 'Kelas online + lab praktik dengan instruktur praktisi. Quiz, sertifikat digital terverifikasi, dan penyaluran kerja.', 1, 1),
  ('stats',        'Statistik', '', 2, 1),
  ('featured',     'Kelas Unggulan', 'Kurikulum berbasis kebutuhan industri, diperbarui setiap kuartal.', 3, 1),
  ('categories',   'Jelajahi Bidang', 'Pilih jalur belajarmu.', 4, 1),
  ('tutorials',    'Tutorial Terbaru', 'Panduan praktis langsung dari instruktur.', 5, 1),
  ('articles',     'Artikel & Insight', 'Bacaan pilihan untuk mempercepat karirmu.', 6, 1),
  ('news',         'Berita Kampus', 'Kabar terbaru dari KMSIT.', 7, 1),
  ('programs',     'Program Intensif', 'Jalur belajar terstruktur dengan target karir jelas.', 8, 1),
  ('instructors',  'Instruktur Praktisi', 'Belajar langsung dari orang yang mengerjakannya setiap hari.', 9, 1),
  ('testimonials', 'Kata Mereka', 'Cerita alumni KMSIT.', 10, 1),
  ('cta',          'Mulai Belajar Hari Ini', 'Daftar gratis dan ikuti kelas pertamamu dalam 5 menit.', 11, 1);

INSERT INTO `certificate_templates` (`name`, `config`, `is_default`) VALUES
  ('classic', '{"border":"double","color":"#0c6e5f","font":"serif","seal":true}', 1),
  ('modern',  '{"border":"solid","color":"#101a17","font":"sans","seal":false,"accent":"#e8a33d"}', 0);

INSERT INTO `org_units` (`id`, `name`, `tagline`, `level`, `sort_order`) VALUES
  (1, 'Dewan Pengurus', 'Pimpinan & tata kelola lembaga', 'board', 1),
  (2, 'Divisi Akademik', 'Kurikulum, instruktur, dan penjaminan mutu', 'division', 2),
  (3, 'Divisi Teknologi & Sistem Informasi', 'Platform LMS, infrastruktur, dan keamanan', 'division', 3),
  (4, 'Divisi Operasional & Kemitraan', 'Lab, administrasi, dan hubungan industri', 'division', 4);

INSERT INTO `org_members` (`unit_id`, `name`, `position`, `sort_order`) VALUES
  (1, 'Hendra Gunawan', 'Ketua Umum', 1),
  (1, 'Lestari Widuri', 'Wakil Ketua', 2),
  (1, 'Agus Salim', 'Sekretaris', 3),
  (1, 'Ratna Dewi', 'Bendahara', 4),
  (2, 'Mirza Hakim', 'Kepala Divisi', 1),
  (2, 'Salsabila Putri', 'Pengembang Kurikulum', 2),
  (2, 'Dimas Anggara', 'Penjaminan Mutu', 3),
  (3, 'Yusuf Maulana', 'Kepala Divisi', 1),
  (3, 'Karina Ayu', 'Pengembang Sistem', 2),
  (3, 'Bagus Wicaksono', 'Infrastruktur & Jaringan', 3),
  (4, 'Tania Rahma', 'Kepala Divisi', 1),
  (4, 'Reza Fahlevi', 'Hubungan Industri', 2);

-- ============================================================================
--  SELESAI — 45 tabel + seed. Akun Super Admin dibuat lewat installer
--  (POST /api/install) dengan password ter-hash bcrypt. TIDAK ADA tabel,
--  role, atau endpoint donasi/donatur di database ini.
-- ============================================================================
