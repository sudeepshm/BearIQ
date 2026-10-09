import re
from app.integrations.embeddings import cosine
from app.schemas.memory import Classification

PROTOTYPES = {
    "preference": "User prefers quiet places and likes tea.",
    "technical_preference": "User prefers Python, PostgreSQL and simple software architecture.",
    "communication_style": "User prefers concise explanations and bullet points.",
    "goal": "User plans to become an engineer and wants to learn a language.",
    "project": "User is building an application and working on a research project.",
    "skill": "User is experienced in programming and speaks French.",
    "habit": "User regularly runs and studies every morning.",
    "relationship": "User's colleague and family member are important contacts.",
    "fact": "User lives in a city and works as a teacher.",
    "other": "Other lasting context about the user.",
}


class Classifier:
    def __init__(self, provider):
        self.provider, self.prototypes = provider, None

    def classify(self, content, embedding):
        lower = content.lower()
        if re.search(r"\b(prefers?|likes?|dislikes?)\b", lower):
            if re.search(r"\b(python|javascript|typescript|sql|backend|architecture|programming)\b", lower):
                return "technical_preference"
            if re.search(r"\b(concise|explanations?|responses?|tone|bullet)\b", lower):
                return "communication_style"
            return "preference"
        if re.search(r"\b(building|working on|developing)\b", lower):
            return "project"
        if re.search(r"\b(goal|plans to|wants to achieve)\b", lower):
            return "goal"
        if self.prototypes is None:
            self.prototypes = {k: self.provider.embed(v) for k, v in PROTOTYPES.items()}
        ranked = sorted(((cosine(embedding, v), k) for k, v in self.prototypes.items()), reverse=True)
        if ranked[0][0] >= 0.7 and ranked[0][0] - ranked[1][0] >= 0.08:
            return ranked[0][1]
        return self.provider.structured(
            "Classify the durable memory into one allowed category.", {"content": content}, Classification
        ).type
