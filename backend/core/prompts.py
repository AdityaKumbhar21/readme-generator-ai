README_PROMPT_TEMPLATE = """
Generate a professional README.md file for the following project:

Project Name: {project_name}
Tech Stack: {tech_stack}
Languages Used: {languages}
Description: {description}

Include sections like Introduction, Features, Technologies Used, Getting Started, Installation, Usage, and License.

IMPORTANT: Return ONLY the raw markdown content. Do NOT wrap the output in markdown code fences (do not start with ```markdown and do not end with ```). Just return the plain README content directly.
"""
