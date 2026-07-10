# CCCashflow

---
## Project Overview
> Web App offer overview and control to personal finance

### Dashboard view
<img width="2559" height="1390" alt="Screenshot 2026-07-10 170213" src="https://github.com/user-attachments/assets/538f9d0d-c557-414d-a3a4-353963632ded" />

### demo video
https://github.com/user-attachments/assets/a9bb3731-992c-45c7-858e-66ccc8c3f8f0

### Flowchart / Diagram

#### Database Entity Relationship Diagram (ERD)
<img width="4446" height="2278" alt="cccashflow-ERD-2026-07-10" src="https://github.com/user-attachments/assets/ce480631-510a-4328-9aba-19a9f3732789" />

#### Systtem Architecture
<img width="880" height="800" alt="sys-arch" src="https://github.com/user-attachments/assets/1fb5810b-a4c0-4628-851a-3a46c3147da3" />

### TL; DR:
stack:
Front-end: react (js)
Back-end: express.js, [python (if we need to do scientific calculation or AI plug)]
Database: MariaDB / SQlite

- accounting logic based

### Core Functions
---
## How to Run
### start service
```shell
cd .\cccashflow-server
npm i
npm start
```

### import data
(provided you have correctly set-up the .env (dotenv) file)
```
cd .\cccashflow-server
node run db-import-script.js
```

---
## Technical Highlights

---
## Key Takeaways

---
## Challenges

---
## Flaws and Future Improvements

### Flaws

### Future Improvements
AI features: OCR and auto-fill entry
expense prediction based on AI calcuation

---
## Reference
### Developement
#### packages / dependences
Frontend: 
[chartjs](https://www.chartjs.org/docs/latest/)

Backend
[expressjs](https://www.npmjs.com/package/express)
[dotenv](https://www.npmjs.com/package/dotenv)
[better-sqlite3](https://www.npmjs.com/package/better-sqlite3)
[ejs](https://www.npmjs.com/package/ejs)

Database: 
[sqlite](https://sqlite.org/docs.html)

### Mobile Apps (IOS)
- 每日家計簿
- Money+

### open source personal financial app
- (Actual)[https://actualbudget.org/]
- (money Manager Ex)[https://moneymanagerex.org/]
- (firefly-iii)[https://www.firefly-iii.org/]
