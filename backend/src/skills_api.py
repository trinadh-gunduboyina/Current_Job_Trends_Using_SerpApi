# backend/src/skills_api.py
import os, re, requests
from collections import Counter
from flask import Blueprint, request, jsonify
from datetime import datetime
from dotenv import load_dotenv
import json
from pathlib import Path

COUNTER_FILE = Path("counter.json")

def read_api_count():
    if not COUNTER_FILE.exists():
        with open(COUNTER_FILE, "w") as f:
            json.dump({"serpapi_calls": 0}, f)
    with open(COUNTER_FILE, "r") as f:
        return json.load(f)

def update_api_count():
    data = read_api_count()
    data["serpapi_calls"] += 1
    with open(COUNTER_FILE, "w") as f:
        json.dump(data, f)

skills_blueprint = Blueprint('skills_api', __name__)

load_dotenv()
api_key = os.getenv("SERPAPI_KEY")
if not api_key:
    raise ValueError("❌ SERPAPI_KEY not found in .env file")

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

def extract_skills(description):
    description = description.lower()
    skills = set()
    for keyword in tech_keywords:
        if re.search(rf"\b{re.escape(keyword)}\b", description):
            skills.add(keyword)
    capitalized = capitalized_term_pattern.findall(description)
    for phrase in capitalized:
        if phrase.lower() not in stopwords and len(phrase) > 2:
            skills.add(phrase.lower())
    return skills

def fetch_and_process_jobs(query, max_results=50):
    url = "https://serpapi.com/search.json"
    update_api_count() #Is used to increment the API limit hits counter.
    params = {
        "engine": "google_jobs",
        "q": f"{query} developer",
        "hl": "en",
        "location": "United States",
        "api_key": api_key
    }

    response = requests.get(url, params=params)
    response.raise_for_status()
    jobs = response.json().get("jobs_results", [])[:max_results]

    skill_counts = Counter()
    for job in jobs:
        description = job.get("description", "")
        skills = extract_skills(description)
        skill_counts.update(skills)

    sorted_skills = dict(skill_counts.most_common())
    top_10_skills = dict(list(sorted_skills.items())[:10])

    return {
        "total_jobs": len(jobs),
        "skills": sorted_skills,
        "top_skills": top_10_skills
    }

@skills_blueprint.route("/api/skills")
def get_skills():
    role = request.args.get("role", "dotnet")
    try:
        skills_data = fetch_and_process_jobs(role)
        return jsonify({
            "total_jobs": skills_data["total_jobs"],
            "top_skills": skills_data["skills"],
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@skills_blueprint.route("/api/usage")
def get_api_usage():
    try:
        response = requests.get("https://serpapi.com/account", params={"api_key": api_key})
        response.raise_for_status()
        usage = response.json()
        return jsonify({
            "total_searches": usage.get("total_searches", 0),
            "account_type": usage.get("account_type", "free"),
            "search_limit": usage.get("search_limit", 100)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
