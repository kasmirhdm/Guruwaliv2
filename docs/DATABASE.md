# GuruWali V2 Database Blueprint

## Identity
users
- id
- email
- password_hash
- role
- teacher_mode
- status
- created_at

schools
- id
- name
- npsn
- address
- logo_path
- principal_name
- created_at

school_memberships
- id
- school_id
- user_id
- role
- status
- joined_at

## School data
academic_years
classes
subjects
teachers
students
homeroom_assignments

## Curriculum
curriculums
phases
curriculum_subjects
learning_outcomes
learning_objectives
learning_sequences
learning_materials

Important fields for learning_outcomes:
- source_type: PLATFORM_MASTER | SCHOOL
- is_master: boolean
- status
- curriculum_id
- phase_id
- subject_id

## Learning documents
teaching_modules
teaching_materials
worksheets
assessments
question_banks
documents

## Student administration
attendance
grades
student_notes
achievements

All school-scoped tables use school_id where appropriate. Personal teacher documents may use owner_user_id and nullable school_id.

## Future
Use PostgreSQL on the production VPS. Prisma will be used as the ORM.
