import json

transcript_path = "/Users/bharathkumara/.gemini/antigravity/brain/1c491eba-87ff-4c77-b653-d7d91cea8e5a/.system_generated/logs/transcript.jsonl"

with open(transcript_path, "r") as f:
    for line in f:
        data = json.loads(line)
        content = data.get("content", "")
        if "The following changes were made by the USER to" in content:
            step = data.get('step_index')
            with open(f"/Users/bharathkumara/.gemini/antigravity/brain/1c491eba-87ff-4c77-b653-d7d91cea8e5a/scratch/user_diff_step_{step}.txt", "w") as out:
                out.write(content)
print("Done writing user diffs.")
