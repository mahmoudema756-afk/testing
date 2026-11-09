insert into public.courses (code, title, semester, level, description) values
  ('CS211', 'Data Structures', 'Fall 2025', 'Level 2', 'Core structures, algorithmic thinking, and practical implementation patterns.'),
  ('CS221', 'Object-Oriented Programming', 'Fall 2025', 'Level 2', 'Designing maintainable software with classes, objects, and clean abstractions.'),
  ('CS231', 'Discrete Mathematics', 'Spring 2026', 'Level 2', 'Logic, proofs, sets, combinatorics, and the mathematics behind computing.'),
  ('CS311', 'Database Systems', 'Spring 2026', 'Level 3', 'Relational design, SQL queries, normalization, and transaction concepts.')
on conflict (code) do update set title = excluded.title, semester = excluded.semester, level = excluded.level, description = excluded.description;
