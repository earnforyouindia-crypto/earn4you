# System Design & Cost Analysis: Instascraper-2

This document provides a clear breakdown of how the Instagram Scraper system operates, where the money goes, and how it makes decisions when checking "Insta handles."

## 1. High-Level Workflow (The "Insta Happen" Flow)

When a user provides an Instagram Reel to the system, it enters a **4-Stage Pipeline**:

### Stage 1: Comment Gathering (The Input)
The system starts by fetching all comments from the provided Reel.
- **Decision Logic**: If the first tool (primary scraper) gets blocked or returns too few results, it automatically switches to a backup tool (fallback scraper).
- **Cost**: Uses **Apify tokens** to pay for specialized Instagram scraping actors.

### Stage 2: Lead Filtering (The Sieve)
Not all commenters are buyers. The system uses AI to read every comment.
- **Decision Logic**: AI (Gemini) classifies comments into:
  - **Most Relevant**: High intent (e.g., "What is the price?", "Send brochure").
  - **Relevant**: Moderate intent (e.g., "Interested", "DM details").
  - **Irrelevant**: Emojis, generic praise ("Nice!"), or other real estate agents (competitors).
- **Cost**: Uses **Gemini API** for classification.

### Stage 2.5 & 3: Deep Enrichment (The Investigation)
For the "Relevant" users, the system plays detective to find their contact info.
- **Noise Filters**: Before spending money, it skips "fake" accounts (< 25 followers) and "other agents" (scanning bios for keywords like "Realtor").
- **Multi-Source OSINT**: It searches the web, YouTube, Facebook, and LinkedIn in parallel.
- **Dorking**: It uses Claude to generate clever Google search queries (dorks) to find hidden PDFs or directory listings where the user's phone number might be.
- **Cost**: This is the **most expensive part**. It calls multiple Google Search actors and LLM models.

### Stage 4: Professional Scoring (The Verdict)
If a LinkedIn profile is found, the system scrapes it to see their job title and company.
- **Decision Logic**: Uses AI to score the "quality" of the lead based on their professional background.
- **Cost**: High-cost specialized **Apify LinkedIn Scrapers**.

---

## 2. Where the Money Goes (Cost Breakdown)

The system spends money in three main areas:

| Category | Service | Primary Use | Cost Impact |
| :--- | :--- | :--- | :--- |
| **Scraping** | Apify | IG profiles, comments, website scraping, LinkedIn profiles. | **High**. This is the bulk of the spend per user. |
| **Search** | Apify Google | Finding the same person on other platforms (FB, YT). | **Medium**. High volume of calls per user. |
| **AI (LLM)** | Gemini | Parsing bios, classifying comments, scoring leads. | **Low per call** but adds up with high volume. |
| **AI (LLM)** | Claude | Generating search "dork" queries. | **Low**. Only one call per user at the end of the chain. |

> [!IMPORTANT]
> **Cost Control**: The system has a built-in "Kill Switch" in the [.env](file:///c:/instascraper-2/instascraper/.env) file (`MAX_COST_PER_RUN=10.0`). It will stop automatically if it spends more than $10 to prevent accidental bills.

---

## 3. How the System Starts (Entry Points)

There are two ways the system is typically triggered:

1. **The Automated API ([api_main.py](file:///c:/instascraper-2/instascraper/api_main.py))**:
   - This starts a web server (FastAPI).
   - A **Background Worker** (`ReelProcessor`) sits in the back and waits for new "Reel Jobs" to be submitted via the API.
   - When a job arrives, it starts the 4-stage pipeline described above.

2. **The Manual/Sheet Mode ([main.py](file:///c:/instascraper-2/instascraper/main.py))**:
   - **Sheet Mode**: The system looks at a Google Sheet, finds usernames marked as "Pending," and processes them one by one.
   - **CLI Mode**: A developer can run `python main.py cli -u [username]` to test a specific person immediately without using the API or Sheets.

---

## 4. Current Bottlenecks (Found in Logs)

Reviewing the logs from previous runs ([pipeline_20260323.log](file:///c:/instascraper-2/instascraper/logs/pipeline_20260323.log)), we see a few "leaks" and blocks:
1. **API Key Issues**: The Claude API is currently returning `401 Unauthorized`. This means the "Dork Search" step is likely failing or being skipped.
2. **Resource Limits**: The system occasionally hits "Memory Limits" on Apify ($8192MB$). This causes some search steps to fail.
3. **Permission Blocks**: Certain actors (like the YouTube scraper) are failing due to "Insufficient permissions" or "Paid Actor" requirements.

---

## 4. Simplified Decision Loop

1. **Wait** for a Reel.
2. **Grab** comments.
3. **Ask AI**: Is this person a buyer or a competitor?
4. **If Buyer**:
   - Check if we already have them in the **Cache** (saves money!).
   - If not, go **OSINT**: Check Google -> Check LinkedIn -> Check Websites.
   - **Merge** all findings into the final results file.
5. **Report**: Save lead to [latest_results.csv](file:///c:/instascraper-2/instascraper/latest_results.csv).
