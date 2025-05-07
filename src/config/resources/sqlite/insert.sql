
INSERT INTO auto (id, version, fgnr, art, preis, lieferbar, datum, schlagwoerter, erzeugt, aktualisiert)
VALUES (1, 0, '1-0001-6', 'COUPE', 44990.00, true, '2025-02-01', 'SPORT', '2025-02-01 00:00:00', '2025-02-01 00:00:00');

INSERT INTO auto (id, version, fgnr, art, preis, lieferbar, datum, schlagwoerter, erzeugt, aktualisiert)
VALUES (20, 0, '1-0020-6', 'LIMO', 38990.00, true, '2025-02-02', 'SPORT,KOMFORT', '2025-02-02 00:00:00', '2025-02-02 00:00:00');

INSERT INTO auto (id, version, fgnr, art, preis, lieferbar, datum, schlagwoerter, erzeugt, aktualisiert)
VALUES (30, 0, '1-0030-6', 'KOMBI', 29990.00, true, '2025-02-03', 'KOMFORT,SPORT', '2025-02-03 00:00:00', '2025-02-03 00:00:00');

INSERT INTO auto (id, version, fgnr, art, preis, lieferbar, datum, schlagwoerter, erzeugt, aktualisiert)
VALUES (40, 0, '1-0040-6', 'COUPE', 57990.00, true, '2025-02-04', 'SPORT,KOMFORT', '2025-02-04 00:00:00', '2025-02-04 00:00:00');

INSERT INTO auto (id, version, fgnr, art, preis, lieferbar, datum, schlagwoerter, erzeugt, aktualisiert)
VALUES (50, 0, '1-0050-6', 'LIMO', 46990.00, true, '2025-02-05', 'KOMFORT', '2025-02-05 00:00:00', '2025-02-05 00:00:00');

INSERT INTO auto (id, version, fgnr, art, preis, lieferbar, datum, schlagwoerter, erzeugt, aktualisiert)
VALUES (60, 0, '1-0060-6', 'KOMBI', 25990.00, false, '2025-02-06', 'KOMFORT', '2025-02-06 00:00:00', '2025-02-06 00:00:00');

INSERT INTO auto (id, version, fgnr, art, preis, lieferbar, datum, schlagwoerter, erzeugt, aktualisiert)
VALUES (70, 0, '1-0070-6', 'KOMBI', 21990.00, false, '2025-02-07', NULL, '2025-02-07 00:00:00', '2025-02-07 00:00:00');

INSERT INTO auto (id, version, fgnr, art, preis, lieferbar, datum, schlagwoerter, erzeugt, aktualisiert)
VALUES (80, 0, '1-0080-6', 'LIMO', 53990.00, true, '2025-02-08', 'KOMFORT,SPORT', '2025-02-08 00:00:00', '2025-02-08 00:00:00');

INSERT INTO auto (id, version, fgnr, art, preis, lieferbar, datum, schlagwoerter, erzeugt, aktualisiert)
VALUES (90, 0, '1-0090-6', 'LIMO', 59990.00, true, '2025-02-09', 'KOMFORT,SPORT', '2025-02-09 00:00:00', '2025-02-09 00:00:00');




INSERT INTO modell (id, modell, auto_id)
VALUES (1, 'BMW', 1);

INSERT INTO modell (id, modell, auto_id)
VALUES (20, 'AUDI', 20);

INSERT INTO modell (id, modell, auto_id)
VALUES (30, 'MERCEDES', 30);

INSERT INTO modell (id, modell, auto_id)
VALUES (40, 'PORSCHE', 40);

INSERT INTO modell (id, modell, auto_id)
VALUES (50, 'AUDI', 50);

INSERT INTO modell (id, modell, auto_id)
VALUES (60, 'BMW', 60);

INSERT INTO modell (id, modell, auto_id)
VALUES (70, 'MERCEDES', 70);

INSERT INTO modell (id, modell, auto_id)
VALUES (80, 'PORSCHE', 80);

INSERT INTO modell (id, modell, auto_id)
VALUES (90, 'AUDI', 90);




INSERT INTO bild (id, beschriftung, content_type, auto_id)
VALUES (1, 'Abb. 1', 'img/png', 1);

INSERT INTO bild (id, beschriftung, content_type, auto_id)
VALUES (2, 'Abb. 1', 'img/png', 20);

INSERT INTO bild (id, beschriftung, content_type, auto_id)
VALUES (3, 'Abb. 2', 'img/png', 20);

INSERT INTO bild (id, beschriftung, content_type, auto_id)
VALUES (4, 'Abb. 1', 'img/png', 30);

INSERT INTO bild (id, beschriftung, content_type, auto_id)
VALUES (5, 'Abb. 2', 'img/png', 30);

INSERT INTO bild (id, beschriftung, content_type, auto_id)
VALUES (6, 'Abb. 1', 'img/png', 40);

INSERT INTO bild (id, beschriftung, content_type, auto_id)
VALUES (7, 'Abb. 1', 'img/png', 50);

INSERT INTO bild (id, beschriftung, content_type, auto_id)
VALUES (8, 'Abb. 1', 'img/png', 60);

INSERT INTO bild (id, beschriftung, content_type, auto_id)
VALUES (9, 'Abb. 1', 'img/png', 70);
