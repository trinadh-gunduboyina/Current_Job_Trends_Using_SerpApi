import http.client
import json
import os
import re
import csv
import matplotlib.pyplot as plt
from collections import defaultdict, Counter
from dotenv import load_dotenv

# ----------------------------
# 🔐 Load API Key from .env
# ----------------------------
load_dotenv()  # Looks for a .env file in the project root
api_key = os.getenv("RAPIDAPI_KEY")
if not api_key:
    raise ValueError("❌ API key not found. Make sure your .env file contains RAPIDAPI_KEY=")

# ----------------------------
# 🌐 Set up API Request
# ----------------------------
conn = http.client.HTTPSConnection("jsearch.p.rapidapi.com")
headers = {
    'x-rapidapi-key': api_key,
    'x-rapidapi-host': "jsearch.p.rapidapi.com"
}

# Modify the query as needed
params = "/search?query=.NET%20Developer&country=US&page=1&num_pages=15"
conn.request("GET", params, headers=headers)
res = conn.getresponse()
data = res.read()
response_json = json.loads(data.decode("utf-8"))

# ----------------------------
# 📦 Extract job data
# ----------------------------
job_data = response_json.get("data", [])
if not job_data:
    print("❌ No job data returned. Check your API response or rate limits.")
    print("Full response:", response_json)
    exit()

print(f"✅ Total jobs fetched: {len(job_data)}")

# ----------------------------
# 🧠 Skill Extraction
# ----------------------------
job_skills_map = {}
capitalized_term_pattern = re.compile(r'\b(?:[A-Z][a-zA-Z0-9+#.]+(?:\s+[A-Z][a-zA-Z0-9+#.]+)*)\b')
tech_keywords = [
    'c#', '.net', 'asp.net', 'mvc', 'rest', 'graphql', 'api', 'sql', 'javascript',
    'typescript', 'react', 'angular', 'docker', 'azure', 'aws', 'ci/cd', 'jenkins',
    'linux', 'git', 'microservices', 'kubernetes', 'jira'
]

for job in job_data:
    title = job.get("job_title", "Unknown Job")
    description = job.get("job_description", "")

    skills = set()
    capitalized_matches = capitalized_term_pattern.findall(description)
    for match in capitalized_matches:
        if len(match) > 2:
            skills.add(match.strip())

    for keyword in tech_keywords:
        if re.search(rf"\b{re.escape(keyword)}\b", description.lower()):
            skills.add(keyword)

    job_skills_map[title] = sorted(skills)

# ----------------------------
# 🏷️ Tag Jobs by Type
# ----------------------------
def tag_job_type(title, description):
    text = f"{title} {description}".lower()
    tags = []
    if any(kw in text for kw in ['full-stack', 'react', 'angular', 'frontend', 'html', 'css']):
        tags.append("Full-Stack")
    if any(kw in text for kw in ['backend', 'api', 'sql', '.net core', 'c#']):
        tags.append("Backend")
    if any(kw in text for kw in ['azure', 'aws', 'docker', 'devops', 'kubernetes']):
        tags.append("Cloud")
    if any(kw in text for kw in ['clearance', 'secret', 'federal', 'government', 'dod']):
        tags.append("Gov/Defense")
    return tags if tags else ["General"]

job_tags = {}
for job in job_data:
    title = job.get("job_title", "")
    desc = job.get("job_description", "")
    job_tags[title] = tag_job_type(title, desc)

# ----------------------------
# 🧹 Clean Skills
# ----------------------------
stopwords = set([
    "experience", "ability", "computer science", "have", "this", "excellent", "that", "bachelor", "the",
    "strong", "must", "what", "why", "because", "support", "knowledge", "need", "work", "develop",
    "like", "learn", "plus", "value", "equal opportunity employer", "commitment", "creatively","use","participate","use","washington","our","our","inc","location","plan","research"
])

def clean_skill(skill):
    return skill.strip().lower()

cleaned_skills_per_job = defaultdict(list)
for job_title, raw_skills in job_skills_map.items():
    for skill in raw_skills:
        clean = clean_skill(skill)
        if len(clean) > 1 and clean not in stopwords and not clean.isnumeric():
            cleaned_skills_per_job[job_title].append(clean)

# ----------------------------
# 📊 Skill Frequency
# ----------------------------
all_skills = []
for skills in cleaned_skills_per_job.values():
    all_skills.extend(skills)

skill_counts = Counter(all_skills)
print("\n📊 Top 50 Most In-Demand Skills:")
for skill, count in skill_counts.most_common(50):
    print(f"{skill}: {count}")

# ----------------------------
# 📝 Export CSV
# ----------------------------
os.makedirs("data", exist_ok=True)
with open("data/cleaned_job_skills.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["Job Title", "Skills", "Tags"])
    for title, skills in cleaned_skills_per_job.items():
        tags = ", ".join(job_tags.get(title, ["General"]))
        writer.writerow([title, ", ".join(sorted(set(skills))), tags])

# ----------------------------
# 📈 Save Bar Chart
# ----------------------------
top_skills = skill_counts.most_common(50)
if not top_skills:
    print("⚠️ No skills found to plot. Try reducing num_pages or check the API response.")
else:
    labels, values = zip(*top_skills)
    plt.figure(figsize=(12, 16))
    plt.barh(labels[::-1], values[::-1])
    plt.xlabel("Number of Mentions")
    plt.title("Top 50 Most In-Demand Skills in .NET Job Listings")
    plt.tight_layout()
    os.makedirs("visuals", exist_ok=True)
    plt.savefig("visuals/top_skills_chart.png")
    plt.show()
