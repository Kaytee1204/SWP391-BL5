/* Allow attempts that are automatically submitted when their timer expires. */
DECLARE @statusConstraint sysname;
SELECT @statusConstraint = cc.name
FROM sys.check_constraints cc
JOIN sys.columns c
  ON c.object_id = cc.parent_object_id
 AND cc.definition LIKE '%[[]status[]]%'
WHERE cc.parent_object_id = OBJECT_ID('dbo.TestAttempt');

IF @statusConstraint IS NOT NULL
    EXEC('ALTER TABLE dbo.TestAttempt DROP CONSTRAINT [' + @statusConstraint + ']');

ALTER TABLE dbo.TestAttempt WITH CHECK
ADD CONSTRAINT CK_TestAttempt_Status
CHECK (status IN ('in_progress', 'submitted', 'expired'));
