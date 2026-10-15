-- Interlinked sample — SQL
CREATE TABLE swatches (
  id     INTEGER PRIMARY KEY,
  name   VARCHAR(32) NOT NULL,
  hex    CHAR(7)     NOT NULL,
  alpha  DECIMAL(3, 2) DEFAULT 1.00
);

INSERT INTO swatches (id, name, hex)
VALUES (1, 'teal', '#00CC99'),
       (2, 'amber', '#FFB74D');

SELECT s.name AS colour,
       COUNT(u.id)  AS uses,
       AVG(s.alpha) AS mean_alpha
FROM swatches AS s
JOIN usages AS u ON u.swatch_id = s.id
WHERE s.hex LIKE '#00%'
  AND s.alpha >= 0.5
GROUP BY s.name
HAVING COUNT(u.id) > 3
ORDER BY uses DESC;
