ALTER TABLE users ADD COLUMN display_name TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN alt_email TEXT;
ALTER TABLE users ADD COLUMN timezone TEXT NOT NULL DEFAULT 'America/New_York';

UPDATE users
SET username = 'support@raymondtec.com',
    display_name = 'Super Admin',
    alt_email = NULL,
    timezone = 'America/New_York'
WHERE username = 'sadmin';

UPDATE users
SET display_name = 'Super Admin',
    timezone = 'America/New_York'
WHERE username = 'support@raymondtec.com'
  AND (display_name = '' OR timezone = '');

UPDATE sessions
SET username = 'support@raymondtec.com'
WHERE username = 'sadmin';

UPDATE users
SET username = 'michaelyork@raymondtec.com',
    display_name = 'Mike York',
    alt_email = 'michaelyorkpa@gmail.com',
    timezone = 'America/New_York'
WHERE username = 'Mike';

UPDATE users
SET display_name = 'Mike York',
    alt_email = 'michaelyorkpa@gmail.com',
    timezone = 'America/New_York'
WHERE username = 'michaelyork@raymondtec.com'
  AND (display_name = '' OR timezone = '' OR alt_email IS NULL);

UPDATE sessions
SET username = 'michaelyork@raymondtec.com'
WHERE username = 'Mike';
