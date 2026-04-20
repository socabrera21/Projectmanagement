import csv
from jobspy import scrape_jobs

print("Searching for remote Account Executive roles across all job boards...")
print("This may take a few minutes...\n")

jobs = scrape_jobs(
    site_name=["indeed", "linkedin", "zip_recruiter", "google", "glassdoor"],
    search_term="Account Executive",
    google_search_term="Account Executive remote jobs",
    location="USA",
    results_wanted=50,
    hours_old=72,
    country_indeed="USA",
    is_remote=True,
    verbose=2,
)

print(f"\nFound {len(jobs)} jobs total\n")

if not jobs.empty:
    # Show summary by site
    print("=== Results by Job Board ===")
    print(jobs["site"].value_counts().to_string())
    print()

    # Show key columns
    cols = ["site", "title", "company", "location", "job_type", "min_amount", "max_amount", "date_posted", "job_url"]
    available_cols = [c for c in cols if c in jobs.columns]
    print("=== Top 15 Results ===")
    print(jobs[available_cols].head(15).to_string(index=False))

    # Save to CSV
    output_path = "/Users/Apple/Projectmanagement/scripts/jobs_ae_remote.csv"
    jobs.to_csv(output_path, quoting=csv.QUOTE_NONNUMERIC, escapechar="\\", index=False)
    print(f"\nAll {len(jobs)} jobs saved to: {output_path}")
else:
    print("No jobs found. Try broadening your search criteria.")
