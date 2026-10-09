from app.schemas.memory import Extraction

PROMPT = """Extract potential durable memories about the user, not a conversation summary.
Only user messages are evidence; assistant statements are context, never user facts.
Useful: stable facts, preferences, goals, ongoing projects, skills, habits, relationships,
communication style and recurring technical requirements.
Positive examples: 'I prefer Python' => 'User prefers Python'; 'I am building BearIQ'
=> 'User is building BearIQ'. Negative: thanks, today's time, random questions,
one-off requests, hypothetical examples, quoted third-party claims and temporary details.
Never infer a user preference from advice offered by the assistant. Cite exact supplied
message IDs. Mark uncertainty as inferred. Mark health, financial, identity and similarly
private information sensitive. Do not extract secrets, passwords or API keys.
Return candidates with importance/confidence between 0 and 1, temporality, source_type,
sensitivity, type, content and message_ids. Return an empty candidates list if none qualify."""


def extract(chunk, provider):
    return provider.structured(PROMPT, chunk, Extraction).candidates
