import os
import re
import requests
from collections import Counter
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# 🔐 Load API Key
load_dotenv()
api_key = os.getenv("SERPAPI_KEY")
if not api_key:
    raise ValueError("❌ SERPAPI_KEY not found in .env file")

# 🌍 Flask Setup
app = Flask(__name__)
CORS(app)

# 🧠 Skills to Detect
tech_keywords = [
    'c#', '.net', 'asp.net', 'mvc', 'rest', 'graphql', 'api', 'sql', 'javascript',
    'typescript', 'react', 'angular', 'docker', 'azure', 'aws', 'ci/cd', 'jenkins',
    'linux', 'git', 'microservices', 'kubernetes', 'jira', 'python', 'java', 'flask',
    'spring boot', 'pandas', 'numpy', 'matplotlib', 'tensorflow', 'pytorch',
    'hadoop', 'spark'
]
stopwords = {
    "experience", "requirement", "develop", "support", "benefits", "preferred",
    "skills", "role", "strong", "excellent", "preferred qualifications", "proven"
}
capitalized_term_pattern = re.compile(r'\b(?:[A-Z][a-zA-Z0-9+#.]+(?:\s+[A-Z][a-zA-Z0-9+#.]+)*)\b')

# 🧠 Skill Extraction
def extract_skills(description):
    description = description.lower()
    skills = set()

    # Match lowercase keywords
    for keyword in tech_keywords:
        if re.search(rf"\b{re.escape(keyword)}\b", description):
            skills.add(keyword)

    # Capitalized phrases
    capitalized = capitalized_term_pattern.findall(description)
    for phrase in capitalized:
        if phrase.lower() not in stopwords and len(phrase) > 2:
            skills.add(phrase.lower())

    return skills

# 🔎 Fetch & Process Jobs from SerpAPI
def fetch_and_process_jobs(query):
    url = "https://serpapi.com/search.json"
    params = {
        "engine": "google_jobs",
        "q": f"{query} developer",
        "hl": "en",
        "location": "United States",
        "api_key": api_key
    }

    response = requests.get(url, params=params)
    response.raise_for_status()
    jobs = response.json().get("jobs_results", [])

    print(f"✅ Total jobs fetched: {len(jobs)}")

    skill_counts = Counter()
    for job in jobs:
        description = job.get("description", "")
        skills = extract_skills(description)
        skill_counts.update(skills)

    return dict(skill_counts.most_common(50))

# 🔗 API Endpoint
@app.route("/api/skills")
def get_skills():
    role = request.args.get("role", "dotnet")
    try:
        skills_data = fetch_and_process_jobs(role)
        return jsonify(skills_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🏁 Run
if __name__ == "__main__":
    app.run(debug=True)