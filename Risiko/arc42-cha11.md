## 11. Risikomanagement

Es wurde ein Risikoassessment gemäß dem RMMM-Modell durchgeführt. Die identifizierten Risiken sind anhand ihres Risiko-Scores sortiert, wobei bei gleichem Score das Risiko mit der höheren Eintrittswahrscheinlichkeit zuerst genannt wird. Das RMMM-Modell ist wird weiter unten präsentiert.

### 11.1 Identifizierte Risiken

- **Schwachstellen in NodeJS** ---> Score: 6
- **Markt bricht weg** ---> Score: 3
- **Technische Komplexität** ---> Score: 2
- **API Preis/Preis-Modell Änderung** ---> Score: 2
- **Mitarbeiterausfall** ---> Score: 1


### RMMM-Modell

| Risiko ID | Beschreibung | Wahrscheinlichkeit (sklasse) | Schadenshöhe | Risiko Score | Minimierungs-Strategie | Indikatoren | Notfallplan | Status | Verantwortlicher | Datum der letzten Aktualisierung |
|-----------|--------------|------------------------------|---------------|--------------|--------------------------|-------------|--------------|--------|-------------------|-------------------------------|
| 1 | API Preis/Preismodell ändert sich, bspw. Freemium --> Abo-Modell | 1 | 2 | 2 | Generische Implementierung mit hohem Abstraktionsgrad, die erlauben alternative APIs zu verwenden | Akzeptanzgrad der API, Profitabilität der API/Firma, Trends bei API Pricing, Nutzungsrate von anderen und einem selbst | Suspendierung der Services, welche die APIs benötigen | offen | Jan Bassing | 17.04.2025 |
| 2 | Pandemie --> Reiseverbot, Produkt wird nicht nachgefragt, Markt bricht weg | 1 | 3 | 3 | Diversifizierung und alternative Einnahmequellen | Flug / Reiseverbote, Warnungen/Empfehlungen von Ämtern | - | offen | Jan Bassing | 17.04.2025 |
| 3 | Mitarbeiterausfall | 1 | 1 | 1 | Mehr Personen als nötig fürs Projekt heranziehen | Performance von Mitarbeitern | Freelancer rekrutieren | offen | Jan Bassing | 17.04.2025 |
| 4 | Schwachstellen in NodeJS | 3 | 2 | 6 | Informiert bleiben und schnellstmöglich beheben | Hacking oder Ausnutzung von Schwachstellen | Emergency Shutdown der Applikation | offen | Cedric Noeldechen | 17.04.2025 |
| 5 | Technische Komplexität | 2 | 1 | 2 | Mehr Zeit einplanen | Erfüllung der Aufgabe dauert länger als eingeschätzt | Features werden nicht oder nicht wie geplant implementiert (auf Kosten der User Experience) | offen | Tim Hitschfeld | 17.04.2025 |

