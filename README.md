# .NET Job Skills Analysis 💼📊

This project extracts and analyzes the most in-demand technical skills from **.NET Developer job postings in the U.S.** using the [JSearch API](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch/).

It is designed to help developers, job seekers, and students understand what technologies are trending in the .NET job market.

---

## Features 🌟

- 🔍 **Live Job Scraping** from the JSearch API
- ⚖️ **Skill Extraction** using regex and keyword matching
- 🔁 **Job Type Tagging** (Full-Stack, Backend, Cloud, Gov/Defense)
- 📊 **Skill Frequency Analysis** (Top 50 Skills)
- 📈 **Bar Chart Visualization**
- 🗋 **Export to CSV**

---

## Project Structure 📁

```
.
├── src/                         # Python code files
│   └── JSearchApi.py           # Main script
├── data/                        # Processed data output
│   └── cleaned_job_skills.csv
├── visuals/                     # Charts and plots
│   └── top_skills_chart.png
├── .env                         # API Key (Not committed)
├── .gitignore                   # Ignores .env, .venv, etc.
├── requirements.txt             # Project dependencies
└── README.md                    # You're reading it!
```

---

## Installation & Setup ⚙️

### 1. Clone the repository
```bash
git clone https://github.com/trinadh-gunduboyina/dotnet-job-skills-analysis.git
cd dotnet-job-skills-analysis
```

### 2. Create virtual environment (recommended)
```bash
python -m venv .venv
source .venv/Scripts/activate    # On Windows
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Set up `.env`
Create a `.env` file in the root directory with the following:
```env
RAPIDAPI_KEY=your_rapidapi_key_here
```
> ⚠️ Never share your `.env` or commit it to GitHub.

### 5. Run the script
```bash
python src/JSearchApi.py
```

---

## Output 📊

- **CSV File**: `data/cleaned_job_skills.csv`
  - Contains job titles, extracted skills, and job tags
- **Bar Chart**: `visuals/top_skills_chart.png`
  - Shows the top 50 most frequent skills

---

## Customization ⚙️

You can change the number of job listings fetched by modifying the query line in `JSearchApi.py`:
```python
params = "/search?query=.NET%20Developer&country=US&page=1&num_pages=10"
```

Increase or decrease `num_pages` to fetch more or fewer job descriptions (based on API rate limits).

---

## Tags Logic 📄

Jobs are tagged into types using keyword matching:

- **Full-Stack**: react, angular, frontend, html, css
- **Backend**: api, sql, c#, .net core
- **Cloud**: azure, aws, docker, devops, kubernetes
- **Gov/Defense**: clearance, secret, federal, government, dod

---

## Example Use Case 🎡

> "I want to know which skills to focus on for backend .NET roles in the U.S."

Run this project, and you'll get:
- Top skills for backend-tagged jobs
- Visualization of top 50 tech terms
- CSV export for your own analysis

---

## Credits 💚

- API: [JSearch by Let's Scrape on RapidAPI](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch)
- Developed with ❤️ by [Trinadh Gunduboyina](https://github.com/trinadh-gunduboyina)

---

## License 📜

This project is licensed under the [MIT License](LICENSE) — feel free to use, share, and modify.

---

## Coming Soon ✨

- Web-based dashboard using React or Streamlit
- Skill trends over time
- Location-based skill insights

